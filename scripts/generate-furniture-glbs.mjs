/**
 * Deterministic PBR 3D Furniture & Lighting GLB Generator (§Stage C).
 *
 * Generates real, multi-part, beautifully detailed PBR .glb assets for all 19
 * interior catalog items with proper bounds, normalized origins, and PBR materials:
 * - Floor-mounted items rest cleanly at y = 0, centered on X/Z.
 * - Ceiling-mounted items hang with canopy at y = 0, centered on X/Z.
 * - Saved directly into packages/pascal-studio/public/assets/furniture/*.glb
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

// Polyfill FileReader for Three's GLTFExporter in Node
class NodeFileReader {
  constructor() {
    this.result = null;
    this.onload = null;
    this.onloadend = null;
    this.onerror = null;
  }
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf;
      if (this.onload) this.onload({ target: this });
      if (this.onloadend) this.onloadend({ target: this });
    }).catch(err => {
      if (this.onerror) this.onerror(err);
      if (this.onloadend) this.onloadend({ target: this });
    });
  }
}
globalThis.FileReader = NodeFileReader;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const req = createRequire(path.join(root, 'packages', 'pascal-studio', 'package.json'));
const threePkgDir = path.dirname(path.dirname(req.resolve('three')));
const threeModulePath = path.join(threePkgDir, 'build', 'three.module.js');
const gltfExporterPath = path.join(threePkgDir, 'examples', 'jsm', 'exporters', 'GLTFExporter.js');
const bufferUtilsPath = path.join(threePkgDir, 'examples', 'jsm', 'utils', 'BufferGeometryUtils.js');

const THREE = await import(pathToFileURL(threeModulePath).href);
const { GLTFExporter } = await import(pathToFileURL(gltfExporterPath).href);
const { mergeGeometries } = await import(pathToFileURL(bufferUtilsPath).href);

const OUT_DIR = path.join(root, 'packages', 'pascal-studio', 'public', 'assets', 'furniture');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Reusable PBR Materials
const matFabricWarm = new THREE.MeshStandardMaterial({ color: 0xd2cabb, roughness: 0.85, metalness: 0.05 });
const matFabricCushion = new THREE.MeshStandardMaterial({ color: 0xc4bcae, roughness: 0.8, metalness: 0.05 });
const matFabricDark = new THREE.MeshStandardMaterial({ color: 0x42464c, roughness: 0.8, metalness: 0.1 });
const matOakWood = new THREE.MeshStandardMaterial({ color: 0xa87848, roughness: 0.55, metalness: 0.05 });
const matDarkWalnut = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.6, metalness: 0.05 });
const matBlackMetal = new THREE.MeshStandardMaterial({ color: 0x1f2327, roughness: 0.35, metalness: 0.8 });
const matChrome = new THREE.MeshStandardMaterial({ color: 0xe0e4e8, roughness: 0.15, metalness: 0.95 });
const matBrass = new THREE.MeshStandardMaterial({ color: 0xd4a44c, roughness: 0.25, metalness: 0.85 });
const matPorcelain = new THREE.MeshStandardMaterial({ color: 0xf8f9fa, roughness: 0.12, metalness: 0.02 });
const matGranite = new THREE.MeshStandardMaterial({ color: 0xe8e6e2, roughness: 0.3, metalness: 0.1 });
const matCabinetGrey = new THREE.MeshStandardMaterial({ color: 0x3a4047, roughness: 0.5, metalness: 0.2 });
const matSteel = new THREE.MeshStandardMaterial({ color: 0xb5bcc4, roughness: 0.25, metalness: 0.75 });
const matMattress = new THREE.MeshStandardMaterial({ color: 0xeae6df, roughness: 0.9, metalness: 0.0 });
const matPillow = new THREE.MeshStandardMaterial({ color: 0xf5f3ee, roughness: 0.9, metalness: 0.0 });
const matBlanket = new THREE.MeshStandardMaterial({ color: 0x687888, roughness: 0.85, metalness: 0.05 });
const matGlass = new THREE.MeshStandardMaterial({ color: 0xd0e8f0, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.38 });
const matEmissiveWarm = new THREE.MeshStandardMaterial({ color: 0xfff3e0, emissive: 0xffe0b2, emissiveIntensity: 1.8, roughness: 0.2 });
const matPlasticWhite = new THREE.MeshStandardMaterial({ color: 0xf4f4f4, roughness: 0.4, metalness: 0.05 });

async function exportMeshToGlb(group, filename) {
  // Batch-merge child geometries sharing identical PBR materials to cut WebGL draw calls by ~7x
  group.updateMatrixWorld(true);
  const byMaterial = new Map();
  group.traverse((obj) => {
    if (!obj.isMesh || !obj.geometry || !obj.material) return;
    const mat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
    const cloned = obj.geometry.index ? obj.geometry.toNonIndexed() : obj.geometry.clone();
    cloned.applyMatrix4(obj.matrixWorld);
    if (!byMaterial.has(mat)) byMaterial.set(mat, []);
    byMaterial.get(mat).push(cloned);
  });

  const optimized = new THREE.Group();
  for (const [mat, geos] of byMaterial.entries()) {
    const merged = geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
    if (!merged) continue;
    const mesh = new THREE.Mesh(merged, mat);
    mesh.castShadow = mat !== matEmissiveWarm && mat !== matRugWarm;
    mesh.receiveShadow = true;
    optimized.add(mesh);
  }

  const exporter = new GLTFExporter();
  const buffer = await exporter.parseAsync(optimized, { binary: true });
  const outPath = path.join(OUT_DIR, filename);
  fs.writeFileSync(outPath, Buffer.from(buffer));
  const sizeKb = Math.round(buffer.byteLength / 1024 * 10) / 10;
  console.log(`  ✓ Generated ${filename.padEnd(26)} (${sizeKb} KB, ${optimized.children.length} draw calls)`);
  return { filename, sizeKb };
}

// Helper to make rounded boxes / clean box meshes
function makeBox(w, h, d, mat, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function makeCylinder(rt, rb, h, segs, mat, x = 0, y = 0, z = 0, rx = 0, rz = 0) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs), mat);
  mesh.position.set(x, y, z);
  if (rx) mesh.rotation.x = rx;
  if (rz) mesh.rotation.z = rz;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// ---------------------------------------------------------------------------
const matPillowsAccent = new THREE.MeshStandardMaterial({ color: 0xc26d53, roughness: 0.8, metalness: 0.05 });
const matSageAccent = new THREE.MeshStandardMaterial({ color: 0x5c7c70, roughness: 0.8, metalness: 0.05 });
const matRugWarm = new THREE.MeshStandardMaterial({ color: 0xd8d0c5, roughness: 0.95, metalness: 0.0 });
const matFeltDark = new THREE.MeshStandardMaterial({ color: 0x22262c, roughness: 0.92, metalness: 0.02 });
const matTvScreen = new THREE.MeshStandardMaterial({ color: 0x0b0f17, roughness: 0.08, metalness: 0.45 });
const matPlantLeaf = new THREE.MeshStandardMaterial({ color: 0x2e6f40, roughness: 0.72, metalness: 0.02 });
const matCarBody = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.28, metalness: 0.68 });
const matTire = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.88, metalness: 0.05 });

// ---------------------------------------------------------------------------
// 1. SOFA 3-SEATER (2.1m W x 0.85m D x 0.82m H) + WOVEN RUG & ACCENT PILLOWS
// ---------------------------------------------------------------------------
function buildSofa3Seater() {
  const root = new THREE.Group();
  const w = 2.1, d = 0.85, backH = 0.82;
  // Subtle woven area rug tucked beneath front sofa zone
  root.add(makeBox(w + 0.45, 0.008, d + 1.15, matRugWarm, 0, 0.004, 0.42));
  // 4 tapered walnut legs
  const legH = 0.12;
  root.add(makeCylinder(0.025, 0.018, legH, 12, matDarkWalnut, -w / 2 + 0.1, legH / 2, -d / 2 + 0.1));
  root.add(makeCylinder(0.025, 0.018, legH, 12, matDarkWalnut, w / 2 - 0.1, legH / 2, -d / 2 + 0.1));
  root.add(makeCylinder(0.025, 0.018, legH, 12, matDarkWalnut, -w / 2 + 0.1, legH / 2, d / 2 - 0.1));
  root.add(makeCylinder(0.025, 0.018, legH, 12, matDarkWalnut, w / 2 - 0.1, legH / 2, d / 2 - 0.1));
  // Base deck
  root.add(makeBox(w, 0.15, d, matFabricWarm, 0, legH + 0.075, 0));
  // Backrest
  root.add(makeBox(w, backH - (legH + 0.15), 0.18, matFabricWarm, 0, legH + 0.15 + (backH - (legH + 0.15)) / 2, -d / 2 + 0.09));
  // Left & right armrests
  const armW = 0.15, armH = 0.22, armD = d;
  root.add(makeBox(armW, armH, armD, matFabricWarm, -w / 2 + armW / 2, legH + 0.15 + armH / 2, 0));
  root.add(makeBox(armW, armH, armD, matFabricWarm, w / 2 - armW / 2, legH + 0.15 + armH / 2, 0));
  // 3 Seat & Back Cushions
  const cushW = (w - 2 * armW - 0.04) / 3;
  const cushD = d - 0.18 - 0.02;
  for (let i = 0; i < 3; i++) {
    const cx = -w / 2 + armW + cushW / 2 + i * (cushW + 0.02);
    root.add(makeBox(cushW, 0.14, cushD, matFabricCushion, cx, legH + 0.15 + 0.07, 0.06));
    root.add(makeBox(cushW, 0.32, 0.12, matFabricCushion, cx, legH + 0.15 + 0.14 + 0.16, -d / 2 + 0.18 + 0.06));
  }
  // Designer accent throw pillows
  root.add(makeBox(0.32, 0.30, 0.11, matPillowsAccent, -w / 2 + armW + 0.20, legH + 0.44, -d / 2 + 0.28));
  root.add(makeBox(0.32, 0.30, 0.11, matSageAccent, w / 2 - armW - 0.20, legH + 0.44, -d / 2 + 0.28));
  return root;
}

// ---------------------------------------------------------------------------
// 2. SOFA 2-SEATER (1.55m W x 0.85m D x 0.82m H)
// ---------------------------------------------------------------------------
function buildSofa2Seater() {
  const root = new THREE.Group();
  const w = 1.55, d = 0.85, backH = 0.82;
  const legH = 0.12;
  root.add(makeCylinder(0.025, 0.018, legH, 12, matDarkWalnut, -w / 2 + 0.1, legH / 2, -d / 2 + 0.1));
  root.add(makeCylinder(0.025, 0.018, legH, 12, matDarkWalnut, w / 2 - 0.1, legH / 2, -d / 2 + 0.1));
  root.add(makeCylinder(0.025, 0.018, legH, 12, matDarkWalnut, -w / 2 + 0.1, legH / 2, d / 2 - 0.1));
  root.add(makeCylinder(0.025, 0.018, legH, 12, matDarkWalnut, w / 2 - 0.1, legH / 2, d / 2 - 0.1));
  root.add(makeBox(w, 0.15, d, matFabricWarm, 0, legH + 0.075, 0));
  root.add(makeBox(w, backH - (legH + 0.15), 0.18, matFabricWarm, 0, legH + 0.15 + (backH - (legH + 0.15)) / 2, -d / 2 + 0.09));
  const armW = 0.15, armH = 0.22, armD = d;
  root.add(makeBox(armW, armH, armD, matFabricWarm, -w / 2 + armW / 2, legH + 0.15 + armH / 2, 0));
  root.add(makeBox(armW, armH, armD, matFabricWarm, w / 2 - armW / 2, legH + 0.15 + armH / 2, 0));
  const cushW = (w - 2 * armW - 0.03) / 2;
  const cushD = d - 0.18 - 0.02;
  for (let i = 0; i < 2; i++) {
    const cx = -w / 2 + armW + cushW / 2 + i * (cushW + 0.03);
    root.add(makeBox(cushW, 0.14, cushD, matFabricCushion, cx, legH + 0.15 + 0.07, 0.06));
    root.add(makeBox(cushW, 0.32, 0.12, matFabricCushion, cx, legH + 0.15 + 0.14 + 0.16, -d / 2 + 0.18 + 0.06));
  }
  root.add(makeBox(0.30, 0.28, 0.10, matPillowsAccent, -w / 2 + armW + 0.20, legH + 0.43, -d / 2 + 0.28));
  return root;
}

// ---------------------------------------------------------------------------
// 3. COFFEE TABLE (1.1m W x 0.6m D x 0.42m H) + CERAMIC TRAY
// ---------------------------------------------------------------------------
function buildCoffeeTable() {
  const root = new THREE.Group();
  const w = 1.1, d = 0.6, h = 0.42;
  root.add(makeBox(w, 0.035, d, matOakWood, 0, h - 0.0175, 0));
  root.add(makeBox(w - 0.1, 0.015, d - 0.1, matBlackMetal, 0, 0.14, 0));
  const legW = 0.025;
  root.add(makeBox(legW, h - 0.035, legW, matBlackMetal, -w / 2 + 0.06, (h - 0.035) / 2, -d / 2 + 0.06));
  root.add(makeBox(legW, h - 0.035, legW, matBlackMetal, w / 2 - 0.06, (h - 0.035) / 2, -d / 2 + 0.06));
  root.add(makeBox(legW, h - 0.035, legW, matBlackMetal, -w / 2 + 0.06, (h - 0.035) / 2, d / 2 - 0.06));
  root.add(makeBox(legW, h - 0.035, legW, matBlackMetal, w / 2 - 0.06, (h - 0.035) / 2, d / 2 - 0.06));
  // Architectural coffee table books & ceramic vase
  root.add(makeBox(0.28, 0.022, 0.22, matFabricDark, -0.18, h + 0.011, 0.02));
  root.add(makeBox(0.25, 0.018, 0.20, matPillowsAccent, -0.18, h + 0.031, 0.02));
  root.add(makeCylinder(0.05, 0.065, 0.14, 16, matPorcelain, 0.20, h + 0.07, -0.02));
  return root;
}

// ---------------------------------------------------------------------------
// 4. DESIGNER TV FEATURE WALL UNIT (2.05m W x 0.42m D x 1.95m H)
// Fluted wood slat panel + floating walnut console + 65" Smart TV + warm LED strip + indoor planter
// ---------------------------------------------------------------------------
function buildTvConsole() {
  const root = new THREE.Group();
  const w = 1.65, d = 0.42, cabH = 0.44;
  // Warm walnut architectural backing panel with vertical oak slats
  const wallW = 1.95, wallH = 1.92;
  root.add(makeBox(wallW, wallH, 0.025, matDarkWalnut, 0, wallH / 2, -d / 2 + 0.025));
  const slatCount = 14;
  const slatSpacing = (wallW - 0.08) / slatCount;
  for (let i = 0; i < slatCount; i++) {
    const sx = -wallW / 2 + 0.04 + slatSpacing * (i + 0.5);
    root.add(makeBox(0.036, wallH - 0.04, 0.048, matOakWood, sx, wallH / 2, -d / 2 + 0.025));
  }
  // Floating walnut console credenza (elevated 0.16m off floor)
  root.add(makeBox(w, cabH - 0.14, d, matDarkWalnut, 0, 0.16 + (cabH - 0.14) / 2, 0.02));
  // Warm cove LED glow strip beneath floating console
  root.add(makeBox(w - 0.08, 0.014, 0.02, matEmissiveWarm, 0, 0.153, -d / 2 + 0.08));
  // Brass minimalist drawer pulls
  for (let i = 0; i < 3; i++) {
    const cx = -w / 2 + (w / 3) * i + w / 6;
    root.add(makeBox(0.10, 0.014, 0.018, matBrass, cx, 0.16 + (cabH - 0.14) * 0.55, d / 2 + 0.025));
  }
  // 65-inch ultra-thin OLED smart TV wall-mounted cleanly on slats facing +Z
  const tvW = 1.44, tvH = 0.80, tvY = 1.15;
  root.add(makeBox(tvW, tvH, 0.032, matBlackMetal, 0, tvY, -d / 2 + 0.08));
  root.add(makeBox(tvW - 0.025, tvH - 0.025, 0.006, matTvScreen, 0, tvY, -d / 2 + 0.098));
  // Backlit warm LED halo above/below TV
  root.add(makeBox(tvW - 0.1, 0.012, 0.012, matEmissiveWarm, 0, tvY + tvH / 2 - 0.02, -d / 2 + 0.062));
  // Minimalist indoor planter beside media wall
  root.add(makeCylinder(0.13, 0.10, 0.28, 16, matPorcelain, w / 2 + 0.20, 0.14, 0.02));
  root.add(makeCylinder(0.16, 0.06, 0.42, 12, matPlantLeaf, w / 2 + 0.20, 0.46, 0.02));
  return root;
}

// ---------------------------------------------------------------------------
// 5. QUEEN BED (1.6m W x 2.05m D x 1.05m H)
// ---------------------------------------------------------------------------
function buildBedQueen() {
  const root = new THREE.Group();
  const w = 1.6, d = 2.05;
  // Wood plinth base
  root.add(makeBox(w, 0.28, d, matDarkWalnut, 0, 0.14, 0));
  // Headboard
  const hbH = 1.05, hbD = 0.1;
  root.add(makeBox(w + 0.06, hbH, hbD, matFabricWarm, 0, hbH / 2, -d / 2 + hbD / 2));
  // Mattress
  const matW = w - 0.04, matD = d - hbD - 0.04, matH = 0.26;
  root.add(makeBox(matW, matH, matD, matMattress, 0, 0.28 + matH / 2, hbD / 2));
  // Folded duvet blanket covering bottom 65%
  const blkLen = matD * 0.65;
  root.add(makeBox(matW + 0.02, 0.04, blkLen, matBlanket, 0, 0.28 + matH + 0.02, hbD / 2 + (matD - blkLen) / 2));
  // 2 Plump pillows at top
  const pilW = 0.65, pilD = 0.42, pilH = 0.12;
  root.add(makeBox(pilW, pilH, pilD, matPillow, -pilW / 2 - 0.04, 0.28 + matH + pilH / 2, -d / 2 + hbD + pilD / 2 + 0.05));
  root.add(makeBox(pilW, pilH, pilD, matPillow, pilW / 2 + 0.04, 0.28 + matH + pilH / 2, -d / 2 + hbD + pilD / 2 + 0.05));
  return root;
}

// ---------------------------------------------------------------------------
// 6. SINGLE BED (1.0m W x 2.0m D x 0.95m H)
// ---------------------------------------------------------------------------
function buildBedSingle() {
  const root = new THREE.Group();
  const w = 1.0, d = 2.0;
  root.add(makeBox(w, 0.28, d, matOakWood, 0, 0.14, 0));
  const hbH = 0.95, hbD = 0.08;
  root.add(makeBox(w + 0.04, hbH, hbD, matFabricWarm, 0, hbH / 2, -d / 2 + hbD / 2));
  const matW = w - 0.04, matD = d - hbD - 0.04, matH = 0.24;
  root.add(makeBox(matW, matH, matD, matMattress, 0, 0.28 + matH / 2, hbD / 2));
  const blkLen = matD * 0.65;
  root.add(makeBox(matW + 0.02, 0.04, blkLen, matBlanket, 0, 0.28 + matH + 0.02, hbD / 2 + (matD - blkLen) / 2));
  const pilW = 0.7, pilD = 0.42, pilH = 0.12;
  root.add(makeBox(pilW, pilH, pilD, matPillow, 0, 0.28 + matH + pilH / 2, -d / 2 + hbD + pilD / 2 + 0.05));
  return root;
}

// ---------------------------------------------------------------------------
// 7. BEDSIDE NIGHTSTAND (0.48m W x 0.45m D x 0.52m H) + LAMP
// ---------------------------------------------------------------------------
function buildSideTable() {
  const root = new THREE.Group();
  const w = 0.48, d = 0.45, h = 0.52;
  // Nightstand box with 2 drawers
  root.add(makeBox(w, h - 0.1, d, matOakWood, 0, 0.1 + (h - 0.1) / 2, 0));
  // 4 slim legs
  root.add(makeCylinder(0.015, 0.012, 0.1, 10, matBrass, -w / 2 + 0.05, 0.05, -d / 2 + 0.05));
  root.add(makeCylinder(0.015, 0.012, 0.1, 10, matBrass, w / 2 - 0.05, 0.05, -d / 2 + 0.05));
  root.add(makeCylinder(0.015, 0.012, 0.1, 10, matBrass, -w / 2 + 0.05, 0.05, d / 2 - 0.05));
  root.add(makeCylinder(0.015, 0.012, 0.1, 10, matBrass, w / 2 - 0.05, 0.05, d / 2 - 0.05));
  // Drawer pulls
  root.add(makeCylinder(0.012, 0.012, 0.02, 10, matBrass, 0, 0.1 + (h - 0.1) * 0.75, d / 2 + 0.01, Math.PI / 2));
  root.add(makeCylinder(0.012, 0.012, 0.02, 10, matBrass, 0, 0.1 + (h - 0.1) * 0.25, d / 2 + 0.01, Math.PI / 2));
  // Small table lamp on top
  root.add(makeCylinder(0.07, 0.07, 0.015, 16, matBrass, 0, h + 0.0075, 0));
  root.add(makeCylinder(0.008, 0.008, 0.18, 12, matBrass, 0, h + 0.1, 0));
  root.add(makeCylinder(0.08, 0.12, 0.16, 20, matEmissiveWarm, 0, h + 0.26, 0));
  return root;
}

// ---------------------------------------------------------------------------
// 8. 3-DOOR WARDROBE (1.5m W x 0.6m D x 2.1m H)
// ---------------------------------------------------------------------------
function buildWardrobe() {
  const root = new THREE.Group();
  const w = 1.5, d = 0.6, h = 2.1;
  // Main carcass
  root.add(makeBox(w, h, d, matFabricWarm, 0, h / 2, 0));
  // 3 Recessed door panels
  const doorW = (w - 0.08) / 3;
  for (let i = 0; i < 3; i++) {
    const cx = -w / 2 + 0.04 + doorW / 2 + i * (doorW + 0.01);
    root.add(makeBox(doorW - 0.02, h - 0.12, 0.02, matOakWood, cx, h / 2, d / 2 + 0.01));
    // Sleek vertical brass handle
    root.add(makeCylinder(0.008, 0.008, 0.24, 10, matBrass, cx + doorW / 2 - 0.04, 1.05, d / 2 + 0.03));
  }
  return root;
}

// ---------------------------------------------------------------------------
// 9. 6-SEATER DINING TABLE & CHAIRS (1.8m W x 0.95m D x 0.76m H)
// ---------------------------------------------------------------------------
function buildDiningTable6() {
  const root = new THREE.Group();
  const w = 1.8, d = 0.95, h = 0.76;
  // Tabletop
  root.add(makeBox(w, 0.04, d, matOakWood, 0, h - 0.02, 0));
  // 4 Legs
  const legW = 0.06;
  root.add(makeBox(legW, h - 0.04, legW, matOakWood, -w / 2 + 0.08, (h - 0.04) / 2, -d / 2 + 0.08));
  root.add(makeBox(legW, h - 0.04, legW, matOakWood, w / 2 - 0.08, (h - 0.04) / 2, -d / 2 + 0.08));
  root.add(makeBox(legW, h - 0.04, legW, matOakWood, -w / 2 + 0.08, (h - 0.04) / 2, d / 2 - 0.08));
  root.add(makeBox(legW, h - 0.04, legW, matOakWood, w / 2 - 0.08, (h - 0.04) / 2, d / 2 - 0.08));
  // 6 Chairs (2 on each long side, 1 at each short end)
  const addChair = (cx, cz, rotY) => {
    const chair = new THREE.Group();
    // 4 legs
    chair.add(makeCylinder(0.015, 0.012, 0.44, 8, matDarkWalnut, -0.18, 0.22, -0.18));
    chair.add(makeCylinder(0.015, 0.012, 0.44, 8, matDarkWalnut, 0.18, 0.22, -0.18));
    chair.add(makeCylinder(0.015, 0.012, 0.44, 8, matDarkWalnut, -0.18, 0.22, 0.18));
    chair.add(makeCylinder(0.015, 0.012, 0.44, 8, matDarkWalnut, 0.18, 0.22, 0.18));
    // Seat
    chair.add(makeBox(0.42, 0.04, 0.42, matFabricDark, 0, 0.46, 0));
    // Backrest
    chair.add(makeBox(0.40, 0.42, 0.03, matFabricDark, 0, 0.69, -0.19));
    chair.position.set(cx, 0, cz);
    chair.rotation.y = rotY;
    root.add(chair);
  };
  addChair(-0.45, -d / 2 - 0.25, 0);
  addChair(0.45, -d / 2 - 0.25, 0);
  addChair(-0.45, d / 2 + 0.25, Math.PI);
  addChair(0.45, d / 2 + 0.25, Math.PI);
  addChair(-w / 2 - 0.25, 0, Math.PI / 2);
  addChair(w / 2 + 0.25, 0, -Math.PI / 2);
  return root;
}

// ---------------------------------------------------------------------------
// 10. 4-SEATER DINING TABLE (1.2m W x 0.85m D x 0.76m H)
// ---------------------------------------------------------------------------
function buildDiningTable4() {
  const root = new THREE.Group();
  const w = 1.2, d = 0.85, h = 0.76;
  root.add(makeBox(w, 0.04, d, matOakWood, 0, h - 0.02, 0));
  const legW = 0.05;
  root.add(makeBox(legW, h - 0.04, legW, matOakWood, -w / 2 + 0.07, (h - 0.04) / 2, -d / 2 + 0.07));
  root.add(makeBox(legW, h - 0.04, legW, matOakWood, w / 2 - 0.07, (h - 0.04) / 2, -d / 2 + 0.07));
  root.add(makeBox(legW, h - 0.04, legW, matOakWood, -w / 2 + 0.07, (h - 0.04) / 2, d / 2 - 0.07));
  root.add(makeBox(legW, h - 0.04, legW, matOakWood, w / 2 - 0.07, (h - 0.04) / 2, d / 2 - 0.07));
  const addChair = (cx, cz, rotY) => {
    const chair = new THREE.Group();
    chair.add(makeCylinder(0.015, 0.012, 0.44, 8, matDarkWalnut, -0.18, 0.22, -0.18));
    chair.add(makeCylinder(0.015, 0.012, 0.44, 8, matDarkWalnut, 0.18, 0.22, -0.18));
    chair.add(makeCylinder(0.015, 0.012, 0.44, 8, matDarkWalnut, -0.18, 0.22, 0.18));
    chair.add(makeCylinder(0.015, 0.012, 0.44, 8, matDarkWalnut, 0.18, 0.22, 0.18));
    chair.add(makeBox(0.42, 0.04, 0.42, matFabricDark, 0, 0.46, 0));
    chair.add(makeBox(0.40, 0.42, 0.03, matFabricDark, 0, 0.69, -0.19));
    chair.position.set(cx, 0, cz);
    chair.rotation.y = rotY;
    root.add(chair);
  };
  addChair(-0.3, -d / 2 - 0.24, 0);
  addChair(0.3, -d / 2 - 0.24, 0);
  addChair(-0.3, d / 2 + 0.24, Math.PI);
  addChair(0.3, d / 2 + 0.24, Math.PI);
  return root;
}

// ---------------------------------------------------------------------------
// 11. MODULAR KITCHEN COUNTER (2.2m W x 0.6m D x 0.86m H) + SINK & HOB
// ---------------------------------------------------------------------------
function buildKitchenCounter() {
  const root = new THREE.Group();
  const w = 2.2, d = 0.6, h = 0.86;
  // Lower base cabinets
  root.add(makeBox(w, h - 0.04, d, matCabinetGrey, 0, (h - 0.04) / 2, 0));
  // White quartz countertop
  root.add(makeBox(w + 0.02, 0.04, d + 0.02, matGranite, 0, h - 0.02, 0));
  // 4-burner black ceramic hob on left
  const hobX = -w / 4;
  root.add(makeBox(0.6, 0.01, 0.5, matBlackMetal, hobX, h + 0.005, 0));
  root.add(makeCylinder(0.08, 0.08, 0.008, 16, matBrass, hobX - 0.15, h + 0.01, -0.12));
  root.add(makeCylinder(0.06, 0.06, 0.008, 16, matBrass, hobX + 0.15, h + 0.01, -0.12));
  root.add(makeCylinder(0.06, 0.06, 0.008, 16, matBrass, hobX - 0.15, h + 0.01, 0.12));
  root.add(makeCylinder(0.09, 0.09, 0.008, 16, matBrass, hobX + 0.15, h + 0.01, 0.12));
  // Stainless sink on right
  const sinkX = w / 4;
  root.add(makeBox(0.55, 0.005, 0.45, matSteel, sinkX, h + 0.002, 0));
  // Chrome gooseneck faucet
  root.add(makeCylinder(0.015, 0.015, 0.24, 12, matChrome, sinkX, h + 0.12, -0.18));
  root.add(makeCylinder(0.012, 0.012, 0.12, 12, matChrome, sinkX, h + 0.24, -0.12, Math.PI / 2));
  return root;
}

// ---------------------------------------------------------------------------
// 12. DOUBLE-DOOR REFRIGERATOR (0.7m W x 0.7m D x 1.75m H)
// ---------------------------------------------------------------------------
function buildRefrigerator() {
  const root = new THREE.Group();
  const w = 0.7, d = 0.7, h = 1.75;
  // Main body
  root.add(makeBox(w, h, d, matSteel, 0, h / 2, 0));
  // Top freezer doors split
  const fzH = h * 0.4;
  root.add(makeBox(w - 0.02, fzH - 0.02, 0.02, matSteel, 0, h - fzH / 2, d / 2 + 0.01));
  // Bottom fridge door
  const rfH = h * 0.6;
  root.add(makeBox(w - 0.02, rfH - 0.02, 0.02, matSteel, 0, rfH / 2, d / 2 + 0.01));
  // Brushed steel vertical handles
  root.add(makeCylinder(0.01, 0.01, 0.35, 10, matChrome, w / 2 - 0.06, h - fzH / 2, d / 2 + 0.03));
  root.add(makeCylinder(0.01, 0.01, 0.5, 10, matChrome, w / 2 - 0.06, rfH / 2 + 0.15, d / 2 + 0.03));
  return root;
}

// ---------------------------------------------------------------------------
// 13. WATER CLOSET TOILET (0.4m W x 0.68m D x 0.76m H)
// ---------------------------------------------------------------------------
function buildWcToilet() {
  const root = new THREE.Group();
  const w = 0.4, d = 0.68, h = 0.76;
  // Rear cistern tank
  root.add(makeBox(w, 0.42, 0.22, matPorcelain, 0, 0.34 + 0.21, -d / 2 + 0.11));
  // Chrome dual flush button on top
  root.add(makeCylinder(0.025, 0.025, 0.01, 16, matChrome, 0, h + 0.005, -d / 2 + 0.11));
  // Bowl pedestal
  root.add(makeCylinder(0.16, 0.14, 0.40, 20, matPorcelain, 0, 0.2, 0.08));
  // Elongated bowl rim & lid
  root.add(makeBox(w - 0.04, 0.04, d - 0.24, matPorcelain, 0, 0.42, 0.08));
  root.add(makeBox(w - 0.06, 0.02, d - 0.26, matPlasticWhite, 0, 0.45, 0.08));
  return root;
}

// ---------------------------------------------------------------------------
// 14. VANITY WASH BASIN (0.6m W x 0.46m D x 0.82m H) + MIRROR
// ---------------------------------------------------------------------------
function buildWashBasin() {
  const root = new THREE.Group();
  const w = 0.6, d = 0.46, h = 0.82;
  // Floating vanity cabinet
  root.add(makeBox(w, 0.5, d, matDarkWalnut, 0, 0.3 + 0.25, 0));
  // White ceramic countertop & integrated basin
  root.add(makeBox(w + 0.02, 0.05, d + 0.02, matPorcelain, 0, h - 0.025, 0));
  // Chrome single-lever mixer faucet
  root.add(makeCylinder(0.018, 0.018, 0.16, 12, matChrome, 0, h + 0.08, -d / 2 + 0.08));
  root.add(makeCylinder(0.012, 0.012, 0.10, 12, matChrome, 0, h + 0.15, -d / 2 + 0.12, Math.PI / 2));
  // Framed wall mirror above basin
  const mirH = 0.8, mirW = 0.56;
  root.add(makeBox(mirW, mirH, 0.02, matBlackMetal, 0, h + 0.15 + mirH / 2, -d / 2));
  root.add(makeBox(mirW - 0.04, mirH - 0.04, 0.005, matGlass, 0, h + 0.15 + mirH / 2, -d / 2 + 0.012));
  return root;
}

// ---------------------------------------------------------------------------
// 15. WALK-IN SHOWER TRAY & GLASS PARTITION (0.9m W x 0.9m D x 2.05m H)
// ---------------------------------------------------------------------------
function buildShowerTray() {
  const root = new THREE.Group();
  const w = 0.9, d = 0.9;
  // Low ceramic shower tray
  root.add(makeBox(w, 0.06, d, matPorcelain, 0, 0.03, 0));
  // Chrome drain grid
  root.add(makeCylinder(0.05, 0.05, 0.005, 16, matChrome, 0, 0.062, 0));
  // Tempered glass partition screen (along front edge or side edge)
  root.add(makeBox(0.01, 1.95, d, matGlass, -w / 2 + 0.005, 0.06 + 1.95 / 2, 0));
  // Chrome clamp brackets
  root.add(makeBox(0.03, 0.04, 0.03, matChrome, -w / 2 + 0.01, 0.08, -d / 4));
  root.add(makeBox(0.03, 0.04, 0.03, matChrome, -w / 2 + 0.01, 0.08, d / 4));
  // Chrome wall shower column and rain head
  root.add(makeCylinder(0.012, 0.012, 1.8, 12, matChrome, 0, 1.0, -d / 2 + 0.04));
  root.add(makeCylinder(0.12, 0.12, 0.02, 20, matChrome, 0, 1.92, -d / 2 + 0.22));
  return root;
}

// ---------------------------------------------------------------------------
// 16. CEILING FAN (1.2m Span x 0.32m H) — Top Canopy at Y = 0 (attachTo: 'ceiling')
// ---------------------------------------------------------------------------
function buildCeilingFan() {
  const root = new THREE.Group();
  // Ceiling canopy at y = 0
  root.add(makeCylinder(0.09, 0.09, 0.04, 20, matBlackMetal, 0, -0.02, 0));
  // Downrod
  root.add(makeCylinder(0.014, 0.014, 0.20, 12, matBlackMetal, 0, -0.14, 0));
  // Motor hub housing
  root.add(makeCylinder(0.14, 0.14, 0.08, 24, matDarkWalnut, 0, -0.28, 0));
  // Bottom warm light dome
  root.add(makeCylinder(0.08, 0.08, 0.025, 20, matEmissiveWarm, 0, -0.325, 0));
  // 3 Sculpted angled aerodynamic blades (120 deg apart)
  for (let i = 0; i < 3; i++) {
    const angle = (i * 2 * Math.PI) / 3;
    const blade = new THREE.Group();
    blade.add(makeBox(0.52, 0.012, 0.13, matDarkWalnut, 0.32, 0, 0));
    blade.rotation.y = angle;
    blade.position.set(0, -0.28, 0);
    root.add(blade);
  }
  return root;
}

// ---------------------------------------------------------------------------
// 17. RECESSED CEILING DOWNLIGHT (0.15m Diam x 0.04m H) — Top at Y = 0
// ---------------------------------------------------------------------------
function buildCeilingLightRecessed() {
  const root = new THREE.Group();
  // Flush bezel ring
  root.add(makeCylinder(0.085, 0.085, 0.008, 24, matPlasticWhite, 0, -0.004, 0));
  // Warm emissive LED diffuser disc
  root.add(makeCylinder(0.065, 0.065, 0.005, 24, matEmissiveWarm, 0, -0.008, 0));
  // Canister recess above ceiling
  root.add(makeCylinder(0.07, 0.07, 0.04, 20, matBlackMetal, 0, 0.02, 0));
  return root;
}

// ---------------------------------------------------------------------------
// 18. PENDANT LIGHT (0.28m Diam x 0.55m H) — Top Canopy at Y = 0
// ---------------------------------------------------------------------------
function buildPendantLight() {
  const root = new THREE.Group();
  // Small ceiling canopy
  root.add(makeCylinder(0.05, 0.05, 0.02, 16, matBrass, 0, -0.01, 0));
  // Black suspension cable
  root.add(makeCylinder(0.004, 0.004, 0.36, 8, matBlackMetal, 0, -0.20, 0));
  // Sculptural conical brass shade
  root.add(makeCylinder(0.04, 0.14, 0.16, 24, matBrass, 0, -0.44, 0));
  // Warm glowing bulb tip
  root.add(makeCylinder(0.035, 0.035, 0.04, 16, matEmissiveWarm, 0, -0.52, 0));
  return root;
}

// ---------------------------------------------------------------------------
// 19. WALL SCONCE (0.14m W x 0.18m D x 0.28m H)
// ---------------------------------------------------------------------------
function buildWallSconce() {
  const root = new THREE.Group();
  // Wall backplate
  root.add(makeBox(0.10, 0.16, 0.015, matBrass, 0, 0, -0.08));
  // Forward arm
  root.add(makeCylinder(0.01, 0.01, 0.09, 10, matBrass, 0, 0, -0.035, Math.PI / 2));
  // Frosted glass cylindrical shade with warm glow
  root.add(makeCylinder(0.05, 0.05, 0.20, 18, matEmissiveWarm, 0, 0.04, 0.02));
  return root;
}

function buildDiningChair() {
  const root = new THREE.Group();
  root.add(makeCylinder(0.015, 0.012, 0.44, 8, matDarkWalnut, -0.18, 0.22, -0.18));
  root.add(makeCylinder(0.015, 0.012, 0.44, 8, matDarkWalnut, 0.18, 0.22, -0.18));
  root.add(makeCylinder(0.015, 0.012, 0.44, 8, matDarkWalnut, -0.18, 0.22, 0.18));
  root.add(makeCylinder(0.015, 0.012, 0.44, 8, matDarkWalnut, 0.18, 0.22, 0.18));
  root.add(makeBox(0.42, 0.045, 0.42, matFabricDark, 0, 0.46, 0));
  root.add(makeBox(0.40, 0.42, 0.03, matFabricDark, 0, 0.69, -0.19));
  return root;
}

function buildStudyDesk() {
  const root = new THREE.Group();
  const w = 1.2, d = 0.6, h = 0.75;
  root.add(makeBox(w, 0.035, d, matOakWood, 0, h - 0.0175, 0));
  root.add(makeBox(0.035, h - 0.035, 0.54, matBlackMetal, -w / 2 + 0.05, (h - 0.035) / 2, 0));
  root.add(makeBox(0.035, h - 0.035, 0.54, matBlackMetal, w / 2 - 0.05, (h - 0.035) / 2, 0));
  // Slim widescreen monitor on desk
  root.add(makeBox(0.20, 0.015, 0.15, matBlackMetal, 0, h + 0.0075, -0.12));
  root.add(makeBox(0.04, 0.12, 0.03, matBlackMetal, 0, h + 0.06, -0.14));
  root.add(makeBox(0.62, 0.36, 0.025, matTvScreen, 0, h + 0.26, -0.13));
  return root;
}

function buildCarSedan() {
  const root = new THREE.Group();
  // Sleek low-poly architectural car silhouette (~4.3m L x 1.8m W x 1.45m H)
  const bodyW = 1.82, bodyL = 4.35;
  // Lower chassis
  root.add(makeBox(bodyW, 0.56, bodyL, matCarBody, 0, 0.48, 0));
  // Glazed upper cabin greenhouse
  root.add(makeBox(bodyW - 0.24, 0.48, bodyL * 0.48, matCabinetGrey, 0, 0.98, -0.12));
  root.add(makeBox(bodyW - 0.20, 0.42, bodyL * 0.42, matGlass, 0, 0.99, -0.12));
  // 4 Tires
  const wheelZ = [bodyL * 0.31, -bodyL * 0.31];
  const wheelX = [-bodyW / 2 + 0.06, bodyW / 2 - 0.06];
  for (const wz of wheelZ) {
    for (const wx of wheelX) {
      root.add(makeCylinder(0.32, 0.32, 0.20, 16, matTire, wx, 0.32, wz, 0, Math.PI / 2));
      root.add(makeCylinder(0.18, 0.18, 0.21, 12, matSteel, wx, 0.32, wz, 0, Math.PI / 2));
    }
  }
  return root;
}

// ===========================================================================
// MAIN GENERATION RUNNER
// ===========================================================================
async function main() {
  console.log('========================================================================');
  console.log('  GENERATING DETERMINISTIC PBR 3D FURNITURE & LIGHTING ASSETS (.GLB)    ');
  console.log('========================================================================\n');
  console.log(`Target Output Directory: ${OUT_DIR}\n`);

  const builders = [
    { fn: buildSofa3Seater, name: 'sofa_3seater.glb' },
    { fn: buildSofa2Seater, name: 'sofa_2seater.glb' },
    { fn: buildCoffeeTable, name: 'coffee_table.glb' },
    { fn: buildTvConsole, name: 'tv_console.glb' },
    { fn: buildBedQueen, name: 'bed_queen.glb' },
    { fn: buildBedSingle, name: 'bed_single.glb' },
    { fn: buildSideTable, name: 'side_table.glb' },
    { fn: buildWardrobe, name: 'wardrobe.glb' },
    { fn: buildDiningTable6, name: 'dining_table_6.glb' },
    { fn: buildDiningTable4, name: 'dining_table_4.glb' },
    { fn: buildDiningChair, name: 'dining_chair.glb' },
    { fn: buildStudyDesk, name: 'study_desk.glb' },
    { fn: buildKitchenCounter, name: 'kitchen_counter.glb' },
    { fn: buildRefrigerator, name: 'refrigerator.glb' },
    { fn: buildWcToilet, name: 'wc_toilet.glb' },
    { fn: buildWashBasin, name: 'wash_basin.glb' },
    { fn: buildShowerTray, name: 'shower_tray.glb' },
    { fn: buildCeilingFan, name: 'ceiling_fan.glb' },
    { fn: buildCeilingLightRecessed, name: 'ceiling_light_recessed.glb' },
    { fn: buildPendantLight, name: 'pendant_light.glb' },
    { fn: buildWallSconce, name: 'wall_sconce.glb' },
    { fn: buildCarSedan, name: 'car_sedan.glb' },
  ];

  const results = [];
  for (const b of builders) {
    const group = b.fn();
    const res = await exportMeshToGlb(group, b.name);
    results.push(res);
  }

  console.log('\n========================================================================');
  console.log(`  ALL ${results.length} PBR 3D GLB ASSETS GENERATED SUCCESSFULLY!`);
  console.log('========================================================================\n');
}

main().catch(err => {
  console.error('Fatal generator error:', err);
  process.exit(1);
});
