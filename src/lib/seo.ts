import { EMAIL_CONTACT, MARQUE, RAISON_SOCIALE, RESEAUX_SOCIAUX } from '@/lib/entreprise'

export const TITRE_DEFAUT =
  `${RAISON_SOCIALE}, commerce général à Kinshasa et Brazzaville`

export const DESCRIPTION_DEFAUT =
  `${RAISON_SOCIALE} : riz, farine, semoule, sucre et huiles à Kinshasa et Brazzaville. Réservez en ligne, retirez en boutique.`

export const IMAGE_PARTAGE = '/images/og-couverture.png'

interface OptionsPage {
  titre: string
  description?: string
}

/** Toutes les pages portent le nom complet de l'entreprise dans leur métadonnée. */
export function metaPage({ titre, description = DESCRIPTION_DEFAUT }: OptionsPage) {
  const titreComplet = `${titre} | ${RAISON_SOCIALE}`

  return {
    meta: [
      { title: titreComplet },
      { name: 'description', content: description },
      { name: 'application-name', content: RAISON_SOCIALE },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: `${RAISON_SOCIALE} — ${MARQUE}` },
      { property: 'og:locale', content: 'fr_FR' },
      { property: 'og:title', content: titreComplet },
      { property: 'og:description', content: description },
      { property: 'og:image', content: IMAGE_PARTAGE },
      { property: 'og:image:secure_url', content: IMAGE_PARTAGE },
      { property: 'og:image:type', content: 'image/png' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: `${RAISON_SOCIALE} — ${MARQUE}` },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: RESEAUX_SOCIAUX[0]?.identifiant },
      { name: 'twitter:title', content: titreComplet },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: IMAGE_PARTAGE },
      { name: 'twitter:image:alt', content: `${RAISON_SOCIALE} — ${MARQUE}` },
      { name: 'theme-color', content: '#faf9f6' },
    ],
  }
}

/** Métadonnées du document racine, sans doublon avec le titre de la page active. */
export function metaRacine() {
  return {
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: TITRE_DEFAUT },
      { name: 'description', content: DESCRIPTION_DEFAUT },
      { name: 'application-name', content: RAISON_SOCIALE },
      { name: 'theme-color', content: '#faf9f6' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: `${RAISON_SOCIALE} — ${MARQUE}` },
      { property: 'og:locale', content: 'fr_FR' },
      { property: 'og:title', content: TITRE_DEFAUT },
      { property: 'og:description', content: DESCRIPTION_DEFAUT },
      { property: 'og:image', content: IMAGE_PARTAGE },
      { property: 'og:image:secure_url', content: IMAGE_PARTAGE },
      { property: 'og:image:type', content: 'image/png' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: `${RAISON_SOCIALE} — ${MARQUE}` },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:image', content: IMAGE_PARTAGE },
      { name: 'twitter:image:alt', content: `${RAISON_SOCIALE} — ${MARQUE}` },
    ],
  }
}

export { EMAIL_CONTACT }
