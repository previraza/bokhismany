import { createFileRoute } from '@tanstack/react-router'
import { Lien } from '@/components/Lien'
import { ProductCard } from '@/components/ProductCard'
import { Reveal } from '@/components/Reveal'
import { SectionTitre } from '@/components/SectionTitre'
import { CATEGORIES, LIBELLES_CATEGORIES, visuelCategorie } from '@/lib/categories'
import { CLASSE_BOUTON_OR } from '@/lib/classes'
import { EMAIL_CONTACT, POINTS_DE_VENTE } from '@/lib/entreprise'
import { formaterPrix } from '@/lib/format'
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

const ETAPES = [
  { titre: 'Choisissez', texte: 'Parcourez le catalogue et ajoutez vos produits au panier.' },
  { titre: 'Réservez', texte: 'Recevez un code de réservation valable 24 heures.' },
  { titre: 'Retirez', texte: 'Présentez le code en boutique, payez sur place et repartez.' },
]

const SAVOIR_FAIRE = [
  {
    titre: 'Vente en gros et au détail',
    texte: 'Sacs de riz, de farine et de sucre, bidons d’huile et cartons de produits du quotidien.',
  },
  {
    titre: 'Produits du quotidien',
    texte: 'Riz, semoule, farine, sucre, huiles, poisson salé, oignons et sel, sélectionnés pour nos rayons.',
  },
  {
    titre: 'Commerce entre Brazzaville et la RDC',
    texte: 'Acheminement, réception et formalités de dédouanement de marchandises entre les deux villes.',
  },
]

