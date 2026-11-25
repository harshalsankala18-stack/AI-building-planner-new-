import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('../packages/frontend/node_modules/playwright');

const SCREENSHOTS_DIR = path.resolve(process.cwd(), 'docs/screenshots/stage-g-verified');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const results = { passed: [], failed: [], metrics: {} };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function pass(name, detail = '') {
  results.passed.push({ name, detail });
  console.log(`  [PASS] ${name}${detail ? ` (${detail})` : ''}`);
}

function fail(name, detail = '') {
  results.failed.push({ name, detail });
  console.error(`  [FAIL] ${name}${detail ? ` (${detail})` : ''}`);
}

async function main() {
  console.log('========================================================================');
  console.log('  STAGE G PERFORMANCE, KEEP-ALIVE, REALISM & 413 FIX VERIFICATION      ');
  console.log('========================================================================\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=gl'],
  });
  const context = await browser.newContext({ viewport: { width: 1536, height: 960 } });
  const page = await context.newPage();

  const glb404s = [];
  const archlangLogs = [];
  page.on('request', (req) => {
    if (req.url().includes('/archlang/preview')) {
      archlangLogs.push({
        url: req.url(),
        reqBytes: Buffer.byteLength(req.postData() || '', 'utf8'),
        t0: Date.now(),
      });
    }
  });
  page.on('response', (res) => {
    if (res.status() >= 400 && (res.url().includes('/assets/') || res.url().includes('.glb'))) {
      glb404s.push(`${res.status()} ${res.url()}`);
    }
    if (res.url().includes('/archlang/preview')) {
      const entry = archlangLogs.find((e) => e.url === res.url() && e.status === undefined);
      if (entry) {
        entry.status = res.status();
        entry.elapsedMs = Date.now() - entry.t0;
      }
    }
  });

  try {
    // -----------------------------------------------------------------------
    // PHASE 1: LOGIN & DEMO 2BHK (2D Orthogonal Wiring + 3D Cutaway + Keep-Alive)
    // -----------------------------------------------------------------------
    console.log('[PHASE 1] Authenticating & Opening Demo 2BHK...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await sleep(500);
    const demoBtn = page.locator('button:has-text("Use Demo Credentials & Sign In")');
    if (await demoBtn.count()) {
      await demoBtn.click();
      await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 15000 }).catch(() => {});
    }

    await page.goto('http://localhost:3000/studio?project=proj-canonical-30x50-2bhk', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('[data-testid="tab-2d-plan"]', { timeout: 15000 });
    await page.locator('[data-testid="tab-2d-plan"]').click();
    await sleep(1200);

    // Toggle Electrical overlay and verify orthogonal wiring runs
    const elecPill = page.locator('[data-testid="cad-pill-electrical"]');
    if (await elecPill.count()) {
      await elecPill.click();
      await sleep(700);
    }

    const elecAudit = await page.evaluate(() => {
      const svg = document.querySelector('[data-testid="cad-canvas-host"] svg');
      if (!svg) return { wires: 0, diagonalSegments: -1, junctions: 0 };
      const polys = Array.from(svg.querySelectorAll('.cad-layer-M-ELEC-WIRE polyline'));
      let diagonalSegments = 0;
      for (const pl of polys) {
        const raw = (pl.getAttribute('points') || '').trim().split(/\s+/);
        const pts = raw.map((p) => p.split(',').map(Number));
        for (let i = 1; i < pts.length; i++) {
          const [x1, y1] = pts[i - 1];
          const [x2, y2] = pts[i];
          if (Math.abs(x2 - x1) > 1.5 && Math.abs(y2 - y1) > 1.5) {
            diagonalSegments++;
          }
        }
      }
      const junctions = svg.querySelectorAll('.cad-layer-M-ELEC-WIRE circle[data-mep-junction="true"]').length;
      return { wires: polys.length, diagonalSegments, junctions };
    });
    results.metrics.electrical2d = elecAudit;
    if (elecAudit.wires >= 1 && elecAudit.diagonalSegments === 0) {
      pass('2D Electrical Wiring Strictly 90° Orthogonal', `${elecAudit.wires} runs, ${elecAudit.junctions} junctions, 0 diagonals`);
    } else {
      fail('2D Electrical Wiring Contains Diagonals or Empty', JSON.stringify(elecAudit));
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-2d-orthogonal-electrical.png'), fullPage: false });
    pass('Saved Screenshot 1', '01-2d-orthogonal-electrical.png');

    // Measure Demo 2BHK initial 3D Studio load & inspect Cutaway walls
    const tDemo0 = Date.now();
    await page.locator('[data-testid="tab-3d-studio"]').click();
    const demoIframeEl = page.locator('iframe[title="Pascal 3D Studio"]').first();
    await demoIframeEl.waitFor({ state: 'visible', timeout: 15000 });
    const demoFrame = await (await demoIframeEl.elementHandle())?.contentFrame();
    if (!demoFrame) throw new Error('Demo Pascal iframe missing');

    await demoFrame.waitForFunction(() => {
      const us = window.__PASCAL_USE_SCENE__;
      const sc = window.__THREE_SCENE__;
      if (!us || !sc) return false;
      return Object.keys(us.getState().nodes || {}).length > 10;
    }, undefined, { timeout: 15000 });
    await page.waitForFunction(() => !document.body.innerText.includes('Loading building scene...'), undefined, { timeout: 10000 }).catch(() => {});
    for (let i = 0; i < 25; i++) {
      const whiteCurtain = await demoFrame.evaluate(() =>
        Array.from(document.querySelectorAll('div')).some((el) => {
          const r = el.getBoundingClientRect();
          return r.width >= 400 && r.height >= 400 && getComputedStyle(el).backgroundColor === 'rgb(255, 255, 255)';
        }),
      );
      if (!whiteCurtain) break;
      await sleep(150);
    }
    await sleep(300);
    const demoLoadMs = Date.now() - tDemo0;
    results.metrics.demo3dLoadMs = demoLoadMs;

    const demoCutawayAudit = await demoFrame.evaluate(() => {
      const sc = window.__THREE_SCENE__;
      const us = window.__PASCAL_USE_SCENE__;
      const nodes = us ? Object.values(us.getState().nodes || {}) : [];
      const walls = nodes.filter((n) => n?.type === 'wall');
      const cutawayWalls = walls.filter((w) => !w.metadata?.isBalconyRailing && Number(w.height) >= 1.35 && Number(w.height) <= 1.85);
      const items = nodes.filter((n) => n?.type === 'item');
      let meshCount = 0;
      let brokenRedWireframes = 0;
      let capGroupCount = 0;
      sc?.traverse((o) => {
        if (o.name === 'ArchitecturalCapsAndFascia') capGroupCount = o.children?.length ?? 0;
        if (!o.isMesh || !o.visible) return;
        meshCount++;
        const mat = Array.isArray(o.material) ? o.material[0] : o.material;
        if (mat && mat.wireframe && mat.color && mat.color.getHexString() === 'ef4444') {
          brokenRedWireframes++;
        }
      });
      return {
        wallNodes: walls.length,
        cutawayWalls: cutawayWalls.length,
        avgCutawayHeight: cutawayWalls.length ? Number((cutawayWalls.reduce((s, w) => s + Number(w.height), 0) / cutawayWalls.length).toFixed(2)) : 0,
        itemNodes: items.length,
        visibleMeshCount: meshCount,
        capMeshes: capGroupCount,
        brokenRedWireframes,
      };
    });
    results.metrics.demoCutawayAudit = demoCutawayAudit;
    if (demoCutawayAudit.cutawayWalls >= 8 && demoCutawayAudit.avgCutawayHeight >= 1.4 && demoCutawayAudit.avgCutawayHeight <= 1.85 && demoCutawayAudit.capMeshes >= 8 && demoCutawayAudit.brokenRedWireframes === 0) {
      pass('Cutaway Walls Solid & Visible With Dark Top Caps', JSON.stringify(demoCutawayAudit));
    } else {
      fail('Cutaway Walls Missing or Incorrect Height', JSON.stringify(demoCutawayAudit));
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-demo-3d-cutaway-walls.png'), fullPage: false });
    pass('Saved Screenshot 2', '02-demo-3d-cutaway-walls.png');

    // Keep-Alive Test: stamp iframe node, switch 3D -> 2D Plan -> 3D Studio
    await page.evaluate(() => {
      window.__stageGKeepAliveIframe = document.querySelector('iframe[title="Pascal 3D Studio"]');
    });
    await page.locator('[data-testid="tab-2d-plan"]').click();
    await sleep(300);
    const tKeep0 = Date.now();
    await page.locator('[data-testid="tab-3d-studio"]').click();
    await demoIframeEl.waitFor({ state: 'visible', timeout: 5000 });
    const keepAliveCheck = await page.evaluate(() => {
      const cur = document.querySelector('iframe[title="Pascal 3D Studio"]');
      const sameDom = Boolean(cur && cur === window.__stageGKeepAliveIframe);
      const flashNoBuildings = document.body.innerText.includes('No buildings yet');
      return { sameDom, flashNoBuildings };
    });
    const keepAliveSwitchMs = Date.now() - tKeep0;
    results.metrics.keepAliveSwitchMs = keepAliveSwitchMs;
    results.metrics.keepAliveCheck = keepAliveCheck;
    if (keepAliveCheck.sameDom && !keepAliveCheck.flashNoBuildings && keepAliveSwitchMs < 400) {
      pass('Keep-Alive 3D -> 2D -> 3D Zero Remounts', `${keepAliveSwitchMs} ms, sameDom=true`);
    } else {
      fail('Keep-Alive Switch Slow or Remounted', `${keepAliveSwitchMs} ms, ${JSON.stringify(keepAliveCheck)}`);
    }

    // -----------------------------------------------------------------------
    // PHASE 2: ARGON RESIDENCE TOWERS (2D Sheet 200 + 5-Floor All Floors Speed + Walk Inside)
    // -----------------------------------------------------------------------
    console.log('\n[PHASE 2] Auditing 5-Floor ARGON Residence Towers...');
    await page.goto('http://localhost:3000/studio?project=proj-argon-tower-01', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForFunction(() => document.body.innerText.includes('ARGON Residence'), undefined, { timeout: 15000 }).catch(() => {});
    await sleep(1000);

    // 2D Sheet (ArchLang) 413 fix check on multi-story building
    const tSheet0 = Date.now();
    await page.locator('[data-testid="tab-2d-sheet"]').click();
    await page.waitForFunction(
      () =>
        !document.body.innerText.includes('Compiling ArchLang') &&
        !document.body.innerText.includes('413') &&
        !document.body.innerText.includes('Payload Too Large') &&
        Boolean(document.querySelector('svg[viewBox]')),
      undefined,
      { timeout: 15000 },
    );
    await sleep(400);
    const sheetRenderMs = Date.now() - tSheet0;
    results.metrics.sheetRenderMs = sheetRenderMs;
    results.metrics.archlangRequests = archlangLogs;

    const latestArch = archlangLogs[archlangLogs.length - 1];
    const has413 = archlangLogs.some((l) => l.status === 413);
    if (!has413 && latestArch?.status === 200) {
      pass('2D Sheet (ArchLang) Returned HTTP 200 (Zero 413)', `reqBytes=${latestArch.reqBytes}B, render=${sheetRenderMs}ms`);
    } else {
      fail('2D Sheet (ArchLang) Failed or Returned 413', JSON.stringify(archlangLogs));
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-2d-sheet-archlang-200.png'), fullPage: false });
    pass('Saved Screenshot 3', '03-2d-sheet-archlang-200.png');

    // Switch to 3D Studio on ARGON Residence Towers
    const tTower0 = Date.now();
    await page.locator('[data-testid="tab-3d-studio"]').click();
    const towerIframeEl = page.locator('iframe[title="Pascal 3D Studio"]').first();
    await towerIframeEl.waitFor({ state: 'visible', timeout: 15000 });
    const towerFrame = await (await towerIframeEl.elementHandle())?.contentFrame();
    if (!towerFrame) throw new Error('Tower iframe missing');

    await towerFrame.waitForFunction(() => {
      const us = window.__PASCAL_USE_SCENE__;
      const sc = window.__THREE_SCENE__;
      if (!us || !sc) return false;
      const lvls = Object.values(us.getState().nodes || {}).filter((n) => n?.type === 'level').length;
      return lvls >= 5;
    }, undefined, { timeout: 15000 });
    await sleep(300);
    const towerInitial3dMs = Date.now() - tTower0;
    results.metrics.towerInitial3dMs = towerInitial3dMs;

    // Click All Floors and measure exact transition speed until stacked mode + all level slabs render
    const tAll0 = Date.now();
    await page.locator('[data-testid="floor-mode-stacked"]').click();
    await towerFrame.waitForFunction(() => {
      const uv = window.__PASCAL_USE_VIEWER__;
      const us = window.__PASCAL_USE_SCENE__;
      const sc = window.__THREE_SCENE__;
      if (!uv || !us || !sc || uv.getState().levelMode !== 'stacked') return false;
      let fasciaBands = 0;
      sc.traverse((o) => {
        if (o.name === 'ArchitecturalCapsAndFascia') fasciaBands = o.children?.length ?? 0;
      });
      return fasciaBands >= 8;
    }, undefined, { timeout: 10000 });
    await towerFrame.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const allFloorsSwitchMs = Date.now() - tAll0;
    results.metrics.allFloorsSwitchMs = allFloorsSwitchMs;

    if (allFloorsSwitchMs < 2500) {
      pass('ARGON Residence Towers All Floors Switch Fast', `${allFloorsSwitchMs} ms (< 2500ms)`);
    } else {
      fail('ARGON Residence Towers All Floors Switch Exceeded Budget', `${allFloorsSwitchMs} ms`);
    }

    // Set crisp exterior perspective & wait for settled render (no white curtain) before screenshot
    await towerFrame.evaluate(() => {
      const ctrl = window.__THREE_CONTROLS__;
      if (ctrl && typeof ctrl.setLookAt === 'function') {
        ctrl.setLookAt(52, 26, 56, 20, 7.5, 22, false);
      }
    });
    for (let i = 0; i < 25; i++) {
      const whiteCurtain = await towerFrame.evaluate(() =>
        Array.from(document.querySelectorAll('div')).some((el) => {
          const r = el.getBoundingClientRect();
          return r.width >= 400 && r.height >= 400 && getComputedStyle(el).backgroundColor === 'rgb(255, 255, 255)';
        }),
      );
      if (!whiteCurtain) break;
      await sleep(150);
    }
    await sleep(400);

    const towerAudit = await towerFrame.evaluate(() => {
      const sc = window.__THREE_SCENE__;
      let fasciaBands = 0;
      let brokenRedWireframes = 0;
      let meshCount = 0;
      sc?.traverse((o) => {
        if (o.name === 'ArchitecturalCapsAndFascia') fasciaBands = o.children?.length ?? 0;
        if (!o.isMesh) return;
        meshCount++;
        const mat = Array.isArray(o.material) ? o.material[0] : o.material;
        if (mat && mat.wireframe && mat.color && mat.color.getHexString() === 'ef4444') {
          brokenRedWireframes++;
        }
      });
      return { fasciaBands, meshCount, brokenRedWireframes };
    });
    results.metrics.towerAudit = towerAudit;
    if (towerAudit.fasciaBands >= 8 && towerAudit.brokenRedWireframes === 0) {
      pass('5-Floor Exterior Facade + Slab Bands Rendered Cleanly', JSON.stringify(towerAudit));
    } else {
      fail('5-Floor Exterior Missing Slab Bands or Had Wireframes', JSON.stringify(towerAudit));
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-5floor-all-floors-facade.png'), fullPage: false });
    pass('Saved Screenshot 4', '04-5floor-all-floors-facade.png');

    // Switch to 1ST FLOOR (furnished residential suite), Isolate floor & Walk Inside Living Room
    const firstFloorBtn = page.locator('.studio-context-bar button:has-text("1ST FLOOR")').first();
    if (await firstFloorBtn.count()) {
      await firstFloorBtn.click();
      await sleep(300);
    }
    await page.locator('[data-testid="floor-mode-isolate"]').click();
    await towerFrame.waitForFunction(() => {
      const us = window.__PASCAL_USE_SCENE__;
      if (!us) return false;
      const st = us.getState();
      const itemCount = Object.values(st.nodes || {}).filter((n) => n?.type === 'item').length;
      return itemCount > 10 && (st.dirtyNodes?.size ?? 1) === 0;
    }, undefined, { timeout: 10000 });
    await page.locator('[data-testid="walkthrough-btn"]').click();
    await sleep(1100);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-walk-inside-living-room.png'), fullPage: false });
    pass('Saved Screenshot 5', '05-walk-inside-living-room.png');

    results.metrics.glb404s = glb404s;
    if (glb404s.length === 0) {
      pass('Zero Missing .GLB Asset 404 Requests');
    } else {
      fail('Detected Missing .GLB Requests', glb404s.join(', '));
    }
  } finally {
    await browser.close();
  }

  console.log('\n========================================================================');
  console.log(`  STAGE G RESULTS: ${results.passed.length} PASSED, ${results.failed.length} FAILED`);
  console.log('  Metrics:', JSON.stringify(results.metrics, null, 2));
  console.log('========================================================================');

  if (results.failed.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Stage G Audit Fatal Error:', err);
  process.exit(1);
});
