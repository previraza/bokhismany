import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { EmptyState } from '@/components/EmptyState'
import { PageHero } from '@/components/PageHero'
import { ProductCard } from '@/components/ProductCard'
import { Reveal } from '@/components/Reveal'
import { CLASSE_CHAMP } from '@/lib/classes'
import { MENTION_ESTIMATION } from '@/lib/format'
import { metaPage } from '@/lib/seo'
import { listCategoriesFn } from '@/lib/server/categories.functions'
import { obtenirProduitsFn } from '@/lib/server/produits.functions'

type Tri = 'nom' | 'prix-asc' | 'prix-desc'
type FiltreCategorie = 'tous' | string

export const Route = createFileRoute('/produits')({
  head: () =>
    metaPage({
      titre: 'Produits',
      description:
        'Catalogue Bokhismany : riz, farines, semoules, huiles, sucre et autres produits du quotidien. Réservez en ligne et retirez en boutique.',
    }),
  loader: async () => {
    const [Produits, categories] = await Promise.all([obtenirProduitsFn(), listCategoriesFn()])
    return { produits: Produits, categories }
  },
  component: Catalogue,
})

function Catalogue() {
  const { produits, categories } = Route.useLoaderData()
  const rechercheInitiale = Route.useSearch()
  const slugInitial = rechercheInitiale.categorie ?? ''
  const categorieInitiale = categories.some((categorie) => categorie.slug === slugInitial)
    ? slugInitial
    : 'tous'
  const [categorie, setCategorie] = useState<FiltreCategorie>(categorieInitiale)
  const [recherche, setRecherche] = useState('')
  const [tri, setTri] = useState<Tri>('nom')

  const visibles = useMemo(() => {
    const terme = recherche.trim().toLocaleLowerCase('fr-FR')
    const resultat = produits.filter((produit) => {
      const dansCategorie = categorie === 'tous' || produit.categorySlugs.includes(categorie)
      const dansRecherche =
        terme.length === 0 ||
        produit.name.toLocaleLowerCase('fr-FR').includes(terme) ||
        (produit.description ?? '').toLocaleLowerCase('fr-FR').includes(terme)
      return dansCategorie && dansRecherche
    })

    return [...resultat].sort((a, b) => {
      if (tri === 'prix-asc') return a.priceFc - b.priceFc || a.name.localeCompare(b.name, 'fr')
      if (tri === 'prix-desc') return b.priceFc - a.priceFc || a.name.localeCompare(b.name, 'fr')
      return a.name.localeCompare(b.name, 'fr')
    })
  }, [produits, categorie, recherche, tri])

  return (
    <main>
      <PageHero
        surtitre="Catalogue"
        titre="Nos produits"
        description="Retrouvez tous nos produits alimentaires de première nécessité. Les prix sont indicatifs et confirmés en boutique lors du retrait."
        image="/images/couverture-produits.svg"
        imageAlt="Illustration de produits alimentaires de première nécessité"
        imageLegende="Sélection Daayake Food"
      />

      <section className="conteneur-site py-14 lg:py-20">
        <div className="border border-encre/10 bg-papier p-5 sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <label htmlFor="recherche-produits" className="text-sm font-semibold text-marine">
                Rechercher un produit
              </label>
              <div className="relative mt-2">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-encre-douce"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
                  <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
                <input
                  id="recherche-produits"
                  type="search"
                  value={recherche}
                  onChange={(evenement) => setRecherche(evenement.target.value)}
                  placeholder="Ex. Lion, huile, farine…"
                  className={`${CLASSE_CHAMP} pl-12`}
                />
              </div>
            </div>
            <div>
              <label htmlFor="tri-produits" className="text-sm font-semibold text-marine">
                Trier par
              </label>
              <select
                id="tri-produits"
                value={tri}
                onChange={(evenement) => setTri(evenement.target.value as Tri)}
                className={`${CLASSE_CHAMP} mt-2`}
              >
                <option value="nom">Nom (A → Z)</option>
                <option value="prix-asc">Prix croissant</option>
                <option value="prix-desc">Prix décroissant</option>
              </select>
            </div>
          </div>
          <div className="mt-7 border-t border-encre/10 pt-6">
            <p className="mb-3 text-sm font-semibold text-marine">Catégories</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
              <BoutonCategorie
                active={categorie === 'tous'}
                onClick={() => setCategorie('tous')}
                libelle="Tous les produits"
              />
              {categories.map((element) => (
                <BoutonCategorie
                  key={element.slug}
                  active={categorie === element.slug}
                  onClick={() => setCategorie(element.slug)}
                  libelle={element.label}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="text-sm text-encre-douce" aria-live="polite">
            {visibles.length} produit{visibles.length > 1 ? 's' : ''} affiché
            {visibles.length > 1 ? 's' : ''} sur {produits.length}
          </p>
          {categorie !== 'tous' || recherche.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setCategorie('tous')
                setRecherche('')
              }}
              className="text-sm font-semibold text-marine underline decoration-or underline-offset-4"
            >
              Réinitialiser les filtres
            </button>
          ) : null}
        </div>

        {visibles.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {visibles.map((produit, index) => (
              <Reveal
                key={produit.slug}
                delai={(index % 4) * 60}
                className={index === 0 ? 'col-span-2 lg:col-span-1' : undefined}
              >
                <ProductCard produit={produit} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              titre="Aucun produit ne correspond"
              description="Essayez un autre nom ou sélectionnez une autre catégorie avec les filtres ci-dessus."
            />
          </div>
        )}

        <p className="mt-10 border border-or/25 bg-or-pale/30 px-5 py-4 text-sm text-marine">
          {MENTION_ESTIMATION} La réservation ne déclenche aucun paiement en ligne.
        </p>
      </section>
    </main>
  )
}

function BoutonCategorie({
  active,
  onClick,
  libelle,
}: {
  active: boolean
  onClick: () => void
  libelle: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-11 border px-4 text-sm font-semibold transition-colors ${
        active
          ? 'border-marine bg-marine text-creme'
          : 'border-encre/15 text-encre-douce hover:border-marine hover:text-marine'
      }`}
    >
      {libelle}
    </button>
  )
}
