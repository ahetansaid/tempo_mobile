// Page technique d'état de la base (déplacée depuis /). Utile en dev/prod pour vérifier
// que la connexion, PostGIS et la contrainte anti-double-booking sont en place.
export const dynamic = 'force-dynamic';

type Check = { label: string; ok: boolean; detail?: string };

async function runChecks(): Promise<{ connected: boolean; checks: Check[]; error?: string }> {
  if (!process.env.DATABASE_URL) {
    return { connected: false, checks: [], error: 'DATABASE_URL absent' };
  }
  try {
    const postgres = (await import('postgres')).default;
    const sql = postgres(process.env.DATABASE_URL, { max: 1, idle_timeout: 5 });
    const ext = await sql<{ extname: string }[]>`SELECT extname FROM pg_extension WHERE extname IN ('postgis','btree_gist')`;
    const names = ext.map((r) => r.extname);
    const cons = await sql`SELECT 1 FROM pg_constraint WHERE conname = 'resa_pas_de_chevauchement'`;
    const tables = await sql<{ c: number }[]>`
      SELECT count(*)::int AS c FROM information_schema.tables
      WHERE table_schema='public' AND table_name IN ('professionnels','reservations','notifications')`;
    await sql.end();
    return {
      connected: true,
      checks: [
        { label: 'Connexion PostgreSQL', ok: true },
        { label: 'Extension PostGIS', ok: names.includes('postgis') },
        { label: 'Extension btree_gist', ok: names.includes('btree_gist') },
        { label: 'Tables métier', ok: tables[0].c === 3, detail: `${tables[0].c}/3` },
        { label: 'Contrainte anti-double-booking', ok: cons.length > 0 },
      ],
    };
  } catch (e) {
    return { connected: false, checks: [], error: (e as Error).message };
  }
}

export default async function Statut() {
  const { connected, checks, error } = await runChecks();
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '48px 20px', fontFamily: 'var(--font-inter, system-ui)' }}>
      <h1 style={{ fontSize: 26 }}>État du socle</h1>
      {error && <p style={{ color: '#b45309' }}>{error}</p>}
      {connected && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {checks.map((c) => (
            <li key={c.label} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid #f0ece5' }}>
              <span style={{ color: c.ok ? '#16a34a' : '#dc2626', fontWeight: 700 }}>{c.ok ? '✓' : '✗'}</span>
              {c.label}{c.detail ? ` (${c.detail})` : ''}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
