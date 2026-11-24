import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { aller, recharger } from './aide'

test('ajouter un produit met à jour le badge du panier', async ({ page }) => {
  await aller(page,'/produits')
  await page.getByRole('button', { name: /^Ajouter .+ au panier$/ }).first().click()
  await expect(page.getByRole('link', { name: /Panier, 1 article/ })).toBeVisible()
})

test('le panier survit à un rechargement et les quantités mettent à jour le total', async ({ page }) => {
  await aller(page,'/produits')
  await page.getByRole('button', { name: /^Ajouter .+ au panier$/ }).first().click()
  await recharger(page)
  await page.getByRole('link', { name: /Panier, 1 article/ }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Panier' })).toBeVisible()

  const totalAvant = await page.getByText('Total estimé').first().locator('..').innerText()
  await page.getByRole('button', { name: /Augmenter la quantité/ }).first().click()
  const totalApres = await page.getByText('Total estimé').first().locator('..').innerText()
  expect(totalApres).not.toBe(totalAvant)

  await expect(
    page.getByText('Montant estimé, à confirmer en boutique.', { exact: false }).first(),
  ).toBeVisible()
})

test('vider le panier remet le badge à zéro', async ({ page }) => {
  await aller(page,'/produits')
  await page.getByRole('button', { name: /^Ajouter .+ au panier$/ }).first().click()
  await page.getByRole('link', { name: /Panier, 1 article/ }).click()
  await page.getByRole('button', { name: 'Vider le panier' }).click()
  await expect(page.getByRole('link', { name: /Panier, 0 article/ })).toBeVisible()
  await expect(page.getByText('Votre panier est vide')).toBeVisible()
})

test('le panier s’exporte en proforma PDF avec la bannière officielle', async ({ page }) => {
  await aller(page, '/produits')
  await page.getByRole('button', { name: /^Ajouter .+ au panier$/ }).first().click()
  await page.getByRole('link', { name: /Panier, 1 article/ }).click()
  await page.getByRole('link', { name: 'Exporter la proforma' }).click()

  await expect(page.getByRole('heading', { level: 1, name: 'Proforma de votre panier' })).toBeVisible()
  await page.getByRole('button', { name: 'Générer la proforma' }).click()
  await expect(page.getByText('Indiquez votre nom.')).toBeVisible()

  await page.getByLabel('Nom *').fill('Client Proforma')
  await page.getByLabel('Téléphone *').fill('+243 812345678')
  await page.getByRole('button', { name: 'Générer la proforma' }).click()

  await expect(page.getByRole('heading', { name: 'Proforma', exact: true })).toBeVisible()
  const banniere = page.getByAltText('Bannière Bokhismany Trading SARL')
  await expect(banniere).toBeVisible()
  expect(
    await banniere.evaluate(
      (element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0,
    ),
  ).toBe(true)
  await expect(page.getByText('Montant estimé, à confirmer en boutique.')).toBeVisible()
  await expect(page.getByText(/Aucun paiement en ligne/)).toBeVisible()

  const [telechargement] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Télécharger le PDF' }).click(),
  ])
  expect(telechargement.suggestedFilename()).toMatch(
    /^proforma-PF-\d{8}-[A-HJ-NP-Z2-9]{4}\.pdf$/,
  )
  const chemin = await telechargement.path()
  expect(chemin).not.toBeNull()
  const contenu = await readFile(chemin!)
  expect(contenu.subarray(0, 4).toString()).toBe('%PDF')
  expect(contenu.length).toBeGreaterThan(10_000)
})
