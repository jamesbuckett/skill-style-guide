#!/usr/bin/env node
// run-evals.mjs — exercise the skill against evals/evals.json end-to-end.
//
// For each eval:
//   1. Mktemp a fresh working directory.
//   2. Spawn `claude -p "<prompt>"` in it, with skill-style-guide auto-loaded
//      from ~/.claude/skills/. The subprocess writes index.html via tools.
//   3. Run scripts/validate.mjs against the produced HTML.
//   4. Run scripts/a11y.mjs against it (if Playwright is installed).
//   5. Capture screenshots via scripts/screenshot.mjs (best effort).
//   6. Send the prompt + expected_output rubric + produced HTML + screenshots
//      to Claude (Anthropic API) for an LLM-as-judge score (0-5).
//   7. Aggregate and write evals/results/<timestamp>.json.
//
// Pass criterion: validate.ok && a11y.ok && judge.score >= 4.
//
// Usage:
//   ANTHROPIC_API_KEY=sk-... node scripts/run-evals.mjs
//   node scripts/run-evals.mjs --id 0           # run a single eval by id
//   node scripts/run-evals.mjs --skip-judge     # skip the LLM-as-judge call
//   node scripts/run-evals.mjs --skip-a11y      # skip the axe-core scan
//
// Costs API tokens. Run on SKILL.md changes, not every commit.

import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn, execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.resolve(__dirname, '..');
const EVALS_PATH = path.join(SKILL_ROOT, 'evals', 'evals.json');
const RESULTS_DIR = path.join(SKILL_ROOT, 'evals', 'results');

// -----------------------------------------------------------------------------
// CLI
// -----------------------------------------------------------------------------

const args = process.argv.slice(2);
const flags = {
  help:       args.includes('--help') || args.includes('-h'),
  skipJudge:  args.includes('--skip-judge'),
  skipA11y:   args.includes('--skip-a11y'),
  skipShots:  args.includes('--skip-screenshots'),
  id:         null,
};
const idIdx = args.indexOf('--id');
if (idIdx !== -1 && args[idIdx + 1] != null) flags.id = Number(args[idIdx + 1]);

if (flags.help) {
  console.log('Usage: node scripts/run-evals.mjs [options]');
  console.log('');
  console.log('Options:');
  console.log('  --id <n>            Run a single eval by id');
  console.log('  --skip-judge        Skip the LLM-as-judge API call');
  console.log('  --skip-a11y         Skip the axe-core scan');
  console.log('  --skip-screenshots  Skip Playwright screenshot capture');
  console.log('');
  console.log('Environment:');
  console.log('  ANTHROPIC_API_KEY   Required unless --skip-judge');
  process.exit(0);
}

if (!fs.existsSync(EVALS_PATH)) {
  console.error(`run-evals: ${EVALS_PATH} not found`);
  process.exit(2);
}

const allEvals = JSON.parse(fs.readFileSync(EVALS_PATH, 'utf8')).evals;
const evals = flags.id == null ? allEvals : allEvals.filter((e) => e.id === flags.id);
if (!evals.length) {
  console.error(`run-evals: no evals matched ${flags.id == null ? '' : `--id ${flags.id}`}`);
  process.exit(2);
}

if (!flags.skipJudge && !process.env.ANTHROPIC_API_KEY) {
  console.error('run-evals: ANTHROPIC_API_KEY not set (or pass --skip-judge to disable the judge).');
  process.exit(2);
}

// -----------------------------------------------------------------------------
// Per-eval pipeline
// -----------------------------------------------------------------------------

