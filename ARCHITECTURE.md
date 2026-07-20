# TEMPO — Architecture MVP (stack retenue)

> Stack décidée avec le porteur : **Flutter** (app pro mobile) + **Next.js** (fullstack :
> API + front-office + back-office) + **PostgreSQL/PostGIS** (sans Supabase).
> Notifications **100 % in-app** (push FCM + centre de notifications), **sans WhatsApp ni SMS**.

---

## 1. Vue d'ensemble des surfaces

```
                     ┌──────────────────────────────────────┐
                     │        Next.js (fullstack)            │
                     │  ┌────────────┐   ┌────────────────┐  │
                     │  │ Front-office│   │  API (Route     │  │
                     │  │ + Back-office│  │  Handlers REST) │  │
                     │  └────────────┘   └───────┬─────────┘  │
                     └───────────────────────────┼────────────┘
                                                 │ Drizzle ORM
                   ┌───────────────┐   ┌─────────┴──────────┐   ┌──────────────┐
                   │  App PRO       │──▶│  PostgreSQL 16      │◀──│ Cloudflare R2 │
                   │  Flutter (REST)│   │  + PostGIS          │   │ (photos)      │
                   └───────┬───────┘   └────────────────────┘   └──────────────┘
                           │
                           └────── FCM (push) ─── centre de notifications in-app
```

