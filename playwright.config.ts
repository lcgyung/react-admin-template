import { defineConfig, devices } from '@playwright/test';

/**
 * E2E — 데모 모드 빌드를 preview 서버로 띄우고 검증한다.
 * MSW 목이 켜진 데모 빌드(`pnpm build:demo`, --mode demo / .env.demo)라 백엔드 없이 동작한다(ADR 0011).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm build:demo && pnpm preview --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
