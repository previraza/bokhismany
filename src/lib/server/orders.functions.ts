import { randomInt } from 'node:crypto'
import { createServerFn } from '@tanstack/react-start'
import { and, asc, desc, eq, gte, ilike, inArray, like, or, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import {
  invoices,
  orderItems,
  orders,
  products,
  reservationItems,
  reservations,
  type OrderStatus,
} from '@/lib/db/schema'
import { schemaAjusterCommande, schemaCommandeDepuisPanier } from '@/lib/validation'
import { calculateCartAmounts, consumeCoupons } from './coupons.server'
import { setPrivateHeaders } from './headers'
import { exigerSession } from './session.server'

const REFERENCE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const LIMITE_PAR_HEURE = 5
const MESSAGE_INDISPONIBLE =
  "Ce produit n'est plus disponible. Retirez-le du panier pour continuer."

function estViolationUnique(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === '23505'
  )
}

function genererReference(): string {
  let suffixe = ''
  for (let index = 0; index < 6; index += 1) {
    suffixe += REFERENCE_ALPHABET[randomInt(REFERENCE_ALPHABET.length)]
  }
  return `BC-${new Date().getFullYear()}-${suffixe}`
}

async function referenceDisponible(): Promise<string> {
  for (let essai = 0; essai < 12; essai += 1) {
    const reference = genererReference()
    const [existant] = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.reference, reference))
      .limit(1)
    if (!existant) return reference
  }
  throw new Error('Une erreur est survenue. Réessayez dans un instant.')
}

async function prochainNumeroFacture(): Promise<string> {
  const prefix = `F-${new Date().getFullYear()}-`
  const [resultat] = await db
    .select({
      dernier: sql<number>`coalesce(max(split_part(${invoices.number}, '-', 3)::int), 0)`,
    })
    .from(invoices)
    .where(like(invoices.number, `${prefix}%`))
  return `${prefix}${String((resultat?.dernier ?? 0) + 1).padStart(4, '0')}`
}

async function chargerCommande(orderId: number) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
  if (!order) throw new Error('Bon de commande introuvable.')
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id))
    .orderBy(asc(orderItems.id))
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.orderId, order.id))
    .limit(1)
  return { order, items, invoice: invoice ?? null }
}

export const createOrderFromReservationFn = createServerFn({ method: 'POST' })
  .validator(z.object({ code: z.string().trim().min(6).max(6) }))
  .handler(async ({ data }) => {
    await exigerSession()
    setPrivateHeaders()

    const [reservation] = await db
      .select()
      .from(reservations)
      .where(eq(reservations.code, data.code.toUpperCase()))
      .limit(1)
    if (!reservation) throw new Error('Réservation introuvable.')

    let statut = reservation.status
    if (statut === 'en_attente' && new Date(reservation.expiresAt).getTime() < Date.now()) {
      const [expiree] = await db
        .update(reservations)
        .set({ status: 'expiree' })
        .where(and(eq(reservations.id, reservation.id), eq(reservations.status, 'en_attente')))
        .returning()
      statut = expiree?.status ?? 'expiree'
    }
    if (statut === 'expiree' || statut === 'annulee') {
      throw new Error('Cette réservation ne peut plus être transformée en bon de commande.')
    }

    const [dejaCree] = await db
      .select()
      .from(orders)
      .where(eq(orders.reservationId, reservation.id))
      .limit(1)
    if (dejaCree) return { id: dejaCree.id, reference: dejaCree.reference, dejaCree: true }

    const articles = await db
      .select()
      .from(reservationItems)
      .where(eq(reservationItems.reservationId, reservation.id))
      .orderBy(asc(reservationItems.id))
    if (articles.length === 0) throw new Error('Cette réservation ne contient aucun article.')

    const subtotalFc = articles.reduce(
      (total, article) => total + article.unitPriceFc * article.quantity,
      0,
    )
    const reference = await referenceDisponible()

    const [created] = await db.transaction(async (transaction) => {
      const [order] = await transaction
        .insert(orders)
        .values({
          reference,
          reservationId: reservation.id,
          customerName: reservation.customerName,
          customerPhone: reservation.customerPhone,
          source: 'reservation',
          status: 'pending',
          subtotalFc,
          discountFc: 0,
          totalFc: subtotalFc,
        })
        .returning()

      await transaction.insert(orderItems).values(
        articles.map((article) => ({
          orderId: order.id,
          productId: article.productId,
          productName: article.productName,
          unitPriceFc: article.unitPriceFc,
          quantity: article.quantity,
        })),
      )
      return [order]
    })

    return { id: created.id, reference: created.reference, dejaCree: false }
  })

