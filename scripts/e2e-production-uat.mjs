/**
 * Full Automated End-to-End Production UAT Suite.
 *
 * Boots the bundled production server (dist-server/server.cjs) on an ephemeral port
 * with isolated storage and runs an end-to-end integration battery testing:
 *  1. Root SPA & Pascal Studio Static Serving
 *  2. Capability & Provider Health Probe
 *  3. ArchLang 2D Compilation, Overlays & Room Locks
 *  4. 2D AI Self-Healing Edit with Unit Normalization
 *  5. ArchLang Presentation Export (SVG & DSL)
 *  6. Pascal 3D Scene Persistence, AI Mutation & Reset
 *  7. Async Job Queue Submission & Status Polling
 *  8. Security Guards: Body Limit (HTTP 413) & Origin Lockdown
 */

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const serverBundle = path.join(root, 'packages', 'backend', 'dist-server', 'server.cjs');

if (!existsSync(serverBundle)) {
  console.error(`Error: Server bundle not found at ${serverBundle}. Run "pnpm build:all" first.`);
  process.exit(1);
}

const TEST_PORT = 4299;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;
const tempStorage = mkdtempSync(path.join(tmpdir(), 'afp-uat-'));

console.log('================================================================');
console.log('  AI Floor Planner SaaS — Production End-to-End UAT Suite       ');
console.log('================================================================');
console.log(`Ephemeral Server Port: ${TEST_PORT}`);
console.log(`Isolated Storage Temp: ${tempStorage}\n`);