function Accueil() {
  const { produits, promotion } = Route.useLoaderData()

  return (
    <main>
      <section className="bg-papier">
        <div className="h-16 overflow-hidden border-b border-encre/10 bg-encre sm:h-20 lg:h-24">
          <img
            src="/images/marque/banniere.png"
            alt="Bannière Bokhismany Trading SARL"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="conteneur-site grid gap-14 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-20">
          <div>
            <p className="etiquette text-or">Commerce général · Daayake Food</p>
            <h1 className="titre-fluide mt-7 text-marine">
              Bokhismany <span className="italic text-or">Trading</span> SARL
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-encre-douce sm:text-lg">
              Des produits alimentaires de première nécessité, entre Kinshasa et Brazzaville, vendus
              en gros et au détail.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Lien to="/produits" viewTransition className={CLASSE_BOUTON_OR}>
                Voir nos produits <span aria-hidden="true">→</span>
              </Lien>
              <Lien to="/panier" viewTransition className="lien-editorial text-sm">
                Réserver un panier
              </Lien>
            </div>
            <dl className="mt-12 grid max-w-xl grid-cols-3 border-t border-encre/15 pt-6 text-xs sm:text-sm">
              {[
                ['Vente', 'Gros & détail'],
                ['Réservation', 'Valable 24 h'],
                ['Paiement', 'En boutique'],
              ].map(([terme, valeur]) => (
                <div key={terme}>
                  <dt className="text-encre-douce/75">{terme}</dt>
                  <dd className="mt-1 font-semibold text-marine">{valeur}</dd>
                </div>
              ))}
            </dl>
          </div>

          <figure className="relative mx-auto w-full max-w-xl lg:ml-auto">
            <div
              className="absolute -top-4 -right-4 h-28 w-28 bg-or-pale/70"
              aria-hidden="true"
            />
            <div className="relative border border-encre/10 bg-creme p-3 shadow-[0_24px_60px_-40px_rgba(23,21,20,0.5)] sm:p-4">
              <img
                src="/images/couverture-produits.svg"
                alt="Illustration de sacs de riz et de farine, bidons d’huile et produits du quotidien"
                className="aspect-[4/3] w-full object-cover"
              />
              <figcaption className="flex items-center justify-between gap-4 pt-4 text-[0.62rem] font-semibold tracking-[0.24em] text-or uppercase">
                <span>Sélection du jour</span>
                <span>01 / {String(produits.length).padStart(2, '0')}</span>
              </figcaption>
            </div>
            <div className="absolute -bottom-6 -left-4 hidden border border-encre/10 bg-papier px-5 py-4 shadow-sm sm:block">
              <p className="text-[0.6rem] font-semibold tracking-[0.24em] text-or uppercase">
                Daayake Food
              </p>
              <p className="mt-1 text-sm font-semibold text-marine">Épicerie du quotidien</p>
            </div>
          </figure>
        </div>
      </section>

      {promotion.active ? (
        <section className="border-y border-or/40 bg-or-pale/50" aria-label="Promotion en cours">
          <div className="conteneur-site flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-marine sm:text-base">{promotion.message}</p>
            <Lien
              to="/produits"
              viewTransition
              className="self-start border-b border-marine pb-1 text-sm font-semibold text-marine sm:self-auto"
            >
              Découvrir la sélection
            </Lien>
          </div>
        </section>
      ) : null}

      <section className="conteneur-site py-20 lg:py-28">
        <Reveal>
          <SectionTitre
            surtitre="Ce que nous faisons"
            titre="Un commerce de proximité, une logistique maîtrisée"
            description="Bokhismany accompagne les particuliers comme les revendeurs, à Kinshasa et à Brazzaville."
          />
        </Reveal>
        <div className="grid gap-x-12 gap-y-10 md:grid-cols-3">
          {SAVOIR_FAIRE.map((item, index) => (
            <Reveal key={item.titre} delai={index * 80}>
              <article className="h-full border-t-2 border-marine pt-5">
                <p className="font-display text-5xl text-or/80">0{index + 1}</p>
                <h3 className="mt-6 text-xl leading-snug text-marine">{item.titre}</h3>
                <p className="mt-3 text-sm leading-relaxed text-encre-douce">{item.texte}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="surface-claire py-20 lg:py-28" aria-labelledby="univers-titre">
        <div className="conteneur-site">
          <Reveal>
            <SectionTitre
              surtitre="Nos univers"
              titre="Tout le nécessaire, par catégorie"
              description="Riz, huiles, farines et produits du quotidien : trouvez rapidement ce qu’il vous faut."
            />
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
            {CATEGORIES.map((categorie, index) => (
              <Reveal key={categorie} delai={index * 60}>
                <Lien
                  to={`/produits?categorie=${categorie}`}
                  viewTransition
                  className="group block h-full border border-encre/10 bg-creme"
                >
                  <img
                    src={visuelCategorie(categorie)}
                    alt=""
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="flex min-h-14 items-center justify-between gap-3 border-t border-encre/10 px-4 text-sm font-semibold text-marine">
                    {LIBELLES_CATEGORIES[categorie]}
                    <span aria-hidden="true" className="text-or">→</span>
                  </span>
                </Lien>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="conteneur-site py-20 lg:py-28">
        <Reveal>
          <SectionTitre
            surtitre="Sélection"
            titre="Des produits du quotidien"
            description="Une sélection de nos produits actuellement proposés dans nos points de vente."
            action={
              <Lien to="/produits" viewTransition className="lien-editorial self-start text-sm">
                Tout le catalogue →
              </Lien>
            }
          />
        </Reveal>
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {produits.map((produit, index) => (
            <Reveal key={produit.slug} delai={index * 70}>
              <ProductCard produit={produit} />
            </Reveal>
          ))}
        </div>
        {produits.length === 0 ? (
          <p className="border border-dashed border-encre/20 p-10 text-center text-encre-douce">
            Le catalogue sera disponible prochainement.
          </p>
        ) : null}
      </section>

      <section className="conteneur-site py-20 lg:py-28">
        <Reveal>
          <SectionTitre
            surtitre="Comment réserver"
            titre="Trois étapes, zéro paiement en ligne"
            description="Votre sélection est conservée 24 heures. Le règlement se fait uniquement en boutique."
          />
        </Reveal>
        <ol className="grid gap-10 md:grid-cols-3 md:gap-0">
          {ETAPES.map((etape, index) => (
            <Reveal key={etape.titre} delai={index * 90}>
              <li className="h-full border-t border-encre/25 pr-8 pt-5">
                <span className="font-display text-5xl text-or">{index + 1}</span>
                <h3 className="mt-5 text-2xl text-marine">{etape.titre}</h3>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-encre-douce">
                  {etape.texte}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
        <p className="mt-12 text-sm text-encre-douce">
          Pour en savoir plus :{' '}
          <Lien to="/panier" viewTransition className="lien-editorial">
            lire les conditions de réservation
          </Lien>
          .
        </p>
      </section>

      <section className="surface-claire py-20 lg:py-28">
        <div className="conteneur-site">
          <Reveal>
            <SectionTitre
              surtitre="Nos points de vente"
              titre="Trois adresses pour vous accueillir"
              description="Retrouvez Daayake Food à Kinshasa et à Brazzaville."
              action={
                <Lien to="/adresses" viewTransition className="lien-editorial self-start text-sm">
                  Toutes les adresses →
                </Lien>
              }
            />
          </Reveal>
          <div className="grid gap-10 md:grid-cols-3">
            {POINTS_DE_VENTE.map((point, index) => (
              <Reveal key={point.nom} delai={index * 70}>
                <article className="h-full border-t border-encre/25 pt-5">
                  <p className="text-[0.65rem] font-semibold tracking-[0.22em] text-encre-douce uppercase">
                    {point.ville}
                  </p>
                  <h3 className="mt-3 text-xl text-marine">{point.nom}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-encre-douce">{point.adresse}</p>
                  <a href={`tel:${point.tel}`} className="lien-editorial mt-4 inline-block text-sm">
                    {point.telephone}
                  </a>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-marine text-creme">
        <div className="conteneur-site flex flex-col gap-10 py-16 md:flex-row md:items-end md:justify-between lg:py-24">
          <div className="max-w-2xl">
            <p className="etiquette text-or-pale">Daayake Food</p>
            <h2 className="mt-6 text-3xl leading-tight sm:text-5xl">
              Prêt à composer votre panier ?
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-creme/70">
              Une question sur un produit, un prix ou une commande en gros ? Écrivez-nous à{' '}
              <a href={`mailto:${EMAIL_CONTACT}`} className="text-or-pale underline underline-offset-4">
                {EMAIL_CONTACT}
              </a>
              .
            </p>
          </div>
          <Lien
            to="/produits"
            viewTransition
            className={`${CLASSE_BOUTON_OR} shrink-0`}
          >
            {produits[0] ? `Dès ${formaterPrix(produits[0].priceFc)}` : 'Voir le catalogue'}
          </Lien>
        </div>
      </section>
    </main>
  )
}
