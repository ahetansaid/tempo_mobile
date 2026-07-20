// Test du tunnel de réservation web (serveur dev requis).
// Usage : node scripts/test-booking.mjs
const BASE = 'http://localhost:3000';
const slug = 'seed-art-du-rasoir';
let pass = 0, fail = 0;
const check = (n, ok, x = '') => { console.log(`${ok ? '✓' : '✗'} ${n}${x ? ' — ' + x : ''}`); ok ? pass++ : fail++; };

const isoLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

async function creneaux(date) {
  const r = await fetch(`${BASE}/api/salons/${slug}/creneaux?date=${date}`);
  return r.json();
}

// Trouver un jour ouvert dans les 7 prochains
let data, date;
for (let i = 1; i <= 7; i++) {
  const d = new Date(); d.setDate(d.getDate() + i);
  date = isoLocal(d);
  data = await creneaux(date);
  if ((data.creneaux ?? []).length > 0) break;
}
check('Créneaux générés', (data.creneaux ?? []).length > 0, `${date} · ${data.creneaux?.length} créneaux · service ${data.service?.libelle}`);
const libres = data.creneaux.filter((c) => c.etat === 'libre');
check('Au moins un créneau libre', libres.length > 0, `${libres.length} libres`);

const cible = libres[Math.floor(libres.length / 2)]; // un créneau au milieu de la journée
const proId = (await (await fetch(`${BASE}/api/salons?rayon=20000`)).json()).salons.find((s) => s.slug === slug)?.id;

const res = await fetch(`${BASE}/api/reservations`, {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    proId, serviceId: data.service.id, clientNom: 'Test Cliente', clientTel: '+22990000000',
    debut: new Date(cible.debut).toISOString(), fin: new Date(cible.fin).toISOString(),
  }),
});
check('Réservation invité acceptée (201)', res.status === 201, `HTTP ${res.status} · créneau ${cible.heure}`);

// Re-générer : le créneau réservé doit maintenant être "pris"
const apres = await creneaux(date);
const memeSlot = apres.creneaux.find((c) => c.heure === cible.heure);
check('Le créneau réservé est maintenant "pris"', memeSlot?.etat === 'pris', `${cible.heure} → ${memeSlot?.etat}`);

// Doublon direct sur le même créneau → 409
const dup = await fetch(`${BASE}/api/reservations`, {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    proId, serviceId: data.service.id, clientNom: 'Autre', clientTel: '+22990000001',
    debut: new Date(cible.debut).toISOString(), fin: new Date(cible.fin).toISOString(),
  }),
});
check('Doublon refusé (409)', dup.status === 409, `HTTP ${dup.status}`);

console.log(`\n${fail === 0 ? '✅ TUNNEL OK' : '❌ ÉCHECS'} — ${pass} ok, ${fail} ko`);
process.exit(fail === 0 ? 0 : 1);
