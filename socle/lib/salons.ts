// Recherche géolocalisée des salons (F1). PostGIS ST_DWithin sur `position`,
// tri par distance, prix d'appel calculé depuis les prestations.
// Utilisée par l'API (/api/salons) ET par la page front-office (SSR).
import { sql, eq, and, asc } from 'drizzle-orm';
import { db } from '../db';
import { professionnels, services } from '../db/schema';

// Centre de Cotonou par défaut (si la cliente ne partage pas sa position).
export const COTONOU = { lat: 6.3703, lng: 2.3912 };

export type SalonProche = {
  id: string;
  nom: string;
  slug: string;
  quartier: string | null;
  ville: string | null;
  photoUrl: string | null;
  scoreFiabilite: number | null;
  distanceM: number;
  prixMin: number | null;
};

export async function rechercherSalons(opts: {
  lat?: number; lng?: number; rayonM?: number; limite?: number;
} = {}): Promise<SalonProche[]> {
  const lat = opts.lat ?? COTONOU.lat;
  const lng = opts.lng ?? COTONOU.lng;
  const rayon = opts.rayonM ?? 5000;
  const limite = opts.limite ?? 30;

  const point = sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography`;

  const rows = await db.execute<{
    id: string; nom: string; slug: string; adresse: string | null; ville: string | null;
    photo_url: string | null; score_fiabilite: string | null; distance_m: number; prix_min: number | null;
  }>(sql`
    SELECT p.id, p.nom, p.slug, p.adresse, p.ville, p.photo_url, p.score_fiabilite,
           ST_Distance(p.position, ${point}) AS distance_m,
           (SELECT min(prix_fcfa) FROM services s WHERE s.pro_id = p.id) AS prix_min
    FROM professionnels p
    WHERE p.publie = true
      AND p.position IS NOT NULL
      AND ST_DWithin(p.position, ${point}, ${rayon})
    ORDER BY distance_m ASC
    LIMIT ${limite}
  `);

  return rows.map((r) => ({
    id: r.id,
    nom: r.nom,
    slug: r.slug,
    quartier: r.adresse,
    ville: r.ville,
    photoUrl: r.photo_url,
    scoreFiabilite: r.score_fiabilite === null ? null : Number(r.score_fiabilite),
    distanceM: Math.round(Number(r.distance_m)),
    prixMin: r.prix_min === null ? null : Number(r.prix_min),
  }));
}

// ---- F2 : fiche d'un salon ----
export type Jour = 'lun' | 'mar' | 'mer' | 'jeu' | 'ven' | 'sam' | 'dim';
export type Horaires = Partial<Record<Jour, [string, string][]>>;
export type Prestation = { id: string; libelle: string; dureeMin: number; prixFcfa: number };
export type SalonDetail = {
  id: string; nom: string; slug: string; telephone: string | null;
  quartier: string | null; ville: string | null; adresse: string | null;
  photoUrl: string | null; scoreFiabilite: number | null; horaires: Horaires;
  prestations: Prestation[];
};

export async function getSalonBySlug(slug: string): Promise<SalonDetail | null> {
  const [pro] = await db.select().from(professionnels)
    .where(and(eq(professionnels.slug, slug), eq(professionnels.publie, true)))
    .limit(1);
  if (!pro) return null;

  const prestations = await db.select().from(services)
    .where(eq(services.proId, pro.id))
    .orderBy(asc(services.prixFcfa));

  return {
    id: pro.id,
    nom: pro.nom,
    slug: pro.slug,
    telephone: pro.telephone,
    quartier: pro.adresse,
    ville: pro.ville,
    adresse: pro.adresse,
    photoUrl: pro.photoUrl,
    scoreFiabilite: pro.scoreFiabilite === null ? null : Number(pro.scoreFiabilite),
    horaires: (pro.horaires ?? {}) as Horaires,
    prestations: prestations.map((s) => ({
      id: s.id, libelle: s.libelle, dureeMin: s.dureeMin, prixFcfa: s.prixFcfa,
    })),
  };
}
