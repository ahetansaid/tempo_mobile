// Test du parcours pro : inscription (Better Auth) → publication du salon (API auth) →
// vérification que le salon publié apparaît dans la recherche. Serveur dev requis.
// Usage : node scripts/test-pro.mjs
const BASE = 'http://localhost:3000';
const tag = Date.now();
let pass = 0, fail = 0;
const check = (n, ok, x = '') => { console.log(`${ok ? '✓' : '✗'} ${n}${x ? ' — ' + x : ''}`); ok ? pass++ : fail++; };

// 1. Inscription pro
const email = `pro+${tag}@tempo.bj`;
const signup = await fetch(`${BASE}/api/auth/sign-up/email`, {
  method: 'POST', headers: { 'content-type': 'application/json', origin: BASE },
  body: JSON.stringify({ email, password: 'motdepasse123', name: 'Salon Onboarding Test' }),
});
check('Inscription pro', signup.status === 200, `HTTP ${signup.status}`);
const cookies = (signup.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).join('; ');
check('Cookie de session reçu', cookies.length > 0);

// 2. Publication du salon (authentifié)
const salon = await fetch(`${BASE}/api/pro/salon`, {
  method: 'POST', headers: { 'content-type': 'application/json', origin: BASE, cookie: cookies },
  body: JSON.stringify({
    nom: `Salon Onboarding ${tag}`, telephone: '+22997123456', adresse: 'Ganhi', ville: 'Cotonou',
    lat: 6.3660, lng: 2.4200,
    prestations: [
      { libelle: 'Coupe homme', dureeMin: 30, prixFcfa: 3000 },
      { libelle: 'Coupe + barbe', dureeMin: 45, prixFcfa: 5000 },
    ],
    horaires: { lun: [['09:00', '20:00']], mar: [['09:00', '20:00']], mer: [['09:00', '20:00']],
      jeu: [['09:00', '20:00']], ven: [['09:00', '20:00']], sam: [['09:00', '20:00']], dim: [] },
  }),
});
const sj = await salon.json();
check('Salon publié (201)', salon.status === 201, `HTTP ${salon.status} · slug ${sj.slug}`);

// 3. Refus si non authentifié
const anon = await fetch(`${BASE}/api/pro/salon`, {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ nom: 'X', lat: 6.37, lng: 2.39, prestations: [{ libelle: 'a', dureeMin: 30, prixFcfa: 0 }], horaires: {} }),
});
check('Sans session → 401', anon.status === 401, `HTTP ${anon.status}`);

// 4. Le salon apparaît dans la recherche
const rech = await (await fetch(`${BASE}/api/salons?lat=6.37&lng=2.39&rayon=8000`)).json();
const trouve = (rech.salons ?? []).some((s) => s.slug === sj.slug);
check('Salon visible dans la recherche', trouve, `${rech.count} salons`);

// 5. Sa fiche publique répond
const fiche = await fetch(`${BASE}/salon/${sj.slug}`);
check('Fiche publique accessible', fiche.status === 200, `HTTP ${fiche.status}`);

console.log(`\n${fail === 0 ? '✅ PARCOURS PRO OK' : '❌ ÉCHECS'} — ${pass} ok, ${fail} ko`);
process.exit(fail === 0 ? 0 : 1);
