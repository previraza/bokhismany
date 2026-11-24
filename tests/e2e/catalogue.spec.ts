import { expect, test } from '@playwright/test'
import { aller } from './aide'

const cartes = (page: import('@playwright/test').Page) =>
  page.locator('article:has(a[aria-label^="Voir la fiche"])')

test('le catalogue affiche tous les produits actifs', async ({ page }) => {
  await aller(page,'/produits')
  await expect(page.getByRole('heading', { level: 1, name: 'Nos produits' })).toBeVisible()
  await expect(cartes(page)).toHaveCount(27)
})

test('la carte ajoute au panier et « Voir plus » ouvre la fiche', async ({ page }) => {
  await aller(page, '/produits')
  await page.getByRole('button', { name: /^Ajouter .+ au panier$/ }).first().click()
  await expect(page.getByRole('link', { name: /Panier, 1 article/ })).toBeVisible()

  await page.getByRole('link', { name: /^Voir la fiche de / }).first().click()
  await expect(page).toHaveURL(/\/produits\/[^/]+$/)
})

test('le filtre par catégorie limite les produits affichés', async ({ page }) => {
  await aller(page,'/produits')
  await page.getByRole('button', { name: 'Huiles', exact: true }).click()
  await expect(cartes(page)).toHaveCount(5)
  await expect(cartes(page).first()).toContainText('Huiles')
})

test('la recherche retrouve les deux formats Lion', async ({ page }) => {
  await aller(page,'/produits')
  await page.getByLabel('Rechercher un produit').fill('Lion')
  await expect(cartes(page)).toHaveCount(2)
  await expect(cartes(page)).toContainText(['Lion', 'Lion'])
})

test('le tri par prix fonctionne dans les deux sens', async ({ page }) => {
  await aller(page,'/produits')
  await page.getByLabel('Trier par').selectOption('prix-asc')
  const premiersPrixAsc = await cartes(page).first().locator('p.text-lg').innerText()
  await page.getByLabel('Trier par').selectOption('prix-desc')
  const premiersPrixDesc = await cartes(page).first().locator('p.text-lg').innerText()
  expect(premiersPrixAsc).not.toBe(premiersPrixDesc)
})

test('un produit sans image utilise un visuel de remplacement', async ({ page }) => {
  await aller(page,'/produits')
  const visuel = cartes(page).first().locator('[role="img"]')
  await expect(visuel).toHaveAttribute('aria-label', /Visuel de remplacement/)
  await expect(visuel.locator('img')).toHaveCount(0)
})

test('une adresse inconnue affiche une page 404 stylée', async ({ page }) => {
  await aller(page,'/cette-page-nexiste-pas')
  await expect(page.getByRole('heading', { name: 'Cette page n’existe pas' })).toBeVisible()
})

test('une fiche inconnue affiche une page 404 stylée', async ({ page }) => {
  await aller(page,'/produits/ce-produit-nexiste-pas')
  await expect(page.getByRole('heading', { name: 'Cette page n’existe pas' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Voir les produits' })).toBeVisible()
})
