#!/usr/bin/env node
// Stop hook helper for skill-style-guide.
//
// When Claude is about to finish a response in a project that has ./index.html
// at its root, this hook makes the "Verify before reporting done" checklist
// (from SKILL.md) unskippable. Blocks completion if:
//
//   1. validate.mjs reports any errors, OR
//   2. None of ./screenshots/{mobile,tablet,desktop}.png exist (i.e. the
//      screenshot harness was never run).
//
// Partial screenshots (one out of three present) are surfaced as a softer
// reminder rather than a hard block — Claude may have just regenerated one
// viewport during iteration.
//
// Skips silently when there is no ./index.html (not a style-guide project)
// or when `stop_hook_active` is true (we already blocked once; don't loop).
//
// Wire into `.claude/settings.json`:
//
//   "hooks": {
//     "Stop": [{
//       "matcher": "*",
//       "hooks": [{
//         "type": "command",
//         "command": "node $HOME/.claude/skills/skill-style-guide/scripts/hook-stop.mjs"
//       }]
//     }]
//   }

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VALIDATOR = path.join(__dirname, 'validate.mjs');

// Read the event payload (used to check stop_hook_active).
let raw = '';
process.stdin.setEncoding('utf8');
for await (const chunk of process.stdin) raw += chunk;
let event = {};
try { event = JSON.parse(raw); } catch {}
if (event.stop_hook_active) process.exit(0);

const cwd = process.cwd();
const htmlPath = path.join(cwd, 'index.html');
if (!fs.existsSync(htmlPath)) process.exit(0); // not a style-guide project

const issues = [];

// --- validate.mjs -----------------------------------------------------------

const v = spawnSync('node', [VALIDATOR, htmlPath, '--json'], { encoding: 'utf8' });
const validateRaw = v.stdout || v.stderr || '';
try {
  const report = JSON.parse(validateRaw);
  if (!report.ok) {
    const rules = report.errors.map((e) => e.rule).join(', ');
    issues.push(`validate.mjs failed with ${report.errors.length} error(s): ${rules}`);
  }
} catch {
  // validator output unparseable — surface as an issue so it's not silently swallowed.
  issues.push(`validate.mjs output could not be parsed: ${validateRaw.slice(0, 200)}`);
}

// --- screenshots ------------------------------------------------------------

const shotsDir = path.join(cwd, 'screenshots');
const required = ['mobile.png', 'tablet.png', 'desktop.png'];
const present = required.filter((f) => fs.existsSync(path.join(shotsDir, f)));
if (present.length === 0) {
  issues.push('No screenshots in ./screenshots/ — run the Playwright harness before reporting done.');
} else if (present.length < required.length) {
  const missing = required.filter((f) => !present.includes(f));
  issues.push(`Missing screenshots: ${missing.join(', ')}. Re-run the harness to capture all three viewports.`);
}

if (issues.length === 0) process.exit(0);

const reason = [
  'Verify-before-done check failed:',
  '',
  ...issues.map((i) => `  • ${i}`),
  '',
  'Required:',
  '  1. `node $HOME/.claude/skills/skill-style-guide/scripts/validate.mjs ./index.html` exits clean.',
  '  2. `./screenshots/{mobile,tablet,desktop}.png` exist from the latest run of screenshot.mjs.',
].join('\n');

// Stop-hook protocol: print decision JSON to stdout to block.
console.log(JSON.stringify({ decision: 'block', reason }));
process.exit(0);
