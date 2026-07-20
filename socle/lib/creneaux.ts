// Génération des créneaux d'un salon pour une date + une durée de prestation.
// Créneaux = fenêtres d'ouverture (horaires) découpées au pas donné, en retirant
// ceux qui chevauchent une réservation active ou une indisponibilité posée par le pro.
// Le Bénin est à GMT+1 sans heure d'été → on ancre les heures locales avec +01:00.
import { and, eq, gte, lt, inArray } from 'drizzle-orm';
import { db } from '../db';
import { reservations, disponibilites } from '../db/schema';
import type { Horaires, Jour } from './salons';

export const TZ_OFFSET = '+01:00';
const JOUR_KEYS: Jour[] = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];
const PAS_MIN = 30;

export type EtatCreneau = 'libre' | 'pris';
export type Creneau = { heure: string; debut: string; fin: string; etat: EtatCreneau };

const hhmmToMin = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const minToHHMM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const iso = (dateISO: string, min: number) => `${dateISO}T${minToHHMM(min)}:00${TZ_OFFSET}`;

/** Renvoie tous les créneaux du jour avec leur état (libre/pris). */
export async function creneauxDuJour(opts: {
  proId: string; dateISO: string; horaires: Horaires; dureeMin: number;
}): Promise<Creneau[]> {
  const { proId, dateISO, horaires, dureeMin } = opts;

  const jour = JOUR_KEYS[new Date(`${dateISO}T12:00:00${TZ_OFFSET}`).getDay()];
  const plages = horaires[jour] ?? [];
  if (plages.length === 0) return [];

  // Bornes du jour (instants) pour ne charger que ce qui nous concerne.
  const jourDebut = new Date(`${dateISO}T00:00:00${TZ_OFFSET}`);
  const jourFin = new Date(`${dateISO}T23:59:59${TZ_OFFSET}`);

  const [resas, indispos] = await Promise.all([
    db.select({ debut: reservations.debut, fin: reservations.fin }).from(reservations)
      .where(and(
        eq(reservations.proId, proId),
        inArray(reservations.statut, ['en_attente', 'confirmee']),
        gte(reservations.debut, jourDebut), lt(reservations.debut, jourFin),
      )),
    db.select({ debut: disponibilites.debut, fin: disponibilites.fin }).from(disponibilites)
      .where(and(
        eq(disponibilites.proId, proId), eq(disponibilites.bloque, true),
        gte(disponibilites.debut, jourDebut), lt(disponibilites.debut, jourFin),
      )),
  ]);
  const occupes = [...resas, ...indispos].map((r) => [new Date(r.debut).getTime(), new Date(r.fin).getTime()] as const);

  const maintenant = Date.now();
  const creneaux: Creneau[] = [];
  for (const [a, b] of plages) {
    const finPlage = hhmmToMin(b);
    for (let start = hhmmToMin(a); start + dureeMin <= finPlage; start += PAS_MIN) {
      const debutISO = iso(dateISO, start);
      const finISO = iso(dateISO, start + dureeMin);
      const t0 = new Date(debutISO).getTime();
      const t1 = new Date(finISO).getTime();
      const chevauche = occupes.some(([o0, o1]) => t0 < o1 && t1 > o0);
      const passe = t0 < maintenant;
      creneaux.push({ heure: minToHHMM(start), debut: debutISO, fin: finISO, etat: chevauche || passe ? 'pris' : 'libre' });
    }
  }
  return creneaux;
}
