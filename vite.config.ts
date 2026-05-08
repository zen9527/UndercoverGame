import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './src/shared'),
      '@server': path.resolve(__dirname, './src/server'),
      '@host': path.resolve(__dirname, './src/client/host'),
      '@player': path.resolve(__dirname, './src/client/player'),
    },
  },
  server: {
    port: parseInt(process.env.CLIENT_PORT ?? '5173', 10),
    host: true, // 允许局域网访问
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        host: path.resolve(__dirname, 'src/client/host/index.html'),
        player: path.resolve(__dirname, 'src/client/player/index.html'),
      },
    },
  },
});
