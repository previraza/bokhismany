import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { aller, numeroTelephoneTest } from './aide'

async function composerPanier(page: import('@playwright/test').Page) {
  await aller(page,'/produits')
  await page.getByRole('button', { name: /^Ajouter .+ au panier$/ }).first().click()
  await page.getByRole('link', { name: /Panier,/ }).click()
}

test('les coordonnées sont obligatoires et le téléphone est validé', async ({ page }) => {
  await composerPanier(page)
  await page.getByRole('button', { name: 'Réserver mon panier' }).click()
  await expect(page.getByText('Indiquez votre nom (au moins 2 caractères).')).toBeVisible()
  await expect(page.getByText('Saisissez un numéro de téléphone valide.').first()).toBeVisible()

  await page.getByLabel('Nom *').fill('Client Test')
  await page.getByLabel('Téléphone *').fill('abcdefgh')
  await page.getByRole('button', { name: 'Réserver mon panier' }).click()
  await expect(page.getByText(/Utilisez uniquement des chiffres/)).toBeVisible()
})

test('une réservation valide crée un code sans caractère ambigu', async ({ page }) => {
  await composerPanier(page)
  await page.getByLabel('Nom *').fill('Client Test')
  await page.getByLabel('Téléphone *').fill(numeroTelephoneTest())
  await page.getByRole('button', { name: 'Réserver mon panier' }).click()

  await expect(page).toHaveURL(/\/reservation\/[A-Z0-9]{6}$/)
  const titre = page.getByRole('heading', { level: 1, name: /^Réservation [A-Z0-9]{6}$/ })
  await expect(titre).toBeVisible()
  const code = (await titre.innerText()).replace('Réservation ', '').trim()
  expect(code).toMatch(/^[A-HJ-NP-Z2-9]{6}$/)
  expect(code).not.toMatch(/[0O1I]/)

  await expect(page.getByText('En attente')).toBeVisible()
  await expect(page.getByText(/Ce code est valable 24 heures/)).toBeVisible()
  await expect(page.getByText('Montant estimé, à confirmer en boutique.').first()).toBeVisible()
})

test('un code inconnu affiche une page dédiée', async ({ page }) => {
  await aller(page,'/reservation/ZZZZZZ')
  await expect(page.getByRole('heading', { name: 'Réservation introuvable' })).toBeVisible()
})

test('la confirmation de réservation se télécharge en PDF', async ({ page }) => {
  await composerPanier(page)
  await page.getByLabel('Nom *').fill('Client PDF')
  await page.getByLabel('Téléphone *').fill(numeroTelephoneTest())
  await page.getByRole('button', { name: 'Réserver mon panier' }).click()

  const titre = page.getByRole('heading', { level: 1, name: /^Réservation [A-Z0-9]{6}$/ })
  await expect(titre).toBeVisible()
  const code = (await titre.innerText()).replace('Réservation ', '').trim()

  const [telechargement] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Télécharger la confirmation PDF' }).click(),
  ])
  expect(telechargement.suggestedFilename()).toBe(`reservation-${code}.pdf`)
  const chemin = await telechargement.path()
  expect(chemin).not.toBeNull()
  const contenu = await readFile(chemin!)
  expect(contenu.subarray(0, 4).toString()).toBe('%PDF')
})
