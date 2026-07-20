# TEMPO — Dossier d'étude technique

Application de réservation et de gestion de clientèle pour les coiffeurs, barbiers et salons
du Bénin (Cotonou & Abomey-Calavi). Ce dossier contient l'étude de faisabilité et
l'architecture MVP, à partir du document projet v1.0.

## Contenu

| Fichier | Rôle |
|---|---|
| `ETUDE_FAISABILITE.md` | Verdict, faisabilité des 7 fonctions V1, points de fragilité, dérisquage |
| `ARCHITECTURE.md` | Stack retenue, surfaces, notifications in-app, modèle de données, auth, séquençage |
| `POC_NOTIFICATIONS.md` | POC de bout en bout des notifications (device FCM → réservation → push + centre in-app) |

## Stack retenue

- **Flutter** — app mobile professionnel (natif : agenda, push FCM, offline, géoloc)
- **Next.js** — **fullstack** : API REST (consommée par Flutter) + front-office web (découverte,
  fiches pros SSR, réservation cliente sans install) + back-office (admin porteur)
- **PostgreSQL 16 + PostGIS** — base de données (sans Supabase), via **Drizzle ORM**
- **JWT maison** (`jose`) — auth email+mot de passe (pro), réservation invité (cliente)
- **FCM** — notifications push (mobile + web)
- **Cloudflare R2** — stockage des photos (S3-compatible)
- **Vercel Cron** — planificateur des rappels 24h/1h
- **MapLibre + OpenStreetMap** — cartographie sans facturation Google

## Décisions techniques actées

1. **PostgreSQL nu, sans Supabase.** L'auth, le stockage, le temps réel et le cron sont
   ré-assemblés à la main (voir le tableau des remplacements dans `ARCHITECTURE.md` §2).
2. **API backend unique dans Next.js** (Route Handlers), consommée par Flutter et le web.
3. **Notifications 100 % in-app** (push FCM + centre de notifications) — **pas de WhatsApp ni SMS**.
4. **Auth sans SMS** : email+mot de passe côté pro, réservation invité côté cliente.
5. **Cliente = web-first** (réservation invité) → protège l'amorçage. App cliente Flutter = Phase 2.
6. **Anti-double-booking par contrainte d'exclusion PostgreSQL**, pas en code applicatif.
7. **Géoloc via PostGIS** (`ST_DWithin`), pas de calcul de distance naïf.

> Notes : le natif (Flutter) inverse la décision V1 du document (« la PWA suffit »), et Postgres
> nu ajoute de la surface à construire au bloc 1 (auth/storage/cron). Upgrades défendables, mais
> à budgéter — d'où le séquençage en 5 blocs dans `ARCHITECTURE.md`.

## Prochaine étape (au choix)

- **Schéma PostgreSQL complet** (PostGIS + anti-double-booking + Drizzle) en SQL exécutable
- **POC notifications** (push FCM + centre in-app + Vercel Cron des rappels 24h/1h)
- **POC recherche géolocalisée** (PostGIS + carte MapLibre)
- **POC auth JWT** (login pro web + appel API authentifié depuis Flutter)
- **Architecture formalisée en artefact web partageable**