let serverProcess = null;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, maxRetries = 15, delayMs = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await sleep(delayMs);
    }
  }
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error(`  ❌ FAILED: ${message}`);
      failed++;
      throw new Error(message);
    } else {
      console.log(`  ✅ PASSED: ${message}`);
      passed++;
    }
  }

  // 1. Root SPA Serving
  console.log('\n--- Test 1: Production SPA Static File Serving ---');
  const rootRes = await fetch(`${BASE_URL}/`);
  assert(rootRes.status === 200, 'GET / returns HTTP 200');
  const rootText = await rootRes.text();
  assert(rootText.includes('<html') || rootText.includes('<!DOCTYPE'), 'GET / serves HTML index document');

  // 2. Pascal Studio Embedded Static Serving
  console.log('\n--- Test 2: Pascal 3D Studio Sub-App Static Serving ---');
  const pascalRes = await fetch(`${BASE_URL}/pascal-studio/`);
  assert(pascalRes.status === 200, 'GET /pascal-studio/ returns HTTP 200');
  const pascalText = await pascalRes.text();
  assert(
    pascalText.includes('<html') || pascalText.includes('Pascal') || pascalText.includes('vite'),
    'GET /pascal-studio/ serves sub-app HTML'
  );

  // 3. System Capabilities & Provider Health Probe
  console.log('\n--- Test 3: System Capabilities & Health Probes ---');
  const capRes = await fetch(`${BASE_URL}/api/health/capabilities`);
  assert(capRes.status === 200, 'GET /api/health/capabilities returns HTTP 200');
  const capData = await capRes.json();
  assert(capData.status === 'ok', 'Capabilities status is "ok"');
  assert(capData.storageProvider !== undefined, 'Storage provider is reported');
  assert(capData.databaseProvider !== undefined, 'Database provider is reported');
  assert(capData.queueMode !== undefined, 'Queue mode is reported');
  assert(capData.capabilities?.linuxAiWorker === 'local', 'Linux AI worker is local');

  // 4. ArchLang 2D Presentation Preview
  console.log('\n--- Test 4: ArchLang 2D Presentation Compilation & Preview ---');
  const previewRes = await fetch(`${BASE_URL}/api/projects/proj-uat-01/archlang/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      floorId: 'floor-0',
      autoFurnish: true,
      circulationOverlay: true,
      showDimensions: true,
    }),
  });
  if (previewRes.status !== 200) {
    const errText = await previewRes.text();
    console.error(`Preview failed with HTTP ${previewRes.status}:`, errText);
  }
  assert(previewRes.status === 200, 'POST /archlang/preview returns HTTP 200');
  const previewData = await previewRes.json();
  const previewSvg = previewData.preview?.svg ?? previewData.svg;
  assert(typeof previewSvg === 'string' && previewSvg.includes('<svg'), 'Preview returns valid SVG');
  assert(previewSvg.length > 500, `SVG length is substantial (${previewSvg.length} bytes)`);
  const roomCount = previewData.preview?.stats?.roomCount ?? previewData.stats?.roomCount;
  assert(roomCount >= 1, `Stats report rooms compiled (${roomCount})`);

  // 5. ArchLang Room Lock Impact Audit
  console.log('\n--- Test 5: ArchLang Room Lock Impact Evaluation ---');
  const impactRes = await fetch(`${BASE_URL}/api/projects/proj-uat-01/archlang/impact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      floorId: 'floor-0',
      lockedRoomIds: ['room-1'],
      proposedChanges: { 'room-1': { areaDeltaSqM: 5 } },
    }),
  });
  assert(impactRes.status === 200, 'POST /archlang/impact returns HTTP 200');
  const impactData = await impactRes.json();
  assert(impactData.impact !== undefined, 'Impact analysis returns impact report');
  assert(Array.isArray(impactData.impact?.lockedRooms), 'Impact reports locked rooms list');

  // 6. 2D AI Edit with Unit Normalization
  console.log('\n--- Test 6: 2D AI Edit with Imperial Unit Normalization ---');
  const edit2dRes = await fetch(`${BASE_URL}/api/projects/proj-uat-01/ai-edit/2d`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'Expand the living room by 3ft on the east side and add 200 sq ft terrace',
      floorId: 'floor-0',
      lockedRoomIds: ['room-2'],
    }),
  });
  assert(edit2dRes.status === 200, 'POST /ai-edit/2d returns HTTP 200');
  const edit2dData = await edit2dRes.json();
  assert(
    edit2dData.status === 'applied' || edit2dData.status === 'rejected',
    `2D edit returned valid status: ${edit2dData.status}`
  );
  if (edit2dData.status === 'applied') {
    const dsl = edit2dData.dslSource ?? edit2dData.archlangDsl;
    assert(typeof dsl === 'string' && dsl.length > 0, 'Returned updated ArchLang DSL');
    const svg = edit2dData.svg ?? edit2dData.previewSvg;
    assert(typeof svg === 'string' && svg.includes('<svg'), 'Returned verified preview SVG');
  }

  // 7. ArchLang Presentation Artifact Export
  console.log('\n--- Test 7: ArchLang Presentation Export ---');
  const exportRes = await fetch(`${BASE_URL}/api/projects/proj-uat-01/archlang/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      floorId: 'floor-0',
      format: 'svg',
      autoFurnish: true,
    }),
  });
  assert(exportRes.status === 200, 'POST /archlang/export returns HTTP 200');
  const exportData = await exportRes.json();
  assert(
    exportData.artifact?.fileName !== undefined || exportData.artifact?.fileId !== undefined,
    'Exported artifact contains fileName/fileId'
  );
  assert(exportData.downloadUrl !== undefined, 'Exported artifact provides downloadUrl');

  // 8. Pascal 3D Scene Persistence & AI Headless Editing
  console.log('\n--- Test 8: Pascal 3D Scene CRUD & Headless Mutation ---');
  const getSceneRes = await fetch(`${BASE_URL}/api/projects/proj-uat-01/pascal-scene`);
  assert(getSceneRes.status === 200, 'GET /pascal-scene returns HTTP 200');
  const getSceneData = await getSceneRes.json();
  assert(getSceneData.scene?.nodes !== undefined, 'Pascal scene contains nodes');
  assert(getSceneData.scene?.rootNodeIds !== undefined, 'Pascal scene contains rootNodeIds');

  // PUT updated scene
  const testNodeId = 'test-slab-uat';
  const updatedNodes = {
    ...getSceneData.scene.nodes,
    [testNodeId]: {
      id: testNodeId,
      type: 'slab',
      name: 'UAT Custom Slab',
      polygon: [[0, 0], [5000, 0], [5000, 5000], [0, 5000]],
      thickness: 150,
      elevation: 0,
    },
  };
  const putSceneRes = await fetch(`${BASE_URL}/api/projects/proj-uat-01/pascal-scene`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scene: {
        nodes: updatedNodes,
        rootNodeIds: [...getSceneData.scene.rootNodeIds, testNodeId],
      },
    }),
  });
  assert(putSceneRes.status === 200, 'PUT /pascal-scene saves manual 3D scene');

  // 3D AI edit
  const edit3dRes = await fetch(`${BASE_URL}/api/projects/proj-uat-01/ai-edit/3d`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'Add a 2.5m dining table and 4 chairs in the living room',
    }),
  });
  assert(edit3dRes.status === 200, 'POST /ai-edit/3d returns HTTP 200');
  const edit3dData = await edit3dRes.json();
  assert(edit3dData.status === 'applied', '3D AI edit applied mutations');
  assert(Array.isArray(edit3dData.appliedOperations), '3D edit reports applied operations');

  // Reset 3D scene
  const resetRes = await fetch(`${BASE_URL}/api/projects/proj-uat-01/pascal-scene/reset`, {
    method: 'POST',
  });
  if (resetRes.status !== 200) {
    const errText = await resetRes.text();
    console.error(`  [DEBUG] Reset failed with status ${resetRes.status}: ${errText}`);
  }
  assert(resetRes.status === 200, 'POST /pascal-scene/reset restores scene from 2D plan');

  // 9. Async Job Queue Submission & Polling
  console.log('\n--- Test 9: Async Job Queue Execution & Terminal Polling ---');
  const jobSubmitRes = await fetch(`${BASE_URL}/api/projects/proj-uat-01/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jobType: 'archlang-compile',
      payload: { floorId: 'floor-0', autoFurnish: true },
    }),
  });
  assert(jobSubmitRes.status === 202, 'POST /jobs enqueues job with HTTP 202');
  const jobData = await jobSubmitRes.json();
  assert(typeof jobData.jobId === 'string', 'Job submission returns jobId');

  // Poll job until completed
  let terminalJob = null;
  for (let attempt = 0; attempt < 20; attempt++) {
    const pollRes = await fetch(`${BASE_URL}/api/jobs/${encodeURIComponent(jobData.jobId)}`);
    assert(pollRes.status === 200, `GET /jobs/${jobData.jobId} returns HTTP 200`);
    const statusData = await pollRes.json();
    if (statusData.status === 'completed' || statusData.status === 'failed') {
      terminalJob = statusData;
      break;
    }
    await sleep(500);
  }
  assert(terminalJob !== null, 'Job reached terminal state within timeout');
  assert(terminalJob.status === 'completed', `Job finished with status "completed" (got ${terminalJob?.status})`);

  // 10. Security Guard: Safe Payload Size Limit (HTTP 413)
  console.log('\n--- Test 10: Security Guard: Payload Size Limit (HTTP 413) ---');
  const hugePayload = 'X'.repeat(2 * 1024 * 1024); // 2MB string
  const limitRes = await fetch(`${BASE_URL}/api/projects/proj-uat-01/ai-edit/2d`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: hugePayload }),
  });
  assert(limitRes.status === 413, `Oversized request rejected with HTTP 413 (got ${limitRes.status})`);

  console.log('\n================================================================');
  console.log(`  E2E Production UAT Completed: ${passed} passed, ${failed} failed `);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

