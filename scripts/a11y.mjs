#!/usr/bin/env node
// a11y.mjs — accessibility validation for skill-style-guide pages.
//
// Runs axe-core WCAG AA scans at mobile/tablet/desktop viewports, then probes
// the page's dark-mode wiring: a sampled set of elements must change computed
// colour when data-theme flips. If a hex got hardcoded into component CSS,
// validate.mjs catches it statically; this script catches the same class of
// bug end-to-end at runtime.
//
// Usage:
//   node a11y.mjs                  # ./index.html, human output
//   node a11y.mjs ./page.html      # explicit target
//   node a11y.mjs --json           # machine-readable JSON
//
// Requires: npm install --save-dev playwright @axe-core/playwright

import fs from 'fs';
import path from 'path';

// -----------------------------------------------------------------------------
// CLI
// -----------------------------------------------------------------------------

const args = process.argv.slice(2);
const flags = {
  json: args.includes('--json'),
  help: args.includes('--help') || args.includes('-h'),
};
const target = args.find((a) => !a.startsWith('-')) || './index.html';

if (flags.help) {
  console.log('Usage: node a11y.mjs [path-or-url] [--json]');
  console.log('');
  console.log('  Runs axe-core WCAG AA scans + dark-mode parity probe.');
  console.log('  Exit 0 if clean, 1 on serious/critical axe violations or parity failure.');
  console.log('  Requires: npm install --save-dev playwright @axe-core/playwright');
  process.exit(0);
}

const isUrl = /^https?:\/\//.test(target);
if (!isUrl && !fs.existsSync(target)) {
  console.error(`a11y.mjs: target not found: ${target}`);
  process.exit(2);
}

// Deps are imported dynamically so `--help` works without them installed.
let launchBrowser;
try {
  ({ launchBrowser } = await import('./_launch.mjs'));
} catch (e) {
  console.error('a11y.mjs: playwright is not installed.');
  console.error('  Install with: npm install --save-dev playwright');
  console.error(`  Underlying error: ${e.message}`);
  process.exit(2);
}

let AxeBuilder;
try {
  const mod = await import('@axe-core/playwright');
  AxeBuilder = mod.default ?? mod.AxeBuilder;
  if (!AxeBuilder) throw new Error('AxeBuilder export not found');
} catch (e) {
  console.error('a11y.mjs: @axe-core/playwright not installed or unavailable.');
  console.error('  Install with: npm install --save-dev @axe-core/playwright');
  console.error(`  Underlying error: ${e.message}`);
  process.exit(2);
}

// -----------------------------------------------------------------------------
// Run
// -----------------------------------------------------------------------------

const url = isUrl ? target : `file://${path.resolve(target)}`;
const viewports = [
  { name: 'mobile',  width: 375,  height: 812 },
  { name: 'tablet',  width: 768,  height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

const errors = [];
const warnings = [];
const err  = (rule, msg) => errors.push({ rule, msg });
const warn = (rule, msg) => warnings.push({ rule, msg });

const { browser, label } = await launchBrowser();
if (!flags.json) console.log(`Browser: ${label}`);

try {
  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts?.ready);

    // --- axe-core scan -----------------------------------------------------
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    for (const v of results.violations) {
      const ruleId = `axe:${v.id}@${vp.name}`;
      const msg = `${v.help} (${v.nodes.length} node${v.nodes.length === 1 ? '' : 's'}) — ${v.helpUrl}`;
      if (v.impact === 'critical' || v.impact === 'serious') err(ruleId, msg);
      else warn(ruleId, msg);
    }

    // --- dark-mode parity probe (desktop only — DOM is shared) -------------
    if (vp.name === 'desktop') {
      const samples = ['h1', 'h2', 'p', 'a', 'body'];

      const readColors = () => page.evaluate((sel) => {
        const out = {};
        for (const s of sel) {
          const el = document.querySelector(s);
          out[s] = el ? getComputedStyle(el).color : null;
        }
        return out;
      }, samples);

      // Disable transitions so we don't sample an in-flight colour.
      await page.addStyleTag({
        content: '*, *::before, *::after { transition: none !important; }',
      });

      // Force light first (in case the page's bootstrap landed on dark).
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
      await page.waitForTimeout(30);
      const lightColors = await readColors();

      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
      await page.waitForTimeout(30);
      const darkColors = await readColors();

      for (const s of samples) {
        if (lightColors[s] && darkColors[s] && lightColors[s] === darkColors[s]) {
          err(
            'dark-parity',
            `${s} colour identical in light and dark (${lightColors[s]}) — likely a hardcoded hex bypassing the palette variables`
          );
        }
      }
    }

    await context.close();
  }
} finally {
  await browser.close();
}

// -----------------------------------------------------------------------------
// Report
// -----------------------------------------------------------------------------

const ok = errors.length === 0;
const report = { target, ok, errors, warnings };

if (flags.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const RED   = '\x1b[31m';
  const YEL   = '\x1b[33m';
  const GRN   = '\x1b[32m';
  const DIM   = '\x1b[2m';
  const RESET = '\x1b[0m';
  const useColor = process.stdout.isTTY;
  const c = (code, s) => (useColor ? `${code}${s}${RESET}` : s);

  console.log(`${c(DIM, 'target:')} ${target}`);
  if (ok && warnings.length === 0) {
    console.log(c(GRN, '✓ a11y clean — no violations'));
  } else {
    if (errors.length) {
      console.log(`\n${c(RED, `${errors.length} error${errors.length === 1 ? '' : 's'}:`)}`);
      for (const { rule, msg } of errors) console.log(`  ${c(RED, '✗')} ${c(DIM, rule.padEnd(28))} ${msg}`);
    }
    if (warnings.length) {
      console.log(`\n${c(YEL, `${warnings.length} warning${warnings.length === 1 ? '' : 's'}:`)}`);
      for (const { rule, msg } of warnings) console.log(`  ${c(YEL, '!')} ${c(DIM, rule.padEnd(28))} ${msg}`);
    }
  }
}

process.exit(ok ? 0 : 1);
