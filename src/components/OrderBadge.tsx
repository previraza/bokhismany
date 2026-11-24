import type { InvoiceStatus, OrderStatus } from '@/lib/db/schema'

const STATUTS_COMMANDE: Record<OrderStatus, { libelle: string; classe: string }> = {
  pending: { libelle: 'En attente', classe: 'bg-or/15 text-marine ring-1 ring-or/40' },
  invoiced: {
    libelle: 'Facturée, non payée',
    classe: 'bg-[#b02060]/10 text-[#8c1647] ring-1 ring-[#b02060]/25',
  },
  paid: {
    libelle: 'Payée',
    classe: 'bg-[#2f6b52]/15 text-[#245341] ring-1 ring-[#2f6b52]/30',
  },
}

const STATUTS_FACTURE: Record<InvoiceStatus, { libelle: string; classe: string }> = {
  issued: {
    libelle: 'Émise, non payée',
    classe: 'bg-[#b02060]/10 text-[#8c1647] ring-1 ring-[#b02060]/25',
  },
  paid: {
    libelle: 'Payée',
    classe: 'bg-[#2f6b52]/15 text-[#245341] ring-1 ring-[#2f6b52]/30',
  },
}

export function OrderBadge({ statut }: { statut: OrderStatus }) {
  const info = STATUTS_COMMANDE[statut] ?? STATUTS_COMMANDE.pending
  return (
    <span className={`inline-flex min-h-7 items-center px-3 text-xs font-semibold ${info.classe}`}>
      {info.libelle}
    </span>
  )
}

export function InvoiceBadge({ statut }: { statut: InvoiceStatus }) {
  const info = STATUTS_FACTURE[statut] ?? STATUTS_FACTURE.issued
  return (
    <span className={`inline-flex min-h-7 items-center px-3 text-xs font-semibold ${info.classe}`}>
      {info.libelle}
    </span>
  )
}
