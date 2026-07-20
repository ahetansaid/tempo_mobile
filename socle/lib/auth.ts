// =====================================================================
// Auth — Better Auth sur NOTRE Postgres (remplace Supabase Auth).
// - Pro : email + mot de passe (aucun OTP -> aucun SMS).
// - Flutter : plugin `bearer` -> jeton porté dans l'en-tête Authorization.
// - Les clientes en réservation invité n'ont PAS de compte (voir reservations).
// Génère les tables : `npx @better-auth/cli generate`
// =====================================================================
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer } from 'better-auth/plugins';
import { db } from '../db';
import { user, session, account, verification } from '../db/auth-schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user, session, account, verification },
  }),

  // Auth pro : email + mot de passe. Pas de canal à envoyer, donc pas de SMS.
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30,   // 30 jours
    updateAge: 60 * 60 * 24,        // rafraîchi chaque jour
  },

  // `bearer` : l'app Flutter reçoit un token et l'envoie en Authorization: Bearer ...
  plugins: [bearer()],

  trustedOrigins: [process.env.APP_URL!],
});

// Helper d'autorisation à appeler en tête de chaque route API protégée.
// Fonctionne pour le web (cookie de session) ET Flutter (bearer token).
export async function getSession(headers: Headers) {
  return auth.api.getSession({ headers });
}