**Répartition des surfaces** (protège l'amorçage) :

- **App PRO = Flutter natif.** Utilisateur payant, quotidien, notifications-critiques.
  Consomme l'**API REST** de Next.js. Push FCM fiable, agenda offline, géoloc native.
- **Cliente = web-first (Next.js front-office).** Réservation par QR en salon / lien Instagram,
  **sans installation ni compte** (réservation invité : nom + téléphone). Friction minimale.
- **Back-office = Next.js.** Console d'admin du porteur (pros, pilote, bascule payante, stats).
- **API = Next.js Route Handlers.** Backend unique servant Flutter **et** le web. Un seul repo.
- **App CLIENTE Flutter = Phase 2**, pour les habituées, sans refonte (même API).

> ⚠️ Le choix natif (Flutter) inverse la décision V1 du document (« la PWA suffit »).
> Upgrade défendable (push native = fiabilité des rappels), mais il ajoute des surfaces.
> Le passage à Postgres nu (sans Supabase) ajoute aussi l'auth, le stockage et le cron à
> construire → voir §2 le tableau des remplacements et §6 le séquençage.

---

## 2. Stack détaillée

| Couche | Choix | Pourquoi |
|---|---|---|
| App mobile pro | **Flutter** (Dart) | iOS + Android natif, push FCM fiable, offline, géoloc, stores. |
| Web + API | **Next.js** (App Router) | Fullstack : front-office SSR + back-office + API REST pour Flutter. Un codebase. |
| Base de données | **PostgreSQL 16 + PostGIS** | Recherche géo indexée, robuste, standard. Managé (Neon/Railway) ou VPS. |
| Accès données | **Drizzle ORM** (+ SQL brut pour la géo) | SQL-first, TypeScript strict, excellent support PostGIS, migrations `drizzle-kit`. |
| Auth | **JWT maison** (`jose`) — email+mot de passe (pro), réservation invité (cliente) | Sert Flutter (bearer) et web à l'identique, sans OTP SMS. |
| Push | **Firebase Cloud Messaging (FCM)** | Gratuit, fiable, mobile **et** web. Cœur des notifications. |
| Stockage fichiers | **Cloudflare R2** (S3-compatible) | Photos pros/galerie. Pas de frais d'egress, peu cher. |
| Rappels programmés | **Vercel Cron → route API** (ou `pg_cron`/`node-cron` si self-host) | Déclenche les rappels 24h/1h à l'heure dite. |
| Cartes | **MapLibre + tuiles OpenStreetMap** | Évite la facturation Google Maps. F5 deep-linke vers Maps/Waze. |
| Hébergement | **Vercel** (web+API) + Postgres managé | Déploiement continu, CDN. Alternative : VPS unique si auto-hébergement souhaité. |
| Mesure / erreurs | Plausible + Sentry | Léger, privacy-friendly. |

### Ce que Postgres nu remplace (vs Supabase)

| Fonction Supabase | Remplacement | Coût pour le solo |
|---|---|---|
| Postgres managé | PostgreSQL + PostGIS (Neon/Railway/VPS) | — |
| Auth | JWT maison (`jose`) + hash mot de passe (`argon2`) | +auth à construire |
| Realtime | FCM push + refresh (WebSocket plus tard) | simplifié |
| Storage | Cloudflare R2 | +intégration S3 |
| RLS (autorisation) | Autorisation dans l'API Next.js ; RLS en défense secondaire | déplacé, pas perdu |
| Edge Function / cron | Vercel Cron → route API | équivalent |

---

## 3. Architecture des notifications (100 % in-app)

Trois composants, aucun coût par message :

1. **Push FCM** — mobile (Flutter) et web (front-office). Canal temps réel.
2. **Centre de notifications in-app** — table `notifications` (fil persistant lu/non-lu),
   affiché à l'ouverture. Garantit que rien n'est perdu si la push est ratée.
3. **Planificateur de rappels** — **Vercel Cron** appelle une route API chaque minute :
   elle lit les rappels dus, écrit dans `notifications`, et pousse via FCM (Firebase Admin SDK).

```
Réservation confirmée
   → crée 3 rappels programmés : [confirmation immédiate] [J-1] [H-1]
   → Vercel Cron (1 min) → /api/cron/rappels : rappels dus → INSERT notifications + FCM
   → utilisateur : push (si en ligne) + fil in-app (à l'ouverture)
```

**Événements notifiés :** réservation reçue (pro), confirmation/décline (cliente),
rappel J-1, rappel H-1, modification, annulation.

**Filet gratuit optionnel :** email de confirmation/rappel pour une cliente qui réserve sur
le web sans app installée (seul cas où la push ne la touche pas). Zéro coût, à activer si besoin.

---

## 4. Modèle de données — points structurants

PostgreSQL 16 + PostGIS. Schéma détaillé (SQL) à produire. Points de vigilance :

- **PostGIS sur les pros** : colonne `geography(Point,4326)` + index GiST → recherche
  `ST_DWithin(pos, :client_pos, :rayon)` rapide et exacte (F1).
- **Anti-double-booking (F3)** : contrainte d'exclusion sur `reservations`
  ```sql
  CREATE EXTENSION IF NOT EXISTS btree_gist;
  ALTER TABLE reservations ADD CONSTRAINT no_overlap
    EXCLUDE USING gist (professionnel_id WITH =, plage_horaire WITH &&)
    WHERE (statut IN ('en_attente','confirmee'));
  ```
  → impossible de réserver deux fois le même créneau, garanti par la base.
- **Autorisation dans l'API** : l'app se connecte à Postgres avec un rôle applicatif unique ;
  l'API Next.js vérifie le JWT et filtre chaque requête par propriétaire. RLS Postgres
  activable en défense secondaire plus tard.
- **Score de fiabilité (F7)** : vue/matérialisation calculée depuis les faits objectifs
  (présence, ponctualité, annulations). Jamais d'avis libre.
- **`notifications`** : `(id, user_id, type, payload jsonb, du_a timestamptz, lu bool, envoye bool)`.

Tables principales : `utilisateurs`, `professionnels` (fiche + `geography` + abonnement),
`services`, `disponibilites`, `reservations`, `notifications`, `abonnements`, `appareils_fcm`.

---

## 5. Auth — le détail qui évite le SMS

- **Pro** : inscription/connexion **email + mot de passe** (hash `argon2`), JWT access+refresh.
  Volume faible, utilisateur engagé. Pas d'OTP à livrer donc pas de SMS.
- **Cliente (web)** : **réservation invité** — saisit nom + téléphone, aucune création de compte.
  Reçoit la confirmation à l'écran ; les rappels ne lui parviennent que si elle installe la PWA/app.
- **Cliente (app Flutter, Phase 2)** : compte complet + enregistrement de l'appareil FCM.

> Rappel : « pas de SMS » = notifications. L'auth pro passe par mot de passe, pas par OTP,
> donc aucun canal payant n'est requis nulle part.

---

## 6. Séquençage recommandé (16 semaines, solo)

Le natif + Postgres nu ajoutent des surfaces → ordonner pour ne pas s'éparpiller.

| Bloc | Contenu | Fenêtre |
|---|---|---|
| **1. Socle** | Postgres+PostGIS, schéma Drizzle + anti-double-booking, auth JWT, R2, FCM | S1-S4 |
| **2. App PRO Flutter** | Agenda F6 (utile en solo dès J1), réservations F3, push F4 | S5-S9 |
| **3. Front-office web** | Fiches pros SSR F2, géoloc F1, réservation invité, F5 | S9-S13 |
| **4. Back-office + F7** | Admin porteur, score fiabilité, stats, polissage | S13-S15 |
| **5. Tests terrain** | 10-15 salons pré-recrutés, corrections UX | S15-S16 |

Le bloc 1 est plus lourd qu'avec Supabase (auth + storage + cron à câbler soi-même) — budgéter
la marge en conséquence. Priorité au **bloc 2** : l'app pro a de la valeur *solo* (agenda) et
amorce l'offre avant la demande. L'app cliente Flutter reste **hors scope V1**.

---

## 7. Dérisquage avant de coder le produit

1. **POC notifications** : push FCM (Flutter + web) + centre in-app + Vercel Cron des rappels 24h/1h. F4.
2. **POC géo** : PostGIS + `ST_DWithin` + carte MapLibre.
3. **Anti-double-booking** : contrainte d'exclusion testée en concurrence.
4. **POC auth** : JWT `jose` end-to-end (login pro web + appel API authentifié depuis Flutter).
