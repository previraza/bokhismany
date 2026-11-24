import { createServerFn } from '@tanstack/react-start'
import { setResponseHeaders } from '@tanstack/react-start/server'
import { and, asc, desc, eq, gte, ilike, lt, or, sql } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import {
  contactMessages,
  products,
  reservationItems,
  reservations,
  type ReservationStatus,
} from '@/lib/db/schema'
import { schemaPromotion, schemaProduit, schemaStatut } from '@/lib/validation'
import { obtenirPromotionFn, mettreAJourPromotionFn } from './promotion.functions'
import { exigerSession } from './session.server'

function prive() {
  setResponseHeaders(
    new Headers({ 'Cache-Control': 'no-store', Vary: 'Cookie' }),
  )
}

async function appliquerExpirations(): Promise<void> {
  await db
    .update(reservations)
    .set({ status: 'expiree' })
    .where(
      and(eq(reservations.status, 'en_attente'), lt(reservations.expiresAt, new Date())),
    )
}

function debutJourKinshasa(): Date {
  const maintenant = new Date()
  const decale = new Date(maintenant.getTime() + 60 * 60 * 1000)
  return new Date(
    Date.UTC(decale.getUTCFullYear(), decale.getUTCMonth(), decale.getUTCDate()) -
      60 * 60 * 1000,
  )
}

async function compter(condition?: ReturnType<typeof eq>) {
  const [resultat] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(reservations)
    .where(condition)
  return resultat?.total ?? 0
}

export const obtenirTableauDeBordFn = createServerFn({ method: 'GET' }).handler(async () => {
  await exigerSession()
  prive()
  await appliquerExpirations()

  const [duJour, enAttente, retirees, expirees, messagesNonLus] = await Promise.all([
    compter(gte(reservations.createdAt, debutJourKinshasa())),
    compter(eq(reservations.status, 'en_attente')),
    compter(eq(reservations.status, 'retiree')),
    compter(eq(reservations.status, 'expiree')),
    (async () => {
      const [resultat] = await db
        .select({ total: sql<number>`count(*)::int` })
        .from(contactMessages)
        .where(eq(contactMessages.isRead, false))
      return resultat?.total ?? 0
    })(),
  ])

  const recentes = await db
    .select()
    .from(reservations)
    .orderBy(desc(reservations.createdAt))
    .limit(8)

  return { duJour, enAttente, retirees, expirees, messagesNonLus, recentes }
})

const schemaFiltresReservations = z
  .object({
    statut: z.enum(['en_attente', 'retiree', 'expiree', 'annulee']).optional(),
    recherche: z.string().max(120).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  })
  .optional()

export const obtenirReservationsAdminFn = createServerFn({ method: 'GET' })
  .validator(schemaFiltresReservations)
  .handler(async ({ data }) => {
    await exigerSession()
    prive()
    await appliquerExpirations()

    const conditions = []

    if (data?.statut) conditions.push(eq(reservations.status, data.statut))
    if (data?.date) {
      const debut = new Date(`${data.date}T00:00:00+01:00`)
      conditions.push(gte(reservations.createdAt, debut))
      conditions.push(lt(reservations.createdAt, new Date(debut.getTime() + 24 * 60 * 60 * 1000)))
    }
    const recherche = data?.recherche?.trim()
    if (recherche) {
      const motif = `%${recherche}%`
      const condition = or(
        ilike(reservations.code, motif),
        ilike(reservations.customerName, motif),
        ilike(reservations.customerPhone, motif),
      )
      if (condition) conditions.push(condition)
    }

    return db
      .select()
      .from(reservations)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(reservations.createdAt))
      .limit(200)
  })

export const obtenirReservationAdminFn = createServerFn({ method: 'GET' })
  .validator(z.string().trim().min(6).max(6))
  .handler(async ({ data }) => {
    await exigerSession()
    prive()
    await appliquerExpirations()

    const [reservation] = await db
      .select()
      .from(reservations)
      .where(eq(reservations.code, data.toUpperCase()))
      .limit(1)
    if (!reservation) return null

    const articles = await db
      .select()
      .from(reservationItems)
      .where(eq(reservationItems.reservationId, reservation.id))
      .orderBy(asc(reservationItems.id))

    return { reservation, articles }
  })

