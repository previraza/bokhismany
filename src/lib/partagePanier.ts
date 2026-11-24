export interface LignePanierPartagee {
  slug: string
  quantite: number
}

function enBase64Url(texte: string): string {
  const octets = new TextEncoder().encode(texte)
  let binaire = ''
  for (const octet of octets) binaire += String.fromCharCode(octet)
  return btoa(binaire).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function depuisBase64Url(valeur: string): string {
  const normalisee = valeur.replace(/-/g, '+').replace(/_/g, '/')
  const complete = normalisee.padEnd(Math.ceil(normalisee.length / 4) * 4, '=')
  const binaire = atob(complete)
  const octets = Uint8Array.from(binaire, (caractere) => caractere.charCodeAt(0))
  return new TextDecoder().decode(octets)
}

/** Encode uniquement le slug et la quantité : aucun prix ni coordonnée dans le lien. */
export function encoderPanier(
  lignes: readonly LignePanierPartagee[],
): string {
  const charge = lignes
    .map((ligne) => `${ligne.slug}:${ligne.quantite}`)
    .join(',')
  return enBase64Url(charge)
}

export function decoderPanier(valeur: string | null | undefined): LignePanierPartagee[] | null {
  if (!valeur || valeur.length > 2000) return null
  try {
    const charge = depuisBase64Url(valeur)
    if (charge.length === 0) return []
    const lignes = charge.split(',').map((morceau) => {
      const [slug, quantiteBrute] = morceau.split(':')
      const quantite = Number(quantiteBrute)
      if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) return null
      if (!Number.isInteger(quantite) || quantite < 1 || quantite > 99) return null
      return { slug, quantite }
    })
    if (lignes.some((ligne) => ligne === null) || lignes.length > 30) return null
    return lignes as LignePanierPartagee[]
  } catch {
    return null
  }
}

export function lienPartagePanier(lignes: readonly LignePanierPartagee[]): string {
  const url = new URL('/panier', window.location.origin)
  url.searchParams.set('panier', encoderPanier(lignes))
  return url.toString()
}
