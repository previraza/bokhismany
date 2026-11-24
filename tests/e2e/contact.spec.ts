import { expect, test } from '@playwright/test'
import { aller } from './aide'

function identifiants() {
  const email = process.env.ADMIN_EMAIL
  const motDePasse = process.env.ADMIN_PASSWORD
  if (!email || !motDePasse) {
    throw new Error('Définissez ADMIN_EMAIL et ADMIN_PASSWORD dans le .env local pour ce test.')
  }
  return { email, motDePasse }
}

test('un message vide est refusé', async ({ page }) => {
  await aller(page,'/contact')
  await page.getByRole('button', { name: 'Envoyer le message' }).click()
  await expect(page.getByText('Indiquez votre nom.')).toBeVisible()
  await expect(page.getByText('Votre message doit contenir au moins 10 caractères.')).toBeVisible()
})

test('un message valide est enregistré et visible dans l’administration', async ({ page }) => {
  const nom = `Contact E2E ${Date.now()}`
  await aller(page,'/contact')
  await page.getByLabel('Nom *').fill(nom)
  await page.getByLabel('Email ou téléphone *').fill('contact-e2e@exemple.com')
  await page.getByLabel('Message *').fill('Bonjour, avez-vous du riz Lion en gros ?')
  await page.getByRole('button', { name: 'Envoyer le message' }).click()
  await expect(
    page.getByText('Merci, votre message a bien été envoyé. Nous vous répondrons rapidement.'),
  ).toBeVisible()

  const { email, motDePasse } = identifiants()
  await aller(page,'/admin/connexion')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Mot de passe').fill(motDePasse)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.getByRole('link', { name: 'Messages', exact: true }).click()
  const message = page.locator('li').filter({ hasText: nom })
  await expect(message).toBeVisible()
  await message.getByRole('button', { name: 'Marquer comme lu' }).click()
  await expect(message).toContainText('Lu')
})
