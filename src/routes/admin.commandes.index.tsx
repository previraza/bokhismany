import { useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { OrderBadge } from '@/components/OrderBadge'
import { CLASSE_BOUTON_SECONDAIRE, CLASSE_CHAMP } from '@/lib/classes'
import { formaterDate, formaterPrix } from '@/lib/format'
import { metaPage } from '@/lib/seo'
import { listOrdersAdminFn } from '@/lib/server/orders.functions'
import type { OrderStatus } from '@/lib/db/schema'

const STATUTS: OrderStatus[] = ['pending', 'invoiced', 'paid']

export const Route = createFileRoute('/admin/commandes/')({
  head: () => metaPage({ titre: 'Bons de commande' }),
  loader: () => listOrdersAdminFn(),
  component: CommandesAdmin,
})

function CommandesAdmin() {
  const commandes = Route.useLoaderData()
  const [recherche, setRecherche] = useState('')
  const [statut, setStatut] = useState<'tous' | OrderStatus>('tous')

  const visibles = useMemo(() => {
    const terme = recherche.trim().toLocaleLowerCase('fr-FR')
    return commandes.filter(({ order }) => {
      const dansStatut = statut === 'tous' || order.status === statut
      const dansRecherche =
        terme.length === 0 ||
        order.reference.toLocaleLowerCase('fr-FR').includes(terme) ||
        order.customerName.toLocaleLowerCase('fr-FR').includes(terme) ||
        order.customerPhone.includes(terme)
      return dansStatut && dansRecherche
    })
  }, [commandes, recherche, statut])

  return (
    <div>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-or uppercase">Registre</p>
          <h1 className="mt-3 text-3xl text-marine sm:text-4xl">Bons de commande</h1>
          <p className="mt-3 text-sm text-encre-douce">
            Retrouvez les demandes issues des réservations et des proformas, générez les factures
            puis validez les paiements en boutique.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/factures" className={CLASSE_BOUTON_SECONDAIRE}>
            Voir les factures
          </Link>
          <Link to="/admin" className={CLASSE_BOUTON_SECONDAIRE}>
            Retour au tableau de bord
          </Link>
        </div>
      </header>

      <div className="border border-encre/10 bg-papier p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="filtre-commande" className="text-sm font-semibold text-marine">
              Rechercher
            </label>
            <input
              id="filtre-commande"
              type="search"
              value={recherche}
              onChange={(evenement) => setRecherche(evenement.target.value)}
              placeholder="Référence, nom ou téléphone"
              className={`${CLASSE_CHAMP} mt-2`}
            />
          </div>
          <div>
            <label htmlFor="statut-commande" className="text-sm font-semibold text-marine">
              Statut
            </label>
            <select
              id="statut-commande"
              value={statut}
              onChange={(evenement) => setStatut(evenement.target.value as 'tous' | OrderStatus)}
              className={`${CLASSE_CHAMP} mt-2`}
            >
              <option value="tous">Tous les statuts</option>
              {STATUTS.map((element) => (
                <option key={element} value={element}>
                  {element === 'pending'
                    ? 'En attente'
                    : element === 'invoiced'
                      ? 'Facturée, non payée'
                      : 'Payée'}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-6 text-sm text-encre-douce" aria-live="polite">
          {visibles.length} bon{visibles.length > 1 ? 's' : ''} de commande
          {visibles.length > 1 ? 's' : ''}
        </p>

        {visibles.length > 0 ? (
          <div className="mt-4 overflow-x-auto border border-encre/10 bg-papier">
            <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
              <thead className="bg-creme/70">
                <tr className="text-xs tracking-wider text-encre-douce uppercase">
                  <th scope="col" className="px-5 py-4 font-semibold">Référence</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Client</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Origine</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Créée le</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Total</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Statut</th>
                  <th scope="col" className="px-5 py-4 font-semibold">Facture</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-encre/10">
                {visibles.map(({ order, invoice }) => (
                  <tr key={order.id}>
                    <td className="px-5 py-4 font-semibold tabular-nums text-marine">
                      <Link
                        to="/admin/commandes/$id"
                        params={{ id: String(order.id) }}
                        className="underline decoration-or underline-offset-4"
                      >
                        {order.reference}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-marine">{order.customerName}</p>
                      <p className="mt-1 text-xs text-encre-douce">{order.customerPhone}</p>
                    </td>
                    <td className="px-5 py-4 text-encre-douce">
                      {order.source === 'reservation' ? 'Réservation' : 'Proforma'}
                    </td>
                    <td className="px-5 py-4 text-encre-douce">
                      {order.createdAt ? formaterDate(order.createdAt) : '—'}
                    </td>
                    <td className="px-5 py-4 font-semibold tabular-nums text-marine">
                      {formaterPrix(order.totalFc)}
                    </td>
                    <td className="px-5 py-4">
                      <OrderBadge statut={order.status} />
                    </td>
                    <td className="px-5 py-4 font-medium tabular-nums text-marine">
                      {invoice?.number ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 border border-dashed border-encre/15 bg-papier p-10 text-center text-sm text-encre-douce">
            Aucun bon de commande ne correspond à ces filtres.
          </p>
        )}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-encre-douce">
        Une facture générée n’est pas une facture payée : le règlement est validé manuellement par
        l’administration après réception en boutique.
      </p>
    </div>
  )
}
