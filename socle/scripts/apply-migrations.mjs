// Applique les migrations SQL générées par drizzle-kit (db/drizzle/*.sql).
// Remplace `drizzle-kit push` (qui exige un TTY). Idempotent au niveau fichier
// via une table _migrations qui mémorise ce qui a déjà tourné.
// Usage : node --env-file=.env scripts/apply-migrations.mjs
import postgres from 'postgres';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'db', 'drizzle');
const sql = postgres(process.env.DATABASE_URL, { max: 1 });

try {
  await sql`CREATE TABLE IF NOT EXISTS _migrations (name text PRIMARY KEY, run_at timestamptz DEFAULT now())`;
  const done = new Set((await sql`SELECT name FROM _migrations`).map((r) => r.name));

  const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  let applied = 0;
  for (const file of files) {
    if (done.has(file)) { console.log(`• ${file} — déjà appliqué`); continue; }
    // drizzle-kit met tout le type customType entre guillemets → Postgres cherche
    // un type nommé "geography(Point,4326)". On retire les guillemets autour du type PostGIS.
    const raw = readFileSync(join(dir, file), 'utf8')
      .replace(/"(geography\([^"]*\))"/gi, '$1');
    const statements = raw.split('--> statement-breakpoint').map((s) => s.trim()).filter(Boolean);
    await sql.begin(async (tx) => {
      for (const st of statements) await tx.unsafe(st);
      await tx`INSERT INTO _migrations (name) VALUES (${file})`;
    });
    console.log(`✓ ${file} — ${statements.length} instructions`);
    applied++;
  }
  console.log(applied ? `\n✅ ${applied} migration(s) appliquée(s).` : '\nRien à appliquer.');
} catch (e) {
  console.error('✗ Échec :', e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
