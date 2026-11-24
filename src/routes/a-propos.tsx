import { createFileRoute } from '@tanstack/react-router'
import { Lien } from '@/components/Lien'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'
import { CLASSE_BOUTON_SECONDAIRE } from '@/lib/classes'
import { EMAIL_CONTACT, MARQUE, RAISON_SOCIALE } from '@/lib/entreprise'
import { metaPage } from '@/lib/seo'
import { obtenirEquipeFn } from '@/lib/server/equipe.functions'

export const Route = createFileRoute('/a-propos')({
  head: () =>
    metaPage({
      titre: 'À propos',
      description:
        'Découvrez Bokhismany Trading SARL et sa marque de points de vente Daayake Food, entre Kinshasa et Brazzaville.',
    }),
  loader: () => obtenirEquipeFn(),
  component: APropos,
})

const ENGAGEMENTS = [
  {
    titre: 'Qualité des produits',
    texte: 'Une sélection de produits alimentaires de première nécessité pour nos rayons.',
  },
  {
    titre: 'Transparence des prix',
    texte: 'Des prix indicatifs visibles sur chaque fiche produit, confirmés en boutique.',
  },
  {
    titre: 'Disponibilité en boutique',
    texte: 'Trois points de vente pour retirer votre panier réservé en ligne.',
  },
]

const EN_BREF = [
  ['Activité', 'Commerce général et distribution alimentaire'],
  ['Marque', MARQUE],
  ['Villes', 'Kinshasa et Brazzaville'],
  ['Clientèle', 'Particuliers et revendeurs'],
]

function APropos() {
  const equipe = Route.useLoaderData()

  return (
    <main>
      <PageHero
        surtitre="Notre entreprise"
        titre="Une entreprise de commerce général, ancrée à Kinshasa"
        description="Distribution de produits alimentaires de première nécessité, en gros et au détail, entre Brazzaville et la RDC."
        image="/images/couverture-boutique.svg"
        imageAlt="Illustration d’un point de vente alimentaire avec étagères et comptoir"
        imageLegende="Nos points de vente Daayake Food"
      />

      <section className="conteneur-site py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16">
          <Reveal>
            <article className="max-w-3xl">
              <p className="text-xs font-semibold tracking-[0.28em] text-or uppercase">
                Qui sommes-nous ?
              </p>
              <h2 className="mt-4 text-3xl leading-tight text-marine sm:text-4xl">
                {RAISON_SOCIALE}
              </h2>
              <div className="mt-7 space-y-5 text-base leading-relaxed text-encre-douce">
                <p>
                  Bokhismany Trading SARL est une entreprise de commerce général basée à Kinshasa,
                  avec un point de vente à Brazzaville. Nous approvisionnons nos clients en produits
                  alimentaires de base : riz, farine, semoule, sucre, huiles et autres produits du
                  quotidien.
                </p>
                <p>
                  Notre marque de points de vente, {MARQUE}, accueille les particuliers comme les
                  revendeurs. Nous attachons de l’importance à la qualité des produits, à la
                  transparence des prix et à la disponibilité en boutique.
                </p>
                <p>
                  Notre activité couvre également l’acheminement, la réception et les formalités de
                  dédouanement de marchandises entre Brazzaville et la RDC.
                </p>
              </div>
              <div className="mt-9 border border-dashed border-or/40 bg-or-pale/25 p-6 text-sm text-encre-douce">
                <p className="font-semibold text-marine">Complément à fournir par Bokhismany</p>
                <p className="mt-2">
                  TODO — histoire de l’entreprise et date de création.
                </p>
              </div>
            </article>
          </Reveal>

          <Reveal delai={100}>
            <aside className="h-full border border-encre/10 bg-papier p-7">
              <img
                src="/images/marque/daayake-food.png"
                alt={`Logo de ${MARQUE}`}
                className="mb-8 h-28 w-28 object-contain"
              />
              <p className="text-xs font-semibold tracking-[0.25em] text-or uppercase">En bref</p>
              <dl className="mt-6 space-y-6 text-sm">
                {EN_BREF.map(([terme, valeur]) => (
                  <div key={terme} className="border-b border-encre/10 pb-5 last:border-0 last:pb-0">
                    <dt className="text-xs text-encre-douce">{terme}</dt>
                    <dd className="mt-1 font-semibold text-marine">{valeur}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8 border-t border-encre/10 pt-6">
                <p className="text-xs text-encre-douce">Une question ?</p>
                <a
                  href={`mailto:${EMAIL_CONTACT}`}
                  className="mt-2 block break-all text-sm font-semibold text-marine underline decoration-or underline-offset-4"
                >
                  {EMAIL_CONTACT}
                </a>
                <Lien to="/contact" className={`${CLASSE_BOUTON_SECONDAIRE} mt-6 w-full`}>
                  Écrire à Bokhismany
                </Lien>
              </div>
            </aside>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-encre/8 bg-papier/70 py-16 lg:py-24" aria-labelledby="equipe-titre">
        <div className="conteneur-site">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.28em] text-or uppercase">
              Gouvernance
            </p>
            <h2 id="equipe-titre" className="mt-4 text-3xl text-marine sm:text-4xl">
              Équipe dirigeante
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-encre-douce">
              Les personnes qui dirigent {RAISON_SOCIALE}, renseignées par l’entreprise elle-même.
            </p>
          </Reveal>

          {equipe.length === 0 ? (
            <div className="mt-10 border border-dashed border-or/40 bg-or-pale/25 p-6 text-sm text-encre-douce">
              <p className="font-semibold text-marine">Informations à fournir</p>
              <p className="mt-2">
                TODO — nom, fonction et présentation de l’équipe dirigeante. Ces informations
                seront publiées ici dès validation par Bokhismany.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {equipe.map((membre, index) => (
                <Reveal key={membre.id} delai={index * 80}>
                  <article className="h-full border border-encre/10 bg-papier p-6">
                    {membre.photoUrl ? (
                      <img
                        src={membre.photoUrl}
                        alt={`Photo de ${membre.nom}`}
                        className="mb-6 aspect-square w-full border border-encre/10 object-cover"
                      />
                    ) : (
                      <div className="mb-6 flex aspect-square w-full items-center justify-center border border-encre/10 bg-creme">
                        <span className="font-display text-6xl text-or">
                          {membre.nom.slice(0, 1).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <h3 className="text-xl leading-snug text-marine">{membre.nom}</h3>
                    <p className="mt-1 text-xs font-semibold tracking-[0.16em] text-or uppercase">
                      {membre.fonction}
                    </p>
                    {membre.biographie ? (
                      <p className="mt-4 text-sm leading-relaxed text-encre-douce">
                        {membre.biographie}
                      </p>
                    ) : null}
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="conteneur-site py-16 lg:py-24">
        <Reveal>
          <h2 className="text-3xl text-marine sm:text-4xl">Nos engagements</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {ENGAGEMENTS.map((engagement, index) => (
            <Reveal key={engagement.titre} delai={index * 80}>
              <article className="h-full border border-encre/10 bg-papier p-6">
                <span className="text-xs font-semibold tracking-[0.25em] text-or">
                  0{index + 1}
                </span>
                <h3 className="mt-4 text-lg text-marine">{engagement.titre}</h3>
                <p className="mt-3 text-sm leading-relaxed text-encre-douce">
                  {engagement.texte}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  )
}
