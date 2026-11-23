import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const suppressEconnReset: Plugin = {
  name: 'suppress-econnreset',
  configureServer(server) {
    server.httpServer?.on('clientError', (_err, socket) => {
      socket.destroy();
    });
    server.httpServer?.on('error', (err: any) => {
      if (err.code === 'ECONNRESET') return;
      console.warn('[server error]', err.message);
    });
    process.on('uncaughtException', (err: any) => {
      if (err?.code === 'ECONNRESET' || err?.message?.includes('ECONNRESET')) {
        return;
      }
      console.error('[uncaughtException]', err);
    });
  },
};

export default defineConfig({
  plugins: [react(), suppressEconnReset],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:4200',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.warn('[vite proxy error /api]:', err.message);
          });
        },
      },
      '/pascal-studio': {
        target: process.env.VITE_PASCAL_STUDIO_PROXY_TARGET || 'http://127.0.0.1:5174',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.warn('[vite proxy error /pascal-studio]:', err.message);
          });
        },
      },
    },
  },
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
  },
});
