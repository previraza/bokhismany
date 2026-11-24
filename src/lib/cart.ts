export interface LignePanier {
  slug: string
  nom: string
  categorie: string
  format: string | null
  prixFc: number
  quantite: number
}

export const CLE_PANIER = 'bokhismany-panier-v1'

export function nombreArticles(lignes: readonly LignePanier[]): number {
  return lignes.reduce((total, ligne) => total + ligne.quantite, 0)
}

export function totalPanier(lignes: readonly LignePanier[]): number {
  return lignes.reduce((total, ligne) => total + ligne.prixFc * ligne.quantite, 0)
}

export function estLignePanier(valeur: unknown): valeur is LignePanier {
  if (typeof valeur !== 'object' || valeur === null) return false
  const ligne = valeur as Partial<LignePanier>
  return (
    typeof ligne.slug === 'string' &&
    typeof ligne.nom === 'string' &&
    typeof ligne.prixFc === 'number' &&
    Number.isInteger(ligne.prixFc) &&
    ligne.prixFc > 0 &&
    typeof ligne.quantite === 'number' &&
    Number.isInteger(ligne.quantite) &&
    ligne.quantite > 0
  )
}
