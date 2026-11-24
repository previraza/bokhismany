import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'La variable d’environnement DATABASE_URL est absente. Définissez-la dans le fichier .env local ou dans les variables d’environnement Vercel.',
  );
}

// Le pool Neon serverless permet d’ouvrir des transactions dans la suite du projet.
export const pool = new Pool({ connectionString: databaseUrl });

export const db = drizzle({ client: pool, schema });
