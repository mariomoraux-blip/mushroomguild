import { defineConfig, devices } from '@playwright/test';

// Pruebas de humo y capturas (CLAUDE.md). Las reglas y el store se prueban con Vitest.
// PW_CHROMIUM permite usar un Chromium ya instalado (p. ej. /opt/pw-browsers/chromium en la nube).
const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};
const executablePath = env.PW_CHROMIUM;
const phone = { ...devices['Pixel 7'], hasTouch: true, isMobile: true };

export default defineConfig({
  testDir: 'tests/smoke',
  outputDir: 'test-results',
  reporter: 'list',
  use: { baseURL: 'http://localhost:4173', ...(executablePath ? { launchOptions: { executablePath } } : {}) },
  // Servidor de desarrollo: habilita `?debugState=` para los escenarios que no se alcanzan rápido jugando.
  webServer: { command: 'npm run dev -- --port 4173 --strictPort', url: 'http://localhost:4173', reuseExistingServer: true },
  projects: [
    { name: 'vertical-390x844', use: { ...phone, viewport: { width: 390, height: 844 } }, metadata: { minTile: 64 } },
    { name: 'safari-390x664', use: { ...phone, viewport: { width: 390, height: 664 } }, metadata: { minTile: 56 } },
    { name: 'horizontal-844x390', use: { ...phone, viewport: { width: 844, height: 390 } }, metadata: { minTile: 44 } },
    { name: 'escritorio-1280x800', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } }, metadata: { minTile: 44 } },
  ],
});
