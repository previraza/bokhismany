import type { AppliedCoupon, LignePanier } from '@/lib/cart'

export const CLE_CLIENT_PROFORMA = 'bokhismany-proforma-client-v1'
export const CLE_DOCUMENTS_PROFORMA = 'bokhismany-proforma-documents-v1'

export interface ClientProforma {
  nom: string
  telephone: string
  societe: string
  email: string
}

export const CLIENT_PROFORMA_VIDE: ClientProforma = {
  nom: '',
  telephone: '',
  societe: '',
  email: '',
}

export interface DocumentProforma {
  reference: string
  date: Date
  client: ClientProforma
  lignes: LignePanier[]
  subtotalFc: number
  discountFc: number
  coupons: AppliedCoupon[]
  total: number
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/** Référence de document générée localement, sans numérotation comptable inventée. */
export function genererReference(date: Date = new Date()): string {
  const annee = date.getFullYear()
  const mois = String(date.getMonth() + 1).padStart(2, '0')
  const jour = String(date.getDate()).padStart(2, '0')
  const hasard = new Uint8Array(4)
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(hasard)
  } else {
    for (let i = 0; i < hasard.length; i++) {
      hasard[i] = Math.floor(Math.random() * 256)
    }
  }
  const suffixe = Array.from(hasard, (valeur) => ALPHABET[valeur % ALPHABET.length]).join('')
  return `PF-${annee}${mois}${jour}-${suffixe}`
}

export function formaterDateProforma(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeZone: 'Africa/Kinshasa',
  }).format(date)
}

/** Signature stable : même client, même sélection et mêmes coupons donnent le même proforma. */
export function signatureProforma(
  client: ClientProforma,
  lignes: readonly LignePanier[],
  coupons: readonly string[],
): string {
  const charge = JSON.stringify({
    client: {
      nom: client.nom.trim().toLocaleLowerCase('fr-FR'),
      telephone: client.telephone.trim(),
      societe: client.societe.trim().toLocaleLowerCase('fr-FR'),
      email: client.email.trim().toLocaleLowerCase('fr-FR'),
    },
    lignes: lignes
      .map(({ slug, quantite, prixFc }) => ({ slug, quantite, prixFc }))
      .sort((a, b) => a.slug.localeCompare(b.slug)),
    coupons: [...coupons].sort(),
  })

  let empreinte = 2166136261
  for (let index = 0; index < charge.length; index++) {
    empreinte ^= charge.charCodeAt(index)
    empreinte = Math.imul(empreinte, 16777619)
  }
  return (empreinte >>> 0).toString(36)
}

type DocumentStocke = Omit<DocumentProforma, 'date'> & { date: string }

/** Relit les proformas déjà générés sur cet appareil, sans dépendre d’un compte client. */
export function lireDocumentsProforma(): Record<string, DocumentProforma> {
  try {
    const brut = window.localStorage.getItem(CLE_DOCUMENTS_PROFORMA)
    if (!brut) return {}
    const parse: unknown = JSON.parse(brut)
    if (!parse || typeof parse !== 'object' || Array.isArray(parse)) return {}
    const documents: Record<string, DocumentProforma> = {}
    for (const [signature, valeur] of Object.entries(parse as Record<string, unknown>)) {
      if (!valeur || typeof valeur !== 'object') continue
      const document = valeur as DocumentStocke
      if (
        typeof document.reference !== 'string' ||
        typeof document.date !== 'string' ||
        !document.client ||
        !Array.isArray(document.lignes)
      ) {
        continue
      }
      documents[signature] = { ...document, date: new Date(document.date) }
    }
    return documents
  } catch {
    return {}
  }
}

/** Conserve au plus dix documents pour éviter une croissance sans limite du stockage local. */
export function ecrireDocumentProforma(signature: string, document: DocumentProforma): void {
  try {
    const documents = lireDocumentsProforma()
    documents[signature] = document
    const entrees = Object.entries(documents).slice(-10)
    const aStocker: Record<string, DocumentStocke> = {}
    for (const [cle, valeur] of entrees) {
      aStocker[cle] = { ...valeur, date: valeur.date.toISOString() }
    }
    window.localStorage.setItem(CLE_DOCUMENTS_PROFORMA, JSON.stringify(aStocker))
  } catch {
    // La génération reste possible même si le stockage local est indisponible.
  }
}
