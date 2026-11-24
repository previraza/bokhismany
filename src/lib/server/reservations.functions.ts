import { randomInt } from 'node:crypto'
import { createServerFn } from '@tanstack/react-start'
import { and, asc, eq, gte, inArray, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { products, reservationItems, reservations } from '@/lib/db/schema'
import { schemaReservation } from '@/lib/validation'
import { calculateCartAmounts, consumeCoupons } from './coupons.server'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const DUREE_RESERVATION_MS = 24 * 60 * 60 * 1000
const LIMITE_PAR_HEURE = 5

function genererCode(): string {
  let code = ''
  for (let index = 0; index < 6; index += 1) {
    code += ALPHABET[randomInt(ALPHABET.length)]
  }
  return code
}

async function codeDisponible(): Promise<string> {
  for (let essai = 0; essai < 12; essai += 1) {
    const code = genererCode()
    const [existant] = await db
      .select({ id: reservations.id })
      .from(reservations)
      .where(eq(reservations.code, code))
      .limit(1)
    if (!existant) return code
  }
  throw new Error('Une erreur est survenue. Réessayez dans un instant.')
}

function estViolationUnique(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === '23505'
  )
}

export const verifierArticlesFn = createServerFn({ method: 'POST' })
  .validator(z.array(z.string().min(1)).max(50))
  .handler(async ({ data }) => {
    if (data.length === 0) return []
    const trouves = await db.select().from(products).where(inArray(products.slug, data))
    const parSlug = new Map(trouves.map((produit) => [produit.slug, produit]))

    return data.flatMap((slug) => {
      const produit = parSlug.get(slug)
      if (!produit || !produit.isActive || produit.stockStatus === 'rupture') return [slug]
      return []
    })
  })

export const creerReservationFn = createServerFn({ method: 'POST' })
  .validator(schemaReservation)
  .handler(async ({ data }) => {
    const slugs = [...new Set(data.articles.map((article) => article.slug))]
    const trouves = await db.select().from(products).where(inArray(products.slug, slugs))
    const parSlug = new Map(trouves.map((produit) => [produit.slug, produit]))

    const indisponibles = data.articles
      .filter((article) => {
        const produit = parSlug.get(article.slug)
        return !produit || !produit.isActive || produit.stockStatus === 'rupture'
      })
      .map((article) => article.slug)

    if (indisponibles.length > 0) {
      return {
        succes: false as const,
        message: "Ce produit n'est plus disponible. Retirez-le du panier pour continuer.",
        slugs: indisponibles,
      }
    }

    const telephone = data.telephone.replace(/\D/g, '')
    const depuis = new Date(Date.now() - 60 * 60 * 1000)
    const [recents] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(reservations)
      .where(and(eq(reservations.customerPhone, telephone), gte(reservations.createdAt, depuis)))

    if (recents && recents.total >= LIMITE_PAR_HEURE) {
      return {
        succes: false as const,
        message:
          'Trop de réservations rapides depuis ce numéro. Réessayez dans une heure.',
        slugs: [] as string[],
      }
    }

    const articles = data.articles.map((article) => ({
      slug: article.slug,
      quantity: article.quantite,
    }))
    const montants = await calculateCartAmounts(articles, data.coupons ?? [])
    if (montants.messages.length > 0) {
      return {
        succes: false as const,
        message: montants.messages[0],
        slugs: [] as string[],
      }
    }

    const subtotalFc = montants.subtotalFc
    const discountFc = montants.discountFc
    const totalFc = montants.totalFc

    const creeLe = new Date()
    const expireLe = new Date(creeLe.getTime() + DUREE_RESERVATION_MS)

    for (let essai = 0; essai < 5; essai += 1) {
      const code = await codeDisponible()
      try {
        await db.transaction(async (transaction) => {
          const [reservation] = await transaction
            .insert(reservations)
            .values({
              code,
              customerName: data.nom,
              customerPhone: telephone,
              comment: data.commentaire || null,
              subtotalFc,
              discountFc,
              totalFc,
              coupons: data.coupons ?? [],
              status: 'en_attente',
              createdAt: creeLe,
              expiresAt: expireLe,
            })
            .returning()

          if (!reservation) throw new Error('Une erreur est survenue. Réessayez dans un instant.')

          await transaction.insert(reservationItems).values(
            data.articles.map((article) => {
              const produit = parSlug.get(article.slug)!
              return {
                reservationId: reservation.id,
                productId: produit.id,
                productName: produit.name,
                unitPriceFc: produit.priceFc,
                quantity: article.quantite,
              }
            }),
          )
        })

        await consumeCoupons(data.coupons ?? [])
        return { succes: true as const, code, expiresAt: expireLe }
      } catch (error) {
        if (estViolationUnique(error)) continue
        throw error
      }
    }

    return {
      succes: false as const,
      message: 'Une erreur est survenue. Réessayez dans un instant.',
      slugs: [] as string[],
    }
  })

export const obtenirReservationFn = createServerFn({ method: 'GET' })
  .validator(z.string().trim().min(6).max(6))
  .handler(async ({ data }) => {
    const code = data.toUpperCase()
    const [trouvee] = await db
      .select()
      .from(reservations)
      .where(eq(reservations.code, code))
      .limit(1)

    if (!trouvee) return null

    let reservation = trouvee
    if (
      reservation.status === 'en_attente' &&
      new Date(reservation.expiresAt).getTime() < Date.now()
    ) {
      const [expiree] = await db
        .update(reservations)
        .set({ status: 'expiree' })
        .where(
          and(eq(reservations.id, reservation.id), eq(reservations.status, 'en_attente')),
        )
        .returning()
      reservation = expiree ?? { ...reservation, status: 'expiree' }
    }

    const articles = await db
      .select()
      .from(reservationItems)
      .where(eq(reservationItems.reservationId, reservation.id))
      .orderBy(asc(reservationItems.id))

    return { reservation, articles }
  })
