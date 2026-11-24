import type { LignePanier } from '@/lib/cart'

export const CLE_CLIENT_PROFORMA = 'bokhismany-proforma-client-v1'

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