export const changerStatutReservationFn = createServerFn({ method: 'POST' })
  .validator(schemaStatut)
  .handler(async ({ data }) => {
    await exigerSession()
    prive()

    const [reservation] = await db
      .select()
      .from(reservations)
      .where(eq(reservations.code, data.code.toUpperCase()))
      .limit(1)

    if (!reservation) throw new Error('Réservation introuvable.')
    if (reservation.status === 'retiree' && data.statut === 'en_attente') {
      throw new Error('Une réservation déjà retirée ne peut pas repasser en attente.')
    }
    if (reservation.status === 'expiree' && data.statut === 'retiree') {
      throw new Error('Cette réservation a expiré et ne peut plus être retirée.')
    }

    await db
      .update(reservations)
      .set({ status: data.statut })
      .where(eq(reservations.id, reservation.id))

    return { succes: true }
  })

export const obtenirProduitsAdminFn = createServerFn({ method: 'GET' }).handler(async () => {
  await exigerSession()
  prive()
  return db.select().from(products).orderBy(asc(products.name))
})

const schemaProduitAdmin = schemaProduit.extend({
  id: z.number().int().positive().optional(),
})

export const enregistrerProduitFn = createServerFn({ method: 'POST' })
  .validator(schemaProduitAdmin)
  .handler(async ({ data }) => {
    await exigerSession()
    prive()

    const valeurs = {
      slug: data.slug,
      name: data.nom,
      category: data.categorie,
      format: data.format || null,
      priceFc: data.prixFc,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      stockStatus: data.stockStatus,
      isActive: data.isActive,
    }

    if (data.id) {
      await db.update(products).set(valeurs).where(eq(products.id, data.id))
    } else {
      await db.insert(products).values(valeurs).onConflictDoUpdate({
        target: products.slug,
        set: valeurs,
      })
    }
    return { succes: true }
  })

export const basculerProduitFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.number().int().positive(), actif: z.boolean() }))
  .handler(async ({ data }) => {
    await exigerSession()
    prive()
    await db.update(products).set({ isActive: data.actif }).where(eq(products.id, data.id))
    return { succes: true }
  })

export const obtenirMessagesAdminFn = createServerFn({ method: 'GET' }).handler(async () => {
  await exigerSession()
  prive()
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200)
})

export const marquerMessageLuFn = createServerFn({ method: 'POST' })
  .validator(z.number().int().positive())
  .handler(async ({ data }) => {
    await exigerSession()
    prive()
    await db
      .update(contactMessages)
      .set({ isRead: true })
      .where(eq(contactMessages.id, data))
    return { succes: true }
  })

export { obtenirPromotionFn }

export const enregistrerPromotionAdminFn = createServerFn({ method: 'POST' })
  .validator(schemaPromotion)
  .handler(async ({ data }) => {
    await exigerSession()
    return mettreAJourPromotionFn({ data })
  })

function celluleCsv(valeur: unknown): string {
  return `"${String(valeur ?? '').replace(/"/g, '""')}"`
}

export const exporterReservationsFn = createServerFn({ method: 'GET' }).handler(async () => {
  await exigerSession()
  prive()

  const [lignes, articles] = await Promise.all([
    db.select().from(reservations).orderBy(desc(reservations.createdAt)),
    db.select().from(reservationItems).orderBy(asc(reservationItems.id)),
  ])

  const parReservation = new Map<number, typeof articles>()
  for (const article of articles) {
    if (article.reservationId === null) continue
    const liste = parReservation.get(article.reservationId) ?? []
    liste.push(article)
    parReservation.set(article.reservationId, liste)
  }

  const entete = [
    'Code',
    'Créée le',
    'Expire le',
    'Nom',
    'Téléphone',
    'Statut',
    'Montant estimé (Fc)',
    'Produits',
  ]
    .map(celluleCsv)
    .join(';')

  const corps = lignes.map((reservation) => {
    const produits = (parReservation.get(reservation.id) ?? [])
      .map((article) => `${article.quantity} × ${article.productName}`)
      .join(', ')
    return [
      reservation.code,
      reservation.createdAt?.toISOString() ?? '',
      reservation.expiresAt.toISOString(),
      reservation.customerName,
      reservation.customerPhone,
      reservation.status satisfies ReservationStatus,
      reservation.totalFc,
      produits,
    ]
      .map(celluleCsv)
      .join(';')
  })

  return [entete, ...corps].join('\r\n')
})
