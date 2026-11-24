import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'

// Les identifiants de test restent dans le .env local, jamais dans le dépôt.
config()

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: 'test-results',
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  // La base locale passe par un proxy WebSocket : certaines server functions peuvent dépasser 5 s.
  expect: { timeout: 15_000 },
  use: {
    baseURL: 'http://localhost:3000',
    locale: 'fr-FR',
    colorScheme: 'light',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'mobile-375',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 } },
    },
    {
      name: 'tablette-768',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'ordinateur-1440',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mouvement-reduit',
      use: { ...devices['Desktop Chrome'], reducedMotion: 'reduce' },
    },
  ],
})
