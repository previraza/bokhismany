import { createServerFn } from '@tanstack/react-start'
import { setResponseHeaders } from '@tanstack/react-start/server'
import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { equipeMembres } from '@/lib/db/schema'
import { schemaMembreEquipe, schemaSuppressionMembre } from '@/lib/validation'
import { exigerSession } from './session.server'

function prive() {
  setResponseHeaders(
    new Headers({ 'Cache-Control': 'no-store', Vary: 'Cookie' }),
  )
}

/** Membres actifs destinés à la page publique « À propos ». */
export const obtenirEquipeFn = createServerFn({ method: 'GET' }).handler(async () => {
  return db
    .select()
    .from(equipeMembres)
    .where(eq(equipeMembres.isActive, true))
    .orderBy(asc(equipeMembres.ordre), asc(equipeMembres.id))
})

/** Tous les membres, y compris masqués, pour l'administration. */
export const obtenirEquipeAdminFn = createServerFn({ method: 'GET' }).handler(async () => {
  prive()
  await exigerSession()
  return db
    .select()
    .from(equipeMembres)
    .orderBy(asc(equipeMembres.ordre), asc(equipeMembres.id))
})

export const enregistrerMembreFn = createServerFn({ method: 'POST' })
  .validator(schemaMembreEquipe)
  .handler(async ({ data }) => {
    prive()
    await exigerSession()

    const valeurs = {
      nom: data.nom,
      fonction: data.fonction,
      biographie: data.biographie || null,
      photoUrl: data.photoUrl || null,
      ordre: data.ordre,
      isActive: data.isActive,
    }

    if (data.id) {
      await db
        .update(equipeMembres)
        .set(valeurs)
        .where(eq(equipeMembres.id, data.id))
    } else {
      await db.insert(equipeMembres).values(valeurs)
    }

    return { succes: true }
  })

export const supprimerMembreFn = createServerFn({ method: 'POST' })
  .validator(schemaSuppressionMembre)
  .handler(async ({ data }) => {
    prive()
    await exigerSession()
    await db.delete(equipeMembres).where(eq(equipeMembres.id, data.id))
    return { succes: true }
  })
