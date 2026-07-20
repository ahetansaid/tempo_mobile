// =====================================================================
// Planificateur de rappels — remplace le cron/Edge Function de Supabase.
// Vercel Cron appelle cette route chaque minute (voir vercel.json).
// Elle envoie toutes les notifications dues (rappels J-1, H-1) et non encore poussées.
// =====================================================================
import { NextRequest, NextResponse } from 'next/server';
import { and, lte, eq } from 'drizzle-orm';
import { db, schema } from '@/db';
import { envoyerPush } from '@/lib/notifications';

const { notifications } = schema;

export const runtime = 'nodejs';

const LIBELLES: Record<string, [string, string]> = {
  rappel_j1:  ['Rappel — demain', 'Vous avez un rendez-vous demain.'],
  rappel_h1:  ['Rappel — dans 1h', 'Votre rendez-vous est dans une heure.'],
  reservation_recue: ['Nouvelle réservation', 'Une cliente vient de réserver un créneau.'],
};

export async function GET(req: NextRequest) {
  // Sécurise la route : seul Vercel Cron (avec le secret) peut la déclencher.
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'non autorisé' }, { status: 401 });
  }

  // Rappels dus (duA <= maintenant) et pas encore poussés.
  const dus = await db.select().from(notifications)
    .where(and(lte(notifications.duA, new Date()), eq(notifications.envoye, false)))
    .limit(200);

  let envoyes = 0;
  for (const n of dus) {
    const [titre, corps] = LIBELLES[n.type] ?? ['TEMPO', 'Vous avez une notification.'];
    try {
      await envoyerPush(n.id, n.userId, titre, corps, n.payload as Record<string, unknown>);
      envoyes++;
    } catch {
      // On laisse envoye=false : la prochaine minute réessaiera (résilience).
    }
  }

  return NextResponse.json({ dus: dus.length, envoyes });
}
