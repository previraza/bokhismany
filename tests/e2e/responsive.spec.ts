import { expect, test } from '@playwright/test'
import { aller } from './aide'

const PAGES = ['/', '/produits', '/adresses', '/a-propos', '/contact', '/panier']

for (const chemin of PAGES) {
  test(`${chemin} n'a pas de défilement horizontal`, async ({ page }, testInfo) => {
    await aller(page,chemin)
    const largeurPage = await page.evaluate(() => document.documentElement.scrollWidth)
    const largeurZone = await page.evaluate(() => document.documentElement.clientWidth)
    expect(largeurPage).toBeLessThanOrEqual(largeurZone)

    const nom = chemin === '/' ? 'accueil' : chemin.slice(1).replaceAll('/', '-')
    await page.screenshot({
      path: `test-results/${nom}-${testInfo.project.name}.png`,
      fullPage: true,
    })
  })
}

test("le menu mobile s'ouvre et se ferme avec Échap", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await aller(page,'/')
  const bouton = page.getByRole('button', { name: 'Ouvrir le menu' })
  await bouton.click()
  await expect(page.getByRole('navigation', { name: 'Navigation mobile' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Ouvrir le menu' })).toBeVisible()
  await expect(page.locator('#menu-mobile')).toHaveAttribute('aria-hidden', 'true')
})

test("le menu mobile se ferme au clic sur un lien", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await aller(page,'/')
  await page.getByRole('button', { name: 'Ouvrir le menu' }).click()
  await page.getByRole('navigation', { name: 'Navigation mobile' }).getByRole('link', { name: 'Produits' }).click()
  await expect(page).toHaveURL(/\/produits$/)
  await expect(page.getByRole('navigation', { name: 'Navigation mobile' })).toBeHidden()
})

test('le mouvement réduit désactive les transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await aller(page,'/')
  const reduit = await page.evaluate(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  expect(reduit).toBe(true)
  const comportement = await page.evaluate(
    () => getComputedStyle(document.documentElement).scrollBehavior,
  )
  expect(comportement).toBe('auto')
})