export const createOrderFromCartFn = createServerFn({ method: 'POST' })
  .validator(schemaCommandeDepuisPanier)
  .handler(async ({ data }) => {
    const telephone = data.client.telephone.replace(/\D/g, '')
    const depuis = new Date(Date.now() - 60 * 60 * 1000)
    const [recents] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(orders)
      .where(and(eq(orders.customerPhone, telephone), gte(orders.createdAt, depuis)))
    if ((recents?.total ?? 0) >= LIMITE_PAR_HEURE) {
      throw new Error('Trop de demandes rapides depuis ce numéro. Réessayez dans une heure.')
    }

    const articles = data.articles.map((article) => ({
      slug: article.slug,
      quantity: article.quantity,
    }))
    const amounts = await calculateCartAmounts(articles, data.coupons)
    if (amounts.unavailable.length > 0) throw new Error(MESSAGE_INDISPONIBLE)
    if (amounts.messages.length > 0) throw new Error(amounts.messages[0])

    const foundProducts = await db
      .select()
      .from(products)
      .where(inArray(products.slug, articles.map((article) => article.slug)))
    const bySlug = new Map(foundProducts.map((product) => [product.slug, product]))

    const reference = await referenceDisponible()
    const [created] = await db.transaction(async (transaction) => {
      const [order] = await transaction
        .insert(orders)
        .values({
          reference,
          customerName: data.client.nom,
          customerPhone: telephone,
          customerEmail: data.client.email || null,
          customerCompany: data.client.societe || null,
          source: 'proforma',
          status: 'pending',
          subtotalFc: amounts.subtotalFc,
          discountFc: amounts.discountFc,
          totalFc: amounts.totalFc,
        })
        .returning()

      await transaction.insert(orderItems).values(
        articles.map((article) => {
          const product = bySlug.get(article.slug)!
          return {
            orderId: order.id,
            productId: product.id,
            productName: product.name,
            unitPriceFc: product.priceFc,
            quantity: article.quantity,
          }
        }),
      )
      return [order]
    })

    await consumeCoupons(data.coupons)
    return { reference: created.reference, totalFc: created.totalFc }
  })

const schemaFiltresCommandes = z
  .object({
    statut: z.enum(['pending', 'invoiced', 'paid']).optional(),
    recherche: z.string().max(120).optional(),
  })
  .optional()

export const listOrdersAdminFn = createServerFn({ method: 'GET' })
  .validator(schemaFiltresCommandes)
  .handler(async ({ data }) => {
    await exigerSession()
    setPrivateHeaders()

    const conditions = []
    if (data?.statut) conditions.push(eq(orders.status, data.statut))
    const recherche = data?.recherche?.trim()
    if (recherche) {
      const motif = `%${recherche}%`
      const condition = or(
        ilike(orders.reference, motif),
        ilike(orders.customerName, motif),
        ilike(orders.customerPhone, motif),
      )
      if (condition) conditions.push(condition)
    }

    return db
      .select({ order: orders, invoice: invoices })
      .from(orders)
      .leftJoin(invoices, eq(invoices.orderId, orders.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(orders.createdAt))
      .limit(200)
  })

const schemaFiltresFactures = z
  .object({
    statut: z.enum(['issued', 'paid']).optional(),
    recherche: z.string().max(120).optional(),
  })
  .optional()

export const listInvoicesAdminFn = createServerFn({ method: 'GET' })
  .validator(schemaFiltresFactures)
  .handler(async ({ data }) => {
    await exigerSession()
    setPrivateHeaders()

    const conditions = []
    if (data?.statut) conditions.push(eq(invoices.status, data.statut))
    const recherche = data?.recherche?.trim()
    if (recherche) {
      const motif = `%${recherche}%`
      const condition = or(
        ilike(invoices.number, motif),
        ilike(invoices.customerName, motif),
        ilike(orders.reference, motif),
      )
      if (condition) conditions.push(condition)
    }

    const lignes = await db
      .select({ invoice: invoices, order: orders })
      .from(invoices)
      .innerJoin(orders, eq(orders.id, invoices.orderId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(invoices.issuedAt))
      .limit(200)

    const identifiants = [...new Set(lignes.map(({ order }) => order.id))]
    const articles =
      identifiants.length > 0
        ? await db
            .select()
            .from(orderItems)
            .where(inArray(orderItems.orderId, identifiants))
            .orderBy(asc(orderItems.id))
        : []

    return lignes.map(({ invoice, order }) => ({
      invoice,
      order,
      items: articles.filter((article) => article.orderId === order.id),
    }))
  })

export const getOrderAdminFn = createServerFn({ method: 'GET' })
  .validator(z.number().int().positive())
  .handler(async ({ data }) => {
    await exigerSession()
    setPrivateHeaders()
    return chargerCommande(data)
  })

export const getOrderByReferenceFn = createServerFn({ method: 'GET' })
  .validator(z.string().trim().min(1).max(40))
  .handler(async ({ data }) => {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.reference, data.toUpperCase()))
      .limit(1)
    if (!order) return null

    const [items, invoice] = await Promise.all([
      db.select().from(orderItems).where(eq(orderItems.orderId, order.id)).orderBy(asc(orderItems.id)),
      db.select().from(invoices).where(eq(invoices.orderId, order.id)).limit(1),
    ])
    return { order, items, invoice: invoice[0] ?? null }
  })

