// Données de démonstration : salons de Cotonou & Abomey-Calavi avec position PostGIS
// et prestations. Idempotent : purge les salons "seed-*" puis réinsère.
// Usage : node --env-file=.env scripts/seed.mjs
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

// Horaires par défaut : lun–sam 09:00–20:00, dimanche fermé.
const H_STD = { lun: [['09:00', '20:00']], mar: [['09:00', '20:00']], mer: [['09:00', '20:00']],
  jeu: [['09:00', '20:00']], ven: [['09:00', '20:00']], sam: [['09:00', '20:00']], dim: [] };
// Ouvert aussi le dimanche matin.
const H_DIM = { ...H_STD, dim: [['10:00', '14:00']] };

const SALONS = [
  { slug: 'seed-art-du-rasoir', nom: "L'Art du Rasoir", quartier: 'Fidjrossè', ville: 'Cotonou',
    lng: 2.3850, lat: 6.3620, tel: '+22997000001', score: 9.2,
    services: [['Coupe homme', 30, 3000], ['Coupe + barbe', 45, 5000], ['Rasage à l’ancienne', 40, 6000], ['Barbe', 20, 2000]] },
  { slug: 'seed-barber-elite', nom: 'Barbershop Élite', quartier: 'Ganhi', ville: 'Cotonou',
    lng: 2.4280, lat: 6.3650, tel: '+22997000002', score: 8.7,
    services: [['Coupe homme', 30, 3500], ['Dégradé américain', 40, 4500], ['Coupe + barbe', 45, 6000]] },
  { slug: 'seed-coupe-nette', nom: 'Studio Coupe Nette', quartier: 'Haie Vive', ville: 'Cotonou',
    lng: 2.4050, lat: 6.3700, tel: '+22997000003', score: 8.1,
    services: [['Coupe homme', 30, 3000], ['Coloration', 90, 12000], ['Barbe', 20, 2000]] },
  { slug: 'seed-chez-malick', nom: 'Chez Malick Barbier', quartier: 'Cadjèhoun', ville: 'Cotonou',
    lng: 2.3900, lat: 6.3760, tel: '+22997000004', score: 9.0,
    services: [['Coupe homme', 30, 2500], ['Coupe + barbe', 45, 4000], ['Dégradé', 40, 3500]] },
  { slug: 'seed-fade-master', nom: 'Fade Master', quartier: 'Akpakpa', ville: 'Cotonou',
    lng: 2.4500, lat: 6.3630, tel: '+22997000005', score: 7.4,
    services: [['Dégradé américain', 40, 4000], ['Coupe enfant', 25, 2000], ['Barbe', 20, 1500]] },
  { slug: 'seed-tresses-style', nom: 'Tresses & Style', quartier: 'Abomey-Calavi', ville: 'Abomey-Calavi',
    lng: 2.3556, lat: 6.4489, tel: '+22997000006', score: 8.9,
    services: [['Tresses', 120, 8000], ['Coloration', 90, 12000], ['Coupe femme', 45, 6000]] },
];

try {
  await sql`DELETE FROM services WHERE pro_id IN (SELECT id FROM professionnels WHERE slug LIKE 'seed-%')`;
  await sql`DELETE FROM professionnels WHERE slug LIKE 'seed-%'`;

  for (const s of SALONS) {
    const horaires = s.slug === 'seed-tresses-style' ? H_DIM : H_STD;
    const [pro] = await sql`
      INSERT INTO professionnels (user_id, nom, slug, telephone, adresse, ville, position, horaires, score_fiabilite, publie)
      VALUES (${'seed-user'}, ${s.nom}, ${s.slug}, ${s.tel}, ${s.quartier}, ${s.ville},
              ST_SetSRID(ST_MakePoint(${s.lng}, ${s.lat}), 4326)::geography, ${sql.json(horaires)}, ${s.score}, true)
      RETURNING id`;
    for (const [libelle, duree, prix] of s.services) {
      await sql`INSERT INTO services (pro_id, libelle, duree_min, prix_fcfa) VALUES (${pro.id}, ${libelle}, ${duree}, ${prix})`;
    }
    console.log(`✓ ${s.nom} (${s.quartier}) — ${s.services.length} prestations`);
  }
  console.log(`\n✅ ${SALONS.length} salons insérés.`);
} catch (e) {
  console.error('✗ Échec :', e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