async function runOne(ev) {
  const workdir = fs.mkdtempSync(path.join(os.tmpdir(), `eval-${ev.id}-`));
  const result = { id: ev.id, name: ev.name, workdir, produced_html: false };

  // --- 1. Claude subprocess ---------------------------------------------
  console.log(`\n[${ev.id}] ${ev.name}`);
  console.log(`     workdir: ${workdir}`);
  console.log(`     spawning claude…`);

  const claudeLog = path.join(workdir, '_claude.log');
  await new Promise((resolve, reject) => {
    const child = spawn(
      'claude',
      [
        '-p', ev.prompt,
        '--dangerously-skip-permissions',
      ],
      { cwd: workdir, stdio: ['ignore', fs.openSync(claudeLog, 'w'), fs.openSync(claudeLog + '.err', 'w')] }
    );
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('claude subprocess timed out after 600s'));
    }, 600_000);
    child.on('exit', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`claude exited with code ${code} (see ${claudeLog})`));
    });
    child.on('error', (e) => { clearTimeout(timer); reject(e); });
  }).catch((e) => { result.claude_error = e.message; });

  const htmlPath = path.join(workdir, 'index.html');
  result.produced_html = fs.existsSync(htmlPath);
  if (!result.produced_html) {
    console.log(`     ✗ no index.html produced`);
    return result;
  }
  console.log(`     ✓ index.html produced (${fs.statSync(htmlPath).size} bytes)`);

  // --- 2. validate.mjs --------------------------------------------------
  result.validate = runJsonScript(path.join(SKILL_ROOT, 'scripts', 'validate.mjs'), [htmlPath, '--json']);
  console.log(`     validate: ${result.validate.ok ? '✓' : '✗'} (${result.validate.errors?.length || 0} err, ${result.validate.warnings?.length || 0} warn)`);

  // --- 3. a11y.mjs ------------------------------------------------------
  if (!flags.skipA11y) {
    result.a11y = runJsonScript(path.join(SKILL_ROOT, 'scripts', 'a11y.mjs'), [htmlPath, '--json']);
    console.log(`     a11y:     ${result.a11y.ok ? '✓' : '✗'} (${result.a11y.errors?.length || 0} err, ${result.a11y.warnings?.length || 0} warn)`);
  }

  // --- 4. screenshots ---------------------------------------------------
  let screenshots = [];
  if (!flags.skipShots) {
    try {
      execFileSync('node', [path.join(SKILL_ROOT, 'scripts', 'screenshot.mjs'), htmlPath], {
        cwd: workdir, stdio: 'pipe', timeout: 120_000,
      });
      screenshots = ['mobile.png', 'tablet.png', 'desktop.png']
        .map((f) => path.join(workdir, 'screenshots', f))
        .filter((p) => fs.existsSync(p));
      console.log(`     shots:    ${screenshots.length}/3 captured`);
    } catch (e) {
      result.screenshot_error = e.message;
      console.log(`     shots:    failed (${e.message.split('\n')[0]})`);
    }
  }

  // --- 5. LLM-as-judge --------------------------------------------------
  if (!flags.skipJudge) {
    try {
      result.judge = await judge(ev, fs.readFileSync(htmlPath, 'utf8'), screenshots);
      console.log(`     judge:    ${result.judge.score}/5 — ${result.judge.notes?.[0] || ''}`);
    } catch (e) {
      result.judge = { error: e.message };
      console.log(`     judge:    failed (${e.message.split('\n')[0]})`);
    }
  }

  // --- 6. pass criterion ------------------------------------------------
  result.pass =
    result.produced_html &&
    (result.validate?.ok ?? false) &&
    (flags.skipA11y || (result.a11y?.ok ?? false)) &&
    (flags.skipJudge || ((result.judge?.score ?? 0) >= 4));

  return result;
}

function runJsonScript(scriptPath, scriptArgs) {
  try {
    const out = execFileSync('node', [scriptPath, ...scriptArgs], { encoding: 'utf8', stdio: 'pipe' });
    return JSON.parse(out);
  } catch (e) {
    // Linters exit non-zero on errors but still print valid JSON on stdout.
    if (e.stdout) {
      try { return JSON.parse(e.stdout); } catch {}
    }
    return { ok: false, error: e.message, errors: [], warnings: [] };
  }
}

// -----------------------------------------------------------------------------
// LLM-as-judge — Anthropic Messages API via fetch (zero deps)
// -----------------------------------------------------------------------------

const JUDGE_MODEL = 'claude-sonnet-4-6';

async function judge(ev, html, screenshotPaths) {
  const skillRules = fs.readFileSync(path.join(SKILL_ROOT, 'SKILL.md'), 'utf8');

  const rubric = [
    'You are evaluating the output of an AI skill that produces single-file HTML pages following James Buckett\'s skill-style-guide.',
    '',
    `## The original prompt`,
    ev.prompt,
    '',
    `## Expected output (rubric from the eval file)`,
    ev.expected_output,
    '',
    `## The full skill specification (truncated to 4000 chars)`,
    skillRules.slice(0, 4000),
    '',
    `## The produced HTML (truncated to 8000 chars)`,
    html.slice(0, 8000),
    '',
    `## Your job`,
    'Rate the produced output 0-5 on whether it satisfies the prompt AND follows the skill rules.',
    'Screenshots at mobile/tablet/desktop are attached if available.',
    '',
    'Respond with ONLY a JSON object, no preamble:',
    '{ "score": <0-5 integer>, "notes": ["bullet 1", "bullet 2", "bullet 3"] }',
  ].join('\n');

  const content = [{ type: 'text', text: rubric }];
  for (const p of screenshotPaths) {
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: 'image/png', data: fs.readFileSync(p).toString('base64') },
    });
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: JUDGE_MODEL,
      max_tokens: 512,
      messages: [{ role: 'user', content }],
    }),
  });
  if (!res.ok) {
    throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  }
  const body = await res.json();
  const text = body.content?.[0]?.text ?? '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`judge returned non-JSON: ${text.slice(0, 200)}`);
  return JSON.parse(jsonMatch[0]);
}

// -----------------------------------------------------------------------------
// Run + report
// -----------------------------------------------------------------------------

console.log(`run-evals: ${evals.length} eval${evals.length === 1 ? '' : 's'}, skill=${SKILL_ROOT}`);

const results = [];
for (const ev of evals) {
  results.push(await runOne(ev));
}

const summary = {
  pass:  results.filter((r) => r.pass).length,
  fail:  results.filter((r) => !r.pass).length,
  total: results.length,
};

let skillCommit;
try {
  skillCommit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: SKILL_ROOT, encoding: 'utf8' }).trim();
} catch {}

const report = {
  timestamp: new Date().toISOString(),
  skill_repo: SKILL_ROOT,
  skill_commit: skillCommit ?? null,
  flags,
  results,
  summary,
};

fs.mkdirSync(RESULTS_DIR, { recursive: true });
const reportPath = path.join(RESULTS_DIR, `${report.timestamp.replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log('');
console.log(`summary: ${summary.pass}/${summary.total} passed`);
console.log(`report:  ${reportPath}`);
process.exit(summary.fail === 0 ? 0 : 1);
