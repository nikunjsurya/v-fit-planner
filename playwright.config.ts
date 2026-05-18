import { defineConfig, devices } from '@playwright/test';

// Single-browser config — chromium-only to keep the install footprint
// small. The webServer block auto-starts a vite preview on 4173 against
// the production build; we use `preview` over `dev` so the test exercises
// the same bundle that ships to Vercel.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // shared localStorage means tests serialize
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port=4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
