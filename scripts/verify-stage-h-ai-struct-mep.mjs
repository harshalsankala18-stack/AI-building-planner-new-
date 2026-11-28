import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('../packages/frontend/node_modules/playwright');

const SCREENSHOTS_DIR = path.resolve(process.cwd(), 'docs/screenshots/stage-h-verified');
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

function assertNoLeakedKeys(label, text) {
  const secretHit = /AIza[0-9A-Za-z_-]{20,}|AQ\.[0-9A-Za-z_.-]{20,}/g.test(text);
  if (secretHit) {
    fail(`${label}: zero leaked API keys`, 'SECRET PATTERN FOUND');
  } else {
    pass(`${label}: zero leaked API keys`);
  }
}

async function main() {
  console.log('========================================================================');
  console.log('  STAGE H VERIFICATION: GEMINI 3.8, HOUSE/OTS, RCC BEAMS, ELEC, PLUMB  ');
  console.log('========================================================================\n');

  // -----------------------------------------------------------------------
  // PHASE 1: BACKEND CAPABILITIES & CLIENT BUNDLE SECURITY AUDIT
  // -----------------------------------------------------------------------
  console.log('[PHASE 1] Backend AI Capabilities & Bundle Security Audit...');
  const capRes = await fetch('http://localhost:3000/api/health/capabilities');
  const capText = await capRes.text();
  assertNoLeakedKeys('GET /api/health/capabilities response', capText);
  const cap = JSON.parse(capText);
  results.metrics.capabilities = cap;

  if (capRes.status === 200 && cap.geminiConfigured === true && cap.aiProvider === 'gemini') {
    pass('Health capabilities confirms server-side Gemini configured', `active=${cap.activeModel}, fallback=${cap.fallbackModel}`);
  } else {
    fail('Health capabilities Gemini check', JSON.stringify(cap));
  }

  if (cap.activeModel === 'gemini-3.8-flash' && cap.fallbackModel === 'gemini-3.5-flash-lite') {
    pass('Model defaults set to gemini-3.8-flash + gemini-3.5-flash-lite');
  } else {
    fail('Expected gemini-3.8-flash + gemini-3.5-flash-lite', JSON.stringify(cap));
  }

  // Scan frontend dist JS files for raw secrets
  const frontendAssetsDir = path.resolve(process.cwd(), 'packages/frontend/dist/assets');
  let frontendAssetText = '';
  if (fs.existsSync(frontendAssetsDir)) {
    for (const f of fs.readdirSync(frontendAssetsDir)) {
      if (f.endsWith('.js')) {
        frontendAssetText += fs.readFileSync(path.join(frontendAssetsDir, f), 'utf8');
      }
    }
  }
  assertNoLeakedKeys('Built frontend dist/assets JS bundles', frontendAssetText);

  // -----------------------------------------------------------------------
  // PHASE 2: LIVE HYBRID GENERATION — 30x50 HOUSE + 40x50 MULTI-FLAT TOWER
  // -----------------------------------------------------------------------
  console.log('\n[PHASE 2] Live Hybrid API Generation (30x50 House & 40x50 4-Flat Tower)...');

  const housePayload = {
    seed: 1,
    config: {
      plotWidthMm: 9144,
      plotDepthMm: 15240,
      roadWidthMm: 9000,
      roadAccessSides: ['south'],
      setbacksMm: { front: 1500, rear: 1200, left: 900, right: 900 },
      lotAllotmentMode: 'STATUTORY_SETBACK_100_PERCENT',
      jurisdiction: 'generic_maharashtra',
      verticalStackType: 'G_PLUS_N',
      numTypicalFloors: 2,
      flatsPerFloor: 1,
      units: [{ unitIndex: 1, bhkType: '3BHK' }],
      aiPrompt: '30x50 ft modern 3BHK house with entrance foyer, living room, dining hall, kitchen utility, internal passage to bedrooms and baths',
    },
  };

  const tHouse0 = Date.now();
  const houseGenRes = await fetch('http://localhost:3000/api/v1/projects/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(housePayload),
  });
  const houseText = await houseGenRes.text();
  assertNoLeakedKeys('House /generate response', houseText);
  const houseData = JSON.parse(houseText);
  const houseMs = Date.now() - tHouse0;

  if (houseGenRes.status === 200 && houseData.building?.floors?.length >= 2) {
    const typ = houseData.building.floors.find((f) => f.floorUse === 'RESIDENTIAL') ?? houseData.building.floors[0];
    const hasFoyer = typ.rooms.some((r) => r.type === 'foyer');
    const hasLiving = typ.rooms.some((r) => r.type === 'living');
    const hasKitchen = typ.rooms.some((r) => r.type === 'kitchen');
    const hasBeds = typ.rooms.filter((r) => r.type === 'bedroom').length >= 2;
    const gridX = typ.structuralGrid?.xAxes?.length ?? 0;
    const gridY = typ.structuralGrid?.yAxes?.length ?? 0;
    const cols = typ.columns?.length ?? 0;
    const beams = typ.beams?.length ?? 0;
    const floorMep = houseData.building.mepEngineering?.floors?.find((fl) => fl.floorId === typ.id);
    const elecCount = floorMep?.symbols?.filter((s) => s.discipline === 'ELECTRICAL').length ?? 0;
    const plumbCount = floorMep?.symbols?.filter((s) => s.discipline === 'PLUMBING').length ?? 0;
    results.metrics.house = {
      ms: houseMs,
      telemetry: houseData.telemetry,
      complianceScore: houseData.complianceReport?.score,
      hasFoyer,
      hasLiving,
      hasKitchen,
      hasBeds,
      gridX,
      gridY,
      cols,
      beams,
      elecCount,
      plumbCount,
    };
    pass('30x50 3BHK House generated cleanly', `${houseMs}ms, model=${houseData.telemetry?.modelUsed}, score=${houseData.complianceReport?.score}`);
    if (hasFoyer && hasLiving && hasKitchen && hasBeds) {
      pass('House zoning includes Foyer -> Living -> Kitchen -> Bedrooms');
    } else {
      fail('House zoning incomplete', JSON.stringify({ hasFoyer, hasLiving, hasKitchen, hasBeds }));
    }
    if (cols >= 5 && beams >= 7 && gridX >= 3 && gridY >= 3 && elecCount >= 12 && plumbCount >= 5) {
      pass('House RCC Structural + Electrical + Plumbing complete', `cols=${cols}, beams=${beams}, grid=${gridX}x${gridY}, elec=${elecCount}, plumb=${plumbCount}`);
    } else {
      fail('House structural or MEP counts below threshold', JSON.stringify(results.metrics.house));
    }
  } else {
    fail('30x50 3BHK House generation failed', `status=${houseGenRes.status}`);
  }

  const aptPayload = {
    seed: 1,
    config: {
      plotWidthMm: 24000,
      plotDepthMm: 28000,
      roadWidthMm: 12000,
      roadAccessSides: ['south'],
      setbacksMm: { front: 3000, rear: 2500, left: 2500, right: 2500 },
      lotAllotmentMode: 'STATUTORY_SETBACK_100_PERCENT',
      jurisdiction: 'generic_maharashtra',
      verticalStackType: 'STILT_PLUS_N',
      numTypicalFloors: 4,
      flatsPerFloor: 4,
      units: [
        { unitIndex: 1, bhkType: '2BHK' },
        { unitIndex: 2, bhkType: '2BHK' },
        { unitIndex: 3, bhkType: '2BHK' },
        { unitIndex: 4, bhkType: '2BHK' },
      ],
      aiPrompt: '4 flats per floor modern apartment tower with inter-flat ventilated OTS courtyard, plumbing shafts, stilt parking',
    },
  };

  const tApt0 = Date.now();
  const aptGenRes = await fetch('http://localhost:3000/api/v1/projects/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(aptPayload),
  });
  const aptText = await aptGenRes.text();
  assertNoLeakedKeys('Apartment /generate response', aptText);
  const aptData = JSON.parse(aptText);
  const aptMs = Date.now() - tApt0;

  if (aptGenRes.status === 200 && aptData.building?.floors?.length >= 4) {
    const typ = aptData.building.floors.find((f) => f.floorUse === 'RESIDENTIAL');
    const otsRooms = typ.rooms.filter((r) => r.type === 'ots' || r.tags?.includes('shaft:ots'));
    const plumbShafts = typ.rooms.filter((r) => r.type === 'service_shaft' || r.tags?.includes('shaft:plumbing'));
    const cols = typ.columns?.length ?? 0;
    const beams = typ.beams?.length ?? 0;
    const secondaryBeams = (typ.beams ?? []).filter((b) => b.type === 'SECONDARY').length;
    const gridX = typ.structuralGrid?.xAxes?.length ?? 0;
    const gridY = typ.structuralGrid?.yAxes?.length ?? 0;
    const floorMep = aptData.building.mepEngineering?.floors?.find((fl) => fl.floorId === typ.id);
    const elecCount = floorMep?.symbols?.filter((s) => s.discipline === 'ELECTRICAL').length ?? 0;
    const plumbCount = floorMep?.symbols?.filter((s) => s.discipline === 'PLUMBING').length ?? 0;

    // Persist generated multi-flat building to /api/projects/:projectId/canonical so Playwright inspects it live!
    await fetch('http://localhost:3000/api/projects/proj-stage-h-apt/canonical', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...aptData.building, projectId: 'proj-stage-h-apt', id: 'proj-stage-h-apt', name: 'Stage H 4-Flat Tower' }),
    }).catch(() => {});

    results.metrics.apartment = {
      ms: aptMs,
      telemetry: aptData.telemetry,
      complianceScore: aptData.complianceReport?.score,
      otsCount: otsRooms.length,
      plumbShaftCount: plumbShafts.length,
      cols,
      beams,
      secondaryBeams,
      gridX,
      gridY,
      elecCount,
      plumbCount,
    };

    pass('4-Flat Apartment Tower generated cleanly', `${aptMs}ms, model=${aptData.telemetry?.modelUsed}, score=${aptData.complianceReport?.score}`);
    if (otsRooms.length >= 1) {
      pass('Inter-flat O.T.S. (OPEN TO SKY) cutouts created', `ots=${otsRooms.length}, shafts=${plumbShafts.length}`);
    } else {
      fail('No inter-flat OTS cutouts created on 4-flat tower', JSON.stringify(typ.rooms.map((r) => ({ id: r.id, type: r.type, tags: r.tags }))));
    }
    if (cols >= 12 && beams >= 16 && gridX >= 3 && gridY >= 3 && elecCount >= 25 && plumbCount >= 16) {
      pass('Apartment RCC Structural + Electrical + Plumbing complete', `cols=${cols}, beams=${beams}, sb=${secondaryBeams}, elec=${elecCount}, plumb=${plumbCount}`);
    } else {
      fail('Apartment structural or MEP counts below threshold', JSON.stringify(results.metrics.apartment));
    }
  } else {
    fail('4-Flat Apartment Tower generation failed', `status=${aptGenRes.status}`);
  }

  // -----------------------------------------------------------------------
  // PHASE 3: LIVE PLAYWRIGHT VISUAL & INTERACTIVE CAD TOGGLE VERIFICATION
  // -----------------------------------------------------------------------
  console.log('\n[PHASE 3] Playwright 2D CAD Structural / Electrical / Plumbing & 3D Studio Checks...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=gl'],
  });
  const context = await browser.newContext({ viewport: { width: 1536, height: 960 } });
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await sleep(500);
    const demoBtn = page.locator('button:has-text("Use Demo Credentials & Sign In")');
    if (await demoBtn.count()) {
      await demoBtn.click();
      await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 15000 }).catch(() => {});
    }

    // Load Stage H saved 4-Flat Tower (or fallback to demo if not resolvable via query param)
    await page.goto('http://localhost:3000/studio?project=proj-stage-h-apt', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="tab-2d-plan"]', { timeout: 15000 });
    await page.locator('[data-testid="tab-2d-plan"]').click();
    await sleep(1400);

    // 1. Structural Grid + Beams + Columns View
    const beamsPill = page.locator('[data-testid="cad-pill-beams"]');
    const colsPill = page.locator('[data-testid="cad-pill-columns"]');
    if ((await beamsPill.count()) > 0 && (await colsPill.count()) > 0) {
      if ((await colsPill.getAttribute('aria-pressed')) !== 'true') await colsPill.click();
      if ((await beamsPill.getAttribute('aria-pressed')) !== 'true') await beamsPill.click();
      await sleep(700);
      const structStats = await page.evaluate(() => {
        const svg = document.querySelector('[data-testid="cad-canvas-host"] svg');
        if (!svg) return { present: false };
        return {
          present: true,
          gridLines: svg.querySelectorAll('[data-structural-grid]').length,
          columns: svg.querySelectorAll('[data-entity-type="column"]').length,
          beams: svg.querySelectorAll('[data-entity-type="beam"]').length,
          scheduleBox: Boolean(svg.querySelector('[data-structural-schedule="true"]')),
          otsCrossLines: svg.querySelectorAll('[data-ots-cross="true"]').length,
        };
      });
      results.metrics.structSvg = structStats;
      if (structStats.present && structStats.columns >= 6 && structStats.beams >= 8 && structStats.gridLines >= 4 && structStats.scheduleBox) {
        pass('2D Structural Grid + Double-Dashed Beams + Columns rendered', JSON.stringify(structStats));
      } else {
        fail('2D Structural SVG missing expected elements', JSON.stringify(structStats));
      }
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-2d-structural-beams-columns.png') });
    } else {
      fail('Beams/Columns toggle pills missing in 2D toolbar');
    }

    // 2. Electrical CAD Overlay
    const elecPill = page.locator('[data-testid="cad-pill-electrical"]');
    await elecPill.click();
    await sleep(700);
    const elecStats = await page.evaluate(() => {
      const svg = document.querySelector('[data-testid="cad-canvas-host"] svg');
      if (!svg) return { present: false };
      return {
        present: true,
        symbols: svg.querySelectorAll('[data-layer="M-ELEC-SYMB"] [data-mep-kind]').length,
        wireRuns: svg.querySelectorAll('[data-layer="M-ELEC-WIRE"] polyline').length,
        legendVisible: Boolean(document.querySelector('[data-testid="mep-cad-legend"]')),
      };
    });
    results.metrics.elecSvg = elecStats;
    if (elecStats.present && elecStats.symbols >= 20 && elecStats.wireRuns >= 2 && elecStats.legendVisible) {
      pass('2D Electrical Plan rendered cleanly', JSON.stringify(elecStats));
    } else {
      fail('2D Electrical Plan incomplete', JSON.stringify(elecStats));
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-2d-electrical-layout.png') });
    await elecPill.click();
    await sleep(300);

    // 3. Plumbing CAD Overlay
    const plumbPill = page.locator('[data-testid="cad-pill-plumbing"]');
    if (await plumbPill.count()) {
      await plumbPill.click();
      await sleep(700);
      const plumbStats = await page.evaluate(() => {
        const svg = document.querySelector('[data-testid="cad-canvas-host"] svg');
        if (!svg) return { present: false };
        return {
          present: true,
          fixtures: svg.querySelectorAll('[data-layer="M-PLUMB-FIXT"] [data-mep-kind]').length,
          pipes: svg.querySelectorAll('[data-layer="M-PLUMB-PIPE"] polyline').length,
          legendVisible: Boolean(document.querySelector('[data-testid="mep-cad-legend"]')),
        };
      });
      results.metrics.plumbSvg = plumbStats;
      if (plumbStats.present && plumbStats.fixtures >= 8 && plumbStats.pipes >= 4 && plumbStats.legendVisible) {
        pass('2D Plumbing Plan rendered cleanly', JSON.stringify(plumbStats));
      } else {
        fail('2D Plumbing Plan incomplete', JSON.stringify(plumbStats));
      }
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-2d-plumbing-layout.png') });
      await plumbPill.click();
      await sleep(300);
    } else {
      fail('Plumbing pill missing from 2D bottom-left bar');
    }

    // 4. Clean Architectural OTS + House Zoning View
    if ((await beamsPill.getAttribute('aria-pressed')) === 'true') await beamsPill.click();
    if ((await colsPill.getAttribute('aria-pressed')) === 'true') await colsPill.click();
    await sleep(600);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-2d-multiflat-ots-spacing.png') });

    // 5. 3D Studio View (OTS lightwells + solid cutaway walls + green terrain)
    await page.locator('[data-testid="tab-3d-studio"]').click();
    await sleep(4500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-3d-pascal-multiflat-ots.png') });
    pass('3D Studio screenshot captured without crash');
  } finally {
    await browser.close();
  }

  console.log('\n========================================================================');
  console.log(`  STAGE H SUMMARY: ${results.passed.length} PASSED | ${results.failed.length} FAILED`);
  console.log('========================================================================');
  console.log(JSON.stringify(results.metrics, null, 2));
  if (results.failed.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Stage H verifier crashed:', err);
  process.exit(1);
});
