import { expect, test } from '@playwright/test'

test('le socle s affiche sans défilement horizontal', async ({ page }, testInfo) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { level: 1, name: 'Bokhismany Trading SARL' }),
  ).toBeVisible()

  const largeurPage = await page.evaluate(
    () => document.documentElement.scrollWidth,
  )
  const largeurZone = await page.evaluate(
    () => document.documentElement.clientWidth,
  )
  expect(largeurPage).toBeLessThanOrEqual(largeurZone)

  const fond = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  )
  expect(fond).toBe('rgb(250, 249, 246)')

  const familleTitre = await page.evaluate(() =>
    getComputedStyle(document.querySelector('h1')!).fontFamily.includes(
      'Playfair Display',
    ),
  )
  expect(familleTitre).toBe(true)

  await page.screenshot({
    path: `test-results/socle-${testInfo.project.name}.png`,
    fullPage: true,
  })
})
