import { expect, test } from '@playwright/test'
import { aller, attendreHydratation, numeroTelephoneTest } from './aide'

function identifiants() {
  const email = process.env.ADMIN_EMAIL
  const motDePasse = process.env.ADMIN_PASSWORD
  if (!email || !motDePasse) {
    throw new Error('Définissez ADMIN_EMAIL et ADMIN_PASSWORD dans le .env local pour les tests admin.')
  }
  return { email, motDePasse }
}

async function connecter(page: import('@playwright/test').Page) {
  const { email, motDePasse } = identifiants()
  await aller(page,'/admin/connexion')
  // Une session encore active redirige vers le tableau de bord : rien à remplir.
  if ((await page.getByLabel('Email').count()) === 0) return
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Mot de passe').fill(motDePasse)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Tableau de bord' })).toBeVisible()
}

async function creerReservation(page: import('@playwright/test').Page): Promise<string> {
  await aller(page,'/produits')
  await page.getByRole('button', { name: /^Ajouter .+ au panier$/ }).first().click()
  await page.getByRole('link', { name: /Panier,/ }).click()
  await page.getByLabel('Nom *').fill('Admin Test')
  await page.getByLabel('Téléphone *').fill(numeroTelephoneTest())
  await page.getByRole('button', { name: 'Réserver mon panier' }).click()
  const titre = page.getByRole('heading', { level: 1, name: /^Réservation [A-Z0-9]{6}$/ })
  await expect(titre).toBeVisible()
  return (await titre.innerText()).replace('Réservation ', '').trim()
}

test('/admin redirige vers la connexion sans session', async ({ page }) => {
  await aller(page,'/admin')
  await expect(page).toHaveURL(/\/admin\/connexion$/)
  await expect(page.getByRole('heading', { name: 'Connexion administration' })).toBeVisible()
})

test('un mauvais mot de passe affiche un message générique', async ({ page }) => {
  const { email } = identifiants()
  await aller(page,'/admin/connexion')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Mot de passe').fill('mot-de-passe-errone')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page.getByText('Email ou mot de passe incorrect.')).toBeVisible()
})

test('une réservation peut être retrouvée et marquée comme retirée', async ({ page }) => {
  const code = await creerReservation(page)
  await connecter(page)

  await page.getByRole('link', { name: 'Réservations', exact: true }).click()
  await page.getByLabel('Rechercher').fill(code)
  const ligne = page.locator('tbody tr').filter({ hasText: code })
  await expect(ligne).toHaveCount(1)
  await expect(ligne).toContainText('En attente')

  await ligne.getByRole('combobox').selectOption('retiree')
  await expect(ligne).toContainText('Retirée')
})

test('la déconnexion invalide la session côté serveur', async ({ page }) => {
  await connecter(page)
  await page.getByRole('button', { name: 'Se déconnecter' }).click()
  await expect(page).toHaveURL(/\/admin\/connexion$/)
  await expect(page.getByRole('heading', { name: 'Connexion administration' })).toBeVisible()
  await attendreHydratation(page)
  await aller(page,'/admin')
  await expect(page).toHaveURL(/\/admin\/connexion$/)
})

test('un membre d’équipe ajouté apparaît sur À propos puis peut être retiré', async ({ page }) => {
  const nom = `Membre Test ${Date.now()}`
  await connecter(page)
  await page.getByRole('link', { name: 'Équipe dirigeante' }).click()

  await page.getByLabel('Nom et prénom *').fill(nom)
  await page.getByLabel('Fonction *').fill('Fonction test')
  await page.getByRole('button', { name: 'Ajouter le membre' }).click()
  await expect(page.getByText('Membre ajouté.')).toBeVisible()

  try {
    await aller(page, '/a-propos')
    await expect(page.getByRole('heading', { name: nom })).toBeVisible()
    await expect(page.getByText('Fonction test')).toBeVisible()
  } finally {
    await connecter(page)
    await page.getByRole('link', { name: 'Équipe dirigeante' }).click()
    const ligne = page.locator('li').filter({ hasText: nom })
    await ligne.getByRole('button', { name: 'Supprimer' }).click()
    await expect(page.getByText('Membre retiré de l’équipe.')).toBeVisible()
  }

  await aller(page, '/a-propos')
  await expect(page.getByRole('heading', { name: nom })).toHaveCount(0)
  await expect(page.getByText(/TODO — nom, fonction et présentation/)).toBeVisible()
})
