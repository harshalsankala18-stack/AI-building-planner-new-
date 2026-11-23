import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function run(cmd, cwd = root) {
  console.log(`\n> [build-all] Running: ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env } });
}

console.log('================================================================');
console.log('  AI Floor Planner SaaS — Unified Production Build Pipeline     ');
console.log('================================================================');

try {
  // 0. Ensure 3D PBR furniture assets are generated
  console.log('\n[0/6] Generating PBR 3D furniture & lighting assets...');
  run('node scripts/generate-furniture-glbs.mjs');

  // 1. Build @ai-floor-planner/interop
  console.log('\n[1/6] Building @ai-floor-planner/interop (TypeScript library)...');
  run('pnpm --filter @ai-floor-planner/interop build');

  // 2. Build @ai-floor-planner/ai-orchestration
  console.log('\n[2/6] Building @ai-floor-planner/ai-orchestration...');
  run('pnpm --filter @ai-floor-planner/ai-orchestration build');

  // 3. Build @ai-floor-planner/pascal-studio (React 19 Vite Sub-App)
  console.log('\n[3/6] Building @ai-floor-planner/pascal-studio (React 19 Vite app)...');
  run('pnpm --filter @ai-floor-planner/pascal-studio build');

  // 4. Build @ai-floor-planner/frontend (React 18 Production SPA)
  console.log('\n[4/6] Building @ai-floor-planner/frontend (React 18 SPA)...');
  run('pnpm --filter @ai-floor-planner/frontend build');

  // 5. Copy pascal-studio/dist to frontend/dist/pascal-studio for unified static deployment
  console.log('\n[5/6] Embedding Pascal 3D Studio distribution into frontend static tree...');
  const pascalDist = path.join(root, 'packages', 'pascal-studio', 'dist');
  const frontendDist = path.join(root, 'packages', 'frontend', 'dist');
  const targetPascalDir = path.join(frontendDist, 'pascal-studio');

  if (existsSync(pascalDist) && existsSync(frontendDist)) {
    mkdirSync(targetPascalDir, { recursive: true });
    cpSync(pascalDist, targetPascalDir, { recursive: true });
    console.log(`Successfully embedded: ${pascalDist} -> ${targetPascalDir}`);
  } else {
    console.warn(`Warning: Missing dist dirs (pascal: ${existsSync(pascalDist)}, frontend: ${existsSync(frontendDist)})`);
  }

  // 6. Bundle backend server & workers
  console.log('\n[6/6] Bundling Backend Server & Worker processes...');
  run('node scripts/bundle-backend.mjs');

  console.log('\n================================================================');
  console.log('  Unified Production Build Pipeline COMPLETED SUCCESSFULLY!    ');
  console.log('================================================================\n');
} catch (error) {
  console.error('\nBuild pipeline failed:', error);
  process.exit(1);
}
