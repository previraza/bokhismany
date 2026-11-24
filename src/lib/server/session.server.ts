import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto'
import { and, eq, gt, sql } from 'drizzle-orm'
import { deleteCookie, getCookie, getRequestHeader, setCookie } from '@tanstack/react-start/server'
import { db } from '@/lib/db/client'
import { adminSessions, admins, loginAttempts } from '@/lib/db/schema'

const NOM_COOKIE = 'bokhismany_admin'
const DUREE_SESSION_MS = 8 * 60 * 60 * 1000
const DELAI_LIMITATION_MS = 15 * 60 * 1000
const MAX_TENTATIVES = 5

function secretSession(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error(
      'SESSION_SECRET doit être défini avec au moins 32 caractères dans le fichier .env local ou sur Vercel.',
    )
  }
  return secret
}

function optionsCookie(maxAge = DUREE_SESSION_MS / 1000) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

function empreinte(valeur: string): string {
  return createHash('sha256').update(valeur).digest('hex')
}

function signature(payload: string): string {
  return createHmac('sha256', secretSession()).update(payload).digest('base64url')
}

export function adresseIp(): string {
  return (
    getRequestHeader('x-forwarded-for')?.split(',')[0]?.trim() ||
    getRequestHeader('x-real-ip') ||
    'inconnue'
  )
}

export async function creerSession(adminId: number): Promise<void> {
  const jeton = randomBytes(32).toString('base64url')
  const expiration = new Date(Date.now() + DUREE_SESSION_MS)
  const payload = `${expiration.getTime()}.${adminId}.${jeton}`
  const valeur = `${payload}.${signature(payload)}`

  await db.insert(adminSessions).values({
    tokenHash: empreinte(valeur),
    adminId,
    expiresAt: expiration,
  })

  setCookie(NOM_COOKIE, valeur, optionsCookie())
}

export interface SessionActive {
  adminId: number
  empreinte: string
}

export async function lireSession(): Promise<SessionActive | null> {
  const valeur = getCookie(NOM_COOKIE)
  if (!valeur) return null

  const parties = valeur.split('.')
  if (parties.length !== 4) return null
  const [expirationBrute, adminBrut, jeton, recue] = parties
  if (!expirationBrute || !adminBrut || !jeton || !recue) return null

  const expiration = Number(expirationBrute)
  const adminId = Number(adminBrut)
  if (!Number.isInteger(expiration) || !Number.isInteger(adminId) || Date.now() > expiration) {
    return null
  }

  const payload = `${expirationBrute}.${adminBrut}.${jeton}`
  const attendue = Buffer.from(signature(payload))
  const fournie = Buffer.from(recue)
  if (fournie.length !== attendue.length || !timingSafeEqual(fournie, attendue)) {
    return null
  }

  const hash = empreinte(valeur)
  const [enregistrement] = await db
    .select()
    .from(adminSessions)
    .where(
      and(
        eq(adminSessions.tokenHash, hash),
        gt(adminSessions.expiresAt, new Date()),
      ),
    )
    .limit(1)

  if (!enregistrement || enregistrement.adminId !== adminId) return null
  return { adminId, empreinte: hash }
}

export async function exigerSession(): Promise<SessionActive> {
  const session = await lireSession()
  if (!session) {
    throw new Error('Vous devez être connecté pour effectuer cette action.')
  }
  return session
}

export async function detruireSession(): Promise<void> {
  const session = await lireSession()
  if (session) {
    await db.delete(adminSessions).where(eq(adminSessions.tokenHash, session.empreinte))
  }
  deleteCookie(NOM_COOKIE, optionsCookie(0))
}

export async function peutTenterConnexion(ip: string): Promise<boolean> {
  const hash = empreinte(ip)
  const [tentative] = await db
    .select()
    .from(loginAttempts)
    .where(eq(loginAttempts.ipHash, hash))
    .limit(1)

  if (!tentative) return true
  const dansLaFenetre = Date.now() - tentative.firstAttempt.getTime() < DELAI_LIMITATION_MS
  return !dansLaFenetre || tentative.attempts < MAX_TENTATIVES
}

export async function enregistrerEchecConnexion(ip: string): Promise<void> {
  const hash = empreinte(ip)
  const maintenant = new Date()
  const [tentative] = await db
    .select()
    .from(loginAttempts)
    .where(eq(loginAttempts.ipHash, hash))
    .limit(1)

  if (!tentative || Date.now() - tentative.firstAttempt.getTime() >= DELAI_LIMITATION_MS) {
    await db
      .insert(loginAttempts)
      .values({ ipHash: hash, attempts: 1, firstAttempt: maintenant, lastAttempt: maintenant })
      .onConflictDoUpdate({
        target: loginAttempts.ipHash,
        set: { attempts: 1, firstAttempt: maintenant, lastAttempt: maintenant },
      })
    return
  }

  await db
    .update(loginAttempts)
    .set({
      attempts: sql`${loginAttempts.attempts} + 1`,
      lastAttempt: maintenant,
    })
    .where(eq(loginAttempts.ipHash, hash))
}

export async function reinitialiserTentatives(ip: string): Promise<void> {
  await db.delete(loginAttempts).where(eq(loginAttempts.ipHash, empreinte(ip)))
}

export async function adminExiste(): Promise<boolean> {
  const [compte] = await db.select({ id: admins.id }).from(admins).limit(1)
  return Boolean(compte)
}
