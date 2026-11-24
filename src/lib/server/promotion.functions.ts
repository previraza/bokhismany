import { createServerFn } from '@tanstack/react-start'
import { inArray, sql } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { siteSettings } from '@/lib/db/schema'
import { schemaPromotion } from '@/lib/validation'
import { exigerSession } from './session.server'

export const MESSAGE_PROMOTION_DEFAUT =
  "Promotion en cours : jusqu'à 5 % de réduction sur une sélection de produits."

const CLES = ['promotion_active', 'promotion_message'] as const

export const obtenirPromotionFn = createServerFn({ method: 'GET' }).handler(async () => {
  const enregistrements = await db
    .select()
    .from(siteSettings)
    .where(inArray(siteSettings.key, [...CLES]))

  const valeurs = new Map(enregistrements.map((element) => [element.key, element.value]))

  return {
    active: valeurs.get('promotion_active') === 'true',
    message: valeurs.get('promotion_message') ?? MESSAGE_PROMOTION_DEFAUT,
  }
})

export const mettreAJourPromotionFn = createServerFn({ method: 'POST' })
  .validator(schemaPromotion)
  .handler(async ({ data }) => {
    await exigerSession()

    await db
      .insert(siteSettings)
      .values([
        { key: 'promotion_active', value: data.active ? 'true' : 'false' },
        { key: 'promotion_message', value: data.message },
      ])
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: sql`excluded.value`,
          updatedAt: new Date(),
        },
      })

    return { succes: true }
  })
