// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': '/src/lib/components',
      '@css': '/src/lib/css',
      '@ui': '/src/lib/ui',
      '@context': '/src/lib/context',
      '@utils': '/src/lib/utils',
      '@routes': '/src/routes',
      '@assets': '/src/assets',
      '@api': '/src/api'
    }
  }
});
