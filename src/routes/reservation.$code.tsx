import { useState } from 'react'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { Lien } from '@/components/Lien'
import { PageHero } from '@/components/PageHero'
import { StatusBadge } from '@/components/StatusBadge'
import { CLASSE_BOUTON_SECONDAIRE } from '@/lib/classes'
import { EMAIL_CONTACT, POINTS_DE_VENTE } from '@/lib/entreprise'
import { formaterDate, formaterPrix, MENTION_ESTIMATION } from '@/lib/format'
import { genererPdfReservation } from '@/lib/pdf'
import { metaPage } from '@/lib/seo'
import { obtenirReservationFn } from '@/lib/server/reservations.functions'

export const Route = createFileRoute('/reservation/$code')({
  head: () => metaPage({ titre: 'Réservation' }),
  loader: async ({ params }) => {
    const resultat = await obtenirReservationFn({ data: params.code })
    if (!resultat) throw notFound()
    return resultat
  },
  notFoundComponent: CodeIntrouvable,
  component: SuiviReservation,
})

function CodeIntrouvable() {
  return (
    <main className="conteneur-site py-20 lg:py-28">
      <div className="mx-auto max-w-2xl border border-dashed border-encre/15 bg-papier p-10 text-center">
        <h1 className="text-3xl text-marine sm:text-4xl">Réservation introuvable</h1>
        <p className="mt-4 text-sm leading-relaxed text-encre-douce">
          Ce code de réservation n’existe pas. Vérifiez le code transmis, sans espace ni tiret.
        </p>
        <Lien to="/contact" className={`${CLASSE_BOUTON_SECONDAIRE} mt-8`}>
          Nous contacter
        </Lien>
      </div>
    </main>
  )
}

