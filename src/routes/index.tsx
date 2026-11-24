import { createFileRoute } from '@tanstack/react-router'
import { Lien } from '@/components/Lien'
import { ProductCard } from '@/components/ProductCard'
import { Reveal } from '@/components/Reveal'
import { SectionTitre } from '@/components/SectionTitre'
import { CATEGORIES, LIBELLES_CATEGORIES, visuelCategorie } from '@/lib/categories'
import { CLASSE_BOUTON_OR, CLASSE_BOUTON_PRIMAIRE } from '@/lib/classes'
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
      <section
        className="lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:border-l-[1.75rem] lg:border-[#777a80]"
        aria-label="Présentation de Bokhismany Trading SARL"
      >
        <div className="relative min-h-[32rem] overflow-hidden bg-[#aab0b6] lg:min-h-[47rem]">
          <img
            src="/images/marque/banniere.png"
            alt="Bannière Bokhismany Trading SARL"
            className="absolute inset-x-0 top-0 h-20 w-full object-cover object-center opacity-95 sm:h-24"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(135deg,rgba(24,54,57,0.62)_0%,rgba(179,71,31,0.28)_48%,rgba(23,21,20,0.72)_100%)]"
            aria-hidden="true"
          />
          <img
            src="/images/couverture-produits.svg"
            alt="Illustration de sacs de riz et de farine, bidons d’huile et produits du quotidien"
            className="absolute inset-x-[7%] top-[19%] w-[86%] border border-white/30 object-cover shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]"
          />
          <div className="absolute inset-x-0 bottom-14 p-7 text-creme sm:p-11 lg:p-14">
            <p className="etiquette text-or-pale">Kinshasa · Brazzaville</p>
            <p className="mt-5 max-w-lg font-display text-3xl leading-[1.05] sm:text-4xl lg:text-[2.6rem]">
              Des produits de première nécessité, du quotidien aux revendeurs.
            </p>
            <p className="mt-5 text-[0.65rem] font-semibold tracking-[0.24em] text-or-pale uppercase">
              Daayake Food · {String(produits.length).padStart(2, '0')} sélections
            </p>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex h-14 items-center gap-3 bg-[linear-gradient(90deg,#711c12_0%,#b3471f_55%,#f4b79b_100%)] px-7 text-[0.62rem] font-semibold tracking-[0.18em] text-creme uppercase sm:px-11 lg:px-14">
            <span>3 points de vente</span>
            <span className="h-1 w-1 rounded-full bg-creme/70" aria-hidden="true" />
            <span>Réservation 24 h</span>
            <span className="h-1 w-1 rounded-full bg-creme/70" aria-hidden="true" />
            <span className="hidden sm:inline">Aucun paiement en ligne</span>
          </div>
        </div>

        <div className="flex flex-col bg-papier">
          <div className="flex h-24 shrink-0 items-end bg-[linear-gradient(90deg,#6e170c_0%,#b3471f_45%,#f4e7e7_100%)] px-6 pb-4 sm:px-10 lg:px-14">
            <p className="text-[0.62rem] font-semibold tracking-[0.24em] text-creme uppercase">
              Commerce général · Daayake Food
            </p>
          </div>
          <div className="flex-1 px-6 py-14 sm:px-10 lg:px-14 lg:py-20">
            <h1 className="font-display text-[clamp(2.75rem,5.2vw,4.75rem)] leading-[0.94] tracking-[-0.045em] text-marine">
              Bokhismany <span className="italic text-or">Trading</span> SARL
            </h1>
            <p className="mt-7 max-w-lg text-base leading-relaxed text-encre-douce">
              Commerce général, distribution de produits alimentaires de première nécessité, vente en
              gros et au détail, acheminement et dédouanement de marchandises entre Brazzaville et la
              RDC.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Lien to="/produits" viewTransition className={CLASSE_BOUTON_PRIMAIRE}>
                Voir nos produits <span aria-hidden="true">→</span>
              </Lien>
              <Lien to="/panier" viewTransition className="lien-editorial text-sm">
                Réserver un panier
              </Lien>
            </div>
            <dl className="mt-12 grid grid-cols-3 border-t border-encre/15 pt-6 text-xs sm:text-sm">
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

          <div className="relative overflow-hidden bg-[#1a1716] px-6 py-12 text-creme sm:px-10 lg:px-14">
            <div
              className="absolute -top-16 -right-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,#b3471f_0%,#d9762f_45%,transparent_72%)] opacity-90 blur-xl"
              aria-hidden="true"
            />
            <p className="relative etiquette text-or-pale">Daayake Food</p>
            <p className="relative mt-5 max-w-lg font-display text-2xl leading-snug sm:text-3xl">
              Réservez en ligne, retirez et payez en boutique.
            </p>
            <Lien
              to="/panier"
              viewTransition
              className="relative mt-7 inline-flex items-center gap-2 border-b border-or-pale pb-1 text-sm font-semibold text-or-pale transition-colors hover:text-creme"
            >
              Composer mon panier <span aria-hidden="true">→</span>
            </Lien>
          </div>
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
