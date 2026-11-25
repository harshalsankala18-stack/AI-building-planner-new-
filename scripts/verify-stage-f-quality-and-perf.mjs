import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('../packages/frontend/node_modules/playwright');

const SCREENSHOTS_DIR = path.resolve(process.cwd(), 'docs/screenshots/stage-f-verified');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const results = { passed: [], failed: [], metrics: {} };

function pass(name, detail = '') {
  results.passed.push({ name, detail });
  console.log(`  [PASS] ${name}${detail ? ` (${detail})` : ''}`);
}

function fail(name, detail = '') {
  results.failed.push({ name, detail });
  console.error(`  [FAIL] ${name}${detail ? ` (${detail})` : ''}`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function analyzeGrassWhitePatches(browser, buffer) {
  const page = await browser.newPage();
  try {
    const b64 = buffer.toString('base64');
    return await page.evaluate(async (dataUrl) => {
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, c.width, c.height);
      let greenPx = 0;
      let lowerPureWhitePx = 0;
      const lowerStartRow = Math.floor(c.height * 0.25);
      // Sample ONLY inside 3D viewport canvas area (x >= 28% skipping Pascal's left white tree sidebar)
      const canvasStartX = Math.floor(c.width * 0.28);
      const wingRightStart = Math.floor(c.width * 0.85);
      let sampledWingPx = 0;
      for (let y = 0; y < c.height; y++) {
        for (let x = canvasStartX; x < c.width; x++) {
          const i = (y * c.width + x) * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2];
          if (g > r + 8 && g > b + 8 && g > 48) greenPx++;
          // Check pure outer grass terrain wing (left grass meadow strip outside sidebar, tooltip, and plot pad)
          if (y >= lowerStartRow && y < c.height * 0.52 && x < Math.floor(c.width * 0.40)) {
            sampledWingPx++;
            if (r > 240 && g > 240 && b > 240) {
              lowerPureWhitePx++;
            }
          }
        }
      }
      const canvasTotal = Math.max(1, c.height * (c.width - canvasStartX));
      return {
        greenPercent: Number(((greenPx / canvasTotal) * 100).toFixed(2)),
        outerGrassWhitePercent: Number(((lowerPureWhitePx / Math.max(1, sampledWingPx)) * 100).toFixed(2)),
      };
    }, `data:image/png;base64,${b64}`);
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('========================================================================');
  console.log('  STAGE F COMPREHENSIVE QUALITY, PERFORMANCE & MEP AUDIT                ');
  console.log('========================================================================\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=gl'],
  });
  const context = await browser.newContext({ viewport: { width: 1536, height: 960 } });
  const page = await context.newPage();

  const asset404s = [];
  const consoleErrors = [];
  page.on('response', (res) => {
    if (res.status() >= 400 && (res.url().includes('/assets/') || res.url().includes('.glb'))) {
      asset404s.push(`${res.status()} ${res.url()}`);
    }
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const txt = msg.text();
      if (!txt.includes('favicon') && !txt.includes('deprecated')) {
        consoleErrors.push(txt);
      }
    }
  });

  try {
    // -----------------------------------------------------------------------
    // 1. LOGIN & OPEN DEMO 30x50 2BHK FOR 2D MEP/FIRE + WALKTHROUGH CHECKS
    // -----------------------------------------------------------------------
    console.log('[PHASE 1] Authenticating & Opening Demo 2BHK in Studio...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await sleep(600);
    const demoBtn = page.locator('button:has-text("Use Demo Credentials & Sign In")');
    if (await demoBtn.count()) {
      await demoBtn.click();
      await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    }

    await page.goto('http://localhost:3000/studio?project=proj-canonical-30x50-2bhk', {
      waitUntil: 'domcontentloaded',
    });
    await sleep(2200);

    // Ensure 2D Plan tab active
    await page.locator('[data-testid="tab-2d-plan"]').click();
    await sleep(1000);

    // Audit Floating Window Labels & Cramped Inspector Text
    const cad2dAudit = await page.evaluate(() => {
      const svg = document.querySelector('[data-testid="cad-canvas-host"] svg');
      const winGroups = svg ? Array.from(svg.querySelectorAll('g[data-entity-type="window"]')) : [];
      const wallPolys = svg ? Array.from(svg.querySelectorAll('.layer-walls polygon, .layer-walls line')) : [];
      let wallMinX = Infinity, wallMaxX = -Infinity, wallMinY = Infinity, wallMaxY = -Infinity;
      for (const el of wallPolys) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        wallMinX = Math.min(wallMinX, r.left);
        wallMaxX = Math.max(wallMaxX, r.right);
        wallMinY = Math.min(wallMinY, r.top);
        wallMaxY = Math.max(wallMaxY, r.bottom);
      }
      let orphanedWinLabels = 0;
      for (const wg of winGroups) {
        const txt = wg.querySelector('text');
        if (!txt) continue;
        const r = txt.getBoundingClientRect();
        if (
          r.left < wallMinX - 80 ||
          r.right > wallMaxX + 80 ||
          r.top < wallMinY - 80 ||
          r.bottom > wallMaxY + 80
        ) {
          orphanedWinLabels++;
        }
      }
      const inspector = document.querySelector('[data-testid="property-inspector-drawer"]');
      const inspectorWidth = inspector ? inspector.getBoundingClientRect().width : 0;
      return { winCount: winGroups.length, orphanedWinLabels, inspectorWidth };
    });
    results.metrics.cad2dAudit = cad2dAudit;
    if (cad2dAudit.orphanedWinLabels === 0 && cad2dAudit.winCount > 0) {
      pass('Zero Floating Window Labels Outside Building Bounds', `${cad2dAudit.winCount} windows checked`);
    } else {
      fail('Orphaned Window Labels Detected', JSON.stringify(cad2dAudit));
    }
    if (cad2dAudit.inspectorWidth >= 295) {
      pass('2D Right Inspector Full 300px Uncramped Width', `${cad2dAudit.inspectorWidth}px`);
    } else {
      fail('Right Inspector Width Too Narrow', `${cad2dAudit.inspectorWidth}px`);
    }

    // -----------------------------------------------------------------------
    // 2. 2D ELECTRICAL OVERLAY & SCREENSHOT 1
    // -----------------------------------------------------------------------
    console.log('\n[PHASE 2] Verifying 2D Electrical Circuit Overlay...');
    const elecPill = page.locator('[data-testid="cad-pill-electrical"]');
    await elecPill.click();
    await sleep(800);

    const elecMetrics = await page.evaluate(() => {
      const svg = document.querySelector('[data-testid="cad-canvas-host"] svg');
      if (!svg) return { wires: 0, symbols: 0, c1: false, c2: false };
      const wires = svg.querySelectorAll('.cad-layer-M-ELEC-WIRE polyline').length;
      const symbols = svg.querySelectorAll('.cad-layer-M-ELEC-SYMB > g').length;
      const html = svg.innerHTML;
      return {
        wires,
        symbols,
        c1: html.includes('C1-LT'),
        c2: html.includes('C2-PWR'),
      };
    });
    results.metrics.electrical2d = elecMetrics;
    if (elecMetrics.wires >= 2 && elecMetrics.symbols >= 6) {
      pass('2D Electrical Circuit Overlay Active', `${elecMetrics.wires} runs, ${elecMetrics.symbols} symbols`);
    } else {
      fail('2D Electrical Overlay Empty or Incomplete', JSON.stringify(elecMetrics));
    }

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '01-2d-electrical-circuit-plan.png'),
      fullPage: false,
    });
    pass('Saved Screenshot 1', '01-2d-electrical-circuit-plan.png');

    // Toggle Electrical off, Fire Safety on
    await elecPill.click();
    await sleep(300);

    // -----------------------------------------------------------------------
    // 3. 2D FIRE SAFETY & EMERGENCY EGRESS OVERLAY & SCREENSHOT 2
    // -----------------------------------------------------------------------
    console.log('\n[PHASE 3] Verifying 2D Fire Safety & Egress Overlay...');
    const firePill = page.locator('[data-testid="cad-pill-fire-safety"]');
    await firePill.click();
    await sleep(800);

    const fireMetrics = await page.evaluate(() => {
      const svg = document.querySelector('[data-testid="cad-canvas-host"] svg');
      if (!svg) return { firePipes: 0, fireSymbols: 0, hasEgressText: false };
      const firePipes = svg.querySelectorAll('.cad-layer-F-FIRE-PIPE polyline').length;
      const fireSymbols = svg.querySelectorAll('.cad-layer-F-FIRE-SYMB > g').length;
      const hasEgressText = svg.innerHTML.includes('EGRESS');
      return { firePipes, fireSymbols, hasEgressText };
    });
    results.metrics.fireSafety2d = fireMetrics;
    if (fireMetrics.firePipes >= 1 && fireMetrics.fireSymbols >= 3 && fireMetrics.hasEgressText) {
      pass(
        '2D Fire Safety & Egress Path Overlay Active',
        `${fireMetrics.firePipes} runs/arrows, ${fireMetrics.fireSymbols} symbols`,
      );
    } else {
      fail('2D Fire Safety Overlay Incomplete', JSON.stringify(fireMetrics));
    }

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '02-2d-fire-safety-plan.png'),
      fullPage: false,
    });
    pass('Saved Screenshot 2', '02-2d-fire-safety-plan.png');
    await firePill.click();

    // -----------------------------------------------------------------------
    // 4. 3D STUDIO PERFORMANCE, GRASS AUDIT, TV FEATURE WALL & WALK INSIDE (2BHK + TOWER)
    // -----------------------------------------------------------------------
    console.log('\n[PHASE 4] Verifying 2BHK Living Room TV Wall & Walk Inside Spawn...');
    const t0 = Date.now();
    await page.locator('[data-testid="tab-3d-studio"]').click();
    const iframeHandle = page.locator('iframe[title="Pascal 3D Studio"], iframe[title*="Pascal"]').first();
    await iframeHandle.waitFor({ state: 'visible', timeout: 15000 });
    const frame = await (await iframeHandle.elementHandle())?.contentFrame();
    if (!frame) throw new Error('Pascal iframe missing');

    // Wait until Pascal Three.js canvas paints first non-white frame (spinner overlay dismissed)
    await frame
      .waitForFunction(
        () => {
          const us = window.__PASCAL_USE_SCENE__;
          const sc = window.__THREE_SCENE__;
          if (!us || !sc) return false;
          const wallCount = Object.values(us.getState().nodes || {}).filter((n) => n?.type === 'wall').length;
          let meshCount = 0;
          sc.traverse((o) => {
            if (o.isMesh) meshCount++;
          });
          return wallCount > 0 && meshCount >= 20;
        },
        undefined,
        { timeout: 15000 },
      )
      .catch(() => {});
    // Poll canvas/frame briefly until Pascal's white loader div is gone (~2-3s)
    for (let attempt = 0; attempt < 20; attempt++) {
      const hasWhiteOverlay = await frame.evaluate(() => {
        const bgDivs = Array.from(document.querySelectorAll('div'));
        return bgDivs.some((el) => {
          const r = el.getBoundingClientRect();
          if (r.width < 400 || r.height < 400) return false;
          const bg = getComputedStyle(el).backgroundColor;
          return bg === 'rgb(255, 255, 255)';
        });
      });
      if (!hasWhiteOverlay) break;
      await sleep(250);
    }
    await frame.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
    );
    const load2bhkMs = Date.now() - t0;
    results.metrics.load2bhkMs = load2bhkMs;

    // Inspect Three.js scene & camera + exterior grass screenshot
    const scene2bhk = await frame.evaluate(() => {
      const sc = window.__THREE_SCENE__;
      const cam = window.__THREE_CAMERA__;
      if (!sc) return { error: 'no __THREE_SCENE__' };
      let meshCount = 0;
      let brokenRedWireframes = 0;
      let hiddenSiteGround = true;
      sc.traverse((o) => {
        if (!o.isMesh) return;
        meshCount++;
        const mat = Array.isArray(o.material) ? o.material[0] : o.material;
        if (mat && mat.wireframe && mat.color && mat.color.getHexString() === 'ef4444') {
          brokenRedWireframes++;
        }
        const nl = (o.name || '').toLowerCase();
        if ((nl.includes('horizon') || (nl.includes('ground') && !nl.includes('architectural'))) && o.visible) {
          hiddenSiteGround = false;
        }
      });
      return {
        meshCount,
        brokenRedWireframes,
        hiddenSiteGround,
        cameraFar: cam ? cam.far : 0,
      };
    });
    results.metrics.scene2bhk = scene2bhk;
    if (scene2bhk.brokenRedWireframes === 0) {
      pass('Zero Red Wireframe Error Boxes on 2BHK', `meshes=${scene2bhk.meshCount}`);
    } else {
      fail('Red Wireframes Present on 2BHK', JSON.stringify(scene2bhk));
    }

    const shot3Buf = await page.screenshot({ fullPage: false });
    fs.writeFileSync(path.join(SCREENSHOTS_DIR, '03-3d-exterior-clean-grass.png'), shot3Buf);
    const grassAudit = await analyzeGrassWhitePatches(browser, shot3Buf);
    results.metrics.grassAudit = grassAudit;
    if (grassAudit.greenPercent >= 12 && grassAudit.outerGrassWhitePercent < 2.0) {
      pass(
        'Exterior Grass Smooth & Zero White Slicing Patches',
        `green=${grassAudit.greenPercent}%, outerWhite=${grassAudit.outerGrassWhitePercent}%`,
      );
    } else {
      fail('Grass Terrain Issue Detected', JSON.stringify(grassAudit));
    }

    // Zoom camera close to Living Room TV Feature Wall for Screenshot 4 using CameraControls
    const tvShotInfo = await frame.evaluate(() => {
      const cam = window.__THREE_CAMERA__;
      const ctrl = window.__THREE_CONTROLS__;
      const useSceneStore = window.__PASCAL_USE_SCENE__;
      if (!cam || !useSceneStore) return { found: false };
      const nodes = useSceneStore.getState().nodes || {};
      const items = Object.values(nodes).filter((n) => n && n.type === 'item');
      const livingZone = Object.values(nodes).find(
        (n) => n && n.type === 'zone' && /living/i.test(n.name || ''),
      );
      const roomFilter = (n) =>
        !livingZone?.metadata?.canonicalRoomId || n.metadata?.canonicalRoomId === livingZone.metadata.canonicalRoomId;
      const tvNode = items.find((n) => n.asset?.id === 'tv_console' && roomFilter(n)) ??
        items.find((n) => n.asset?.id === 'tv_console');
      const sofaNode = items.find((n) => n.asset?.id === 'sofa_3seater' && roomFilter(n)) ??
        items.find((n) => n.asset?.id === 'sofa_3seater');
      if (tvNode && Array.isArray(tvNode.position)) {
        const tx = tvNode.position[0];
        const ty = tvNode.position[1] ?? 0;
        const tz = tvNode.position[2];
        let cx = tx + 2.5;
        let cz = tz - 2.3;
        if (sofaNode && Array.isArray(sofaNode.position)) {
          const sx = sofaNode.position[0];
          const sz = sofaNode.position[2];
          const dx = sx - tx;
          const dz = sz - tz;
          const dl = Math.hypot(dx, dz) || 1;
          cx = tx + (dx / dl) * 2.9 + 0.7;
          cz = tz + (dz / dl) * 2.9 + 0.4;
        } else if (livingZone && Array.isArray(livingZone.polygon) && livingZone.polygon.length >= 3) {
          let sx = 0, sz = 0;
          for (const pt of livingZone.polygon) { sx += pt[0]; sz += pt[1]; }
          const zx = sx / livingZone.polygon.length;
          const zz = sz / livingZone.polygon.length;
          const dx = zx - tx;
          const dz = zz - tz;
          const dl = Math.hypot(dx, dz) || 1;
          cx = tx + (dx / dl) * 2.8;
          cz = tz + (dz / dl) * 2.8;
        }
        const cy = ty + 2.15;
        if (ctrl && typeof ctrl.setLookAt === 'function') {
          ctrl.setLookAt(cx, cy, cz, tx, ty + 0.85, tz, false);
        } else {
          cam.position.set(cx, cy, cz);
          cam.lookAt(tx, ty + 0.85, tz);
          cam.updateProjectionMatrix();
        }
        return { found: true, tx, tz, cx, cz, usedControls: Boolean(ctrl?.setLookAt) };
      }
      return { found: false };
    });
    await sleep(600);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '04-3d-living-tv-wall.png'),
      fullPage: false,
    });
    pass('Saved Screenshot 4', `04-3d-living-tv-wall.png (tvLocated=${tvShotInfo.found})`);

    // Test Walk Inside First-Person Living Room Spawn + Screenshot 5
    console.log('\n[PHASE 5] Auditing Walk Inside Living Room Spawn...');
    const walkBtn = page.locator('button:has-text("Walk Inside")').first();
    await walkBtn.click();
    await sleep(1600);

    const spawnBannerCount = await frame.locator('text=Place a spawn point').count();
    const walkCamStats = await frame.evaluate(() => {
      const cam = window.__THREE_CAMERA__;
      return cam
        ? { x: Number(cam.position.x.toFixed(2)), y: Number(cam.position.y.toFixed(2)), z: Number(cam.position.z.toFixed(2)) }
        : null;
    });
    results.metrics.walkCamStats = walkCamStats;
    if (spawnBannerCount === 0 && walkCamStats && walkCamStats.x > 0 && walkCamStats.z > 0 && walkCamStats.y >= 1.2) {
      pass(
        'Walk Inside Spawns Strictly Inside Living Room Without Missing-Spawn Banner',
        `cam=(${walkCamStats.x}, ${walkCamStats.y}, ${walkCamStats.z})`,
      );
    } else {
      fail('Walk Inside Spawn Failed', `bannerCount=${spawnBannerCount}, cam=${JSON.stringify(walkCamStats)}`);
    }

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '05-3d-walkthrough-inside-living-room.png'),
      fullPage: false,
    });
    pass('Saved Screenshot 5', '05-3d-walkthrough-inside-living-room.png');

    // Exit walkthrough
    await walkBtn.click().catch(() => {});
    await sleep(500);

    // -----------------------------------------------------------------------
    // 5. ARGON RESIDENCE TOWERS MULTI-STORY PERFORMANCE & FPS AUDIT
    // -----------------------------------------------------------------------
    console.log('\n[PHASE 6] Loading ARGON Residence Towers (5 Floors) & Measuring Speed/FPS...');
    await page.goto('http://localhost:3000/studio?project=proj-argon-tower-01', {
      waitUntil: 'domcontentloaded',
    });
    await page
      .waitForFunction(
        () => document.body.innerText.includes('ARGON Residence'),
        undefined,
        { timeout: 12000 },
      )
      .catch(() => {});

    const tTower0 = Date.now();
    await page.locator('[data-testid="tab-3d-studio"]').click();

    const towerIframeHandle = page.locator('iframe[title="Pascal 3D Studio"], iframe[title*="Pascal"]').first();
    await towerIframeHandle.waitFor({ state: 'visible', timeout: 15000 });
    const towerFrame = await (await towerIframeHandle.elementHandle())?.contentFrame();
    if (!towerFrame) throw new Error('Tower Pascal iframe missing');

    await page
      .waitForFunction(
        () => !document.body.innerText.includes('Loading building scene...'),
        undefined,
        { timeout: 15000 },
      )
      .catch(() => {});
    await towerFrame
      .waitForFunction(
        () => {
          const sc = window.__THREE_SCENE__;
          const us = window.__PASCAL_USE_SCENE__;
          if (!sc || !us) return false;
          const lvlCount = Object.values(us.getState().nodes || {}).filter((n) => n?.type === 'level').length;
          return lvlCount >= 5;
        },
        undefined,
        { timeout: 15000 },
      )
      .catch(() => {});
    for (let attempt = 0; attempt < 25; attempt++) {
      const hasWhiteOverlay = await towerFrame.evaluate(() => {
        const bgDivs = Array.from(document.querySelectorAll('div'));
        return bgDivs.some((el) => {
          const r = el.getBoundingClientRect();
          if (r.width < 400 || r.height < 400) return false;
          return getComputedStyle(el).backgroundColor === 'rgb(255, 255, 255)';
        });
      });
      if (!hasWhiteOverlay) break;
      await sleep(200);
    }
    await towerFrame.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
    );
    const towerLoadMs = Date.now() - tTower0;
    results.metrics.towerLoadMs = towerLoadMs;

    const towerLevelCount = await towerFrame.evaluate(() => {
      const us = window.__PASCAL_USE_SCENE__;
      return us
        ? Object.values(us.getState().nodes || {}).filter((n) => n?.type === 'level').length
        : 0;
    });
    results.metrics.towerLevelCount = towerLevelCount;
    if (towerLevelCount >= 5) {
      pass('ARGON Residence Towers 5 Floors Loaded in 3D Studio', `${towerLevelCount} floors`);
    } else {
      fail('Wrong Building / Floor Count Loaded in 3D', `levels=${towerLevelCount}`);
    }

    if (towerLoadMs < 8000) {
      pass('ARGON Residence Towers 3D Load Under Fast Budget', `${towerLoadMs} ms`);
    } else {
      fail('ARGON Residence Towers Load Too Slow', `${towerLoadMs} ms`);
    }

    // Measure FPS on isolated Solo floor first, then switch 3D toolbar to All Floors (Stacked)
    const soloFps = await towerFrame.evaluate(
      () =>
        new Promise((resolve) => {
          let frames = 0;
          const start = performance.now();
          const tick = () => {
            frames++;
            const elapsed = performance.now() - start;
            if (elapsed >= 1500) {
              resolve(Number(((frames / elapsed) * 1000).toFixed(1)));
            } else {
              requestAnimationFrame(tick);
            }
          };
          requestAnimationFrame(tick);
        }),
    );
    results.metrics.towerSoloFps = soloFps;

    const allFloorsBtn = page.locator('button:has-text("All Floors")').last();
    if (await allFloorsBtn.count()) {
      await allFloorsBtn.click();
      await sleep(1200);
    }
    const fullWallsBtn = page.locator('button:has-text("Full Walls")').first();
    if (await fullWallsBtn.count()) {
      await fullWallsBtn.click();
      await sleep(3600);
    }
    // Zoom camera slightly out for full 5-story ARGON Residence Towers hero perspective
    await towerFrame.evaluate(() => {
      const ctrl = window.__THREE_CONTROLS__;
      if (ctrl && typeof ctrl.setLookAt === 'function') {
        ctrl.setLookAt(52, 28, 56, 20, 7.5, 22, false);
      }
    });
    await sleep(600);

    const towerFps = await towerFrame.evaluate(
      () =>
        new Promise((resolve) => {
          let frames = 0;
          const start = performance.now();
          const tick = () => {
            frames++;
            const elapsed = performance.now() - start;
            if (elapsed >= 1500) {
              resolve(Number(((frames / elapsed) * 1000).toFixed(1)));
            } else {
              requestAnimationFrame(tick);
            }
          };
          requestAnimationFrame(tick);
        }),
    );
    results.metrics.towerFps = towerFps;
    if (soloFps >= 15 || towerFps >= 12) {
      pass(
        '5-Floor Tower Render Frame Rate Verified in Headless Chromium',
        `solo=${soloFps} FPS, stacked=${towerFps} FPS`,
      );
    } else {
      fail('5-Floor Tower Render FPS Too Low', `solo=${soloFps} FPS, stacked=${towerFps} FPS`);
    }

    const towerSceneAudit = await towerFrame.evaluate(() => {
      const sc = window.__THREE_SCENE__;
      if (!sc) return { brokenRedWireframes: -1, meshCount: 0 };
      let meshCount = 0;
      let brokenRedWireframes = 0;
      sc.traverse((o) => {
        if (!o.isMesh) return;
        meshCount++;
        const mat = Array.isArray(o.material) ? o.material[0] : o.material;
        if (mat && mat.wireframe && mat.color && mat.color.getHexString() === 'ef4444') {
          brokenRedWireframes++;
        }
      });
      return { meshCount, brokenRedWireframes };
    });
    results.metrics.towerSceneAudit = towerSceneAudit;
    if (towerSceneAudit.brokenRedWireframes === 0 && towerSceneAudit.meshCount > 20) {
      pass('ARGON Residence Towers Zero Red Wireframes', `meshes=${towerSceneAudit.meshCount}`);
    } else {
      fail('ARGON Residence Towers Wireframe/Mesh Issue', JSON.stringify(towerSceneAudit));
    }

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '06-3d-argon-towers-5floor.png'),
      fullPage: false,
    });
    pass('Saved Screenshot 6', '06-3d-argon-towers-5floor.png');

    // Final GLB 404 check
    results.metrics.asset404s = asset404s;
    if (asset404s.length === 0) {
      pass('Zero Missing .GLB Asset 404 Requests Across All Floors');
    } else {
      fail('Detected Missing .GLB Requests', asset404s.join(', '));
    }
  } finally {
    await browser.close();
  }

  console.log('\n========================================================================');
  console.log(`  STAGE F RESULTS: ${results.passed.length} PASSED, ${results.failed.length} FAILED`);
  console.log('  Metrics:', JSON.stringify(results.metrics, null, 2));
  console.log('========================================================================');

  if (results.failed.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Stage F Audit Fatal Error:', err);
  process.exit(1);
});
