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
  console.log('  Tall pages are sliced and stitched (requires sharp).');
  process.exit(0);
}

const target = arg || path.join(__dirname, 'index.html');
const isUrl = /^https?:\/\//.test(target);

if (!isUrl && !fs.existsSync(target)) {
  console.error(`screenshot.mjs: target not found: ${target}`);
  process.exit(1);
}

const outDir = path.join(process.cwd(), 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

const url = isUrl ? target : `file://${path.resolve(target)}`;

const viewports = [
  { name: 'mobile',  width: 375,  height: 812,  deviceScaleFactor: 3 },
  { name: 'tablet',  width: 768,  height: 1024, deviceScaleFactor: 2 },
  { name: 'desktop', width: 1440, height: 900,  deviceScaleFactor: 2 },
];

// Chrome canvas limit is ~16384px in any dimension; with @2x/@3x scale
// factors the effective ceiling on CSS-pixel height drops. Stay safe.
const CSS_HEIGHT_CEILING = 5000;

let browser;
const fallbackPaths = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  '/snap/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
].filter(Boolean);
try {
  browser = await chromium.launch({ channel: 'chrome' });
  console.log('Browser: Google Chrome');
} catch {
  try {
    browser = await chromium.launch();
    console.log('Browser: bundled Chromium');
  } catch {
    let launched = false;
    for (const executablePath of fallbackPaths) {
      try {
        browser = await chromium.launch({ executablePath });
        console.log(`Browser: ${executablePath}`);
        launched = true;
        break;
      } catch {}
    }
    if (!launched) throw new Error('No Chrome/Chromium found. Install via `sudo snap install chromium` or set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH.');
  }
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

    const fullHeight = await page.evaluate(() =>
      Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight
      )
    );

    const file = path.join(outDir, `${vp.name}.png`);

    if (fullHeight <= CSS_HEIGHT_CEILING) {
      await page.screenshot({ path: file, fullPage: true });
      console.log(`Saved ${file} (${vp.width}x${fullHeight})`);
    } else {
      const stitched = await captureTall(page, vp, fullHeight, file);
      if (stitched) {
        console.log(`Saved ${file} (${vp.width}x${fullHeight}, stitched)`);
      } else {
        await page.screenshot({ path: file, fullPage: false });
        console.warn(
          `Saved ${file} (viewport only — page is ${fullHeight}px, install sharp for stitched capture: npm i -D sharp)`
        );
      }
    }

    await context.close();
  }
} finally {
  await browser.close();
}

async function captureTall(page, vp, fullHeight, outPath) {
  let sharp;
  try {
    ({ default: sharp } = await import('sharp'));
  } catch {
    return false;
  }

  const scale = vp.deviceScaleFactor;
  const stepHeight = vp.height;
  const slices = [];
  let y = 0;
  while (y < fullHeight) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(50);
    const remaining = fullHeight - y;
    const clipHeight = Math.min(stepHeight, remaining);
    const buf = await page.screenshot({
      clip: { x: 0, y: 0, width: vp.width, height: clipHeight },
    });
    slices.push({ input: buf, top: y * scale, left: 0 });
    y += stepHeight;
  }

  await sharp({
    create: {
      width: vp.width * scale,
      height: fullHeight * scale,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite(slices)
    .png()
    .toFile(outPath);

  return true;
}
