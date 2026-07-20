// =====================================================================
// Exemple de route — montre TOUT le pattern du socle en un endroit :
//   auth/autorisation · validation · anti-double-booking base · notifications.
// POST /api/reservations  (réservation invité : cliente non authentifiée)
// =====================================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import { notifierUtilisateur } from '@/lib/notifications';

const { reservations, professionnels } = schema;

const Body = z.object({
  proId: z.string().uuid(),
  serviceId: z.string().uuid().optional(),
  clientNom: z.string().min(2),
  clientTel: z.string().min(8),
  debut: z.string().datetime(),
  fin: z.string().datetime(),
});

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'données invalides' }, { status: 400 });
  const b = parsed.data;

  const [pro] = await db.select().from(professionnels).where(eq(professionnels.id, b.proId));
  if (!pro || !pro.publie) return NextResponse.json({ error: 'salon introuvable' }, { status: 404 });

  try {
    // La contrainte d'exclusion PostgreSQL empêche tout chevauchement :
    // si le créneau est déjà pris, l'INSERT lève l'erreur 23P01.
    const [resa] = await db.insert(reservations).values({
      proId: b.proId,
      serviceId: b.serviceId,
      clientNom: b.clientNom,
      clientTel: b.clientTel,
      debut: new Date(b.debut),
      fin: new Date(b.fin),
      statut: 'en_attente',
    }).returning();

    // Notifie le pro tout de suite (push + centre in-app).
    await notifierUtilisateur({
      userId: pro.userId,
      type: 'reservation_recue',
      titre: 'Nouvelle réservation',
      corps: `${b.clientNom} a réservé le ${new Date(b.debut).toLocaleString('fr-FR')}.`,
      payload: { reservationId: resa.id },
    });

    // Programme les rappels de la cliente SI elle a un compte/appareil (app installée).
    // (réservation invité web sans app : pas de rappel hors-app — cf. ARCHITECTURE.md §3)

    return NextResponse.json({ reservation: resa }, { status: 201 });
  } catch (e: any) {
    // drizzle enveloppe l'erreur postgres : le SQLSTATE peut être sur e.code OU e.cause.code.
    const code = e?.code ?? e?.cause?.code;
    if (code === '23P01') {  // exclusion_violation = créneau déjà pris
      return NextResponse.json({ error: 'Ce créneau vient d\'être réservé.' }, { status: 409 });
    }
    throw e;
  }
}
