import { useEffect, useState, type FormEvent } from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { InvoiceBadge, OrderBadge } from '@/components/OrderBadge'
import { CLASSE_BOUTON_OR, CLASSE_BOUTON_SECONDAIRE, CLASSE_CHAMP } from '@/lib/classes'
import { formaterDate, formaterPrix } from '@/lib/format'
import { metaPage } from '@/lib/seo'
import { genererPdfFacture } from '@/lib/pdf'
import {
  generateInvoiceFn,
  getOrderAdminFn,
  markInvoicePaidFn,
} from '@/lib/server/orders.functions'

export const Route = createFileRoute('/admin/commandes/$id')({
  head: () => metaPage({ titre: 'Détail du bon de commande' }),
  loader: ({ params }) => getOrderAdminFn({ data: Number(params.id) }),
  component: DetailCommande,
})

interface LigneAjustable {
  id: number
  name: string
  unitPriceFc: number
  quantity: number
}

function DetailCommande() {
  const donnees = Route.useLoaderData()
  const routeur = useRouter()
  const [lignes, setLignes] = useState<LigneAjustable[]>([])
  const [message, setMessage] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const { order, items, invoice } = donnees

  useEffect(() => {
    setLignes(
      items.map((item) => ({
        id: item.id,
        name: item.productName,
        unitPriceFc: item.unitPriceFc,
        quantity: item.quantity,
      })),
    )
  }, [items])

  const remise = Math.min(order.discountFc, lignes.reduce((t, l) => t + l.unitPriceFc * l.quantity, 0))
  const nouveauTotal = lignes.reduce((t, l) => t + l.unitPriceFc * l.quantity, 0) - remise

  const modifierLigne = (id: number, champ: 'unitPriceFc' | 'quantity', valeur: number) => {
    setLignes((etat) =>
      etat.map((ligne) => (ligne.id === id ? { ...ligne, [champ]: Math.max(0, valeur) } : ligne)),
    )
  }

  const genererFacture = async (evenement: FormEvent<HTMLFormElement>) => {
    evenement.preventDefault()
    setMessage('')
    if (lignes.some((ligne) => ligne.unitPriceFc <= 0 || ligne.quantity <= 0)) {
      setMessage('Chaque ligne doit avoir un prix et une quantité supérieurs à zéro.')
      return
    }
    setEnvoi(true)
    try {
      const resultat = await generateInvoiceFn({
        data: {
          orderId: order.id,
          items: lignes.map((ligne) => ({
            id: ligne.id,
            unitPriceFc: ligne.unitPriceFc,
            quantity: ligne.quantity,
          })),
        },
      })
      await routeur.invalidate()
      setMessage(`Facture ${resultat.number} générée. Total : ${formaterPrix(resultat.totalFc)}.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Génération de facture impossible.')
    } finally {
      setEnvoi(false)
    }
  }

  const validerPaiement = async () => {
    if (!invoice) return
    setMessage('')
    setEnvoi(true)
    try {
      await markInvoicePaidFn({ data: invoice.id })
      await routeur.invalidate()
      setMessage('Paiement validé. La facture est désormais marquée comme payée.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Validation du paiement impossible.')
    } finally {
      setEnvoi(false)
    }
  }

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
    <div>
      <Link to="/admin/commandes" className="text-sm font-semibold text-marine underline underline-offset-4">
        ← Retour aux bons de commande
      </Link>
      <header className="mt-6 mb-8">
        <p className="text-xs font-semibold tracking-[0.28em] text-or uppercase">Registre</p>
        <h1 className="mt-3 text-3xl text-marine sm:text-4xl">{order.reference}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <OrderBadge statut={order.status} />
          {invoice ? <InvoiceBadge statut={invoice.status} /> : null}
        </div>
      </header>

      {message ? (
        <p role="status" className="mb-6 border border-or/30 bg-or-pale/30 p-4 text-sm text-marine">
          {message}
        </p>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="border border-encre/10 bg-papier p-6">
          <h2 className="text-xl text-marine">Client</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-encre-douce">Nom</dt>
              <dd className="font-semibold text-marine">{order.customerName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-encre-douce">Téléphone</dt>
              <dd className="font-semibold text-marine">{order.customerPhone}</dd>
            </div>
            {order.customerEmail ? (
              <div className="flex justify-between gap-4">
                <dt className="text-encre-douce">Email</dt>
                <dd className="font-semibold text-marine">{order.customerEmail}</dd>
              </div>
            ) : null}
            {order.customerCompany ? (
              <div className="flex justify-between gap-4">
                <dt className="text-encre-douce">Société</dt>
                <dd className="font-semibold text-marine">{order.customerCompany}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-encre-douce">Origine</dt>
              <dd className="font-semibold text-marine">
                {order.source === 'reservation' ? 'Réservation' : 'Proforma'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-encre-douce">Créée le</dt>
              <dd className="font-semibold text-marine">
                {order.createdAt ? formaterDate(order.createdAt) : '—'}
              </dd>
            </div>
          </dl>
        </div>
        <div className="border border-encre/10 bg-papier p-6">
          <h2 className="text-xl text-marine">Facturation</h2>
          {invoice ? (
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-encre-douce">Numéro</dt>
                <dd className="font-semibold tabular-nums text-marine">{invoice.number}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-encre-douce">Émise le</dt>
                <dd className="font-semibold text-marine">
                  {invoice.issuedAt ? formaterDate(invoice.issuedAt) : '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-encre-douce">Total</dt>
                <dd className="font-semibold tabular-nums text-marine">
                  {formaterPrix(invoice.totalFc)}
                </dd>
              </div>
              {invoice.paidAt ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-encre-douce">Payée le</dt>
                  <dd className="font-semibold text-marine">{formaterDate(invoice.paidAt)}</dd>
                </div>
              ) : null}
            </dl>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-encre-douce">
              Aucune facture générée. Ajustez les prix ci-dessous, puis générez la facture.
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            {invoice ? (
              <>
                <button type="button" onClick={telechargerFacture} className={CLASSE_BOUTON_SECONDAIRE}>
                  Télécharger la facture PDF
                </button>
                {invoice.status === 'issued' ? (
                  <button
                    type="button"
                    onClick={validerPaiement}
                    disabled={envoi}
                    className={CLASSE_BOUTON_OR}
                  >
                    Valider le paiement
                  </button>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-8 border border-encre/10 bg-papier p-6">
        <h2 className="text-xl text-marine">Articles</h2>
        {invoice ? (
          <p className="mt-2 text-xs text-encre-douce">
            La facture est émise : les prix enregistrés ci-dessous sont ceux de la facture.
          </p>
        ) : (
          <p className="mt-2 text-xs text-encre-douce">
            Modifiez les prix unitaires et les quantités avant de générer la facture.
          </p>
        )}
        <form className="mt-5 space-y-3" onSubmit={genererFacture}>
          {lignes.map((ligne) => (
            <div
              key={ligne.id}
              className="grid gap-3 border border-encre/10 bg-creme/50 p-4 sm:grid-cols-[1fr_8rem_6rem]"
            >
              <div className="flex items-center text-sm font-semibold text-marine">{ligne.name}</div>
              <div>
                <label htmlFor={`prix-${ligne.id}`} className="text-xs text-encre-douce">
                  Prix unitaire (Fc)
                </label>
                <input
                  id={`prix-${ligne.id}`}
                  type="number"
                  min={1}
                  disabled={Boolean(invoice)}
                  value={ligne.unitPriceFc}
                  onChange={(evenement) =>
                    modifierLigne(ligne.id, 'unitPriceFc', Number(evenement.target.value))
                  }
                  className={`${CLASSE_CHAMP} mt-1 disabled:opacity-60`}
                />
              </div>
              <div>
                <label htmlFor={`quantite-${ligne.id}`} className="text-xs text-encre-douce">
                  Quantité
                </label>
                <input
                  id={`quantite-${ligne.id}`}
                  type="number"
                  min={1}
                  disabled={Boolean(invoice)}
                  value={ligne.quantity}
                  onChange={(evenement) =>
                    modifierLigne(ligne.id, 'quantity', Number(evenement.target.value))
                  }
                  className={`${CLASSE_CHAMP} mt-1 disabled:opacity-60`}
                />
              </div>
            </div>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-encre/10 pt-5">
            <div className="text-sm">
              <p className="text-encre-douce">Remise coupons : −{formaterPrix(remise)}</p>
              <p className="mt-1 font-semibold text-marine">
                Total {invoice ? 'de la facture' : 'après ajustement'} : {formaterPrix(invoice?.totalFc ?? nouveauTotal)}
              </p>
            </div>
            {!invoice ? (
              <button type="submit" disabled={envoi} className={CLASSE_BOUTON_OR}>
                {envoi ? 'Génération…' : 'Générer la facture'}
              </button>
            ) : null}
          </div>
        </form>
        <p className="mt-5 text-xs leading-relaxed text-encre-douce">
          TODO : numéro de TVA et mentions légales de facturation à fournir par l’entreprise.
        </p>
      </section>
    </div>
  )
}
