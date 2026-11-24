import { jsPDF } from 'jspdf'
import { EMAIL_CONTACT, MARQUE, POINTS_DE_VENTE, RAISON_SOCIALE, SIEGE_SOCIAL } from '@/lib/entreprise'
import type { DocumentProforma } from '@/lib/proforma'
import { formaterDateProforma } from '@/lib/proforma'
import { MENTION_ESTIMATION } from '@/lib/format'

const MARINE: [number, number, number] = [0, 21, 62]
const OR: [number, number, number] = [234, 178, 68]
const ENCRE_DOCE: [number, number, number] = [95, 102, 114]
const LIGNE: [number, number, number] = [205, 200, 190]
const CREME: [number, number, number] = [245, 237, 226]
const ROUGE: [number, number, number] = [121, 36, 25]

const LARGEUR = 210
const MARGE = 16
const LARGEUR_UTILE = LARGEUR - MARGE * 2

async function chargerImage(url: string): Promise<string> {
  const reponse = await fetch(url)
  if (!reponse.ok) throw new Error(`Visuel indisponible : ${url}`)
  const blob = await reponse.blob()
  return new Promise((resoudre, rejeter) => {
    const lecteur = new FileReader()
    lecteur.onload = () => resoudre(String(lecteur.result))
    lecteur.onerror = () => rejeter(new Error('Lecture du visuel impossible.'))
    lecteur.readAsDataURL(blob)
  })
}