export const generateInvoiceFn = createServerFn({ method: 'POST' })
  .validator(schemaAjusterCommande)
  .handler(async ({ data }) => {
    await exigerSession()
    setPrivateHeaders()

    for (let essai = 0; essai < 5; essai += 1) {
      try {
        return await db.transaction(async (transaction) => {
          const [order] = await transaction
            .select()
            .from(orders)
            .where(eq(orders.id, data.orderId))
            .limit(1)
          if (!order) throw new Error('Bon de commande introuvable.')
          if (order.status === 'paid') throw new Error('Cette commande est déjà payée.')

          const [existing] = await transaction
            .select()
            .from(invoices)
            .where(eq(invoices.orderId, order.id))
            .limit(1)
          if (existing) throw new Error('Une facture a déjà été générée pour cette commande.')

          const items = await transaction
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, order.id))
            .orderBy(asc(orderItems.id))
          if (items.length === 0) throw new Error('Cette commande ne contient aucun article.')

          const ids = new Set(items.map((item) => item.id))
          if (data.items.length !== items.length || data.items.some((item) => !ids.has(item.id))) {
            throw new Error('Les articles de la commande ont changé. Rechargez la page.')
          }

          for (const item of data.items) {
            await transaction
              .update(orderItems)
              .set({ unitPriceFc: item.unitPriceFc, quantity: item.quantity })
              .where(and(eq(orderItems.id, item.id), eq(orderItems.orderId, order.id)))
          }

          const subtotalFc = data.items.reduce(
            (total, item) => total + item.unitPriceFc * item.quantity,
            0,
          )
          const discountFc = Math.min(order.discountFc, subtotalFc)
          const totalFc = subtotalFc - discountFc

          await transaction
            .update(orders)
            .set({ subtotalFc, totalFc, status: 'invoiced', updatedAt: new Date() })
            .where(eq(orders.id, order.id))

          const [invoice] = await transaction
            .insert(invoices)
            .values({
              number: await prochainNumeroFacture(),
              orderId: order.id,
              customerName: order.customerName,
              customerPhone: order.customerPhone,
              customerEmail: order.customerEmail,
              customerCompany: order.customerCompany,
              subtotalFc,
              discountFc,
              totalFc,
              status: 'issued',
            })
            .returning()

          return { number: invoice.number, totalFc: invoice.totalFc }
        })
      } catch (error) {
        if (estViolationUnique(error)) continue
        throw error
      }
    }
    throw new Error('La facture n’a pas pu être générée. Réessayez dans un instant.')
  })

export const markInvoicePaidFn = createServerFn({ method: 'POST' })
  .validator(z.number().int().positive())
  .handler(async ({ data }) => {
    await exigerSession()
    setPrivateHeaders()

    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, data))
      .limit(1)
    if (!invoice) throw new Error('Facture introuvable.')
    if (invoice.status === 'paid') return { success: true }

    await db.transaction(async (transaction) => {
      await transaction
        .update(invoices)
        .set({ status: 'paid', paidAt: new Date() })
        .where(eq(invoices.id, invoice.id))
      await transaction
        .update(orders)
        .set({ status: 'paid', updatedAt: new Date() })
        .where(eq(orders.id, invoice.orderId))
    })
    return { success: true }
  })

export const countOrdersAdminFn = createServerFn({ method: 'GET' }).handler(async () => {
  await exigerSession()
  setPrivateHeaders()

  const statuts: OrderStatus[] = ['pending', 'invoiced', 'paid']
  const result: Record<OrderStatus, number> = { pending: 0, invoiced: 0, paid: 0 }
  for (const statut of statuts) {
    const [row] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(orders)
      .where(eq(orders.status, statut))
    result[statut] = row?.total ?? 0
  }
  const [unpaid] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(invoices)
    .where(eq(invoices.status, 'issued'))
  return { ...result, unpaidInvoices: unpaid?.total ?? 0 }
})
