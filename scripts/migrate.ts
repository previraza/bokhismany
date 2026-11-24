import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { db, pool } from '../src/lib/db/client';

async function main(): Promise<void> {
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations appliquées avec succès.');
  } catch (error) {
    console.error(
      'Échec de l’application des migrations :',
      error instanceof Error ? error.message : String(error),
    );
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void main();