function SuiviReservation() {
  const { reservation, articles } = Route.useLoaderData()
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const expiree = reservation.status === 'expiree'

  const telechargerPdf = async () => {
    setEnvoi(true)
    setErreur('')
    try {
      await genererPdfReservation({
        code: reservation.code,
        dateCreation: reservation.createdAt ?? reservation.expiresAt,
        dateExpiration: reservation.expiresAt,
        statut: reservation.status,
        client: reservation.customerName,
        articles: articles.map((article) => ({
          nom: article.productName,
          quantite: article.quantity,
          prixUnitaire: article.unitPriceFc,
        })),
        subtotalFc: reservation.subtotalFc,
        discountFc: reservation.discountFc,
        coupons: reservation.coupons,
        total: reservation.totalFc,
      })
    } catch (cause) {
      setErreur(
        cause instanceof Error
          ? cause.message
          : 'Le PDF n’a pas pu être généré. Réessayez dans un instant.',
      )
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <main>
      <PageHero
        surtitre="Suivi de réservation"
        titre={`Réservation ${reservation.code}`}
        description="Conservez ce code jusqu'à votre passage en boutique. Présentez-le lors du retrait, le paiement se fait sur place."
      />
      <section className="conteneur-site grid gap-10 py-14 lg:grid-cols-[1fr_0.75fr] lg:gap-14 lg:py-20">
        <div>
          <div className="border border-or/30 bg-marine p-7 text-creme sm:p-9">
            <p className="text-xs font-semibold tracking-[0.28em] text-or-pale uppercase">
              Votre code
            </p>
            <p className="mt-4 break-all font-display text-4xl tracking-[0.24em] text-or-pale sm:text-5xl">
              {reservation.code}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-creme/15 pt-6">
              <StatusBadge statut={reservation.status} />
              <span className="text-sm text-creme/70">
                Créée le {formaterDate(reservation.createdAt ?? reservation.expiresAt)}
              </span>
            </div>
            <div
              className={`mt-6 border p-5 text-sm leading-relaxed ${
                expiree
                  ? 'border-alerte/40 bg-alerte/20 text-creme/85'
                  : 'border-or/30 bg-or/10 text-creme/80'
              }`}
            >
              <p className="font-semibold text-creme">
                {reservation.status === 'en_attente'
                  ? `Votre réservation est enregistrée. Présentez le code ${reservation.code} en boutique avant le ${formaterDate(reservation.expiresAt)}.`
                  : reservation.status === 'retiree'
                    ? 'Cette réservation a déjà été retirée.'
                    : reservation.status === 'annulee'
                      ? 'Cette réservation a été annulée.'
                      : 'Cette réservation a expiré. Vous pouvez refaire une réservation depuis le catalogue.'}
              </p>
              <p className="mt-3">
                {expiree ? (
                  <>Passé le délai de 24 heures, les produits ne sont plus réservés.</>
                ) : (
                  <>
                    Ce code est valable 24 heures, jusqu’au{' '}
                    <strong className="font-semibold text-creme">
                      {formaterDate(reservation.expiresAt)}
                    </strong>
                    . Passé ce délai, la réservation expire automatiquement.
                  </>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={telechargerPdf}
              disabled={envoi}
              className="mt-7 flex min-h-11 w-full items-center justify-center border border-or-pale px-5 text-sm font-semibold text-creme transition-colors hover:bg-or hover:text-creme"
            >
              {envoi ? 'Génération du PDF…' : 'Télécharger la confirmation PDF'}
            </button>
            {erreur ? (
              <p role="alert" className="mt-3 text-xs text-or-pale">
                {erreur}
              </p>
            ) : null}
          </div>

          <div className="mt-8 border border-encre/10 bg-papier p-7 sm:p-8">
            <h2 className="text-2xl text-marine">Articles réservés</h2>
            {articles.length > 0 ? (
              <ul className="mt-6 divide-y divide-encre/10">
                {articles.map((article) => (
                  <li key={article.id} className="flex items-start justify-between gap-5 py-4">
                    <div>
                      <p className="font-semibold text-marine">{article.productName}</p>
                      <p className="mt-1 text-sm text-encre-douce">
                        {formaterPrix(article.unitPriceFc)} × {article.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold tabular-nums text-marine">
                      {formaterPrix(article.unitPriceFc * article.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-encre-douce">Aucun article enregistré.</p>
            )}
            <div className="mt-5 space-y-2 border-t border-encre/15 pt-5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <p className="text-encre-douce">Sous-total</p>
                <p className="font-semibold tabular-nums text-marine">
                  {formaterPrix(reservation.subtotalFc)}
                </p>
              </div>
              {reservation.discountFc > 0 ? (
                <div className="flex items-center justify-between gap-4 text-[#2f6b52]">
                  <p>Remise coupons</p>
                  <p className="font-semibold tabular-nums">−{formaterPrix(reservation.discountFc)}</p>
                </div>
              ) : null}
              {reservation.coupons.length > 0 ? (
                <p className="text-xs text-encre-douce">
                  Coupons appliqués : {reservation.coupons.join(', ')}
                </p>
              ) : null}
              <div className="flex items-center justify-between gap-4 border-t border-encre/10 pt-3">
                <p className="font-semibold text-marine">Total estimé</p>
                <p className="text-xl font-semibold tabular-nums text-marine">
                  {formaterPrix(reservation.totalFc)}
                </p>
              </div>
            </div>
            <p className="mt-3 bg-or-pale/30 px-4 py-3 text-xs font-medium text-marine">
              {MENTION_ESTIMATION}
            </p>
          </div>
        </div>

        <aside className="h-fit border border-encre/10 bg-papier p-7 sm:p-8">
          <h2 className="text-xl text-marine">Informations pratiques</h2>
          <dl className="mt-6 space-y-5 text-sm">
            <div>
              <dt className="text-xs text-encre-douce">Client</dt>
              <dd className="mt-1 font-semibold text-marine">{reservation.customerName}</dd>
            </div>
            <div>
              <dt className="text-xs text-encre-douce">Téléphone</dt>
              <dd className="mt-1 font-semibold text-marine">{reservation.customerPhone}</dd>
            </div>
            {reservation.comment ? (
              <div>
                <dt className="text-xs text-encre-douce">Commentaire</dt>
                <dd className="mt-1 whitespace-pre-line text-marine">{reservation.comment}</dd>
              </div>
            ) : null}
          </dl>
          <div className="mt-8 border-t border-encre/10 pt-6">
            <p className="text-xs font-semibold tracking-[0.2em] text-or uppercase">
              Retrait en boutique
            </p>
            <ul className="mt-4 space-y-4 text-sm text-encre-douce">
              {POINTS_DE_VENTE.map((point) => (
                <li key={point.nom}>
                  <span className="font-semibold text-marine">{point.nom}</span>
                  <span className="block">{point.adresse}</span>
                  <a href={`tel:${point.tel}`} className="lien-editorial mt-1 inline-block text-xs">
                    {point.telephone}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-encre-douce">
              Une question ? Écrivez à{' '}
              <a href={`mailto:${EMAIL_CONTACT}`} className="lien-editorial">
                {EMAIL_CONTACT}
              </a>
              .
            </p>
          </div>
        </aside>
      </section>
    </main>
  )
}
