import { useState, type FormEvent } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ProductVisual } from '@/components/ProductVisual'
import { slugifyCategory } from '@/lib/categories'
import {
  CLASSE_BOUTON_OR,
  CLASSE_BOUTON_SECONDAIRE,
  CLASSE_CHAMP,
} from '@/lib/classes'
import type { Product } from '@/lib/db/schema'
import { formaterPrix } from '@/lib/format'
import { metaPage } from '@/lib/seo'
import {
  basculerProduitFn,
  enregistrerProduitFn,
  obtenirProduitsAdminFn,
} from '@/lib/server/admin.functions'
import {
  createCategoryFn,
  listCategoriesAdminFn,
} from '@/lib/server/categories.functions'
import { schemaProduitAdmin } from '@/lib/validation'

type ProduitAdmin = Product & { categorySlugs: string[] }
type Formulaire = {
  id?: number
  slug: string
  nom: string
  categorie: string
  categorySlugs: string[]
  format: string
  prixFc: number
  description: string
  imageUrl: string
  stockStatus: 'disponible' | 'rupture'
  isActive: boolean
}

const FORMULAIRE_VIDE: Formulaire = {
  slug: '',
  nom: '',
  categorie: 'riz',
  categorySlugs: ['riz'],
  format: '',
  prixFc: 0,
  description: '',
  imageUrl: '',
  stockStatus: 'disponible',
  isActive: true,
}

export const Route = createFileRoute('/admin/produits')({
  head: () => metaPage({ titre: 'Produits' }),
  loader: async () => {
    const [produits, options] = await Promise.all([
      obtenirProduitsAdminFn(),
      listCategoriesAdminFn(),
    ])
    return { produits, options }
  },
  component: ProduitsAdmin,
})

