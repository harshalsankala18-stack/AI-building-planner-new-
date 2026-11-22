import { defineConfig } from 'vitest/config';
import path from 'node:path';

const threeBuildDir = path.resolve(__dirname, '../pascal-studio/node_modules/three/build');

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: [
      { find: /^three\/tsl$/, replacement: path.join(threeBuildDir, 'three.tsl.js') },
      { find: /^three\/webgpu$/, replacement: path.join(threeBuildDir, 'three.webgpu.js') },
      { find: /^three$/, replacement: path.join(threeBuildDir, 'three.module.js') },
    ],
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    server: {
      deps: {
        inline: [/@pascal-app/, /three/, /@react-three/],
      },
    },
  },
});
