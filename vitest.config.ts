/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// Separate config so the main vite.config.ts doesn't have to pull in the
// PWA plugin during test runs (it slows down test boot and isn't relevant
// for component tests). RTL component tests need jsdom + the React
// plugin; the vitest CLI auto-picks up `src/**/*.test.{ts,tsx}` and
// `e2e/` is excluded so Playwright doesn't fire here.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e/**'],
    globals: false,
  },
});
