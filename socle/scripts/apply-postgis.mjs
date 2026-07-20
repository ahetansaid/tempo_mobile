// Applique db/migrations/0001_postgis.sql (extensions, index spatial, contrainte
// anti-double-booking) — à lancer APRÈS `drizzle-kit push`.
// Usage : node --env-file=.env scripts/apply-postgis.mjs
import postgres from 'postgres';
import { readFileSync } from 'node:fs';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL absent. Renseigne ton URL Neon dans .env.');
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
const ddl = readFileSync(new URL('../db/migrations/0001_postgis.sql', import.meta.url), 'utf8');

try {
  await sql.unsafe(ddl);
  console.log('✓ PostGIS, index spatial et contrainte anti-double-booking appliqués.');
} catch (e) {
  console.error('✗ Échec :', e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
