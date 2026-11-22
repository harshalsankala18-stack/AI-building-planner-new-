import { fork } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const viteIndex = require.resolve('vite');
// find package.json of vite
let curr = path.dirname(viteIndex);
while (curr && !fs.existsSync(path.join(curr, 'package.json'))) {
  curr = path.dirname(curr);
}
const viteBin = path.join(curr, 'bin', 'vite.js');
console.log('Resolved viteBin:', viteBin, 'exists:', fs.existsSync(viteBin));

const child = fork(viteBin, ['build'], {
  execArgv: ['--max-old-space-size=6144'],
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
