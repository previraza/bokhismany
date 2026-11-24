import { createServerFn } from '@tanstack/react-start'
import { and, asc, desc, eq, ilike, inArray, or } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { categories, productCategories, products, type Product } from '@/lib/db/schema'

const schemaFiltres = z
  .object({
    categorie: z.string().optional(),
    recherche: z.string().max(120).optional(),
    tri: z.enum(['nom', 'prix-asc', 'prix-desc']).optional(),
  })
  .optional()

export interface CatalogueProduct {
  id: number
  slug: string
  name: string
  category: string
  categorySlugs: string[]
  format: string | null
  priceFc: number
  description: string | null
  imageUrl: string | null
  stockStatus: 'disponible' | 'rupture'
  isActive: boolean
  createdAt: Date | null
}

async function withCategorySlugs(rows: Product[]): Promise<CatalogueProduct[]> {
  if (rows.length === 0) return []
  const [allCategories, links] = await Promise.all([
    db.select({ id: categories.id, slug: categories.slug }).from(categories),
    db
      .select()
      .from(productCategories)
      .where(inArray(productCategories.productId, rows.map((row) => row.id))),
  ])
  const slugById = new Map(allCategories.map((category) => [category.id, category.slug]))

  return rows.map((row) => ({
    ...row,
    categorySlugs: links
      .filter((link) => link.productId === row.id)
      .map((link) => slugById.get(link.categoryId))
      .filter((slug): slug is string => Boolean(slug)),
  }))
}

export const obtenirProduitsFn = createServerFn({ method: 'GET' })
  .validator(schemaFiltres)
  .handler(async ({ data }) => {
    const conditions = [eq(products.isActive, true)]

    const recherche = data?.recherche?.trim()
    if (recherche) {
      const motif = `%${recherche}%`
      const conditionRecherche = or(ilike(products.name, motif), ilike(products.description, motif))
      if (conditionRecherche) conditions.push(conditionRecherche)
    }

    const base = db.select().from(products).where(and(...conditions))
    const rows = await (() => {
      switch (data?.tri) {
        case 'prix-asc':
          return base.orderBy(asc(products.priceFc), asc(products.name))
        case 'prix-desc':
          return base.orderBy(desc(products.priceFc), asc(products.name))
        default:
          return base.orderBy(asc(products.name))
      }
    })()

    const avecCategories = await withCategorySlugs(rows)
    if (data?.categorie) {
      return avecCategories.filter((produit) => produit.categorySlugs.includes(data.categorie!))
    }
    return avecCategories
  })

export const obtenirProduitParSlugFn = createServerFn({ method: 'GET' })
  .validator(z.string().min(1))
  .handler(async ({ data }) => {
    const [produit] = await db
      .select()
      .from(products)
      .where(and(eq(products.slug, data), eq(products.isActive, true)))
      .limit(1)
    return produit ?? null
  })

/** Produits d’un panier partagé : seuls les slugs actifs sont résolus, les prix restent serveur. */
export const obtenirProduitsParSlugsFn = createServerFn({ method: 'GET' })
  .validator(z.array(z.string().min(1).max(120)).max(30))
  .handler(async ({ data }) => {
    if (data.length === 0) return []
    const lignes = await db
      .select()
      .from(products)
      .where(and(eq(products.isActive, true), inArray(products.slug, data)))
    return lignes.map((produit) => ({
      slug: produit.slug,
      nom: produit.name,
      categorie: produit.category,
      format: produit.format,
      prixFc: produit.priceFc,
      quantite: 1,
    }))
  })

export const obtenirProduitsPharesFn = createServerFn({ method: 'GET' }).handler(async () => {
  return db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(asc(products.id))
    .limit(4)
})
