import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: ['**/*.spec.ts'],
  testIgnore: [
    '**/tests/unit/**',
    '**/*.test.ts',
  ],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  // Server-side PDF rendering (Puppeteer/Gotenberg/Browserless) is slow, and
  // some tests perform several sequential generations, so give them headroom.
  timeout: 180_000,
  expect: { timeout: 15_000 },
  use: {
    channel: 'chrome',
    headless: true,
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Test against a production build, not the dev server: Nitro lazily
    // compiles routes on first request in dev, so the first /api/pdf hit can
    // take tens of seconds and time out. A prebuilt server responds promptly
    // and deterministically.
    command: 'npm run build && npm run preview',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    cwd: './playground',
    timeout: 180_000,
  },
})
