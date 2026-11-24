export interface FichierPartage {
  blob: Blob
  nom: string
}

export interface DonneesPartage {
  titre: string
  texte: string
  url?: string | (() => string)
  fichier?: () => Promise<FichierPartage>
}

type ChargePartage = ShareData & { files?: File[] }
type NavigateurPartage = Navigator & {
  canShare?: (donnees: ChargePartage) => boolean
  share?: (donnees: ChargePartage) => Promise<void>
}

export type ResultatPartage = 'partage' | 'copie' | 'telechargement' | 'annule'

const MESSAGES: Record<ResultatPartage, string> = {
  partage: 'Partage envoyé.',
  copie: 'Lien copié.',
  telechargement: 'Document téléchargé.',
  annule: 'Partage annulé.',
}

export function messagePartage(resultat: ResultatPartage): string {
  return MESSAGES[resultat]
}

async function copierLien(lien: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(lien)
      return true
    }
  } catch {
    // Le repli ci-dessous couvre les navigateurs sans autorisation clipboard.
  }

  try {
    const champ = document.createElement('textarea')
    champ.value = lien
    champ.setAttribute('readonly', '')
    champ.style.position = 'fixed'
    champ.style.opacity = '0'
    document.body.appendChild(champ)
    champ.select()
    const copie = document.execCommand('copy')
    champ.remove()
    return copie
  } catch {
    return false
  }
}

function telechargerFichier(fichier: File): void {
  const url = URL.createObjectURL(fichier)
  const lien = document.createElement('a')
  lien.href = url
  lien.download = fichier.name
  document.body.appendChild(lien)
  lien.click()
  lien.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Partage natif quand il est disponible, avec copie du lien ou téléchargement en repli. */
export async function partager(donnees: DonneesPartage): Promise<ResultatPartage> {
  const navigateur = navigator as NavigateurPartage
  const url = typeof donnees.url === 'function' ? donnees.url() : donnees.url

  let fichier: File | undefined
  if (donnees.fichier) {
    const { blob, nom } = await donnees.fichier()
    fichier = new File([blob], nom, { type: blob.type || 'application/pdf' })
  }

  const charge: ChargePartage = { title: donnees.titre, text: donnees.texte }
  if (url) charge.url = url
  if (fichier && navigateur.canShare?.({ files: [fichier] })) charge.files = [fichier]

  if (navigateur.share && (!charge.files || navigateur.canShare?.(charge))) {
    try {
      await navigateur.share(charge)
      return 'partage'
    } catch (erreur) {
      if (erreur instanceof DOMException && erreur.name === 'AbortError') return 'annule'
    }
  }

  if (url && (await copierLien(url))) return 'copie'
  if (fichier) {
    telechargerFichier(fichier)
    return 'telechargement'
  }
  return 'copie'
}
