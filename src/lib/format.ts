export const MENTION_ESTIMATION = 'Montant estimé, à confirmer en boutique.'

const formateurPrix = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 0,
})

const formateurDate = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'Africa/Kinshasa',
})

export function formaterPrix(prixFc: number): string {
  return `${formateurPrix.format(prixFc)} Fc`
}

export function formaterDate(date: Date | string): string {
  return formateurDate.format(new Date(date))
}

export function formaterDateCourte(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Africa/Kinshasa',
  }).format(new Date(date))
}
