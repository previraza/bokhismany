import { compare, hashSync } from 'bcryptjs'
import { createServerFn } from '@tanstack/react-start'
import { setResponseHeaders } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { admins } from '@/lib/db/schema'
import { schemaConnexion } from '@/lib/validation'
import {
  adresseIp,
  creerSession,
  detruireSession,
  enregistrerEchecConnexion,
  lireSession,
  peutTenterConnexion,
  reinitialiserTentatives,
} from './session.server'

const EMPREINTE_FIXE = hashSync('comparaison-a-duree-constante', 12)

function sansCache() {
  setResponseHeaders(new Headers({ 'Cache-Control': 'no-store' }))
}

export const verifierSessionFn = createServerFn({ method: 'GET' }).handler(async () => {
  sansCache()
  return { authentifie: Boolean(await lireSession()) }
})

export const connecterAdminFn = createServerFn({ method: 'POST' })
  .validator(schemaConnexion)
  .handler(async ({ data }) => {
    sansCache()
    const ip = adresseIp()

    if (!(await peutTenterConnexion(ip))) {
      return {
        succes: false,
        message: 'Trop de tentatives de connexion. Réessayez dans quelques minutes.',
      }
    }

    const [compte] = await db
      .select()
      .from(admins)
      .where(eq(admins.email, data.email))
      .limit(1)

    const motDePasseValide = await compare(data.motDePasse, compte?.passwordHash ?? EMPREINTE_FIXE)

    if (!compte || !motDePasseValide) {
      await enregistrerEchecConnexion(ip)
      return { succes: false, message: 'Email ou mot de passe incorrect.' }
    }

    await reinitialiserTentatives(ip)
    await creerSession(compte.id)
    return { succes: true, message: '' }
  })

export const deconnecterAdminFn = createServerFn({ method: 'POST' }).handler(async () => {
  sansCache()
  await detruireSession()
  return { succes: true }
})
