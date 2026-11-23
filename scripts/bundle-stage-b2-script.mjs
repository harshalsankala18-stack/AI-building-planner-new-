import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const esbuildPkgDir = path.join(root, 'node_modules', '.pnpm', 'esbuild@0.21.5', 'node_modules', 'esbuild');
const require = createRequire(path.join(esbuildPkgDir, 'package.json'));
const esbuild = require('./lib/main.js');

await esbuild.build({
  entryPoints: [path.join(root, 'scripts', 'verify-stage-b2-engine.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  external: [
    '@resvg/resvg-js',
    '*.node',
    'playwright',
    'canvas',
  ],
  outfile: path.join(root, 'scripts', 'verify-stage-b2-engine.mjs'),
  logLevel: 'warning',
});
console.log('scripts/verify-stage-b2-engine.mjs built successfully.');