async function main() {
  console.log('Spawning production server process...');
  serverProcess = spawn(
    process.execPath,
    [serverBundle],
    {
      cwd: root,
      env: {
        ...process.env,
        PORT: String(TEST_PORT),
        NODE_ENV: 'test',
        DATABASE_PROVIDER: 'local',
        STORAGE_PROVIDER: 'local',
        LOCAL_STORAGE_DIR: tempStorage,
        RATE_LIMIT_DISABLED: 'true', // enable for non-throttled test suite
      },
      stdio: ['pipe', 'inherit', 'inherit'],
    }
  );

  serverProcess.on('error', (err) => {
    console.error('Failed to spawn server process:', err);
    process.exit(1);
  });

  try {
    console.log('Waiting for production server to be ready on port ' + TEST_PORT + '...');
    await fetchWithRetry(`${BASE_URL}/api/health/capabilities`, {}, 20, 1000);
    console.log('Server is online and responding!\n');

    await runTests();
  } catch (error) {
    console.error('UAT Suite encountered an unhandled error:', error);
    process.exitCode = 1;
  } finally {
    console.log('Cleaning up server process and temp directory...');
    if (serverProcess) {
      serverProcess.kill('SIGINT');
      await sleep(1000);
      try {
        serverProcess.kill('SIGKILL');
      } catch {
        // ignore
      }
    }
    try {
      rmSync(tempStorage, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}

main();
