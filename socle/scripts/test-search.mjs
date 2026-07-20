// Vérifie la requête ST_DWithin sans passer par le serveur.
// Usage : node --env-file=.env scripts/test-search.mjs
import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL, { max: 1 });
const lat = 6.3703, lng = 2.3912, rayon = 5000; // centre Cotonou, 5 km

try {
  const rows = await sql`
    SELECT p.nom, p.adresse AS quartier,
           round(ST_Distance(p.position, ST_SetSRID(ST_MakePoint(${lng},${lat}),4326)::geography)) AS distance_m,
           (SELECT min(prix_fcfa) FROM services s WHERE s.pro_id = p.id) AS prix_min
    FROM professionnels p
    WHERE p.publie = true AND p.position IS NOT NULL
      AND ST_DWithin(p.position, ST_SetSRID(ST_MakePoint(${lng},${lat}),4326)::geography, ${rayon})
    ORDER BY distance_m ASC`;
  console.log(`Salons dans ${rayon / 1000} km du centre de Cotonou :\n`);
  for (const r of rows) {
    console.log(`  ${String(r.distance_m).padStart(5)} m — ${r.nom} (${r.quartier}) · dès ${r.prix_min} FCFA`);
  }
  console.log(`\n${rows.length} résultat(s).`);
} catch (e) {
  console.error('✗', e.message);
  process.exitCode = 1;
} finally { await sql.end(); }
