# TEMPO — Déploiement

Le projet est un monorepo. L'application web/API à déployer est dans **`socle/`**.

## 1. Pousser sur GitHub (déjà fait via ce dépôt)

Le code vit dans ce dépôt Git. `socle/.env` (secrets) n'est **pas** versionné — voir les
variables à re-saisir sur Vercel ci-dessous.

## 2. Déployer sur Vercel

1. **vercel.com → Add New → Project**, importe le dépôt GitHub.
2. **Root Directory : `socle`** (bouton *Edit* à côté du root). Framework : **Next.js** (auto).
3. **Environment Variables** — recopie depuis ton `socle/.env` local :

   | Variable | Valeur |
   |---|---|
   | `DATABASE_URL` | la chaîne **pooled** Neon (`…-pooler…?sslmode=require`) |
   | `BETTER_AUTH_SECRET` | ta clé locale (ou une nouvelle de 32+ caractères) |
   | `BETTER_AUTH_URL` | l'URL de prod, ex. `https://tempo-xxx.vercel.app` |
   | `APP_URL` | idem `BETTER_AUTH_URL` |
   | `CRON_SECRET` | ta clé locale |

   > Astuce : `BETTER_AUTH_URL`/`APP_URL` ne sont connues qu'après le 1er déploiement.
   > Déploie une fois, récupère l'URL Vercel, renseigne-les, puis **Redeploy**.
   > Le **tunnel de réservation invité** (recherche → fiche → créneau → réservation) est
   > **public** et fonctionne même sans ces deux variables — pratique pour un test collab.

4. **Deploy.** La base est déjà migrée et peuplée (Neon), rien à faire côté DB.
5. (Optionnel) FCM plus tard : `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`,
   `FIREBASE_PRIVATE_KEY`. Sans elles, la push est un no-op ; les réservations marchent.

## 3. À tester en ligne

- `/recherche` — salons proches (données seed sur Neon)
- clic sur un salon → fiche → **Réserver** → créneau → nom + numéro → confirmation

## Notes

- Le cron (`vercel.json`) est réglé en **quotidien** (plan Hobby). Sur un plan Pro, remets
  `* * * * *` pour des rappels à la minute.
- Régénérer/mettre à jour la base : `cd socle && npm run db:migrate && npm run db:postgis && npm run db:seed`.
