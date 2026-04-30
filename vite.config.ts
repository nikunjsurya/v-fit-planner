import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    // Set DISABLE_HMR=true to disable hot reload (useful for IDE-driven edits).
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
