import { and, eq, inArray, isNull, lt, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import {
  categories,
  coupons,
  productCategories,
  products,
  type Coupon,
} from '@/lib/db/schema'
import type { AppliedCoupon } from '@/lib/cart'
import { formaterPrix } from '@/lib/format'

export interface PanierArticle {
  slug: string
  quantity: number
}

export interface CartAmounts {
  subtotalFc: number
  discountFc: number
  totalFc: number
  coupons: AppliedCoupon[]
  messages: string[]
  unavailable: string[]
}

function couponLabel(coupon: Coupon): string {
  const reduction =
    coupon.type === 'percentage' ? `-${coupon.value} %` : `-${formaterPrix(coupon.value)}`
  if (coupon.scope === 'all') return `${reduction} sur tout le panier`
  if (coupon.scope === 'categories') return `${reduction} sur une catégorie`
  return `${reduction} sur un produit`
}

/**
 * Recalculates every amount from the database. Client-side prices and totals
 * are never trusted. Discounts are added together then capped at 100%.
 */
export async function calculateCartAmounts(
  articles: readonly PanierArticle[],
  codes: readonly string[],
): Promise<CartAmounts> {
  const messages: string[] = []
  const uniqueCodes = [...new Set(codes.map((code) => code.trim().toUpperCase()).filter(Boolean))]
  const unavailable: string[] = []

  const foundProducts = articles.length
    ? await db.select().from(products).where(inArray(products.slug, articles.map((item) => item.slug)))
    : []
  const bySlug = new Map(foundProducts.map((product) => [product.slug, product]))

  for (const article of articles) {
    const product = bySlug.get(article.slug)
    if (!product || !product.isActive || product.stockStatus === 'rupture') {
      unavailable.push(article.slug)
    }
  }

  const subtotalFc = articles.reduce((total, article) => {
    const product = bySlug.get(article.slug)
    return product ? total + product.priceFc * article.quantity : total
  }, 0)

  if (uniqueCodes.length === 0) {
    return { subtotalFc, discountFc: 0, totalFc: subtotalFc, coupons: [], messages, unavailable }
  }
  if (uniqueCodes.length > 5) {
    return {
      subtotalFc,
      discountFc: 0,
      totalFc: subtotalFc,
      coupons: [],
      messages: ['Vous pouvez appliquer au maximum 5 coupons sur un panier.'],
      unavailable,
    }
  }

  const foundCoupons = await db.select().from(coupons).where(inArray(coupons.code, uniqueCodes))
  const couponByCode = new Map(foundCoupons.map((coupon) => [coupon.code, coupon]))

  const categoryByProduct = new Map<number, Set<string>>()
  const productIds = [...new Set(foundProducts.map((product) => product.id))]
  if (productIds.length > 0) {
    const links = await db
      .select({ productId: productCategories.productId, slug: categories.slug })
      .from(productCategories)
      .innerJoin(categories, eq(productCategories.categoryId, categories.id))
      .where(inArray(productCategories.productId, productIds))
    for (const link of links) {
      const set = categoryByProduct.get(link.productId) ?? new Set<string>()
      set.add(link.slug)
      categoryByProduct.set(link.productId, set)
    }
  }

  let rawDiscountFc = 0
  const applied: AppliedCoupon[] = []

  for (const code of uniqueCodes) {
    const coupon = couponByCode.get(code)
    if (!coupon || !coupon.isActive) {
      messages.push(`Le coupon ${code} n’est pas disponible.`)
      continue
    }
    if (coupon.maxUsages !== null && coupon.usages >= coupon.maxUsages) {
      messages.push(`Le coupon ${code} a atteint sa limite d’utilisation.`)
      continue
    }

    const applicable = articles.filter((article) => {
      const product = bySlug.get(article.slug)
      if (!product) return false
      if (coupon.scope === 'all') return true
      if (coupon.scope === 'products') return coupon.targets.includes(article.slug)
      if (coupon.targets.includes(product.category)) return true
      return Boolean(categoryByProduct.get(product.id)?.size)
        ? [...(categoryByProduct.get(product.id) ?? [])].some((slug) => coupon.targets.includes(slug))
        : false
    })

    const baseFc = applicable.reduce((total, article) => {
      const product = bySlug.get(article.slug)
      return product ? total + product.priceFc * article.quantity : total
    }, 0)

    if (baseFc === 0) {
      messages.push(`Le coupon ${code} ne s’applique à aucun produit du panier.`)
      continue
    }

    const discountFc =
      coupon.type === 'percentage'
        ? Math.floor((baseFc * coupon.value) / 100)
        : Math.min(coupon.value, baseFc)
    rawDiscountFc += discountFc
    applied.push({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      scope: coupon.scope,
      label: couponLabel(coupon),
    })
  }

  const discountFc = Math.min(rawDiscountFc, subtotalFc)
  return {
    subtotalFc,
    discountFc,
    totalFc: subtotalFc - discountFc,
    coupons: applied,
    messages,
    unavailable,
  }
}

export async function consumeCoupons(codes: readonly string[]): Promise<void> {
  const uniqueCodes = [...new Set(codes.map((code) => code.trim().toUpperCase()).filter(Boolean))]
  for (const code of uniqueCodes) {
    await db
      .update(coupons)
      .set({ usages: sql`${coupons.usages} + 1` })
      .where(
        and(
          eq(coupons.code, code),
          or(isNull(coupons.maxUsages), lt(coupons.usages, sql`${coupons.maxUsages}`)),
        ),
      )
  }
}
