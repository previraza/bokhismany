export const CATEGORIES = [
  'huiles',
  'riz',
  'semoules',
  'farines',
  'sucre',
  'autres',
] as const

export type Categorie = (typeof CATEGORIES)[number]

export const LIBELLES_CATEGORIES: Record<Categorie, string> = {
  huiles: 'Huiles',
  riz: 'Riz',
  semoules: 'Semoules',
  farines: 'Farines',
  sucre: 'Sucre',
  autres: 'Autres produits',
}

export function estCategorie(valeur: string): valeur is Categorie {
  return (CATEGORIES as readonly string[]).includes(valeur)
}

export function libelleCategorie(valeur: string): string {
  return estCategorie(valeur) ? LIBELLES_CATEGORIES[valeur] : 'Autres produits'
}

/** Illustration vectorielle locale associée à une catégorie. */
export function visuelCategorie(valeur: string): string {
  return `/images/categories/${estCategorie(valeur) ? valeur : 'autres'}.svg`
}
