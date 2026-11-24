import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { aller } from './aide'

test('les métadonnées portent le nom complet et une image de partage', async ({ page }) => {
  await aller(page, '/')

  await expect(page).toHaveTitle(/Bokhismany Trading SARL/)

  const meta = await page.evaluate(() => {
    const contenu = (selecteur: string) =>
      document.querySelector<HTMLMetaElement>(selecteur)?.content ?? ''
    return {
      siteName: contenu('meta[property="og:site_name"]'),
      image: contenu('meta[property="og:image"]'),
      imageAlt: contenu('meta[property="og:image:alt"]'),
      largeur: contenu('meta[property="og:image:width"]'),
      hauteur: contenu('meta[property="og:image:height"]'),
      titre: contenu('meta[property="og:title"]'),
      favicon: document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.href ?? '',
    }
  })

  expect(meta.siteName).toContain('Bokhismany Trading SARL')
  expect(meta.image).toContain('/images/og-couverture.png')
  expect(meta.imageAlt).toContain('Bokhismany Trading SARL')
  expect(meta.largeur).toBe('1200')
  expect(meta.hauteur).toBe('630')
  expect(meta.titre).toContain('Bokhismany Trading SARL')
  expect(meta.favicon).toContain('/images/marque/favicon.png')

  const reponse = await page.request.get('/images/og-couverture.png')
  expect(reponse.ok()).toBe(true)
  expect(reponse.headers()['content-type']).toContain('image/png')
})

test('les visuels officiels sont chargés sur les pages publiques', async ({ page }) => {
  await aller(page, '/')

  const logo = page.locator('header img[src*="bokhismany-logo"]').first()
  await expect(logo).toBeVisible()
  expect(
    await logo.evaluate(
      (element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0,
    ),
  ).toBe(true)

  await aller(page, '/a-propos')
  const daayake = page.locator('img[src*="daayake-food.png"]').first()
  await expect(daayake).toBeVisible()
  expect(
    await daayake.evaluate(
      (element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0,
    ),
  ).toBe(true)
})

test('une catégorie de l’accueil ouvre le catalogue préfiltré', async ({ page }) => {
  await aller(page, '/')
  await page.locator('a[href*="/produits?categorie=riz"]').first().click()

  await expect(page).toHaveURL(/categorie=riz/)
  await expect(page.getByRole('button', { name: 'Riz', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  const nombre = await page.locator('article').count()
  expect(nombre).toBeGreaterThan(0)
})

test('la page À propos réserve un emplacement à l’équipe tant qu’elle est vide', async ({ page }) => {
  await aller(page, '/a-propos')

  await expect(page.getByRole('heading', { name: 'Équipe dirigeante' })).toBeVisible()
  await expect(page.getByText(/TODO — nom, fonction et présentation/)).toBeVisible()
})
