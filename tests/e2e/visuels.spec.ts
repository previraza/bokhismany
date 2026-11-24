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

  const logo = page.locator('header img[src*="bokhismany-logo-officiel.png"]').first()
  await expect(logo).toBeVisible()
  expect(
    await logo.evaluate(
      (element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0,
    ),
  ).toBe(true)

  const daayakeEntete = page.locator('header img[src*="daayake-food.png"]')
  await expect(daayakeEntete).toHaveCount(1)
  if ((page.viewportSize()?.width ?? 0) >= 768) {
    await expect(daayakeEntete).toBeVisible()
    expect(
      await daayakeEntete.evaluate(
        (element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0,
      ),
    ).toBe(true)
  }

  await expect(page.locator('header img[src*="banniere.png"]')).toHaveCount(0)

  await aller(page, '/a-propos')
  const daayake = page.locator('main img[src*="daayake-food.png"]').first()
  await expect(daayake).toBeVisible()
  expect(
    await daayake.evaluate(
      (element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0,
    ),
  ).toBe(true)
})

test('l’accueil utilise des photographies locales sans répéter la bannière', async ({ page }) => {
  await aller(page, '/')

  for (const nom of [
    'marche-grains.jpg',
    'etale-cereales.jpg',
    'chargement-sacs.jpg',
    'sacs-grains.jpg',
  ]) {
    const image = page.locator(`main img[src*="${nom}"]`).first()
    await expect(image).toBeVisible()
    await image.scrollIntoViewIfNeeded()
    await expect
      .poll(() =>
        image.evaluate(
          (element) =>
            element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0,
        ),
      )
      .toBe(true)
  }

  await expect(page.locator('main img[src*="banniere.png"]')).toHaveCount(0)
})

test('le hero occupe la hauteur visible et assemble une vitrine', async ({ page }) => {
  await aller(page, '/')

  const hero = page.locator('main > section').first()
  const hauteur = (await hero.boundingBox())?.height ?? 0
  expect(hauteur).toBeGreaterThanOrEqual((page.viewportSize()?.height ?? 0) - 100)

  await expect(
    hero.getByRole('heading', { level: 1, name: 'Bokhismany Trading SARL' }),
  ).toBeVisible()
  await expect(hero.locator('img')).toHaveCount(4)
  await expect(
    hero.locator('img[src*="bokhismany-logo-officiel.png"]'),
  ).toBeVisible()

  const marque = hero
    .getByRole('heading', { level: 1 })
    .getByText('Bokhismany', { exact: true })
  expect(await marque.evaluate((element) => getComputedStyle(element).color)).toBe(
    'rgb(32, 32, 64)',
  )
  expect(
    await marque.evaluate((element) => getComputedStyle(element).backgroundColor),
  ).toBe('rgb(250, 249, 246)')

  await expect(hero.getByRole('link', { name: /Découvrir les produits/ })).toBeVisible()
  await expect(hero.getByRole('link', { name: /Composer un panier/ })).toBeVisible()
})

test('l’accueil détaille l’entreprise, ses activités et sa portée', async ({ page }) => {
  await aller(page, '/')

  for (const titre of [
    'Une maison de commerce ancrée à Kinshasa',
    'Ce que nous faisons, au quotidien',
    'Deux villes, trois points de vente',
    'Acheminement entre Brazzaville et la RDC',
    'Trois points de vente pour vous accueillir',
  ]) {
    await expect(page.getByRole('heading', { name: titre })).toBeVisible()
  }
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
