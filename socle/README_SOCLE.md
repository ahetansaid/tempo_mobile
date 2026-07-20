# TEMPO — Socle kit (bloc 1)

> La proposition « soutenue » pour remplacer Supabase **sans le coder à la main** :
> assembler 4 librairies ciblées sur ton propre PostgreSQL. Chaque brique que Supabase
> offrait devient un composant éprouvé, pas de la plomberie artisanale.

## Principe : ne pas réinventer, câbler

| Brique Supabase | On la remplace par | Fichier du socle | Effort |
|---|---|---|---|
| Auth | **Better Auth** (adaptateur Drizzle, email+password, bearer mobile) | `lib/auth.ts` | quelques heures, pas quelques jours |
| Base + accès | **Drizzle ORM** + `postgres.js` | `db/schema.ts`, `db/index.ts` | schéma déclaratif |
| Contraintes géo/booking | **SQL brut** (PostGIS, exclusion) | `db/migrations/0001_postgis.sql` | 1 fichier |
| Storage | **Cloudflare R2** via S3 SDK (URL présignée) | `lib/storage.ts` | trivial |
| Push / realtime | **FCM** (firebase-admin) | `lib/fcm.ts` | trivial |
| Cron | **Vercel Cron** → route API | `vercel.json`, `app/api/cron/rappels/route.ts` | 1 route |

**Pourquoi Better Auth plutôt que du JWT `jose` fait main** : tu récupères la DX d'une
Supabase-Auth (sessions, refresh, email+password, vérification) **sur ta propre base**, avec un
adaptateur Drizzle officiel et un plugin `bearer` pour l'app Flutter. Tu ne débogues pas ta
propre couche de sécurité — c'est le meilleur endroit où *ne pas* être créatif.

## Contenu du kit

```
socle/
├── .env.example                        # toutes les variables d'environnement
├── package.json                        # dépendances du socle
├── vercel.json                         # planification du cron des rappels
├── db/
│   ├── index.ts                        # client Drizzle
│   ├── schema.ts                       # tables métier + PostGIS + notifications + FCM
│   └── migrations/
│       └── 0001_postgis.sql            # extensions, index GiST, anti-double-booking
├── lib/
│   ├── auth.ts                         # Better Auth (Drizzle + email/password + bearer)
│   ├── storage.ts                      # Cloudflare R2 (upload présigné)
│   ├── fcm.ts                          # envoi push FCM
│   └── notifications.ts               # créer notif in-app + pousser
└── app/api/
    ├── cron/rappels/route.ts           # planificateur : rappels dus → notif + FCM
    └── reservations/route.ts           # exemple : authz + réservation anti-collision
```

## Mise en route (une fois)

```bash
# 1. Base : PostgreSQL 16 managé (Neon / Railway) ou VPS. Extensions requises :
#    postgis, btree_gist  (voir db/migrations/0001_postgis.sql)

# 2. Dépendances
npm i next react react-dom drizzle-orm postgres better-auth \
      @aws-sdk/client-s3 @aws-sdk/s3-request-presigner firebase-admin zod
npm i -D drizzle-kit

# 3. Générer les tables Better Auth + appliquer les migrations Drizzle
npx @better-auth/cli generate      # tables user/session/account
npx drizzle-kit push               # tables métier
psql "$DATABASE_URL" -f db/migrations/0001_postgis.sql   # PostGIS + contrainte anti-collision

# 4. Copier .env.example -> .env et remplir
```

## Ce que ça règle du bloc 1

- **Auth** : inscription/connexion pro (email+mot de passe), sessions, refresh, bearer Flutter — géré.
- **Autorisation** : helper `getSession()` dans chaque route API, filtrage par propriétaire.
- **Anti-double-booking** : garanti par la base (contrainte d'exclusion), pas par du code fragile.
- **Géoloc** : requête `ST_DWithin` prête (voir `app/api/reservations` et le schéma).
- **Notifications** : `notifierUtilisateur()` crée la notif in-app + pousse via FCM en une ligne.
- **Rappels 24h/1h** : Vercel Cron appelle `/api/cron/rappels` chaque minute, tout est automatique.

Résultat : le bloc 1 passe de « tout construire » à « configurer et câbler » — la partie lourde
du départ de Supabase est absorbée par des composants stables.
