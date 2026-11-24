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

/** Human-readable label, including categories created at runtime by the admin. */
export function prettyCategoryLabel(slug: string): string {
  if (estCategorie(slug)) return LIBELLES_CATEGORIES[slug]
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function libelleCategorie(valeur: string): string {
  return prettyCategoryLabel(valeur)
}

export function slugifyCategory(label: string): string {
  const slug = label
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
  return slug || 'autres'
}

/** Illustration vectorielle locale associée à une catégorie. */
export function visuelCategorie(valeur: string): string {
  return `/images/categories/${estCategorie(valeur) ? valeur : 'autres'}.svg`
}
