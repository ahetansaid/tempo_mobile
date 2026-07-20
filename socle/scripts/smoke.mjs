// Test de bout en bout du socle — à lancer avec le serveur dev démarré (npm run dev).
// Usage : node --env-file=.env scripts/smoke.mjs
//
// Prouve : inscription pro (Better Auth) + réservation invité + ANTI-DOUBLE-BOOKING
// (deux créneaux qui se chevauchent → le 2e est refusé par la base, code 409).
import postgres from 'postgres';

const BASE = process.env.APP_URL || 'http://localhost:3000';
const sql = postgres(process.env.DATABASE_URL, { max: 1 });
const tag = Date.now();
let pass = 0, fail = 0;

function check(name, ok, extra = '') {
  console.log(`${ok ? '✓' : '✗'} ${name}${extra ? ' — ' + extra : ''}`);
  ok ? pass++ : fail++;
}

async function post(path, body) {
  const r = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: BASE },
    body: JSON.stringify(body),
  });
  let json = null;
  try { json = await r.json(); } catch {}
  return { status: r.status, json };
}

try {
  // 1. Inscription pro (email + mot de passe, aucun OTP)
  const email = `pro+${tag}@tempo.bj`;
  const signup = await post('/api/auth/sign-up/email', {
    email, password: 'motdepasse123', name: 'Salon Test',
  });
  check('Inscription pro (Better Auth)', signup.status === 200, `HTTP ${signup.status}${signup.status !== 200 ? ' — ' + JSON.stringify(signup.json) : ''}`);

  const [u] = await sql`SELECT id FROM "user" WHERE email = ${email}`;
  check('Utilisateur créé en base', !!u, u ? u.id : 'introuvable');
  if (!u) throw new Error('pas de user — on arrête');

  // 2. Créer un professionnel publié rattaché à ce user
  const [pro] = await sql`
    INSERT INTO professionnels (user_id, nom, slug, ville, publie)
    VALUES (${u.id}, 'Salon Test', ${'salon-test-' + tag}, 'Cotonou', true)
    RETURNING id`;
  check('Professionnel publié créé', !!pro, pro?.id);

  // 3. Réservation invité — créneau A (09:00 → 09:45 demain)
  const day = new Date(Date.now() + 86400000);
  const at = (h, m) => new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), h, m)).toISOString();
  const base = { proId: pro.id, clientNom: 'Awa Kpodo', clientTel: '+2299700000' };

  const rA = await post('/api/reservations', { ...base, debut: at(9, 0), fin: at(9, 45) });
  check('Réservation A acceptée (201)', rA.status === 201, `HTTP ${rA.status}`);

  // 4. Créneau B qui CHEVAUCHE A (09:30 → 10:15) → doit être refusé (409)
  const rB = await post('/api/reservations', { ...base, clientNom: 'Fatou Adjovi', debut: at(9, 30), fin: at(10, 15) });
  check('Chevauchement refusé par la base (409)', rB.status === 409, `HTTP ${rB.status} — ${rB.json?.error ?? ''}`);

  // 5. Créneau C sans chevauchement (10:30 → 11:00) → accepté (201)
  const rC = await post('/api/reservations', { ...base, clientNom: 'Junior A.', debut: at(10, 30), fin: at(11, 0) });
  check('Créneau libre accepté (201)', rC.status === 201, `HTTP ${rC.status}`);

  console.log(`\n${fail === 0 ? '✅ TOUT PASSE' : '❌ ÉCHECS'} — ${pass} ok, ${fail} ko`);
} catch (e) {
  console.error('Erreur :', e.message);
  fail++;
} finally {
  await sql.end();
  process.exitCode = fail === 0 ? 0 : 1;
}
