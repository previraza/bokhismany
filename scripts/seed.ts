import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { hash } from 'bcryptjs'
import { eq, sql } from 'drizzle-orm'
import { db, pool } from '../src/lib/db/client'
import { admins, products, siteSettings } from '../src/lib/db/schema'
import type { ProductCategory } from '../src/lib/db/schema'

const CHEMIN_CSV = fileURLToPath(new URL('../brief/produits.csv', import.meta.url))
const MESSAGE_PROMOTION =
  "Promotion en cours : jusqu'à 5 % de réduction sur une sélection de produits."

const CATEGORIES: ReadonlySet<string> = new Set([
  'huiles',
  'riz',
  'semoules',
  'farines',
  'sucre',
  'autres',
])

interface LigneCsv {
  slug: string
  nom: string
  categorie: string
  format: string
  prixFc: number
  description: string
}

function analyserCsv(contenu: string): LigneCsv[] {
  const lignes = contenu
    .split(/\r?\n/)
    .map((ligne) => ligne.trim())
    .filter((ligne) => ligne.length > 0)

  const [enTete, ...donnees] = lignes
  if (!enTete) {
    throw new Error('Le fichier produits.csv est vide.')
  }

  const colonnes = enTete.split(',').map((colonne) => colonne.trim())
  const index = (nom: string) => {
    const position = colonnes.indexOf(nom)
    if (position === -1) {
      throw new Error(`Colonne « ${nom} » absente de produits.csv.`)
    }
    return position
  }

  const positions = {
    slug: index('slug'),
    nom: index('nom'),
    categorie: index('categorie'),
    format: index('format'),
    prixFc: index('prix_fc'),
    description: index('description'),
  }

  return donnees.map((ligne) => {
    const cellules = ligne.split(',').map((cellule) =>
      cellule.trim().replace(/^"(.*)"$/, '$1'),
    )
    const prix = Number(cellules[positions.prixFc])
    if (!Number.isInteger(prix) || prix <= 0) {
      throw new Error(`Prix invalide pour ${cellules[positions.slug] ?? 'un produit'}.`)
    }

    return {
      slug: cellules[positions.slug] ?? '',
      nom: cellules[positions.nom] ?? '',
      categorie: cellules[positions.categorie] ?? '',
      format: cellules[positions.format] ?? '',
      prixFc: prix,
      description: cellules[positions.description] ?? '',
    }
  })
}

async function main(): Promise<void> {
  const contenu = await readFile(CHEMIN_CSV, 'utf8')
  const lignes = analyserCsv(contenu)

  for (const ligne of lignes) {
    const categorie: ProductCategory = CATEGORIES.has(ligne.categorie)
      ? (ligne.categorie as ProductCategory)
      : 'autres'

    await db
      .insert(products)
      .values({
        slug: ligne.slug,
        name: ligne.nom,
        category: categorie,
        format: ligne.format || null,
        priceFc: ligne.prixFc,
        description: ligne.description || null,
        imageUrl: null,
        stockStatus: 'disponible',
        isActive: true,
      })
      .onConflictDoUpdate({
        target: products.slug,
        set: {
          name: ligne.nom,
          category: categorie,
          format: ligne.format || null,
          priceFc: ligne.prixFc,
          description: ligne.description || null,
        },
      })
  }

  // Les catégories par défaut sont créées par la migration 0003. On réconcilie
  // les liaisons ici : la migration précède le seed sur une base vide, donc elle
  // ne peut pas rattacher les produits qui n'existent pas encore.
  await db.execute(sql`
    INSERT INTO "product_categories" ("product_id", "category_id")
    SELECT "products"."id", "categories"."id"
    FROM "products"
    INNER JOIN "categories" ON "categories"."slug" = "products"."category"
    ON CONFLICT DO NOTHING
  `)

  await db
    .insert(siteSettings)
    .values([
      { key: 'promotion_active', value: 'true' },
      { key: 'promotion_message', value: MESSAGE_PROMOTION },
    ])
    .onConflictDoNothing()

  const email = process.env.ADMIN_EMAIL
  const motDePasse = process.env.ADMIN_PASSWORD

  if (!email || !motDePasse) {
    throw new Error(
      'Les variables ADMIN_EMAIL et ADMIN_PASSWORD sont nécessaires pour créer le compte administrateur.',
    )
  }
  if (motDePasse.length < 12) {
    throw new Error('Le mot de passe administrateur doit contenir au moins 12 caractères.')
  }

  const empreinte = await hash(motDePasse, 12)
  await db
    .insert(admins)
    .values({ email: email.trim().toLowerCase(), passwordHash: empreinte })
    .onConflictDoUpdate({
      target: admins.email,
      set: { passwordHash: empreinte },
    })

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(products)
    .where(eq(products.isActive, true))

  console.log(`Seed terminé : ${lignes.length} produits traités, ${total} produits actifs.`)
  console.log('Le compte administrateur est à jour.')
}

main()
  .catch((error: unknown) => {
    console.error(
      'Échec du seed :',
      error instanceof Error ? error.message : String(error),
    )
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
