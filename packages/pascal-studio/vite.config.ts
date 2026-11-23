import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  base: '/pascal-studio/',
  define: {
    'process.env': {},
  },
  resolve: {
    dedupe: ['three', 'react', 'react-dom', '@react-three/fiber', '@react-three/drei'],
    alias: {
      '@react-three/fiber': path.resolve(__dirname, 'node_modules/@react-three/fiber/dist/react-three-fiber.esm.js'),
      'use-sync-external-store/shim/with-selector.js': path.resolve(__dirname, 'src/shims/with-selector.ts'),
      'use-sync-external-store/shim/with-selector': path.resolve(__dirname, 'src/shims/with-selector.ts'),
      'use-sync-external-store/with-selector': path.resolve(__dirname, 'src/shims/with-selector.ts'),
      'scheduler/index.js': path.resolve(__dirname, 'src/shims/scheduler.ts'),
      'scheduler': path.resolve(__dirname, 'src/shims/scheduler.ts'),
      'stats.js': path.resolve(__dirname, 'src/shims/stats.ts'),
      'next/image': path.resolve(__dirname, 'src/shims/next-image.tsx'),
      'next/dist/shared/lib/image-config': path.resolve(__dirname, 'src/shims/next-image.tsx'),
      'next/dist/shared/lib/image-config-context.shared-runtime': path.resolve(__dirname, 'src/shims/next-image.tsx'),
      'next/dist/shared/lib/match-remote-pattern': path.resolve(__dirname, 'src/shims/next-image.tsx'),
      'blob-stream': path.resolve(__dirname, 'src/shims/blob-stream.ts'),
      'util': path.resolve(__dirname, 'src/shims/util.ts'),
      'util/': path.resolve(__dirname, 'src/shims/util.ts'),
      'stream': path.resolve(__dirname, 'src/shims/stream.ts'),
      'stream/': path.resolve(__dirname, 'src/shims/stream.ts'),
    },
  },
  plugins: [
    tailwindcss(),
    react(),
    {
      name: 'redirect-root-to-pascal-studio',
      configureServer(server) {
        const transparentWebp = Buffer.from(
          'UklGRkAAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAIAAAAAAFZQOCAYAAAAMAEAnQEqAQABAAFAJiWkAANwAP79NvgA',
          'base64'
        );
        server.middlewares.use((req, res, next) => {
          if (req.url && (req.url.startsWith('/icons/') || req.url.startsWith('/pascal-studio/icons/'))) {
            res.setHeader('Content-Type', 'image/webp');
            res.end(transparentWebp);
            return;
          }
          if (req.url === '/' || req.url === '') {
            res.writeHead(302, { Location: '/pascal-studio/' });
            res.end();
            return;
          }
          next();
        });
      },
    },
  ],
  server: {
    port: 5174,
    host: true,
  },
  optimizeDeps: {
    exclude: ['@react-three/fiber'],
    include: [
      'howler',
      'three',
      '@pascal-app/core',
      '@pascal-app/nodes',
      '@pascal-app/viewer',
    ],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 5000,
    rollupOptions: {},
  },
});
