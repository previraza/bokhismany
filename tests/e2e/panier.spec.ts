import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { aller, numeroTelephoneTest, recharger } from './aide'

test('ajouter un produit met à jour le badge du panier', async ({ page }) => {
  await aller(page,'/produits')
  await page.getByRole('button', { name: /^Ajouter .+ au panier$/ }).first().click()
  await expect(page.getByRole('link', { name: /Panier, 1 article/ })).toBeVisible()
})

test('la barre de réservation suit le client sur toutes les pages', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) >= 1024, 'Barre réservée aux petits écrans')
  await aller(page, '/produits')
  await page.getByRole('button', { name: /^Ajouter .+ au panier$/ }).first().click()

  await aller(page, '/contact')
  const reserver = page.getByRole('link', { name: 'Réserver', exact: true })
  await expect(reserver).toBeVisible()
  await reserver.click()
  await expect(page).toHaveURL(/\/panier$/)

  await reserver.click()
  await expect(page.locator('#reservation-nom')).toBeFocused()
})

test('un panier partagé se recharge chez la personne qui reçoit le lien', async ({ page, browser }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
  })
  await aller(page, '/produits')
  await page.getByRole('button', { name: /^Ajouter .+ au panier$/ }).first().click()
  await page.getByRole('link', { name: /Panier, 1 article/ }).click()
  await page.getByRole('button', { name: 'Partager ce panier' }).click()
  await expect(page.getByText('Lien copié.')).toBeVisible()

  const lien = await page.evaluate(() => navigator.clipboard.readText())
  expect(lien).toContain('/panier?panier=')

  // Un contexte distinct simule un autre appareil : aucun panier local préexistant.
  const contexteDestinataire = await browser.newContext({ locale: 'fr-FR' })
  const destinataire = await contexteDestinataire.newPage()
  try {
    await destinataire.goto(lien)
    await expect(destinataire.getByRole('link', { name: /Panier, 1 article/ })).toBeVisible()
  } finally {
    await contexteDestinataire.close()
  }
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
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
  })
  await aller(page, '/produits')
  await page.getByRole('button', { name: /^Ajouter .+ au panier$/ }).first().click()
  await page.getByRole('link', { name: /Panier, 1 article/ }).click()
  await page.getByRole('link', { name: 'Exporter la proforma' }).click()

  await expect(page.getByRole('heading', { level: 1, name: 'Proforma de votre panier' })).toBeVisible()
  await page.getByRole('button', { name: 'Générer la proforma' }).click()
  await expect(page.getByText('Indiquez votre nom.')).toBeVisible()

  await page.getByLabel('Nom *').fill('Client Proforma')
  await page.getByLabel('Téléphone *').fill(numeroTelephoneTest())
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

  const referenceInitiale = await page.getByText(/^Réf\. PF-/).innerText()
  await page.getByRole('button', { name: 'Générer la proforma' }).click()
  await expect(
    page.getByText('Un proforma identique a déjà été généré. Nous l’avons rechargé.'),
  ).toBeVisible()
  expect(await page.getByText(/^Réf\. PF-/).innerText()).toBe(referenceInitiale)

  await page.getByRole('button', { name: 'Générer un nouveau proforma' }).click()
  await expect(page.getByText('Un nouveau proforma a été généré.')).toBeVisible()
  expect(await page.getByText(/^Réf\. PF-/).innerText()).not.toBe(referenceInitiale)

  const largeurPage = await page.evaluate(() => document.documentElement.scrollWidth)
  const largeurZone = await page.evaluate(() => document.documentElement.clientWidth)
  expect(largeurPage).toBeLessThanOrEqual(largeurZone)
  const surface = page.locator('.proforma-surface')
  await expect(surface).toBeVisible()
  if ((page.viewportSize()?.width ?? 0) < 1024) {
    expect(
      await surface.evaluate(
        (element) => element.scrollWidth > element.clientWidth && getComputedStyle(element).overflowX,
      ),
    ).toBeTruthy()
  }

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

  const [documentPartage] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Partager la proforma' }).click(),
  ])
  expect(documentPartage.suggestedFilename()).toMatch(/^proforma-PF-\d{8}-[A-HJ-NP-Z2-9]{4}\.pdf$/)

  await page.getByRole('button', { name: 'Envoyer le bon de commande' }).click()
  const lienBon = page.getByRole('link', { name: 'Suivre ce bon de commande' })
  await expect(lienBon).toBeVisible()
  await lienBon.click()
  await page.getByRole('button', { name: 'Partager ce bon' }).click()
  await expect(page.getByText('Lien copié.')).toBeVisible()
  const lienPartageBon = await page.evaluate(() => navigator.clipboard.readText())
  expect(lienPartageBon).toContain('/bon/')
})
