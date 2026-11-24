import { sql } from 'drizzle-orm';
import { db, pool } from '../src/lib/db/client';

async function main(): Promise<void> {
  try {
    await db.execute(sql`SELECT 1`);
    console.log('Connexion à la base de données vérifiée avec succès.');
  } catch (error) {
    console.error(
      'Impossible de se connecter à la base de données :',
      error instanceof Error ? error.message : String(error),
    );
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void main();
