import { createServerFn } from '@tanstack/react-start'
import { and, asc, desc, eq, ilike, or } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { products } from '@/lib/db/schema'
import { estCategorie } from '@/lib/categories'

const schemaFiltres = z
  .object({
    categorie: z.string().optional(),
    recherche: z.string().max(120).optional(),
    tri: z.enum(['nom', 'prix-asc', 'prix-desc']).optional(),
  })
  .optional()

export const obtenirProduitsFn = createServerFn({ method: 'GET' })
  .validator(schemaFiltres)
  .handler(async ({ data }) => {
    const conditions = [eq(products.isActive, true)]

    if (data?.categorie && estCategorie(data.categorie)) {
      conditions.push(eq(products.category, data.categorie))
    }

    const recherche = data?.recherche?.trim()
    if (recherche) {
      const motif = `%${recherche}%`
      const conditionRecherche = or(ilike(products.name, motif), ilike(products.description, motif))
      if (conditionRecherche) conditions.push(conditionRecherche)
    }

    const base = db.select().from(products).where(and(...conditions))

    switch (data?.tri) {
      case 'prix-asc':
        return base.orderBy(asc(products.priceFc), asc(products.name))
      case 'prix-desc':
        return base.orderBy(desc(products.priceFc), asc(products.name))
      default:
        return base.orderBy(asc(products.name))
    }
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

export const obtenirProduitsPharesFn = createServerFn({ method: 'GET' }).handler(async () => {
  return db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(asc(products.id))
    .limit(4)
})
