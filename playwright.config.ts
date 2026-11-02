import { defineConfig, devices } from '@playwright/test';

// Solo capturas de humo (CLAUDE.md). Las reglas se prueban con Vitest.
// PW_CHROMIUM permite usar un Chromium ya instalado (p. ej. /opt/pw-browsers/chromium en la nube).
const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};
const executablePath = env.PW_CHROMIUM;
export default defineConfig({
  testDir: 'tests/smoke',
  outputDir: 'test-results',
  reporter: 'list',
  use: { baseURL: 'http://localhost:4173', ...(executablePath ? { launchOptions: { executablePath } } : {}) },
  webServer: { command: 'npm run build && npm run preview -- --port 4173 --strictPort', url: 'http://localhost:4173', reuseExistingServer: true },
  projects: [
    { name: 'phone-portrait', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
    { name: 'phone-landscape', use: { ...devices['Pixel 7'], viewport: { width: 844, height: 390 } } },
  ],
});