function prixPdf(montant: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(montant).replace(/[\u202f\u00a0]/g, ' ')} Fc`
}

function entete(document: jsPDF, banniere: string): void {
  document.addImage(banniere, 'PNG', 0, 0, LARGEUR, 31.4)
  document.setDrawColor(...OR)
  document.setLineWidth(0.6)
  document.line(0, 31.4, LARGEUR, 31.4)
}

function piedDePage(document: jsPDF): void {
  const hauteur = document.internal.pageSize.getHeight()
  document.setDrawColor(...LIGNE)
  document.setLineWidth(0.3)
  document.line(MARGE, hauteur - 20, LARGEUR - MARGE, hauteur - 20)
  document.setFont('helvetica', 'normal')
  document.setFontSize(8)
  document.setTextColor(...ENCRE_DOCE)
  document.text(`${RAISON_SOCIALE} · ${MARQUE}`, MARGE, hauteur - 14)
  document.text(EMAIL_CONTACT, MARGE, hauteur - 10)
  document.text(`Page ${document.getCurrentPageInfo().pageNumber}`, LARGEUR - MARGE, hauteur - 10, {
    align: 'right',
  })
}

function bloc(document: jsPDF, titre: string, lignes: string[], x: number, y: number, largeur: number): void {
  document.setFont('helvetica', 'bold')
  document.setFontSize(8)
  document.setTextColor(...OR)
  document.text(titre.toUpperCase(), x, y)
  document.setFont('helvetica', 'normal')
  document.setFontSize(9)
  document.setTextColor(...MARINE)
  document.text(document.splitTextToSize(lignes.filter(Boolean).join('\n'), largeur), x, y + 6)
}

function ligneTableau(
  document: jsPDF,
  colonnes: { texte: string; x: number; largeur: number; gras?: boolean }[],
  y: number,
  fond?: [number, number, number],
): void {
  if (fond) {
    document.setFillColor(...fond)
    document.rect(MARGE, y - 5, LARGEUR_UTILE, 9, 'F')
  }
  document.setFont('helvetica', colonnes.some((colonne) => colonne.gras) ? 'bold' : 'normal')
  document.setFontSize(8.5)
  for (const colonne of colonnes) {
    document.setTextColor(...MARINE)
    const morceaux = document.splitTextToSize(colonne.texte, colonne.largeur - 2)
    document.text(morceaux, colonne.x, y, { maxWidth: colonne.largeur - 2 })
  }
  document.setDrawColor(...LIGNE)
  document.setLineWidth(0.2)
  document.line(MARGE, y + 5, LARGEUR - MARGE, y + 5)
}

/** Document de proforma : la bannière officielle sert d'en-tête. */
export async function genererPdfProforma(donnees: DocumentProforma): Promise<void> {
  const banniere = await chargerImage('/images/marque/banniere.png')
  const document = new jsPDF({ unit: 'mm', format: 'a4' })
  entete(document, banniere)

  document.setFont('helvetica', 'bold')
  document.setFontSize(20)
  document.setTextColor(...MARINE)
  document.text('PROFORMA', MARGE, 46)
  document.setFont('helvetica', 'normal')
  document.setFontSize(9)
  document.setTextColor(...ENCRE_DOCE)
  document.text(`Référence : ${donnees.reference}`, LARGEUR - MARGE, 42, { align: 'right' })
  document.text(`Émise le ${formaterDateProforma(donnees.date)}`, LARGEUR - MARGE, 47, {
    align: 'right',
  })

  bloc(
    document,
    'Fournisseur',
    [RAISON_SOCIALE, SIEGE_SOCIAL, EMAIL_CONTACT, POINTS_DE_VENTE[0]?.telephone ?? ''],
    MARGE,
    62,
    80,
  )
  bloc(
    document,
    'Client',
    [
      donnees.client.nom,
      donnees.client.societe,
      donnees.client.telephone,
      donnees.client.email,
    ],
    108,
    62,
    LARGEUR - MARGE - 108,
  )

  let y = 96
  document.setFillColor(...MARINE)
  document.rect(MARGE, y - 6, LARGEUR_UTILE, 10, 'F')
  document.setDrawColor(...LIGNE)
  document.setLineWidth(0.2)
  document.line(MARGE, y + 5, LARGEUR - MARGE, y + 5)
  document.setTextColor(...CREME)
  document.setFont('helvetica', 'bold')
  document.setFontSize(8.5)
  document.text('Produit', MARGE + 2, y)
  document.text('Format', 88, y)
  document.text('Prix unitaire', 115, y)
  document.text('Qté', 142, y)
  document.text('Sous-total', 156, y)
  y += 10

  for (const ligne of donnees.lignes) {
    if (y > 245) {
      piedDePage(document)
      document.addPage()
      y = 24
      entete(document, banniere)
    }
    ligneTableau(
      document,
      [
        { texte: ligne.nom, x: MARGE + 2, largeur: 70 },
        { texte: ligne.format ?? '—', x: 88, largeur: 26 },
        { texte: prixPdf(ligne.prixFc), x: 115, largeur: 25 },
        { texte: String(ligne.quantite), x: 142, largeur: 12 },
        { texte: prixPdf(ligne.prixFc * ligne.quantite), x: 156, largeur: 38 },
      ],
      y,
    )
    y += 9
  }

  y += 6
  document.setFillColor(...CREME)
  document.rect(120, y - 6, LARGEUR - MARGE - 120, 14, 'F')
  document.setFont('helvetica', 'bold')
  document.setFontSize(11)
  document.setTextColor(...MARINE)
  document.text('Total estimé', 124, y + 2)
  document.text(prixPdf(donnees.total), LARGEUR - MARGE - 4, y + 2, { align: 'right' })

  y += 18
  document.setDrawColor(...OR)
  document.setLineWidth(0.5)
  document.rect(MARGE, y, LARGEUR_UTILE, 22)
  document.setFont('helvetica', 'bold')
  document.setFontSize(8.5)
  document.setTextColor(...ROUGE)
  document.text(MENTION_ESTIMATION, MARGE + 4, y + 7)
  document.setFont('helvetica', 'normal')
  document.setTextColor(...ENCRE_DOCE)
  document.text(
    document.splitTextToSize(
      'Aucun paiement en ligne. Ce document ne constitue pas une facture : le prix définitif est confirmé en boutique au moment du règlement.',
      LARGEUR_UTILE - 8,
    ),
    MARGE + 4,
    y + 13,
  )

  piedDePage(document)
  document.save(`proforma-${donnees.reference}.pdf`)
}

export interface DonneesReservationPdf {
  code: string
  dateCreation: Date | string
  dateExpiration: Date | string
  statut: string
  client: string
  articles: { nom: string; quantite: number; prixUnitaire: number }[]
  total: number
}

export async function genererPdfReservation(donnees: DonneesReservationPdf): Promise<void> {
  const banniere = await chargerImage('/images/marque/banniere.png')
  const document = new jsPDF({ unit: 'mm', format: 'a4' })
  entete(document, banniere)

  document.setFont('helvetica', 'bold')
  document.setFontSize(20)
  document.setTextColor(...MARINE)
  document.text('CONFIRMATION DE RÉSERVATION', MARGE, 48)
  document.setFont('helvetica', 'normal')
  document.setFontSize(9)
  document.setTextColor(...ENCRE_DOCE)
  document.text(`Émise le ${formaterDateProforma(new Date(donnees.dateCreation))}`, LARGEUR - MARGE, 53, {
    align: 'right',
  })

  document.setFillColor(...MARINE)
  document.rect(MARGE, 62, LARGEUR_UTILE, 30, 'F')
  document.setFont('helvetica', 'normal')
  document.setFontSize(8)
  document.setTextColor(...OR)
  document.text('CODE DE RÉSERVATION', MARGE + 6, 72)
  document.setFont('helvetica', 'bold')
  document.setFontSize(24)
  document.setTextColor(...CREME)
  document.text(donnees.code, MARGE + 6, 84)
  document.setFontSize(9)
  document.text(`Valable 24 heures`, LARGEUR - MARGE - 6, 84, { align: 'right' })

  bloc(
    document,
    'Client',
    [donnees.client],
    MARGE,
    104,
    80,
  )
  bloc(
    document,
    'Détails',
    [
      `Créée le ${formaterDateProforma(new Date(donnees.dateCreation))}`,
      `Expire le ${formaterDateProforma(new Date(donnees.dateExpiration))}`,
      `Statut : ${donnees.statut}`,
    ],
    108,
    104,
    LARGEUR - MARGE - 108,
  )

  let y = 140
  ligneTableau(
    document,
    [
      { texte: 'Article', x: MARGE + 2, largeur: 80, gras: true },
      { texte: 'Prix unitaire', x: 106, largeur: 28, gras: true },
      { texte: 'Qté', x: 140, largeur: 12, gras: true },
      { texte: 'Sous-total', x: 156, largeur: 38, gras: true },
    ],
    y,
    CREME,
  )
  y += 10
  for (const article of donnees.articles) {
    if (y > 245) {
      piedDePage(document)
      document.addPage()
      y = 24
      entete(document, banniere)
    }
    ligneTableau(
      document,
      [
        { texte: article.nom, x: MARGE + 2, largeur: 80 },
        { texte: prixPdf(article.prixUnitaire), x: 106, largeur: 28 },
        { texte: String(article.quantite), x: 140, largeur: 12 },
        { texte: prixPdf(article.prixUnitaire * article.quantite), x: 156, largeur: 38 },
      ],
      y,
    )
    y += 9
  }

  y += 6
  document.setFont('helvetica', 'bold')
  document.setFontSize(11)
  document.setTextColor(...MARINE)
  document.text(`Total estimé : ${prixPdf(donnees.total)}`, MARGE, y)

  y += 10
  document.setDrawColor(...OR)
  document.rect(MARGE, y, LARGEUR_UTILE, 20)
  document.setFont('helvetica', 'normal')
  document.setFontSize(8.5)
  document.setTextColor(...ENCRE_DOCE)
  document.text(
    document.splitTextToSize(
      `${MENTION_ESTIMATION} Présentez ce code en boutique ; le règlement se fait sur place. Aucun paiement en ligne.`,
      LARGEUR_UTILE - 8,
    ),
    MARGE + 4,
    y + 7,
  )

  piedDePage(document)
  document.save(`reservation-${donnees.code}.pdf`)
}
