import { createFileRoute, Link } from '@tanstack/react-router'
import { BoutonPartager } from '@/components/BoutonPartager'
import { EmptyState } from '@/components/EmptyState'
import { InvoiceBadge, OrderBadge } from '@/components/OrderBadge'
import { PageHero } from '@/components/PageHero'
import { CLASSE_BOUTON_SECONDAIRE } from '@/lib/classes'
import { formaterDate, formaterPrix, MENTION_ESTIMATION } from '@/lib/format'
import { genererPdfFacture } from '@/lib/pdf'
import { metaPage } from '@/lib/seo'
import { getOrderByReferenceFn } from '@/lib/server/orders.functions'

export const Route = createFileRoute('/bon/$reference')({
  head: () =>
    metaPage({
      titre: 'Suivi du bon de commande',
      description: 'Suivez votre bon de commande Bokhismany et téléchargez votre facture.',
    }),
  loader: ({ params }) => getOrderByReferenceFn({ data: params.reference }),
  component: SuiviBon,
})

function SuiviBon() {
  const donnees = Route.useLoaderData()

  if (!donnees) {
    return (
      <main>
        <PageHero
          surtitre="Suivi"
          titre="Bon de commande introuvable"
          description="Vérifiez la référence transmise et réessayez."
        />
        <section className="conteneur-site py-16 lg:py-24">
          <EmptyState
            titre="Aucun bon de commande ne correspond"
            description="La référence saisie n’existe pas ou a été supprimée."
            action={{ libelle: 'Voir les produits', to: '/produits' }}
          />
        </section>
      </main>
    )
  }

  const { order, items, invoice } = donnees

  const telechargerFacture = async () => {
    if (!invoice) return
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
    <main>
      <PageHero
        surtitre="Suivi"
        titre={`Bon ${order.reference}`}
        description="Ce bon de commande a été enregistré. Le montant définitif est validé en boutique lors de l’établissement de la facture."
      />
      <section className="conteneur-site grid gap-6 py-14 lg:grid-cols-2 lg:py-20">
        <div className="border border-encre/10 bg-papier p-6 sm:p-8">
          <h2 className="text-xl text-marine">Détails</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <OrderBadge statut={order.status} />
            {invoice ? <InvoiceBadge statut={invoice.status} /> : null}
          </div>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-encre-douce">Référence</dt>
              <dd className="font-semibold tabular-nums text-marine">{order.reference}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-encre-douce">Créé le</dt>
              <dd className="font-semibold text-marine">
                {order.createdAt ? formaterDate(order.createdAt) : '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-encre-douce">Client</dt>
              <dd className="font-semibold text-marine">{order.customerName}</dd>
            </div>
            {invoice ? (
              <div className="flex justify-between gap-4">
                <dt className="text-encre-douce">Facture</dt>
                <dd className="font-semibold tabular-nums text-marine">{invoice.number}</dd>
              </div>
            ) : null}
          </dl>
          <BoutonPartager
            titre={`Bon ${order.reference}`}
            texte={`Bon de commande ${order.reference} — total estimé ${formaterPrix(order.totalFc)}.`}
            url={() => window.location.href}
            libelle="Partager ce bon"
            className={`${CLASSE_BOUTON_SECONDAIRE} mt-6`}
          />
          {invoice ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={telechargerFacture} className={CLASSE_BOUTON_SECONDAIRE}>
                Télécharger la facture PDF
              </button>
              {invoice.status !== 'paid' ? (
                <p className="flex-1 border border-or/30 bg-or-pale/30 p-4 text-xs leading-relaxed text-marine">
                  La facture a été émise mais n’est pas payée. Le règlement se fait en boutique ; le
                  statut est validé par l’administration.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-6 border border-or/30 bg-or-pale/30 p-4 text-xs leading-relaxed text-marine">
              La facture n’est pas encore générée. {MENTION_ESTIMATION}
            </p>
          )}
        </div>
        <div className="border border-encre/10 bg-papier p-6 sm:p-8">
          <h2 className="text-xl text-marine">Articles</h2>
          <ul className="mt-5 divide-y divide-encre/10">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 py-4 text-sm">
                <div>
                  <p className="font-semibold text-marine">{item.productName}</p>
                  <p className="mt-1 text-xs text-encre-douce">
                    {item.quantity} × {formaterPrix(item.unitPriceFc)}
                  </p>
                </div>
                <p className="font-semibold tabular-nums text-marine">
                  {formaterPrix(item.unitPriceFc * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-encre/10 pt-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-encre-douce">Sous-total</dt>
              <dd className="font-semibold tabular-nums text-marine">
                {formaterPrix(order.subtotalFc)}
              </dd>
            </div>
            {order.discountFc > 0 ? (
              <div className="flex justify-between gap-4 text-[#2f6b52]">
                <dt>Remise coupons</dt>
                <dd className="font-semibold tabular-nums">−{formaterPrix(order.discountFc)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4 pt-2">
              <dt className="font-semibold text-marine">Total</dt>
              <dd className="text-xl font-semibold tabular-nums text-marine">
                {formaterPrix(order.totalFc)}
              </dd>
            </div>
          </dl>
          <Link
            to="/produits"
            viewTransition
            className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-marine underline decoration-or underline-offset-4"
          >
            Continuer mes achats
          </Link>
        </div>
      </section>
    </main>
  )
}
