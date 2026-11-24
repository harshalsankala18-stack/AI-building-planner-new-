import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('../packages/frontend/node_modules/playwright');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function auditProject(page, projectName) {
  console.log(`\n========================================================================`);
  console.log(`  AUDITING: ${projectName}`);
  console.log(`========================================================================`);

  // Track HTTP requests
  const networkEvents = {
    putPascalScene: 0,
    postParametricEdit: 0,
    syncFrom2d: 0,
    allUrls: [],
  };

  const reqListener = (req) => {
    const url = req.url();
    const method = req.method();
    if (url.includes('/pascal-scene') && method === 'PUT') {
      networkEvents.putPascalScene++;
      networkEvents.allUrls.push(`PUT ${url}`);
    } else if (url.includes('/parametric-edit') && method === 'POST') {
      networkEvents.postParametricEdit++;
      networkEvents.allUrls.push(`POST ${url}`);
    } else if (url.includes('/sync-from-2d') && method === 'POST') {
      networkEvents.syncFrom2d++;
      networkEvents.allUrls.push(`POST ${url}`);
    }
  };
  page.on('request', reqListener);

  // Switch to 3D Pascal Studio tab
  console.log('  Switching to 3D Pascal Studio tab...');
  const tab3d = page.locator('button:has-text("3D Studio"), button:has-text("3D Pascal Studio")').first();
  if (await tab3d.count()) {
    await tab3d.click();
  }
  await sleep(4000); // Allow initial hydration

  // Locate Pascal iframe
  const iframeHandle = page.locator('iframe[title="Pascal 3D Studio"], iframe[title*="Pascal"]').first();
  await iframeHandle.waitFor({ state: 'visible', timeout: 15000 });
  const frame = await (await iframeHandle.elementHandle())?.contentFrame();
  if (!frame) throw new Error('Pascal 3D iframe content frame not accessible');

  const canvas = frame.locator('canvas').first();
  await canvas.waitFor({ state: 'visible', timeout: 15000 });
  console.log('  Canvas mounted and visible.');

  // Inject message tracking hooks inside host and iframe to count LOAD_SCENE & SCENE_MUTATED
  await page.evaluate(() => {
    window.__HOST_POSTED_MESSAGES = [];
    window.__HOST_RECEIVED_MESSAGES = [];
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type) {
        window.__HOST_RECEIVED_MESSAGES.push({ type: e.data.type, time: Date.now() });
      }
    });
  });

  await frame.evaluate(() => {
    window.__STUDIO_RECEIVED_MESSAGES = [];
    window.__STUDIO_SENT_MESSAGES = [];
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type) {
        window.__STUDIO_RECEIVED_MESSAGES.push({ type: e.data.type, time: Date.now() });
      }
    });
  });

  console.log('  >>> STARTING 6-SECOND IDLE MONITORING (ZERO USER INTERACTION) <<<');
  const initialPutCount = networkEvents.putPascalScene;
  const initialParametricCount = networkEvents.postParametricEdit;
  const initialSyncCount = networkEvents.syncFrom2d;

  // Clear counters right before the 6s window
  await page.evaluate(() => {
    window.__HOST_RECEIVED_MESSAGES = [];
  });
  await frame.evaluate(() => {
    window.__STUDIO_RECEIVED_MESSAGES = [];
  });

  // Wait for 6 full seconds without any user interaction
  await sleep(6000);
  console.log(`  >>> 6-SECOND IDLE MONITORING COMPLETE <<<`);

  // Inspect message counts
  const hostMessages = await page.evaluate(() => window.__HOST_RECEIVED_MESSAGES || []);
  const studioMessages = await frame.evaluate(() => window.__STUDIO_RECEIVED_MESSAGES || []);

  const idleSceneMutated = hostMessages.filter((m) => m.type === 'SCENE_MUTATED').length;
  const idleLoadScene = studioMessages.filter((m) => m.type === 'LOAD_SCENE').length;
  const idlePutPascal = networkEvents.putPascalScene - initialPutCount;
  const idleParametric = networkEvents.postParametricEdit - initialParametricCount;
  const idleSync = networkEvents.syncFrom2d - initialSyncCount;

  console.log('\n  [DIAGNOSTIC IDLE COUNTS (6 Seconds)]');
  console.log(`    LOAD_SCENE messages:             ${idleLoadScene}`);
  console.log(`    SCENE_MUTATED messages:          ${idleSceneMutated}`);
  console.log(`    PUT /pascal-scene HTTP calls:    ${idlePutPascal}`);
  console.log(`    POST /parametric-edit calls:     ${idleParametric}`);
  console.log(`    POST /sync-from-2d calls:        ${idleSync}`);

  // Inspect Live Three.js Scene Graph inside the Pascal iframe
  const sceneGraphAudit = await frame.evaluate(() => {
    const canvasEl = document.querySelector('canvas');
    if (!canvasEl) return { error: 'No canvas element found' };

    const r3f = canvasEl.__r3f;
    if (!r3f || !r3f.root) {
      return { error: 'No __r3f fiber root found on canvas' };
    }

    const state = r3f.root.store.getState();
    const scene = state.scene;
    const camera = state.camera;
    const controls = state.controls;

    if (!scene) return { error: 'No Three.js scene found on fiber state' };

    let wallMeshes = 0;
    let slabMeshes = 0;
    let zoneFloorMeshes = 0;
    let doorMeshes = 0;
    let windowMeshes = 0;
    let stairMeshes = 0;
    let itemGlbMeshes = 0;
    let envTerrainMeshes = 0;
    let envPadMeshes = 0;
    let envTrees = 0;

    const buildingBox = {
      min: [Infinity, Infinity, Infinity],
      max: [-Infinity, -Infinity, -Infinity],
    };

    scene.traverse((obj) => {
      const name = obj.name || '';
      const type = obj.type || '';
      const isMesh = obj.isMesh || type === 'Mesh';
      const isInstanced = obj.isInstancedMesh || type === 'InstancedMesh';

      // Check environment objects
      if (name.includes('architectural-terrain')) envTerrainMeshes++;
      if (name.includes('architectural-building-pad')) envPadMeshes++;
      if (name.includes('architectural-trees') || (isInstanced && obj.count > 0)) envTrees += (obj.count || 1);

      // Check architectural building objects
      if (isMesh) {
        const geom = obj.geometry;
        if (geom && !name.includes('architectural-')) {
          if (!geom.boundingBox) geom.computeBoundingBox();
          if (geom.boundingBox) {
            obj.updateMatrixWorld(true);
            const box = geom.boundingBox.clone().applyMatrix4(obj.matrixWorld);
            buildingBox.min[0] = Math.min(buildingBox.min[0], box.min.x);
            buildingBox.min[1] = Math.min(buildingBox.min[1], box.min.y);
            buildingBox.min[2] = Math.min(buildingBox.min[2], box.min.z);
            buildingBox.max[0] = Math.max(buildingBox.max[0], box.max.x);
            buildingBox.max[1] = Math.max(buildingBox.max[1], box.max.y);
            buildingBox.max[2] = Math.max(buildingBox.max[2], box.max.z);
          }
        }

        const nLower = name.toLowerCase();
        const parentName = (obj.parent && obj.parent.name) ? obj.parent.name.toLowerCase() : '';
        const combined = `${nLower} ${parentName}`;

        if (combined.includes('wall')) wallMeshes++;
        else if (combined.includes('slab')) slabMeshes++;
        else if (combined.includes('zone') || combined.includes('floor') || combined.includes('room')) zoneFloorMeshes++;
        else if (combined.includes('door')) doorMeshes++;
        else if (combined.includes('window')) windowMeshes++;
        else if (combined.includes('stair')) stairMeshes++;
        else if (combined.includes('item') || combined.includes('furniture') || combined.includes('sofa') || combined.includes('bed') || combined.includes('table')) itemGlbMeshes++;
      }
    });

    const camPos = camera ? [camera.position.x, camera.position.y, camera.position.z] : null;
    const camTarget = controls && controls.target ? [controls.target.x, controls.target.y, controls.target.z] : null;
    let camDistance = 0;
    if (camPos && camTarget) {
      const dx = camPos[0] - camTarget[0];
      const dy = camPos[1] - camTarget[1];
      const dz = camPos[2] - camTarget[2];
      camDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    return {
      counts: {
        wallMeshes,
        slabMeshes,
        zoneFloorMeshes,
        doorMeshes,
        windowMeshes,
        stairMeshes,
        itemGlbMeshes,
        envTerrainMeshes,
        envPadMeshes,
        envTrees,
      },
      buildingBox,
      camera: {
        position: camPos,
        target: camTarget,
        distance: camDistance,
      },
    };
  });

  console.log('\n  [LIVE THREE.JS SCENE GRAPH AUDIT]');
  console.log(JSON.stringify(sceneGraphAudit, null, 2));

  page.off('request', reqListener);
  return {
    idleCounts: { idleLoadScene, idleSceneMutated, idlePutPascal, idleParametric, idleSync },
    sceneGraph: sceneGraphAudit,
  };
}

