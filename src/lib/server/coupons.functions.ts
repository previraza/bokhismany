import { createServerFn } from '@tanstack/react-start'
import { asc, desc, eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { categories, coupons, products } from '@/lib/db/schema'
import { schemaCoupon, schemaVerificationCoupons } from '@/lib/validation'
import { calculateCartAmounts } from './coupons.server'
import { setPrivateHeaders } from './headers'
import { exigerSession } from './session.server'

export const validateCouponsFn = createServerFn({ method: 'POST' })
  .validator(schemaVerificationCoupons)
  .handler(async ({ data }) => {
    const articles = data.articles.map((article) => ({
      slug: article.slug,
      quantity: article.quantity,
    }))
    const result = await calculateCartAmounts(articles, data.codes)
    return {
      coupons: result.coupons,
      subtotalFc: result.subtotalFc,
      discountFc: result.discountFc,
      totalFc: result.totalFc,
      messages: result.messages,
      unavailable: result.unavailable,
    }
  })

export const listCouponsAdminFn = createServerFn({ method: 'GET' }).handler(async () => {
  await exigerSession()
  setPrivateHeaders()
  return db.select().from(coupons).orderBy(desc(coupons.createdAt)).limit(200)
})

export const saveCouponFn = createServerFn({ method: 'POST' })
  .validator(schemaCoupon)
  .handler(async ({ data }) => {
    await exigerSession()
    setPrivateHeaders()

    const existing = await db
      .select({ id: coupons.id })
      .from(coupons)
      .where(eq(coupons.code, data.code))
      .limit(1)
    if (existing.some((coupon) => coupon.id !== data.id)) {
      throw new Error('Ce code de réduction existe déjà.')
    }

    if (data.scope !== 'all' && data.targets.length === 0) {
      throw new Error('Sélectionnez au moins une cible pour ce coupon.')
    }
    if (data.scope === 'products') {
      const found = await db.select({ slug: products.slug }).from(products).where(inArray(products.slug, data.targets))
      if (found.length !== data.targets.length) throw new Error('Un produit sélectionné est introuvable.')
    }
    if (data.scope === 'categories') {
      const found = await db.select({ slug: categories.slug }).from(categories).where(inArray(categories.slug, data.targets))
      if (found.length !== data.targets.length) throw new Error('Une catégorie sélectionnée est introuvable.')
    }

    const values = {
      code: data.code,
      type: data.type,
      value: data.value,
      scope: data.scope,
      targets: data.targets,
      isActive: data.isActive,
      maxUsages: data.maxUsages ?? null,
    }

    if (data.id) {
      await db.update(coupons).set(values).where(eq(coupons.id, data.id))
    } else {
      await db.insert(coupons).values(values)
    }
    return { success: true }
  })

export const listCouponTargetsFn = createServerFn({ method: 'GET' }).handler(async () => {
  await exigerSession()
  setPrivateHeaders()
  const [productRows, categoryRows] = await Promise.all([
    db.select({ slug: products.slug, name: products.name }).from(products).orderBy(asc(products.name)),
    db.select({ slug: categories.slug, label: categories.label }).from(categories).orderBy(asc(categories.label)),
  ])
  return { products: productRows, categories: categoryRows }
})
