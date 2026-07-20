// Vérifie la connexion à la base et la disponibilité de PostGIS / btree_gist.
// Usage : node --env-file=.env scripts/db-check.mjs
import postgres from 'postgres';

if (!process.env.DATABASE_URL) { console.error('DATABASE_URL absent.'); process.exit(1); }

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
try {
  const [v] = await sql`SELECT version()`;
  console.log('✓ Connexion OK');
  console.log('  ', v.version.split(',')[0]);

  await sql`CREATE EXTENSION IF NOT EXISTS postgis`;
  await sql`CREATE EXTENSION IF NOT EXISTS btree_gist`;
  const ext = await sql`SELECT extname, extversion FROM pg_extension WHERE extname IN ('postgis','btree_gist') ORDER BY extname`;
  for (const e of ext) console.log(`✓ ${e.extname} ${e.extversion}`);
  if (ext.length < 2) console.log('✗ Une extension manque.');
  else console.log('\n✅ Base prête pour TEMPO.');
} catch (e) {
  console.error('✗ Échec :', e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