async function main() {
  console.log('========================================================================');
  console.log('  STAGE E STEP 1: FORENSIC LOOP & LIVE SCENE-GRAPH DIAGNOSIS            ');
  console.log('========================================================================\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-unsafe-webgpu', '--use-gl=angle', '--use-angle=swiftshader'],
  });

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // 1. Login
    console.log('Navigating to http://localhost:3000/login...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await sleep(800);

    const demoBtn = page.locator('button:has-text("Use Demo Credentials & Sign In")');
    if (await demoBtn.count()) {
      await demoBtn.click();
      await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    }

    // 2. Open Project Hub
    console.log('Opening Project Hub (/projects)...');
    await page.goto('http://localhost:3000/projects', { waitUntil: 'domcontentloaded' });
    await sleep(1500);

    // List available project cards
    const cardLinks = await page.evaluate(() => {
      const cards = document.querySelectorAll('.project-card');
      return Array.from(cards).map((c) => {
        const title = c.querySelector('h3')?.textContent?.trim() || '';
        return { title };
      });
    });
    console.log('Found project cards:', cardLinks);

    // 3. Open Demo Architectural Project (30x50 2BHK)
    console.log('Opening Demo 30x50 2BHK project...');
    const demoCard = page.locator('.project-card:has-text("Demo"), .project-card:has-text("30x50")').first();
    const demoOpenBtn = demoCard.locator('button:has-text("Open")').first();
    await demoOpenBtn.click();
    await page.waitForURL((url) => url.pathname.includes('/studio'), { timeout: 15000 });
    await sleep(1000);

    const demoResult = await auditProject(page, '30x50 2BHK Demo');

    // 4. Open ARGON Residence Towers (Multi-story)
    console.log('\nNavigating back to /projects to open multi-story building...');
    await page.goto('http://localhost:3000/projects', { waitUntil: 'domcontentloaded' });
    await sleep(1500);

    const multiCard = page.locator('.project-card:has-text("ARGON Residence Towers"), .project-card:has-text("Sapphire")').first();
    const multiOpenBtn = multiCard.locator('button:has-text("Open")').first();
    await multiOpenBtn.click();
    await page.waitForURL((url) => url.pathname.includes('/studio'), { timeout: 15000 });
    await sleep(1000);

    const multiResult = await auditProject(page, 'ARGON Residence Towers (Multi-Story)');

    console.log('\n========================================================================');
    console.log('  DIAGNOSIS COMPLETE!');
    console.log('========================================================================');
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Fatal diagnosis failure:', err);
  process.exit(1);
});
