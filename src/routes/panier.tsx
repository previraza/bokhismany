import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Champ } from '@/components/Champ'
import { EmptyState } from '@/components/EmptyState'
import { Lien } from '@/components/Lien'
import { PageHero } from '@/components/PageHero'
import { ProductVisual } from '@/components/ProductVisual'
import { usePanier } from '@/context/CartContext'
import { libelleCategorie } from '@/lib/categories'
import { CLASSE_BOUTON_OR, CLASSE_BOUTON_PRIMAIRE, CLASSE_CHAMP } from '@/lib/classes'
import { formaterPrix, MENTION_ESTIMATION } from '@/lib/format'
import { metaPage } from '@/lib/seo'
import { creerReservationFn, verifierArticlesFn } from '@/lib/server/reservations.functions'
import { schemaReservation } from '@/lib/validation'

export const Route = createFileRoute('/panier')({
  head: () =>
    metaPage({
      titre: 'Panier',
      description:
        'Composez votre panier de produits alimentaires et réservez-le en ligne pour 24 heures. Paiement et retrait en boutique.',
    }),
  component: Panier,
})

interface Coordonnees {
  nom: string
  telephone: string
  commentaire: string
}

const VIDE: Coordonnees = { nom: '', telephone: '', commentaire: '' }

function Panier() {
  const { lignes, nombre, total, pret, modifierQuantite, retirer, vider } = usePanier()
  const naviguer = useNavigate()
  const [coordonnees, setCoordonnees] = useState<Coordonnees>(VIDE)
  const [erreurs, setErreurs] = useState<Partial<Record<keyof Coordonnees, string>>>({})
  const [indisponibles, setIndisponibles] = useState<string[]>([])
  const [etat, setEtat] = useState<'repos' | 'envoi' | 'erreur'>('repos')
  const [messageErreur, setMessageErreur] = useState('')
  const cleSlugs = lignes.map((ligne) => ligne.slug).join('|')

  useEffect(() => {
    if (!pret || lignes.length === 0) {
      setIndisponibles([])
      return
    }
    let actif = true
    verifierArticlesFn({ data: lignes.map((ligne) => ligne.slug) })
      .then((resultat) => {
        if (actif) setIndisponibles(resultat)
      })
      .catch(() => {
        if (actif) setIndisponibles([])
      })
    return () => {
      actif = false
    }
    // La clé évite de relancer la vérification lors d'un simple changement de quantité.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleSlugs, pret])

  const avertissements = useMemo(
    () => lignes.filter((ligne) => indisponibles.includes(ligne.slug)),
    [lignes, indisponibles],
  )

  const changer = (champ: keyof Coordonnees, valeur: string) => {
    setCoordonnees((etatActuel) => ({ ...etatActuel, [champ]: valeur }))
    setErreurs((etatActuel) => ({ ...etatActuel, [champ]: undefined }))
  }

  const reserver = async (evenement: FormEvent<HTMLFormElement>) => {
    evenement.preventDefault()
    setMessageErreur('')
    const analyse = schemaReservation.safeParse({
      nom: coordonnees.nom,
      telephone: coordonnees.telephone,
      commentaire: coordonnees.commentaire || undefined,
      articles: lignes.map((ligne) => ({ slug: ligne.slug, quantite: ligne.quantite })),
    })

    if (!analyse.success) {
      const nouvellesErreurs: Partial<Record<keyof Coordonnees, string>> = {}
      for (const probleme of analyse.error.issues) {
        const champ = String(probleme.path[0]) as keyof Coordonnees
        if (champ in VIDE && !nouvellesErreurs[champ]) {
          nouvellesErreurs[champ] = probleme.message
        }
      }
      setErreurs(nouvellesErreurs)
      setEtat('erreur')
      return
    }

    setEtat('envoi')
    try {
      const resultat = await creerReservationFn({ data: analyse.data })
      if (!resultat.succes) {
        setIndisponibles(resultat.slugs)
        setMessageErreur(resultat.message)
        setEtat('erreur')
        return
      }
      await naviguer({
        to: '/reservation/$code',
        params: { code: resultat.code },
        viewTransition: true,
      })
    } catch (error) {
      setMessageErreur(
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue. Réessayez dans un instant.',
      )
      setEtat('erreur')
    }
  }

  if (!pret) {
    return (
      <main className="conteneur-site py-20">
        <p className="text-encre-douce">Chargement du panier…</p>
      </main>
    )
  }

  return (
    <main>
      <PageHero
        surtitre="Votre sélection"
        titre="Panier"
        description={`${nombre} article${nombre > 1 ? 's' : ''} dans votre panier. Le montant affiché est une estimation, à confirmer en boutique.`}
      />

      {lignes.length === 0 ? (
        <section className="conteneur-site py-16 lg:py-24">
          <EmptyState
            titre="Votre panier est vide"
            description="Découvrez nos produits du quotidien, ajoutez ceux dont vous avez besoin, puis réservez votre panier pour 24 heures."
            action={{ libelle: 'Voir les produits', to: '/produits' }}
          />
        </section>
      ) : (
        <section className="conteneur-site grid gap-10 py-14 lg:grid-cols-[1.25fr_0.75fr] lg:gap-14 lg:py-20">
          <div>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl text-marine">Vos produits</h2>
              <button
                type="button"
                onClick={vider}
                className="min-h-11 text-sm font-semibold text-alerte underline decoration-current/40 underline-offset-4"
              >
                Vider le panier
              </button>
            </div>

            {avertissements.length > 0 ? (
              <div
                role="alert"
                className="mt-6 border border-alerte/30 bg-alerte/10 p-5 text-sm leading-relaxed text-alerte"
              >
                Ce produit n’est plus disponible. Retirez-le du panier pour continuer.
              </div>
            ) : null}

            <ul className="mt-6 space-y-4">
              {lignes.map((ligne) => (
                <li
                  key={ligne.slug}
                  className="grid grid-cols-[5rem_1fr] gap-4 border border-encre/10 bg-papier p-4 sm:grid-cols-[7rem_1fr_auto] sm:p-5"
                >
                  <Link
                    viewTransition
                    to="/produits/$slug"
                    params={{ slug: ligne.slug }}
                    className="block"
                    aria-label={`Voir la fiche de ${ligne.nom}`}
                  >
                    <ProductVisual
                      slug={ligne.slug}
                      nom={ligne.nom}
                      categorie={ligne.categorie}
                      active={false}
                      className="aspect-square"
                    />
                  </Link>
                  <div className="min-w-0">
                    <p className="text-[0.65rem] font-semibold tracking-[0.18em] text-encre-douce uppercase">
                      {libelleCategorie(ligne.categorie)}
                    </p>
                    <h3 className="mt-1 text-lg leading-snug text-marine">
                      <Link viewTransition to="/produits/$slug" params={{ slug: ligne.slug }}>
                        {ligne.nom}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-encre-douce">{ligne.format ?? '—'}</p>
                    {indisponibles.includes(ligne.slug) ? (
                      <p className="mt-2 text-xs font-semibold text-alerte">Rupture signalée</p>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => retirer(ligne.slug)}
                      className="mt-3 min-h-11 text-sm text-encre-douce underline underline-offset-4 hover:text-alerte"
                    >
                      Retirer
                    </button>
                  </div>
                  <div className="col-span-2 flex flex-wrap items-end justify-between gap-4 border-t border-encre/10 pt-4 sm:col-span-1 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                    <div className="flex min-h-11 items-center border border-encre/15">
                      <button
                        type="button"
                        onClick={() => modifierQuantite(ligne.slug, ligne.quantite - 1)}
                        aria-label={`Diminuer la quantité de ${ligne.nom}`}
                        className="flex h-11 w-11 items-center justify-center text-lg text-marine hover:bg-creme"
                      >
                        −
                      </button>
                      <span className="w-9 text-center font-semibold tabular-nums">
                        {ligne.quantite}
                      </span>
                      <button
                        type="button"
                        onClick={() => modifierQuantite(ligne.slug, ligne.quantite + 1)}
                        aria-label={`Augmenter la quantité de ${ligne.nom}`}
                        className="flex h-11 w-11 items-center justify-center text-lg text-marine hover:bg-creme"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-encre-douce">Sous-total</p>
                      <p className="text-base font-semibold tabular-nums text-marine">
                        {formaterPrix(ligne.prixFc * ligne.quantite)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <Lien
              to="/produits"
              viewTransition
              className="mt-7 inline-flex min-h-11 items-center text-sm font-semibold text-marine underline decoration-or underline-offset-4"
            >
              ← Continuer les achats
            </Lien>
          </div>

          <div>
            <div className="border border-encre/10 bg-papier p-6 sm:p-8">
              <h2 className="text-2xl text-marine">Récapitulatif</h2>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-encre-douce">Articles</dt>
                  <dd className="font-semibold tabular-nums text-marine">{nombre}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-encre/10 pt-4">
                  <dt className="font-semibold text-marine">Total estimé</dt>
                  <dd className="text-xl font-semibold tabular-nums text-marine">
                    {formaterPrix(total)}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 bg-or-pale/30 px-4 py-3 text-xs font-medium text-marine">
                {MENTION_ESTIMATION}
              </p>
              <p className="mt-4 text-xs leading-relaxed text-encre-douce">
                Une réservation vous permet de figer votre sélection pendant 24 heures. Le prix
                définitif est confirmé en boutique, au moment du paiement. Passé ce délai, la
                réservation expire et les produits ne sont plus réservés.
              </p>
              <Lien
                to="/proforma"
                viewTransition
                className="mt-5 flex min-h-11 items-center justify-center border border-marine px-4 text-sm font-semibold text-marine transition-colors hover:bg-marine hover:text-creme"
              >
                Exporter la proforma
              </Lien>

              <div className="mt-8 border-t border-encre/10 pt-7">
                <h3 className="text-lg text-marine">Réserver ce panier</h3>
                <p className="mt-2 text-sm leading-relaxed text-encre-douce">
                  Renseignez vos coordonnées. Vous recevrez un code valable 24 heures, à présenter
                  en boutique.
                </p>
                <form className="mt-6 space-y-5" onSubmit={reserver} noValidate>
                  <Champ id="reservation-nom" libelle="Nom *" erreur={erreurs.nom}>
                    {(attributs) => (
                      <input
                        {...attributs}
                        type="text"
                        name="nom"
                        autoComplete="name"
                        value={coordonnees.nom}
                        onChange={(evenement) => changer('nom', evenement.target.value)}
                        placeholder="Votre nom"
                        className={CLASSE_CHAMP}
                      />
                    )}
                  </Champ>
                  <Champ
                    id="reservation-telephone"
                    libelle="Téléphone *"
                    erreur={erreurs.telephone}
                    aide="Utilisé uniquement pour vous joindre au sujet de votre réservation."
                  >
                    {(attributs) => (
                      <input
                        {...attributs}
                        type="tel"
                        name="telephone"
                        autoComplete="tel"
                        value={coordonnees.telephone}
                        onChange={(evenement) => changer('telephone', evenement.target.value)}
                        placeholder="+243 ..."
                        className={CLASSE_CHAMP}
                      />
                    )}
                  </Champ>
                  <Champ
                    id="reservation-commentaire"
                    libelle="Commentaire (facultatif)"
                    erreur={erreurs.commentaire}
                  >
                    {(attributs) => (
                      <textarea
                        {...attributs}
                        name="commentaire"
                        rows={3}
                        value={coordonnees.commentaire}
                        onChange={(evenement) => changer('commentaire', evenement.target.value)}
                        placeholder="Une précision pour la boutique ?"
                        className={`${CLASSE_CHAMP} resize-y py-3`}
                      />
                    )}
                  </Champ>
                  {messageErreur ? (
                    <p role="alert" className="text-sm font-medium text-alerte">
                      {messageErreur}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={etat === 'envoi' || avertissements.length > 0}
                    className={`${CLASSE_BOUTON_PRIMAIRE} w-full`}
                  >
                    {etat === 'envoi' ? 'Création de la réservation…' : 'Réserver mon panier'}
                  </button>
                </form>
                <p className="mt-4 text-center text-xs text-encre-douce">
                  Aucun paiement en ligne. Le règlement se fait en boutique.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {lignes.length > 0 ? (
        <div className="sticky bottom-0 z-30 border-t border-or/30 bg-creme py-3 lg:hidden">
          <div className="conteneur-site flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-encre-douce">Total estimé</p>
              <p className="text-lg font-semibold tabular-nums text-marine">{formaterPrix(total)}</p>
            </div>
            <a href="#reservation-nom" className={CLASSE_BOUTON_OR}>
              Réserver
            </a>
          </div>
        </div>
      ) : null}
    </main>
  )
}
