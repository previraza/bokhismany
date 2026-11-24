import { createServerFn } from '@tanstack/react-start'
import { asc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { CATEGORIES, LIBELLES_CATEGORIES, slugifyCategory } from '@/lib/categories'
import { db } from '@/lib/db/client'
import { categories, productCategories } from '@/lib/db/schema'
import { schemaCategorie } from '@/lib/validation'
import { setPrivateHeaders } from './headers'
import { exigerSession } from './session.server'

export interface CategoryOption {
  id: number
  slug: string
  label: string
}

export const listCategoriesFn = createServerFn({ method: 'GET' }).handler(async () => {
  const rows = await db
    .select({ id: categories.id, slug: categories.slug, label: categories.label })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.label))

  if (rows.length > 0) return rows

  return CATEGORIES.map((slug) => ({ id: 0, slug, label: LIBELLES_CATEGORIES[slug] }))
})

export const listCategoriesAdminFn = createServerFn({ method: 'GET' }).handler(async () => {
  await exigerSession()
  setPrivateHeaders()

  return db
    .select({
      id: categories.id,
      slug: categories.slug,
      label: categories.label,
      isActive: categories.isActive,
      products: sql<number>`(
        select count(*)::int from ${productCategories}
        where ${productCategories.categoryId} = ${categories.id}
      )`,
    })
    .from(categories)
    .orderBy(asc(categories.label))
})

export const createCategoryFn = createServerFn({ method: 'POST' })
  .validator(schemaCategorie)
  .handler(async ({ data }) => {
    await exigerSession()
    setPrivateHeaders()

    const label = data.label
    const [byLabel] = await db
      .select()
      .from(categories)
      .where(eq(categories.label, label))
      .limit(1)
    if (byLabel) return { id: byLabel.id, slug: byLabel.slug, label: byLabel.label }

    const slug = slugifyCategory(label)
    const [bySlug] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1)
    if (bySlug) return { id: bySlug.id, slug: bySlug.slug, label: bySlug.label }

    const [created] = await db
      .insert(categories)
      .values({ slug, label, isActive: true })
      .returning()
    return { id: created.id, slug: created.slug, label: created.label }
  })

export const toggleCategoryFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.number().int().positive(), isActive: z.boolean() }))
  .handler(async ({ data }) => {
    await exigerSession()
    setPrivateHeaders()
    await db.update(categories).set({ isActive: data.isActive }).where(eq(categories.id, data.id))
    return { success: true }
  })
