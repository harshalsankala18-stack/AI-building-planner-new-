import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('../packages/frontend/node_modules/playwright');

async function main() {
  console.log('--- STARTING LIVE BROWSER VERIFICATION ---');
  const screenshotsDir = path.resolve(process.cwd(), 'docs/screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=gl'],
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  const consoleErrors = [];
  const consoleWarnings = [];
  const consoleLogs = [];

  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    if (type === 'error') {
      consoleErrors.push(text);
      console.log(`[BROWSER ERROR] ${text}`);
    } else if (type === 'warning') {
      consoleWarnings.push(text);
    } else {
      consoleLogs.push(text);
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.message || String(err));
    console.log(`[PAGE ERROR] ${err.message || String(err)}`);
  });

  // -------------------------------------------------------------
  // Test 1: Pascal Studio Standalone (http://localhost:5174/pascal-studio/)
  // -------------------------------------------------------------
  console.log('\n--- TEST 1: Standalone Pascal Studio (http://localhost:5174/pascal-studio/) ---');
  await page.goto('http://localhost:5174/pascal-studio/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  const standaloneCanvas = await page.waitForSelector('canvas', { timeout: 15000 });
  const canvasBox = await standaloneCanvas.boundingBox();
  console.log('Standalone Canvas dimensions:', canvasBox);

  const buttonCount = await page.locator('button').count();
  const buttonsText = await page.locator('button').allInnerTexts();
  console.log(`Found ${buttonCount} buttons in standalone Pascal studio:`, buttonsText.filter(Boolean).slice(0, 10));

  const standaloneScreenshotPath = path.join(screenshotsDir, 'debug-pascal-studio.png');
  await page.screenshot({ path: standaloneScreenshotPath });
  console.log('Saved standalone screenshot to:', standaloneScreenshotPath);

  if (!canvasBox || canvasBox.width < 300 || canvasBox.height < 300) {
    throw new Error(`Standalone canvas too small: ${JSON.stringify(canvasBox)}`);
  }

  // -------------------------------------------------------------
  // Test 2: Main App (http://localhost:3000/)
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Main App Integration (http://localhost:3000/) ---');
  consoleErrors.length = 0; // reset for app testing
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Check for Open Demo Project button
  const demoBtn = page.locator('button:has-text("Open Demo Project")').first();
  const hasDemoBtn = (await demoBtn.count()) > 0;
  console.log('Found "Open Demo Project" button:', hasDemoBtn);

  if (hasDemoBtn) {
    console.log('Clicking "Open Demo Project" button...');
    await demoBtn.click();
    await page.waitForTimeout(3000);
  }

  // Verify 6 primary tabs
  const requiredTabs = [
    '2D Engineering',
    '2D Presentation (ArchLang)',
    '3D Standard',
    '3D Pascal Studio (Edit)',
    'Split View (2D + 3D)',
    'Export Center',
  ];

  console.log('Verifying primary studio tabs in top bar...');
  for (const tabName of requiredTabs) {
    const tabEl = page.locator(`button:has-text("${tabName}")`).first();
    const exists = (await tabEl.count()) > 0;
    console.log(`- Tab "${tabName}": ${exists ? 'EXISTS' : 'MISSING'}`);
    if (!exists) {
      throw new Error(`Required tab "${tabName}" not found on page!`);
    }
  }

  // Click 3D Pascal Studio (Edit) tab
  console.log('\nClicking "3D Pascal Studio (Edit)" tab...');
  await page.locator('button:has-text("3D Pascal Studio (Edit)")').first().click();
  await page.waitForTimeout(5000);

  // Inspect iframe
  const iframeHandle = await page.waitForSelector('iframe[src*="pascal-studio"]', { timeout: 15000 });
  const frame = await iframeHandle.contentFrame();
  if (!frame) {
    throw new Error('Unable to access content frame of Pascal Studio iframe!');
  }

  console.log('Waiting for canvas inside embedded iframe...');
  const frameCanvas = await frame.waitForSelector('canvas', { timeout: 20000 });
  const frameCanvasBox = await frameCanvas.boundingBox();
  console.log('Embedded iframe Canvas dimensions:', frameCanvasBox);

  if (!frameCanvasBox || frameCanvasBox.width < 300 || frameCanvasBox.height < 300) {
    throw new Error(`Embedded iframe canvas too small: ${JSON.stringify(frameCanvasBox)}`);
  }

  // Save screenshot of 3D Pascal Studio embedded
  await page.screenshot({ path: path.join(screenshotsDir, 'debug-pascal-studio-embedded.png') });
  console.log('Saved embedded Pascal Studio screenshot');

  // Click 2D Presentation (ArchLang) tab
  console.log('\nClicking "2D Presentation (ArchLang)" tab...');
  await page.locator('button:has-text("2D Presentation (ArchLang)")').first().click();
  await page.waitForTimeout(4000);

  const archLangSvg = await page.waitForSelector('svg', { timeout: 15000 });
  const svgBox = await archLangSvg.boundingBox();
  console.log('ArchLang SVG dimensions:', svgBox);

  // Check room locks / padlocks
  const padlockElements = await page.locator('[aria-label*="Lock"], [aria-label*="lock"], button:has-text("Lock"), [data-testid*="lock"]').count();
  console.log('Found room lock controls count:', padlockElements);

  const archlangScreenshotPath = path.join(screenshotsDir, 'debug-archlang-sheet.png');
  await page.screenshot({ path: archlangScreenshotPath });
  console.log('Saved ArchLang sheet screenshot to:', archlangScreenshotPath);

  // Click Split View (2D + 3D) tab
  console.log('\nClicking "Split View (2D + 3D)" tab...');
  await page.locator('button:has-text("Split View (2D + 3D)")').first().click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(screenshotsDir, 'debug-split-view.png') });
  console.log('Saved Split View screenshot');

  console.log('\n--- VERIFICATION SUCCESSFUL ---');
  console.log('Total critical console errors:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('Console errors encountered:', consoleErrors);
  }

  await browser.close();
}

main().catch((err) => {
  console.error('FATAL VERIFICATION FAILURE:', err);
  process.exit(1);
});
