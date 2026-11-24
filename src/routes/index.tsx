import { createFileRoute } from '@tanstack/react-router'
import { Lien } from '@/components/Lien'
import { ProductCard } from '@/components/ProductCard'
import { CATEGORIES, LIBELLES_CATEGORIES } from '@/lib/categories'
import {
  CLASSE_BOUTON_PRIMAIRE,
  CLASSE_BOUTON_SECONDAIRE,
} from '@/lib/classes'
import { metaPage } from '@/lib/seo'
import { obtenirProduitsPharesFn } from '@/lib/server/produits.functions'
import { obtenirPromotionFn } from '@/lib/server/promotion.functions'

export const Route = createFileRoute('/')({
  head: () => metaPage({ titre: 'Accueil' }),
  loader: async () => {
    const [produits, promotion] = await Promise.all([
      obtenirProduitsPharesFn(),
      obtenirPromotionFn(),
    ])
    return { produits, promotion }
  },
  component: Accueil,
})

function Accueil() {
  const { produits, promotion } = Route.useLoaderData()

  return (
    <main>
      <section
        className="lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
        aria-label="Présentation de Bokhismany Trading SARL"
      >
        <div className="relative min-h-[20rem] overflow-hidden bg-[#a89b90] sm:min-h-[28rem] lg:min-h-[42rem]">
          <img
            src="/images/accueil/marche-grains.jpg"
            alt="Marché où des sacs de grains et de céréales sont exposés"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-6 text-creme sm:p-10 lg:p-14">
            <p className="text-[0.68rem] font-semibold tracking-[0.2em] uppercase">
              Kinshasa · Brazzaville · 3 points de vente
            </p>
            <Lien
              to="/adresses"
              viewTransition
              className="border-b border-creme/60 pb-1 text-xs font-semibold text-creme hover:border-or-pale"
            >
              Voir les adresses →
            </Lien>
          </div>
        </div>

        <div className="flex flex-col justify-center bg-papier px-6 py-14 sm:px-10 lg:px-14 lg:py-20">
          <p className="etiquette text-or">Bokhismany Trading SARL</p>
          <h1 className="mt-6 font-display text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.02] tracking-[-0.04em] text-marine">
            Bokhismany Trading SARL
          </h1>
          <p className="mt-3 font-display text-[clamp(1.5rem,3vw,2.25rem)] italic leading-tight text-or">
            L’essentiel, au quotidien.
          </p>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-encre-douce sm:text-lg">
            Riz, farines, huiles et produits de première nécessité, vendus en gros et au détail à
            Kinshasa et à Brazzaville.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Lien to="/produits" viewTransition className={CLASSE_BOUTON_PRIMAIRE}>
              Voir nos produits <span aria-hidden="true">→</span>
            </Lien>
            <Lien to="/panier" viewTransition className={CLASSE_BOUTON_SECONDAIRE}>
              Réserver un panier
            </Lien>
          </div>
          <p className="mt-8 border-t border-encre/10 pt-5 text-xs leading-relaxed text-encre-douce">
            Réservation valable 24 h · retrait et paiement en boutique · aucun paiement en ligne
          </p>
        </div>
      </section>

      {promotion.active ? (
        <section className="border-y border-or/30 bg-or-pale/40" aria-label="Promotion en cours">
          <div className="conteneur-site flex flex-col gap-3 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-marine">{promotion.message}</p>
            <Lien
              to="/produits"
              viewTransition
              className="lien-editorial self-start text-sm sm:self-auto"
            >
              Voir la sélection →
            </Lien>
          </div>
        </section>
      ) : null}

      <section className="conteneur-site py-16 lg:py-24" aria-labelledby="selection-titre">
        <div className="flex flex-col gap-6 border-b border-encre/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="etiquette text-encre-douce">Le catalogue</p>
            <h2 id="selection-titre" className="mt-4 font-display text-3xl text-marine sm:text-4xl">
              À retrouver en boutique
            </h2>
          </div>
          <Lien to="/produits" viewTransition className="lien-editorial self-start text-sm sm:self-auto">
            Tout voir →
          </Lien>
        </div>

        <nav aria-label="Catégories" className="mt-6 flex flex-wrap gap-2">
          {CATEGORIES.map((categorie) => (
            <Lien
              key={categorie}
              to={`/produits?categorie=${categorie}`}
              viewTransition
              className="inline-flex min-h-11 items-center border border-encre/15 px-4 text-sm font-medium text-encre-douce transition-colors hover:border-or hover:text-or"
            >
              {LIBELLES_CATEGORIES[categorie]}
            </Lien>
          ))}
        </nav>

        <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {produits.map((produit) => (
            <ProductCard key={produit.slug} produit={produit} />
          ))}
        </div>
        {produits.length === 0 ? (
          <p className="mt-10 border border-dashed border-encre/20 p-10 text-center text-encre-douce">
            Le catalogue sera disponible prochainement.
          </p>
        ) : null}
      </section>

      <section className="surface-claire" aria-labelledby="reserver-titre">
        <div className="conteneur-site grid lg:grid-cols-2">
          <div className="relative min-h-[18rem] overflow-hidden bg-[#a89b90] lg:min-h-[28rem]">
            <img
              src="/images/accueil/sacs-grains.jpg"
              alt="Sacs de grains alignés sur un marché"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>
          <div className="px-6 py-14 sm:px-10 lg:px-14 lg:py-20">
            <p className="etiquette text-or">Réservation</p>
            <h2 id="reserver-titre" className="mt-5 font-display text-3xl text-marine sm:text-4xl">
              Choisissez, réservez, retirez.
            </h2>
            <ol className="mt-8 space-y-5">
              <li className="flex gap-4">
                <span className="font-display text-2xl text-or">01</span>
                <p className="text-sm leading-relaxed text-encre-douce">
                  Ajoutez vos produits au panier.
                </p>
              </li>
              <li className="flex gap-4">
                <span className="font-display text-2xl text-or">02</span>
                <p className="text-sm leading-relaxed text-encre-douce">
                  Recevez un code valable 24 heures.
                </p>
              </li>
              <li className="flex gap-4">
                <span className="font-display text-2xl text-or">03</span>
                <p className="text-sm leading-relaxed text-encre-douce">
                  Présentez le code en boutique et payez sur place.
                </p>
              </li>
            </ol>
            <Lien to="/panier" viewTransition className={`${CLASSE_BOUTON_PRIMAIRE} mt-9`}>
              Composer mon panier <span aria-hidden="true">→</span>
            </Lien>
            <p className="mt-5 text-xs text-encre-douce">
              Montant estimé, à confirmer en boutique.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
