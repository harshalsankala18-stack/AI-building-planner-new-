import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('../packages/frontend/node_modules/playwright');

async function main() {
  console.log('--- STARTING PLAYWRIGHT FORENSIC DIAGNOSTIC ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();

  const logs = [];
  const errors = [];
  const failedRequests = [];

  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    logs.push(`[PAGE ${type}] ${text}`);
    if (type === 'error') errors.push(`[PAGE ERROR] ${text}`);
  });

  page.on('pageerror', (err) => {
    errors.push(`[UNCAUGHT PAGE EXCEPTION] ${err.message}\n${err.stack}`);
  });

  page.on('requestfailed', (req) => {
    failedRequests.push(`[FAILED REQ] ${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
  });

  page.on('response', (res) => {
    if (res.status() >= 400) {
      failedRequests.push(`[HTTP ${res.status()}] ${res.url()}`);
    }
  });

  console.log('1. Navigating to http://localhost:3000/login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const demoBtn = page.locator('button:has-text("Use Demo Credentials & Sign In")');
  if (await demoBtn.count()) {
    await demoBtn.click();
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
  }

  console.log('2. Opening studio...');
  await page.goto('http://localhost:3000/studio', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  console.log('3. Switching to 3D Pascal Studio tab...');
  const tab3d = page.locator('button:has-text("3D Studio"), button:has-text("3D Pascal Studio")').first();
  if (await tab3d.count()) {
    await tab3d.click();
  }
  await page.waitForTimeout(4000);

  console.log('4. Inspecting iframe...');
  const iframeElement = await page.$('iframe');
  if (!iframeElement) {
    console.log('NO IFRAME FOUND ON PAGE!');
  } else {
    const frame = await iframeElement.contentFrame();
    if (!frame) {
      console.log('contentFrame() returned null!');
    } else {
      console.log('Frame URL:', frame.url());
      const frameHtml = await frame.evaluate(() => document.body.innerHTML);
      console.log('Iframe document.body.innerHTML length:', frameHtml.length);
      console.log('Iframe document.body.innerHTML slice(0, 1000):');
      console.log(frameHtml.slice(0, 1000));

      const canvasInfo = await frame.evaluate(() => {
        const canvases = Array.from(document.querySelectorAll('canvas'));
        return canvases.map((c) => {
          const rect = c.getBoundingClientRect();
          return {
            width: c.width,
            height: c.height,
            clientWidth: c.clientWidth,
            clientHeight: c.clientHeight,
            rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
            gl: Boolean(c.getContext('webgl') || c.getContext('webgl2')),
          };
        });
      });
      console.log('Iframe canvas info:', JSON.stringify(canvasInfo, null, 2));
    }
  }

  console.log('\n--- DIAGNOSTIC RESULTS (PAGE) ---');
  console.log('Total errors:', errors.length);
  errors.forEach((e) => console.log('ERROR:', e));
  console.log('\nTotal failed requests:', failedRequests.length);
  failedRequests.forEach((r) => console.log('FAILED REQ:', r));

  console.log('\n5. Also checking direct http://localhost:3000/pascal-studio/ ...');
  const directPage = await context.newPage();
  const directErrors = [];
  directPage.on('console', (msg) => {
    if (msg.type() === 'error') directErrors.push(`[DIRECT CONSOLE ERROR] ${msg.text()}`);
  });
  directPage.on('pageerror', (err) => {
    directErrors.push(`[DIRECT PAGEERROR] ${err.message}\n${err.stack}`);
  });
  await directPage.goto('http://localhost:3000/pascal-studio/', { waitUntil: 'domcontentloaded' });
  await directPage.waitForTimeout(3000);

  const directBodyHtml = await directPage.evaluate(() => document.body.innerHTML);
  console.log('Direct /pascal-studio/ body length:', directBodyHtml.length);
  console.log('Direct /pascal-studio/ body HTML slice(0, 500):', directBodyHtml.slice(0, 500));
  console.log('Direct errors count:', directErrors.length);
  directErrors.forEach((e) => console.log(e));

  await browser.close();
}

main().catch(console.error);
