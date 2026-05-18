import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const arg = process.argv[2];

if (arg === '--help' || arg === '-h') {
  console.log('Usage: node screenshot.mjs [path-or-url]');
  console.log('  Captures mobile (375x812 @3x), tablet (768x1024 @2x),');
  console.log('  and desktop (1440x900 @2x) screenshots into ./screenshots/.');
  console.log('  Defaults to ./index.html when no argument is given.');
  process.exit(0);
}

const target = arg || path.join(__dirname, 'index.html');
const isUrl = /^https?:\/\//.test(target);

if (!isUrl && !fs.existsSync(target)) {
  console.error(`screenshot.mjs: target not found: ${target}`);
  process.exit(1);
}

const outDir = path.join(__dirname, 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

const url = isUrl ? target : `file://${path.resolve(target)}`;

const viewports = [
  { name: 'mobile',  width: 375,  height: 812,  deviceScaleFactor: 3 },
  { name: 'tablet',  width: 768,  height: 1024, deviceScaleFactor: 2 },
  { name: 'desktop', width: 1440, height: 900,  deviceScaleFactor: 2 },
];

let browser;
try {
  browser = await chromium.launch({ channel: 'chrome' });
  console.log('Browser: Google Chrome');
} catch {
  browser = await chromium.launch();
  console.log('Browser: bundled Chromium (Chrome not found)');
}

try {
  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.deviceScaleFactor,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const file = path.join(outDir, `${vp.name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`Saved ${file}`);
    await context.close();
  }
} finally {
  await browser.close();
}
