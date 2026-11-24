import { createFileRoute } from '@tanstack/react-router'
import { Lien } from '@/components/Lien'
import { ProductCard } from '@/components/ProductCard'
import { Reveal } from '@/components/Reveal'
import { CATEGORIES, LIBELLES_CATEGORIES } from '@/lib/categories'
import { CLASSE_BOUTON_OR, CLASSE_BOUTON_PRIMAIRE } from '@/lib/classes'
import { EMAIL_CONTACT, MARQUE, POINTS_DE_VENTE, RAISON_SOCIALE } from '@/lib/entreprise'
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

const ACTIVITES = [
  {
    titre: 'Commerce général',
    texte: 'Un assortiment de produits du quotidien pour les foyers et les revendeurs.',
  },
  {
    titre: 'Distribution alimentaire',
    texte: 'Riz, farines, semoules, sucre, huiles et autres produits de première nécessité.',
  },
  {
    titre: 'Vente en gros',
    texte: 'La vente de produits alimentaires pour les revendeurs.',
  },
  {
    titre: 'Vente au détail',
    texte: 'La vente de produits alimentaires pour les particuliers.',
  },
]

const ETAPES = [
  'Ajoutez vos produits au panier.',
  'Recevez un code valable 24 heures.',
  'Présentez le code en boutique et payez sur place.',
]

const ACHEMINEMENT = [
  'Acheminement des marchandises',
  'Réception des marchandises',
  'Formalités de dédouanement',
]

