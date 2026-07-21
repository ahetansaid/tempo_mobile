// POST /api/pro/salon — crée (et publie) le salon du professionnel connecté,
// avec ses prestations et ses horaires. Idempotent : si le pro a déjà un salon,
// on renvoie le sien sans doublon.
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sql } from 'drizzle-orm';
import { db, schema } from '@/db';
import { getSession } from '@/lib/auth';
import { slugUnique, salonDuPro } from '@/lib/pro';

const { services } = schema;

const Presta = z.object({
  libelle: z.string().min(1).max(60),
  dureeMin: z.number().int().positive().max(600),
  prixFcfa: z.number().int().nonnegative().max(1_000_000),
});

const Body = z.object({
  nom: z.string().min(2).max(80),
  telephone: z.string().max(30).optional(),
  adresse: z.string().max(120).optional(),   // quartier
  ville: z.string().max(80).optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  prestations: z.array(Presta).min(1).max(30),
  horaires: z.record(z.array(z.tuple([z.string(), z.string()]))),
});

export async function POST(req: NextRequest) {
  const session = await getSession(req.headers);
  if (!session?.user) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'données invalides', details: parsed.error.flatten() }, { status: 400 });
  const b = parsed.data;

  // Un seul salon par pro (pour l'instant) : si déjà présent, on le renvoie.
  const existant = await salonDuPro(session.user.id);
  if (existant) return NextResponse.json({ slug: existant.slug, existing: true });

  const slug = await slugUnique(b.nom);

  const rows = await db.execute<{ id: string; slug: string }>(sql`
    INSERT INTO professionnels (user_id, nom, slug, telephone, adresse, ville, position, horaires, publie)
    VALUES (${session.user.id}, ${b.nom}, ${slug}, ${b.telephone ?? null}, ${b.adresse ?? null}, ${b.ville ?? null},
            ST_SetSRID(ST_MakePoint(${b.lng}, ${b.lat}), 4326)::geography,
            ${JSON.stringify(b.horaires)}::jsonb, true)
    RETURNING id, slug`);
  const pro = rows[0];

  await db.insert(services).values(
    b.prestations.map((p) => ({ proId: pro.id, libelle: p.libelle, dureeMin: p.dureeMin, prixFcfa: p.prixFcfa })),
  );

  return NextResponse.json({ slug: pro.slug }, { status: 201 });
}
