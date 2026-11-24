import type { Page } from '@playwright/test'

/** Attend que React ait pris le contrôle de la page rendue côté serveur. */
export async function attendreHydratation(page: Page) {
  await page.waitForFunction(() => document.documentElement.dataset.hydrate === 'true')
}

export async function aller(page: Page, chemin: string) {
  await page.goto(chemin)
  await attendreHydratation(page)
}

export async function recharger(page: Page) {
  await page.reload()
  await attendreHydratation(page)
}

/** Numéro unique par scénario pour ne pas saturer la limitation anti-abus. */
export function numeroTelephoneTest() {
  return `+243 8${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 10)}`
}