function Accueil() {
  const { produits, promotion } = Route.useLoaderData()
  const nombreVilles = new Set(POINTS_DE_VENTE.map((point) => point.ville)).size
  const chiffres = [
    { valeur: String(nombreVilles), libelle: 'villes' },
    { valeur: String(POINTS_DE_VENTE.length), libelle: 'points de vente' },
    { valeur: String(produits.length).padStart(2, '0'), libelle: 'références au catalogue' },
    { valeur: '24 h', libelle: 'de réservation' },
  ]

  return (
    <main>
      <section
        className="relative isolate flex min-h-[calc(100svh-4.5rem)] flex-col overflow-hidden bg-marque-nuit text-creme sm:min-h-[calc(100svh-5rem)]"
        aria-label={`Présentation de ${RAISON_SOCIALE}`}
      >
        <img
          src="/images/accueil/marche-grains.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-30 h-full w-full object-cover object-center opacity-25"
        />
        <div
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_20%,rgba(80,192,144,0.2),transparent_36%),radial-gradient(circle_at_72%_78%,rgba(240,80,48,0.16),transparent_34%),linear-gradient(90deg,rgba(32,32,64,0.98)_0%,rgba(32,32,64,0.9)_48%,rgba(32,32,64,0.62)_100%)]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 -z-10 opacity-[0.12] [background-image:linear-gradient(rgba(250,249,246,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(250,249,246,0.25)_1px,transparent_1px)] [background-size:64px_64px]"
          aria-hidden="true"
        />
        <svg
          viewBox="0 0 600 600"
          className="absolute -top-40 -right-40 -z-10 h-[42rem] w-[42rem] text-marque-vert/15"
          aria-hidden="true"
        >
          <circle cx="300" cy="300" r="220" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="300" cy="300" r="160" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="300" cy="300" r="100" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>

        <div className="hero-grille conteneur-site relative grid flex-1 gap-4 py-5 sm:gap-8 sm:py-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-14 lg:py-14">
          <div className="hero-entre relative z-10">
            <p className="inline-flex items-center gap-3 border border-creme/25 bg-creme/5 px-2.5 py-1.5 text-[0.55rem] font-semibold tracking-[0.22em] text-creme/80 uppercase sm:px-3 sm:py-2 sm:text-[0.62rem]">
              <img
                src="/images/marque/bokhismany-logo-officiel.png"
                alt=""
                aria-hidden="true"
                className="h-8 w-8 rounded-[2px] object-cover ring-1 ring-creme/30"
              />
              <span className="h-1.5 w-1.5 rounded-full bg-marque-vert" aria-hidden="true" />
              Kinshasa · Brazzaville
            </p>
            <h1 className="mt-4 font-display text-[2.15rem] font-bold leading-[0.95] tracking-[-0.05em] sm:mt-6 sm:text-[clamp(2.7rem,5vw,5.5rem)] sm:leading-[0.91] sm:tracking-[-0.06em]">
              <span className="relative block">
                <span className="inline-block bg-papier px-3.5 py-1.5 text-marque-bleu shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
                  Bokhismany
                </span>
                <span
                  className="mt-2 block h-[3px] w-24 bg-gradient-to-r from-marque-vert via-marque-fuchsia to-marque-orange sm:w-32"
                  aria-hidden="true"
                />
              </span>{' '}
              <span className="mt-3 block text-creme">
                Trading <span className="text-marque-orange">SARL</span>
              </span>
            </h1>
            <p className="mt-3 max-w-xl border-l-2 border-or pl-5 text-sm leading-relaxed text-creme/80 sm:mt-5 sm:text-lg">
              Riz, farines, huiles et produits de première nécessité, vendus en gros et au détail à
              Kinshasa et à Brazzaville.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 sm:mt-7">
              <Lien to="/produits" viewTransition className={CLASSE_BOUTON_OR}>
                Découvrir les produits <span aria-hidden="true">→</span>
              </Lien>
              <Lien
                to="/panier"
                viewTransition
                className="inline-flex min-h-12 items-center justify-center gap-2 border border-creme/50 px-7 text-sm font-semibold text-creme transition-colors hover:border-creme hover:bg-creme/10"
              >
                Composer un panier
              </Lien>
            </div>
            <dl className="hero-statistiques mt-8 hidden grid-cols-3 gap-4 border-t border-creme/20 pt-6 text-xs lg:grid">
              {[
                ['03', 'points de vente'],
                ['24 h', 'de réservation'],
                ['0', 'paiement en ligne'],
              ].map(([valeur, libelle]) => (
                <div key={libelle}>
                  <dt className="font-display text-xl text-marque-vert sm:text-2xl">{valeur}</dt>
                  <dd className="mt-1 leading-snug text-creme/65">{libelle}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="hero-vitrine relative z-10 mx-auto w-full max-w-[30rem] lg:max-w-none">
            <div className="hero-vitrine-image relative ml-auto aspect-[16/10] w-full overflow-hidden border border-creme/20 bg-[#8b7c6b] shadow-2xl lg:aspect-[4/5] lg:w-[82%]">
              <img
                src="/images/accueil/etale-cereales.jpg"
                alt="Étal de céréales sur un marché"
                fetchPriority="high"
                className="h-full w-full object-cover object-center"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"
                aria-hidden="true"
              />
              <p className="absolute right-4 bottom-4 left-4 text-xs leading-relaxed text-creme/85">
                Distribution de produits alimentaires de première nécessité.
              </p>
            </div>
            <div className="absolute -bottom-6 left-0 hidden aspect-[4/3] w-[46%] overflow-hidden border-4 border-marque-nuit bg-[#8b7c6b] shadow-xl lg:block">
              <img
                src="/images/accueil/chargement-sacs.jpg"
                alt="Chargement de sacs de marchandises"
                fetchPriority="high"
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="hero-flottant absolute -top-5 left-[4%] hidden w-52 border border-encre/10 bg-creme p-4 text-marine shadow-2xl lg:block lg:w-56">
              <p className="text-[0.6rem] font-semibold tracking-[0.2em] text-marque-fuchsia uppercase">
                Nos métiers
              </p>
              <p className="mt-2 font-display text-xl leading-tight">Gros & détail</p>
              <p className="mt-1 text-xs leading-relaxed text-encre-douce">
                Pour les foyers comme pour les revendeurs.
              </p>
            </div>
            <p className="absolute top-1/3 -right-2 hidden bg-marque-orange px-3 py-4 text-[0.6rem] font-semibold tracking-[0.2em] text-creme uppercase [writing-mode:vertical-rl] lg:block">
              Commerce général
            </p>
            <div
              className="absolute right-[9%] -bottom-10 hidden h-24 w-24 rounded-full border border-marque-vert/50 lg:block"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="relative z-10 overflow-hidden border-t border-creme/15 bg-black/25">
          <div
            className="hero-marquee flex w-max gap-10 py-2 text-[0.62rem] font-semibold tracking-[0.28em] text-creme/60 uppercase"
            aria-hidden="true"
          >
            {[0, 1].map((copie) => (
              <span key={copie} className="flex shrink-0 gap-10">
                {[
                  'Commerce général',
                  'Distribution alimentaire',
                  'Vente en gros et au détail',
                  'Acheminement Brazzaville — RDC',
                  MARQUE,
                ].map((libelle) => (
                  <span key={libelle} className="flex items-center gap-10">
                    {libelle}
                    <span className="h-1 w-1 rounded-full bg-marque-orange" />
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {promotion.active ? (
          <div className="relative z-10 border-t border-or/40 bg-or-pale text-marine" aria-label="Promotion en cours">
            <div className="conteneur-site flex flex-col gap-1.5 py-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:py-3 sm:text-sm">
              <p className="font-semibold">{promotion.message}</p>
              <Lien
                to="/produits"
                viewTransition
                className="lien-editorial self-start text-xs sm:self-auto sm:text-sm"
              >
                Voir la sélection →
              </Lien>
            </div>
          </div>
        ) : null}
      </section>

      <section className="conteneur-site py-14 lg:py-20" aria-labelledby="maison-titre">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
          <Reveal>
            <div className="border border-encre/10 bg-papier p-3">
              <img
                src="/images/accueil/etale-cereales.jpg"
                alt="Illustration d’un étal de céréales sur un marché"
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal delai={80}>
            <div>
              <p className="etiquette text-or">Qui sommes-nous</p>
              <h2
                id="maison-titre"
                className="mt-5 font-display text-3xl leading-tight text-marine sm:text-4xl"
              >
                Une maison de commerce ancrée à Kinshasa
              </h2>
              <p className="mt-6 text-base leading-relaxed text-encre-douce">
                {RAISON_SOCIALE} est une entreprise de commerce général basée à Kinshasa, avec un
                point de vente à Brazzaville. Nous approvisionnons nos clients en produits
                alimentaires de base : riz, farine, semoule, sucre, huiles et autres produits du
                quotidien.
              </p>
              <p className="mt-4 text-base leading-relaxed text-encre-douce">
                À travers {MARQUE}, nous accueillons les particuliers comme les revendeurs. Nous
                attachons de l’importance à la qualité des produits, à la transparence des prix et à
                la disponibilité en boutique.
              </p>
              <dl className="mt-8 grid gap-5 border-t border-encre/10 pt-6 sm:grid-cols-3">
                {[
                  ['Siège', 'Kinshasa'],
                  ['Marque', MARQUE],
                  ['Points de vente', String(POINTS_DE_VENTE.length)],
                ].map(([terme, valeur]) => (
                  <div key={terme}>
                    <dt className="text-xs text-encre-douce">{terme}</dt>
                    <dd className="mt-1 text-sm font-semibold text-marine">{valeur}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-sm leading-relaxed text-encre-douce">
                Notre expérience conjugue la distribution en boutique et l’acheminement de
                marchandises entre Brazzaville et la RDC.
              </p>
              <Lien to="/a-propos" viewTransition className="lien-editorial mt-6 inline-block text-sm">
                Lire notre présentation →
              </Lien>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="surface-claire py-14 lg:py-20" aria-labelledby="activites-titre">
        <div className="conteneur-site">
          <Reveal>
            <div className="flex flex-col gap-6 border-b border-encre/10 pb-8 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="etiquette text-or">Nos activités</p>
                <h2 id="activites-titre" className="mt-4 font-display text-3xl text-marine sm:text-4xl">
                  Ce que nous faisons, au quotidien
                </h2>
              </div>
              <Lien to="/a-propos" viewTransition className="lien-editorial self-start text-sm sm:self-auto">
                En savoir plus →
              </Lien>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {ACTIVITES.map((activite, index) => (
              <Reveal key={activite.titre} delai={index * 60}>
                <article className="h-full border-t-2 border-marine pt-5">
                  <span className="font-display text-3xl text-or/70">0{index + 1}</span>
                  <h3 className="mt-5 text-xl leading-snug text-marine">{activite.titre}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-encre-douce">{activite.texte}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="conteneur-site py-14 lg:py-16" aria-labelledby="portee-titre">
        <div className="flex flex-col gap-4 border-b border-encre/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="etiquette text-or">Notre portée</p>
            <h2 id="portee-titre" className="mt-4 font-display text-3xl text-marine sm:text-4xl">
              Deux villes, trois points de vente
            </h2>
          </div>
          <Lien to="/adresses" viewTransition className="lien-editorial self-start text-sm sm:self-auto">
            Voir les adresses →
          </Lien>
        </div>
        <dl className="grid grid-cols-2 gap-y-10 pt-10 lg:grid-cols-4">
          {chiffres.map((chiffre) => (
            <div key={chiffre.libelle} className="border-l border-encre/15 pl-5">
              <dd className="font-display text-4xl text-marine sm:text-5xl">{chiffre.valeur}</dd>
              <dt className="mt-2 text-sm text-encre-douce">{chiffre.libelle}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section
        id="catalogue"
        className="conteneur-site py-14 lg:py-20"
        aria-labelledby="selection-titre"
      >
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

      <section className="conteneur-site py-14 lg:py-20" aria-labelledby="logistique-titre">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
          <Reveal>
            <div>
              <div className="border border-encre/10 bg-papier p-3">
                <img
                  src="/images/accueil/chargement-sacs.jpg"
                  alt="Illustration du chargement de sacs sur un camion"
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-encre-douce">
                Acheminement et réception de marchandises entre Brazzaville et la RDC.
              </p>
            </div>
          </Reveal>
          <Reveal delai={80}>
            <div>
              <p className="etiquette text-or">Logistique</p>
              <h2 id="logistique-titre" className="mt-5 font-display text-3xl text-marine sm:text-4xl">
                Acheminement entre Brazzaville et la RDC
              </h2>
              <p className="mt-6 text-base leading-relaxed text-encre-douce">
                Notre activité couvre également l’acheminement, la réception et les formalités de
                dédouanement de marchandises entre les deux villes.
              </p>
              <ul className="mt-8 space-y-4">
                {ACHEMINEMENT.map((etape) => (
                  <li
                    key={etape}
                    className="flex gap-3 border-b border-encre/10 pb-4 text-sm text-encre-douce"
                  >
                    <span className="text-or" aria-hidden="true">
                      —
                    </span>
                    {etape}
                  </li>
                ))}
              </ul>
              <Lien to="/contact" viewTransition className="lien-editorial mt-8 inline-block text-sm">
                Échanger sur un acheminement →
              </Lien>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="surface-claire" aria-labelledby="reserver-titre">
        <div className="conteneur-site grid py-14 lg:grid-cols-2 lg:py-20">
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
              {ETAPES.map((etape, index) => (
                <li key={etape} className="flex gap-4">
                  <span className="font-display text-2xl text-or">0{index + 1}</span>
                  <p className="text-sm leading-relaxed text-encre-douce">{etape}</p>
                </li>
              ))}
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

      <section className="conteneur-site py-14 lg:py-20" aria-labelledby="points-titre">
        <div className="flex flex-col gap-6 border-b border-encre/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="etiquette text-or">{MARQUE}</p>
            <h2 id="points-titre" className="mt-4 font-display text-3xl text-marine sm:text-4xl">
              Trois points de vente pour vous accueillir
            </h2>
          </div>
          <Lien to="/adresses" viewTransition className="lien-editorial self-start text-sm sm:self-auto">
            Toutes les adresses →
          </Lien>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {POINTS_DE_VENTE.map((point, index) => (
            <Reveal key={point.nom} delai={index * 60}>
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
      </section>

      <section className="bg-marine text-creme" aria-labelledby="contact-titre">
        <div className="conteneur-site flex flex-col gap-8 py-14 md:flex-row md:items-end md:justify-between lg:py-16">
          <div className="max-w-2xl">
            <p className="etiquette text-or-pale">Commande en gros</p>
            <h2 id="contact-titre" className="mt-5 font-display text-3xl leading-tight sm:text-4xl">
              Une question sur un produit ou une quantité ?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-creme/70">
              Écrivez-nous à{' '}
              <a href={`mailto:${EMAIL_CONTACT}`} className="text-or-pale underline underline-offset-4">
                {EMAIL_CONTACT}
              </a>
              .
            </p>
          </div>
          <Lien to="/contact" viewTransition className={`${CLASSE_BOUTON_OR} shrink-0`}>
            Nous contacter →
          </Lien>
        </div>
      </section>
    </main>
  )
}
