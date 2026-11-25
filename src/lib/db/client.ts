import 'dotenv/config'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    'La variable d’environnement DATABASE_URL est absente. Définissez-la dans le fichier .env local ou dans l’environnement du conteneur.',
  )
}

// Pool PostgreSQL standard : compatible avec une base gérée par docker-compose.
export const pool = new Pool({ connectionString: databaseUrl })

export const db = drizzle(pool, { schema })
