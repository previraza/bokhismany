import { useMemo, useState } from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { InvoiceBadge } from '@/components/OrderBadge'
import { CLASSE_BOUTON_SECONDAIRE, CLASSE_CHAMP } from '@/lib/classes'
import { formaterDate, formaterPrix } from '@/lib/format'
import { genererPdfFacture } from '@/lib/pdf'
import { metaPage } from '@/lib/seo'
import { listInvoicesAdminFn, markInvoicePaidFn } from '@/lib/server/orders.functions'
import type { InvoiceStatus } from '@/lib/db/schema'

const STATUTS: InvoiceStatus[] = ['issued', 'paid']

export const Route = createFileRoute('/admin/factures')({
  head: () => metaPage({ titre: 'Factures' }),
  loader: () => listInvoicesAdminFn(),
  component: FacturesAdmin,
})

function FacturesAdmin() {
  const factures = Route.useLoaderData()
  const routeur = useRouter()
  const [recherche, setRecherche] = useState('')
  const [statut, setStatut] = useState<'tous' | InvoiceStatus>('tous')
  const [message, setMessage] = useState('')
  const [envoi, setEnvoi] = useState(false)

  const visibles = useMemo(() => {
    const terme = recherche.trim().toLocaleLowerCase('fr-FR')
    return factures.filter(({ invoice, order }) => {
      const dansStatut = statut === 'tous' || invoice.status === statut
      const dansRecherche =
        terme.length === 0 ||
        invoice.number.toLocaleLowerCase('fr-FR').includes(terme) ||
        order.customerName.toLocaleLowerCase('fr-FR').includes(terme) ||
        order.reference.toLocaleLowerCase('fr-FR').includes(terme)
      return dansStatut && dansRecherche
    })
  }, [factures, recherche, statut])

  const nonPayees = factures.filter(({ invoice }) => invoice.status === 'issued')
  const payees = factures.filter(({ invoice }) => invoice.status === 'paid')
  const encaisse = payees.reduce((total, { invoice }) => total + invoice.totalFc, 0)

  const validerPaiement = async (invoiceId: number, numero: string) => {
    setMessage('')
    setEnvoi(true)
    try {
      await markInvoicePaidFn({ data: invoiceId })
      await routeur.invalidate()
      setMessage(`Paiement de la facture ${numero} validé.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Validation du paiement impossible.')
    } finally {
      setEnvoi(false)
    }
  }

  const telechargerFacture = async (donnees: (typeof factures)[number]) => {
    const { invoice, items } = donnees
    await genererPdfFacture({
      number: invoice.number,
      issuedAt: invoice.issuedAt ?? new Date(),
      paidAt: invoice.paidAt,
      customer: {
        name: invoice.customerName,
        phone: invoice.customerPhone,
        email: invoice.customerEmail,
        company: invoice.customerCompany,
      },
      items: items.map((item) => ({
        name: item.productName,
        unitPriceFc: item.unitPriceFc,
        quantity: item.quantity,
      })),
      subtotalFc: invoice.subtotalFc,
      discountFc: invoice.discountFc,
      totalFc: invoice.totalFc,
      status: invoice.status,
    })
  }

  return (
    <div>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-or uppercase">Registre</p>
          <h1 className="mt-3 text-3xl text-marine sm:text-4xl">Factures</h1>
          <p className="mt-3 text-sm text-encre-douce">
            Une facture est émise depuis le détail d’un bon de commande. Le règlement est validé
            ici, après réception en boutique.
          </p>
        </div>
        <Link to="/admin/commandes" className={CLASSE_BOUTON_SECONDAIRE}>
          Voir les bons de commande
        </Link>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { libelle: 'Factures non payées', valeur: nonPayees.length },
          { libelle: 'Factures payées', valeur: payees.length },
          { libelle: 'Montant encaissé', valeur: formaterPrix(encaisse) },
        ].map((indicateur) => (
          <div key={indicateur.libelle} className="border border-encre/10 bg-papier p-5">
            <p className="text-xs font-semibold tracking-wide text-encre-douce uppercase">
              {indicateur.libelle}
            </p>
            <p className="mt-3 text-2xl font-semibold tabular-nums text-marine">
              {indicateur.valeur}
            </p>
          </div>
        ))}
      </div>

      {message ? (
        <p role="status" className="mb-6 border border-or/30 bg-or-pale/30 p-4 text-sm text-marine">
          {message}
        </p>
      ) : null}

      <div className="border border-encre/10 bg-papier p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="filtre-facture" className="text-sm font-semibold text-marine">
              Rechercher
            </label>
            <input
              id="filtre-facture"
              type="search"
              value={recherche}
              onChange={(evenement) => setRecherche(evenement.target.value)}
              placeholder="Numéro, client ou bon de commande"
              className={`${CLASSE_CHAMP} mt-2`}
            />
          </div>
          <div>
            <label htmlFor="statut-facture" className="text-sm font-semibold text-marine">
              Statut
            </label>
            <select
              id="statut-facture"
              value={statut}
              onChange={(evenement) => setStatut(evenement.target.value as 'tous' | InvoiceStatus)}
              className={`${CLASSE_CHAMP} mt-2`}
            >
              <option value="tous">Tous les statuts</option>
              {STATUTS.map((element) => (
                <option key={element} value={element}>
                  {element === 'issued' ? 'Émise, non payée' : 'Payée'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-6 text-sm text-encre-douce" aria-live="polite">
          {visibles.length} facture{visibles.length > 1 ? 's' : ''}
        </p>

        {visibles.length > 0 ? (
          <div className="mt-4 overflow-x-auto border border-encre/10 bg-papier">
            <table className="w-full min-w-[62rem] border-collapse text-left text-sm">
              <thead className="bg-creme/70">
                <tr className="text-xs tracking-wider text-encre-douce uppercase">
                  <th scope="col" className="px-5 py-4 font-semibold">Numéro</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Client</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Bon</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Émise le</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Total</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Statut</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-encre/10">
                {visibles.map((donnees) => {
                  const { invoice, order } = donnees
                  return (
                    <tr key={invoice.id}>
                      <td className="px-5 py-4 font-semibold tabular-nums text-marine">
                        {invoice.number}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-marine">{invoice.customerName}</p>
                        <p className="mt-1 text-xs text-encre-douce">{invoice.customerPhone}</p>
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          to="/admin/commandes/$id"
                          params={{ id: String(order.id) }}
                          className="underline decoration-or underline-offset-4"
                        >
                          {order.reference}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-encre-douce">
                        {invoice.issuedAt ? formaterDate(invoice.issuedAt) : '—'}
                      </td>
                      <td className="px-5 py-4 font-semibold tabular-nums text-marine">
                        {formaterPrix(invoice.totalFc)}
                      </td>
                      <td className="px-5 py-4">
                        <InvoiceBadge statut={invoice.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col items-start gap-2">
                          <button
                            type="button"
                            onClick={() => void telechargerFacture(donnees)}
                            className="min-h-10 border border-marine px-3 text-xs font-semibold text-marine hover:bg-marine hover:text-creme"
                          >
                            Télécharger le PDF
                          </button>
                          {invoice.status === 'issued' ? (
                            <button
                              type="button"
                              disabled={envoi}
                              onClick={() => void validerPaiement(invoice.id, invoice.number)}
                              className="min-h-10 bg-marine px-3 text-xs font-semibold text-creme hover:bg-encre-douce disabled:opacity-50"
                            >
                              Valider le paiement
                            </button>
                          ) : (
                            <span className="text-xs text-encre-douce">
                              Payée le {invoice.paidAt ? formaterDate(invoice.paidAt) : '—'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 border border-dashed border-encre/15 bg-papier p-10 text-center text-sm text-encre-douce">
            Aucune facture ne correspond à ces filtres.
          </p>
        )}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-encre-douce">
        Le site ne prend aucun paiement en ligne. Une facture reste « Émise, non payée » jusqu’à
        validation manuelle par l’administration. TODO : numéro de TVA et mentions légales à
        fournir par l’entreprise.
      </p>
    </div>
  )
}
