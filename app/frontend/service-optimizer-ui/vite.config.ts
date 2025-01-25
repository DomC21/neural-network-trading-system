import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 4173,
    host: '172.16.1.2',
    proxy: {
      '/api': {
        target: 'http://172.16.1.2:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 4173,
    host: '172.16.1.2',
    proxy: {
      '/api': {
        target: 'http://172.16.1.2:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
