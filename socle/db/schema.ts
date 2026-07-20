// =====================================================================
// TEMPO — Schéma Drizzle (tables métier)
// Les tables d'identité (user/session/account) sont générées par Better Auth
// (`npx @better-auth/cli generate`). Ici on modélise le domaine et on référence
// user.id (text). Les contraintes PostGIS/exclusion vivent dans 0001_postgis.sql.
// =====================================================================
import {
  pgTable, text, uuid, integer, boolean, timestamp, jsonb, numeric, pgEnum,
  customType, index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ---- Type PostGIS geography(Point,4326) : Drizzle ne le connaît pas nativement ----
const geographyPoint = customType<{ data: { lng: number; lat: number }; driverData: string }>({
  dataType() { return 'geography(Point,4326)'; },
  toDriver(v) { return `SRID=4326;POINT(${v.lng} ${v.lat})`; },
});

// ---- Enums ----
export const roleEnum        = pgEnum('role', ['pro', 'admin']);            // clientes = invité, pas de rôle
export const reservationStat = pgEnum('reservation_statut', ['en_attente', 'confirmee', 'terminee', 'annulee', 'absente']);
export const abonnementStat  = pgEnum('abonnement_statut', ['pilote_gratuit', 'actif', 'suspendu', 'resilie']);
export const notifType       = pgEnum('notif_type', ['reservation_recue', 'confirmation', 'rappel_j1', 'rappel_h1', 'modification', 'annulation']);

// ---- Professionnels (fiche publique + géo + abonnement) ----
export const professionnels = pgTable('professionnels', {
  id:         uuid('id').defaultRandom().primaryKey(),
  userId:     text('user_id').notNull(),                 // -> Better Auth user.id
  nom:        text('nom').notNull(),
  slug:       text('slug').notNull().unique(),           // URL publique (lien Instagram)
  telephone:  text('telephone'),
  adresse:    text('adresse'),
  ville:      text('ville'),
  position:   geographyPoint('position'),                // PostGIS
  photoUrl:   text('photo_url'),
  horaires:   jsonb('horaires').notNull().default('{}'), // {lun:[["09:00","18:00"]], ...}
  scoreFiabilite: numeric('score_fiabilite', { precision: 3, scale: 1 }),
  publie:     boolean('publie').notNull().default(false),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  villeIdx: index('pro_ville_idx').on(t.ville),
  // index GiST spatial sur `position` : créé dans 0001_postgis.sql
}));

// ---- Services proposés ----
export const services = pgTable('services', {
  id:         uuid('id').defaultRandom().primaryKey(),
  proId:      uuid('pro_id').notNull().references(() => professionnels.id, { onDelete: 'cascade' }),
  libelle:    text('libelle').notNull(),
  dureeMin:   integer('duree_min').notNull(),
  prixFcfa:   integer('prix_fcfa').notNull(),
});

// ---- Disponibilités / créneaux ouverts ----
export const disponibilites = pgTable('disponibilites', {
  id:         uuid('id').defaultRandom().primaryKey(),
  proId:      uuid('pro_id').notNull().references(() => professionnels.id, { onDelete: 'cascade' }),
  debut:      timestamp('debut', { withTimezone: true }).notNull(),
  fin:        timestamp('fin', { withTimezone: true }).notNull(),
  bloque:     boolean('bloque').notNull().default(false),  // indispo posée par le pro
}, (t) => ({
  proDebutIdx: index('dispo_pro_debut_idx').on(t.proId, t.debut),
}));

// ---- Réservations (client = invité : nom + téléphone, pas de compte) ----
// La contrainte anti-double-booking (EXCLUDE USING gist) est dans 0001_postgis.sql.
export const reservations = pgTable('reservations', {
  id:           uuid('id').defaultRandom().primaryKey(),
  proId:        uuid('pro_id').notNull().references(() => professionnels.id, { onDelete: 'cascade' }),
  serviceId:    uuid('service_id').references(() => services.id),
  clientUserId: text('client_user_id'),                  // renseigné si cliente a un compte (app)
  clientNom:    text('client_nom').notNull(),
  clientTel:    text('client_tel').notNull(),
  debut:        timestamp('debut', { withTimezone: true }).notNull(),
  fin:          timestamp('fin', { withTimezone: true }).notNull(),
  statut:       reservationStat('statut').notNull().default('en_attente'),
  createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  proDebutIdx: index('resa_pro_debut_idx').on(t.proId, t.debut),
}));

// ---- Centre de notifications in-app ----
export const notifications = pgTable('notifications', {
  id:        uuid('id').defaultRandom().primaryKey(),
  userId:    text('user_id').notNull(),                  // destinataire (pro user.id, ou client si compte)
  type:      notifType('type').notNull(),
  payload:   jsonb('payload').notNull().default('{}'),
  duA:       timestamp('du_a', { withTimezone: true }).notNull(),  // quand le rappel doit partir
  lu:        boolean('lu').notNull().default(false),
  envoye:    boolean('envoye').notNull().default(false),  // push FCM déjà tentée ?
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  dusIdx: index('notif_dus_idx').on(t.duA).where(sql`envoye = false`),
}));

// ---- Appareils FCM (un user peut avoir plusieurs devices) ----
export const appareilsFcm = pgTable('appareils_fcm', {
  id:        uuid('id').defaultRandom().primaryKey(),
  userId:    text('user_id').notNull(),
  token:     text('token').notNull().unique(),
  plateforme: text('plateforme'),                        // 'android' | 'ios' | 'web'
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---- Abonnements (1 USD/mois, pilote gratuit) ----
export const abonnements = pgTable('abonnements', {
  id:        uuid('id').defaultRandom().primaryKey(),
  proId:     uuid('pro_id').notNull().references(() => professionnels.id, { onDelete: 'cascade' }),
  statut:    abonnementStat('statut').notNull().default('pilote_gratuit'),
  debutePar: timestamp('debute_par', { withTimezone: true }),
  prochaineEcheance: timestamp('prochaine_echeance', { withTimezone: true }),
});
