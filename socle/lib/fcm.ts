// =====================================================================
// Push FCM — remplace le "realtime" de Supabase pour les alertes.
// Initialisation PARESSEUSE : tant que Firebase n'est pas configuré
// (variables FIREBASE_* absentes), la push est un no-op silencieux —
// le centre de notifications in-app (table `notifications`) fonctionne quand même.
// =====================================================================
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

let app: App | null = null;
let avertiUneFois = false;

function estConfigure() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY,
  );
}

function getApp(): App | null {
  if (!estConfigure()) {
    if (!avertiUneFois) {
      console.warn('[fcm] Firebase non configuré — push désactivée (notifications in-app seules).');
      avertiUneFois = true;
    }
    return null;
  }
  if (!app) {
    app = getApps()[0] ?? initializeApp({
      credential: cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return app;
}

/** Envoie une push à plusieurs tokens. Retourne les tokens invalides à purger. */
export async function pousser(tokens: string[], titre: string, corps: string, data: Record<string, string> = {}) {
  const application = getApp();
  if (!application || !tokens.length) return { invalides: [] as string[] };

  const res = await getMessaging(application).sendEachForMulticast({
    tokens,
    notification: { title: titre, body: corps },
    data,
  });
  const invalides: string[] = [];
  res.responses.forEach((r, i) => {
    if (!r.success && r.error?.code === 'messaging/registration-token-not-registered') {
      invalides.push(tokens[i]);
    }
  });
  return { invalides };
}
