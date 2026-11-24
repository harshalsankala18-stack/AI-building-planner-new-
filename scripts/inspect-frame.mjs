import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('../packages/frontend/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-unsafe-webgpu', '--use-gl=angle', '--use-angle=swiftshader'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(500);
  await page.locator('button:has-text("Use Demo Credentials")').click();
  await page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.goto('http://localhost:3000/studio');
  await page.waitForTimeout(2000);
  await page.locator('button:has-text("3D Studio"), button:has-text("3D Pascal Studio")').first().click();
  await page.waitForTimeout(4000);
  const frame = await (await page.locator('iframe').first().elementHandle())?.contentFrame();
  const info = await frame.evaluate(() => {
    const sc = window.__THREE_SCENE__;
    if (!sc) return { hasScene: false, windowKeys: Object.keys(window).filter(k => k.includes('THREE') || k.includes('scene')) };
    let meshCount = 0;
    const names = [];
    let zoneFloorCount = 0;
    let wallCount = 0;
    let doorCount = 0;
    let windowCount = 0;
    let stairCount = 0;
    let itemCount = 0;
    sc.traverse((obj) => {
      if (obj.isMesh) {
        meshCount++;
        const n = obj.name || '';
        names.push(n || obj.type);
        if (obj.userData?.isZoneFloor || n.startsWith('zone-floor-')) zoneFloorCount++;
        if (n.toLowerCase().includes('wall')) wallCount++;
        if (n.toLowerCase().includes('door')) doorCount++;
        if (n.toLowerCase().includes('window')) windowCount++;
        if (n.toLowerCase().includes('stair')) stairCount++;
        if (n.toLowerCase().includes('item') || n.toLowerCase().includes('furn')) itemCount++;
      }
    });
    return {
      hasScene: true,
      meshCount,
      zoneFloorCount,
      wallCount,
      doorCount,
      windowCount,
      stairCount,
      itemCount,
      sampleNames: names.slice(0, 30),
    };
  });
  console.log('Frame inspection:', JSON.stringify(info, null, 2));
  await browser.close();
})();
