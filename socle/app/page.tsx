// Page d'état du socle : vérifie en direct que la base, PostGIS et la contrainte
// anti-double-booking sont bien en place. Remplacée plus tard par le front-office.
export const dynamic = 'force-dynamic';

type Check = { label: string; ok: boolean; detail?: string };

async function runChecks(): Promise<{ connected: boolean; checks: Check[]; error?: string }> {
  if (!process.env.DATABASE_URL) {
    return { connected: false, checks: [], error: 'DATABASE_URL absent — renseigne ton URL Neon dans .env' };
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
        { label: 'Tables métier (professionnels, reservations, notifications)', ok: tables[0].c === 3, detail: `${tables[0].c}/3` },
        { label: 'Contrainte anti-double-booking', ok: cons.length > 0 },
      ],
    };
  } catch (e) {
    return { connected: false, checks: [], error: (e as Error).message };
  }
}

export default async function Home() {
  const { connected, checks, error } = await runChecks();
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 20px' }}>
      <p style={{ color: '#e0a458', fontWeight: 700, letterSpacing: '.14em', fontSize: 12, textTransform: 'uppercase', margin: 0 }}>
        Bloc 1 · Socle
      </p>
      <h1 style={{ fontSize: 34, margin: '10px 0 6px', letterSpacing: '-.02em' }}>TEMPO — API &amp; web</h1>
      <p style={{ color: '#6b6760', marginTop: 0 }}>
        Réservation et gestion de clientèle pour coiffeurs et barbiers du Bénin. Fondation Next.js + PostgreSQL/PostGIS.
      </p>

      <div style={{ background: '#fff', border: '1px solid #e5e1db', borderRadius: 16, padding: 22, marginTop: 24 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>État de la base</h2>
        {error && (
          <p style={{ color: '#b45309', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, padding: '10px 12px', fontSize: 14 }}>
            {error}
          </p>
        )}
        {connected && (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {checks.map((c) => (
              <li key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f0ece5', fontSize: 15 }}>
                <span style={{ width: 20, textAlign: 'center', color: c.ok ? '#16a34a' : '#dc2626', fontWeight: 700 }}>{c.ok ? '✓' : '✗'}</span>
                <span>{c.label}</span>
                {c.detail && <span style={{ color: '#6b6760', fontSize: 13 }}>({c.detail})</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p style={{ color: '#6b6760', fontSize: 13, marginTop: 20 }}>
        Endpoints : <code>/api/auth/*</code> (Better Auth) · <code>POST /api/reservations</code> · <code>GET /api/cron/rappels</code>
      </p>
    </main>
  );
}
