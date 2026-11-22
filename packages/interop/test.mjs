import { fork } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const vitestEntry = require.resolve('vitest');
let curr = path.dirname(vitestEntry);
while (curr && !fs.existsSync(path.join(curr, 'package.json'))) {
  curr = path.dirname(curr);
}
const vitestBin = path.join(curr, 'vitest.mjs');

const nodeOptions = `${process.env.NODE_OPTIONS || ''} --experimental-require-module`.trim();

const child = fork(vitestBin, ['run', ...process.argv.slice(2)], {
  env: {
    ...process.env,
    NODE_OPTIONS: nodeOptions,
  },
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
