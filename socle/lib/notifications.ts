// =====================================================================
// Notifications — la brique qui unifie "centre in-app" + "push FCM".
// notifierUtilisateur() : crée la notif in-app ET pousse (ou programme un rappel).
// =====================================================================
import { eq, inArray } from 'drizzle-orm';
import { db, schema } from '@/db';
import { pousser } from './fcm';

const { notifications, appareilsFcm } = schema;

type TypeNotif = typeof schema.notifType.enumValues[number];

/** Notifie tout de suite (duA = maintenant) ou programme un rappel (duA futur). */
export async function notifierUtilisateur(opts: {
  userId: string;
  type: TypeNotif;
  titre: string;
  corps: string;
  payload?: Record<string, unknown>;
  duA?: Date;                 // absent = immédiat
}) {
  const immediat = !opts.duA || opts.duA <= new Date();

  // 1. Toujours écrire dans le centre de notifications in-app.
  const [notif] = await db.insert(notifications).values({
    userId: opts.userId,
    type: opts.type,
    payload: (opts.payload ?? {}) as any,
    duA: opts.duA ?? new Date(),
    envoye: false,
  }).returning();

  // 2. Si immédiat, pousser maintenant. Sinon, le cron s'en chargera à l'échéance.
  if (immediat) await envoyerPush(notif.id, opts.userId, opts.titre, opts.corps, opts.payload);
  return notif;
}

/** Envoie la push d'une notif et purge les tokens morts. Idempotent via `envoye`. */
export async function envoyerPush(
  notifId: string, userId: string, titre: string, corps: string, payload?: Record<string, unknown>,
) {
  const devices = await db.select().from(appareilsFcm).where(eq(appareilsFcm.userId, userId));
  const tokens = devices.map((d) => d.token);

  const data = Object.fromEntries(Object.entries(payload ?? {}).map(([k, v]) => [k, String(v)]));
  const { invalides } = await pousser(tokens, titre, corps, data);

  if (invalides.length) await db.delete(appareilsFcm).where(inArray(appareilsFcm.token, invalides));
  await db.update(notifications).set({ envoye: true }).where(eq(notifications.id, notifId));
}