function ProduitsAdmin() {
  const { produits, options } = Route.useLoaderData()
  const routeur = useRouter()
  const [formulaire, setFormulaire] = useState<Formulaire>(FORMULAIRE_VIDE)
  const [erreurs, setErreurs] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [recherche, setRecherche] = useState('')
  const [nouvelleCategorie, setNouvelleCategorie] = useState('')
  const [creationCategorie, setCreationCategorie] = useState(false)

  const modifier = <C extends keyof Formulaire>(champ: C, valeur: Formulaire[C]) => {
    setFormulaire((etat) => ({ ...etat, [champ]: valeur }))
    setErreurs((etat) => ({ ...etat, [champ]: '' }))
  }

  const editer = (produit: ProduitAdmin) => {
    setFormulaire({
      id: produit.id,
      slug: produit.slug,
      nom: produit.name,
      categorie: produit.category,
      categorySlugs: produit.categorySlugs.length > 0 ? produit.categorySlugs : [produit.category],
      format: produit.format ?? '',
      prixFc: produit.priceFc,
      description: produit.description ?? '',
      imageUrl: produit.imageUrl ?? '',
      stockStatus: produit.stockStatus,
      isActive: produit.isActive,
    })
    setMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const reinitialiser = () => {
    setFormulaire(FORMULAIRE_VIDE)
    setErreurs({})
  }

  const basculerCategorie = (slug: string) => {
    setFormulaire((etat) => {
      const slugs = etat.categorySlugs.includes(slug)
        ? etat.categorySlugs.filter((element) => element !== slug)
        : [...etat.categorySlugs, slug]
      return {
        ...etat,
        categorySlugs: slugs,
        categorie: slugs[0] ?? 'autres',
      }
    })
  }

  const creerCategorie = async () => {
    const libelle = nouvelleCategorie.trim()
    if (libelle.length < 2) return
    setCreationCategorie(true)
    try {
      const categorie = await createCategoryFn({ data: { label: libelle } })
      setFormulaire((etat) => ({
        ...etat,
        categorySlugs: etat.categorySlugs.includes(categorie.slug)
          ? etat.categorySlugs
          : [...etat.categorySlugs, categorie.slug],
        categorie: etat.categorySlugs[0] ?? categorie.slug,
      }))
      setNouvelleCategorie('')
      setMessage(`Catégorie « ${categorie.label} » disponible.`)
      await routeur.invalidate()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Création de catégorie impossible.')
    } finally {
      setCreationCategorie(false)
    }
  }

  const soumettre = async (evenement: FormEvent<HTMLFormElement>) => {
    evenement.preventDefault()
    setMessage('')
    const analyse = schemaProduitAdmin.safeParse({
      ...formulaire,
      categorie: formulaire.categorySlugs[0] ?? formulaire.categorie,
      format: formulaire.format || undefined,
      description: formulaire.description || undefined,
      imageUrl: formulaire.imageUrl || undefined,
    })
    if (!analyse.success) {
      const nouvelles: Record<string, string> = {}
      for (const probleme of analyse.error.issues) {
        const champ = String(probleme.path[0])
        if (!nouvelles[champ]) nouvelles[champ] = probleme.message
      }
      setErreurs(nouvelles)
      return
    }
    setErreurs({})
    setEnvoi(true)
    try {
      await enregistrerProduitFn({ data: analyse.data })
      await routeur.invalidate()
      setMessage(formulaire.id ? 'Produit mis à jour.' : 'Produit ajouté au catalogue.')
      reinitialiser()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Enregistrement impossible.')
    } finally {
      setEnvoi(false)
    }
  }

  const basculer = async (produit: ProduitAdmin) => {
    setMessage('')
    try {
      await basculerProduitFn({ data: { id: produit.id, actif: !produit.isActive } })
      await routeur.invalidate()
      setMessage(
        produit.isActive
          ? `${produit.name} est masqué du catalogue public.`
          : `${produit.name} est de nouveau visible.`,
      )
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Modification impossible.')
    }
  }

  const visibles = produits.filter((produit) =>
    produit.name.toLocaleLowerCase('fr-FR').includes(recherche.trim().toLocaleLowerCase('fr-FR')),
  )

  return (
    <div>
      <header className="mb-8">
        <p className="text-xs font-semibold tracking-[0.28em] text-or uppercase">Catalogue</p>
        <h1 className="mt-3 text-3xl text-marine sm:text-4xl">Produits</h1>
        <p className="mt-3 text-sm text-encre-douce">
          Ajoutez un produit, choisissez une ou plusieurs catégories, modifiez un prix ou masquez
          une référence.
        </p>
      </header>

      {message ? (
        <p role="status" className="mb-6 border border-or/30 bg-or-pale/30 p-4 text-sm text-marine">
          {message}
        </p>
      ) : null}

      <section className="border border-encre/10 bg-papier p-6 sm:p-8">
        <h2 className="text-xl text-marine">
          {formulaire.id ? `Modifier ${formulaire.nom}` : 'Ajouter un produit'}
        </h2>
        <p className="mt-2 text-sm text-encre-douce">
          Les catégories peuvent être créées à la volée et un produit peut en porter plusieurs.
        </p>
        <form className="mt-7 grid gap-5 sm:grid-cols-2" onSubmit={soumettre} noValidate>
          <div className="sm:col-span-2">
            <label htmlFor="produit-nom" className="text-sm font-semibold text-marine">
              Nom du produit
            </label>
            <input
              id="produit-nom"
              value={formulaire.nom}
              onChange={(evenement) => modifier('nom', evenement.target.value)}
              aria-invalid={Boolean(erreurs.nom)}
              className={`${CLASSE_CHAMP} mt-2`}
            />
            {erreurs.nom ? <p className="mt-1 text-xs text-alerte">{erreurs.nom}</p> : null}
          </div>
          <div>
            <label htmlFor="produit-slug" className="text-sm font-semibold text-marine">
              Identifiant (slug)
            </label>
            <input
              id="produit-slug"
              value={formulaire.slug}
              onChange={(evenement) => modifier('slug', evenement.target.value)}
              aria-invalid={Boolean(erreurs.slug)}
              className={`${CLASSE_CHAMP} mt-2`}
              placeholder="riz-lion-50kg"
            />
            {erreurs.slug ? <p className="mt-1 text-xs text-alerte">{erreurs.slug}</p> : null}
          </div>
          <div>
            <label htmlFor="produit-prix" className="text-sm font-semibold text-marine">
              Prix indicatif (Fc)
            </label>
            <input
              id="produit-prix"
              type="number"
              min={1}
              value={formulaire.prixFc || ''}
              onChange={(evenement) => modifier('prixFc', Number(evenement.target.value))}
              aria-invalid={Boolean(erreurs.prixFc)}
              className={`${CLASSE_CHAMP} mt-2`}
            />
            {erreurs.prixFc ? <p className="mt-1 text-xs text-alerte">{erreurs.prixFc}</p> : null}
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm font-semibold text-marine">Catégories</p>
            <p className="mt-1 text-xs text-encre-douce">
              Cochez toutes les catégories qui correspondent à ce produit.
            </p>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Catégories du produit">
              {options.map((option) => (
                <label
                  key={option.id}
                  className={`flex min-h-11 cursor-pointer items-center gap-2 border px-3 text-sm ${
                    formulaire.categorySlugs.includes(option.slug)
                      ? 'border-marine bg-marine text-creme'
                      : 'border-encre/15 text-encre-douce'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formulaire.categorySlugs.includes(option.slug)}
                    onChange={() => basculerCategorie(option.slug)}
                    className="h-4 w-4 accent-[#2f6b52]"
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {erreurs.categorySlugs || erreurs.categorie ? (
              <p className="mt-2 text-xs text-alerte">
                {erreurs.categorySlugs ?? erreurs.categorie}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3" aria-label="Créer une catégorie">
              <label htmlFor="nouvelle-categorie" className="sr-only">
                Nouvelle catégorie
              </label>
              <input
                id="nouvelle-categorie"
                value={nouvelleCategorie}
                onChange={(evenement) => setNouvelleCategorie(evenement.target.value)}
                placeholder="Ex. Boissons"
                maxLength={60}
                className={`${CLASSE_CHAMP} max-w-xs flex-1`}
              />
              <button
                type="button"
                onClick={() => void creerCategorie()}
                disabled={creationCategorie || nouvelleCategorie.trim().length < 2}
                className="shrink-0 border border-marine px-4 text-sm font-semibold text-marine hover:bg-marine hover:text-creme disabled:opacity-50"
              >
                Créer la catégorie
              </button>
            </div>
            {nouvelleCategorie.trim().length >= 2 ? (
              <p className="mt-2 text-xs text-encre-douce">
                Identifiant prévu : {slugifyCategory(nouvelleCategorie)}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="produit-format" className="text-sm font-semibold text-marine">
              Format
            </label>
            <input
              id="produit-format"
              value={formulaire.format}
              onChange={(evenement) => modifier('format', evenement.target.value)}
              placeholder="Ex. Sac de 50 kg"
              className={`${CLASSE_CHAMP} mt-2`}
            />
          </div>
          <div>
            <label htmlFor="produit-stock" className="text-sm font-semibold text-marine">
              Disponibilité
            </label>
            <select
              id="produit-stock"
              value={formulaire.stockStatus}
              onChange={(evenement) =>
                modifier('stockStatus', evenement.target.value as Formulaire['stockStatus'])
              }
              className={`${CLASSE_CHAMP} mt-2`}
            >
              <option value="disponible">Disponible</option>
              <option value="rupture">En rupture</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="produit-description" className="text-sm font-semibold text-marine">
              Description
            </label>
            <textarea
              id="produit-description"
              rows={3}
              value={formulaire.description}
              onChange={(evenement) => modifier('description', evenement.target.value)}
              className={`${CLASSE_CHAMP} mt-2 resize-y py-3`}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="produit-image" className="text-sm font-semibold text-marine">
              URL de l’image (facultatif)
            </label>
            <input
              id="produit-image"
              value={formulaire.imageUrl}
              onChange={(evenement) => modifier('imageUrl', evenement.target.value)}
              className={`${CLASSE_CHAMP} mt-2`}
            />
          </div>
          <label htmlFor="produit-actif" className="flex min-h-11 items-center gap-3 text-sm text-marine">
            <input
              id="produit-actif"
              type="checkbox"
              checked={formulaire.isActive}
              onChange={(evenement) => modifier('isActive', evenement.target.checked)}
              className="h-5 w-5 accent-[#2f6b52]"
            />
            Visible dans le catalogue public
          </label>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button type="submit" disabled={envoi} className={CLASSE_BOUTON_OR}>
              {envoi ? 'Enregistrement…' : formulaire.id ? 'Mettre à jour' : 'Ajouter le produit'}
            </button>
            <button type="button" onClick={reinitialiser} className={CLASSE_BOUTON_SECONDAIRE}>
              Réinitialiser
            </button>
          </div>
        </form>
      </section>

      <section className="mt-10">
        <label htmlFor="recherche-admin-produits" className="text-sm font-semibold text-marine">
          Rechercher un produit
        </label>
        <input
          id="recherche-admin-produits"
          type="search"
          value={recherche}
          onChange={(evenement) => setRecherche(evenement.target.value)}
          placeholder="Nom du produit"
          className={`${CLASSE_CHAMP} mt-2 max-w-md`}
        />
        <p className="mt-5 text-sm text-encre-douce" aria-live="polite">
          {visibles.length} produit{visibles.length > 1 ? 's' : ''}
        </p>
        <ul className="mt-4 grid gap-3">
          {visibles.map((produit) => (
            <li
              key={produit.id}
              className="flex flex-wrap items-center gap-4 border border-encre/10 bg-papier p-4"
            >
              <div className="h-16 w-16 shrink-0">
                <ProductVisual
                  slug={produit.slug}
                  nom={produit.name}
                  categorie={produit.category}
                  imageUrl={produit.imageUrl}
                  active={produit.isActive}
                  className="h-full w-full"
                />
              </div>
              <div className="min-w-[12rem] flex-1">
                <p className="font-semibold text-marine">{produit.name}</p>
                <p className="mt-1 text-xs text-encre-douce">
                  {produit.categorySlugs.length > 0
                    ? produit.categorySlugs
                        .map((slug) => options.find((option) => option.slug === slug)?.label ?? slug)
                        .join(' · ')
                    : produit.category}
                </p>
              </div>
              <p className="font-semibold tabular-nums text-marine">{formaterPrix(produit.priceFc)}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => editer(produit)}
                  className="min-h-11 border border-marine px-4 text-sm font-semibold text-marine hover:bg-marine hover:text-creme"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => basculer(produit)}
                  className="min-h-11 border border-encre/20 px-4 text-sm font-semibold text-encre-douce hover:border-marine hover:text-marine"
                >
                  {produit.isActive ? 'Masquer' : 'Réactiver'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
