# TEMPO — POC Notifications de bout en bout (documentation)

> Objectif : démontrer la chaîne complète **enregistrer un device FCM → créer une
> réservation → recevoir la push → voir la notification dans le centre in-app**, et prouver
> que le mécanisme des rappels programmés (J-1 / H-1) fonctionne. Aucun code ici — c'est le
> plan d'exécution et de test. L'implémentation s'appuie sur le socle (`socle/lib/*`).

---

## 1. Ce que le POC doit prouver

1. Un appareil (web ou Flutter) peut **s'enregistrer** et recevoir des notifications.
2. Une **réservation** déclenche immédiatement une notification au professionnel.
3. La notification arrive **par deux canaux complémentaires** : la **push FCM** (temps réel)
   et le **centre in-app** (persistant, visible à l'ouverture même si la push est ratée).
4. Les **rappels programmés** (J-1, H-1) partent tout seuls à l'heure dite, sans intervention.

---

## 2. Les acteurs et composants

| Composant | Rôle | Où il vit |
|---|---|---|
| Client (web démo ou app Flutter) | Demande la permission, obtient un token FCM, l'enregistre | Navigateur / mobile |
| Enregistrement device | Stocke le token dans `appareils_fcm` (un user = plusieurs devices) | API `POST /api/devices` |
| Création réservation | Écrit la réservation (anti-collision) puis notifie le pro | API `POST /api/reservations` |
| Pipeline notifications | Écrit la notif in-app **et** pousse via FCM en une opération | `socle/lib/notifications.ts` |
| Envoi push | Parle à FCM, purge les tokens morts | `socle/lib/fcm.ts` |
| Centre in-app | Liste les notifications d'un utilisateur, marque lu/non-lu | API `GET /api/notifications` |
| Planificateur | Fait partir les rappels dus, réessaie en cas d'échec | Cron → `socle/app/api/cron/rappels/route.ts` |
| Service worker (web) | Reçoit la push quand l'onglet est fermé/en arrière-plan | `firebase-messaging-sw.js` |

---

## 3. Séquence de bout en bout

```
[Client]                [API]                     [Postgres]            [FCM]
   │ permission + token    │                          │                   │
   ├──────────────────────▶│ POST /api/devices        │                   │
   │                       ├─ enregistre token ──────▶│ appareils_fcm     │
   │                       │                          │                   │
   │ « nouvelle résa »     │                          │                   │
   ├──────────────────────▶│ POST /api/reservations   │                   │
   │                       ├─ INSERT (anti-collision)▶│ reservations      │
   │                       ├─ notifierUtilisateur() ─▶│ notifications     │
   │                       │                          │ (in-app écrit)    │
   │                       ├─ push immédiate ─────────┼──────────────────▶│
   │◀── push reçue ────────┼──────────────────────────┼─── FCM ──────────┤
   │                       │                          │                   │
   │ ouvre le centre       │                          │                   │
   ├──────────────────────▶│ GET /api/notifications ──▶│ (liste)          │
   │◀── notif visible ─────┤                          │                   │

   … plus tard, à l'échéance …
[Cron chaque minute] ─▶ /api/cron/rappels ─▶ rappels dus (duA ≤ maintenant, envoye=false)
                                            ─▶ push J-1 / H-1 + marque envoye
```

**Deux chemins temporels distincts :**
- **Immédiat** — `reservation_recue` : la push part à la création de la réservation.
- **Programmé** — `rappel_j1` / `rappel_h1` : la notif est écrite avec une échéance future
  (`du_a`), et le cron la fait partir quand l'heure arrive. Un échec est rejoué à la minute
  suivante (`envoye = false` reste vrai tant que l'envoi n'a pas réussi).

---

## 4. Prérequis

| Élément | Nécessaire pour | Note |
|---|---|---|
| PostgreSQL 16 | Réservations + centre in-app | Suffit pour tester **tout le in-app** sans Firebase |
| Projet Firebase (FCM) | La **push** réelle | Clé service (serveur) + config web + clé VAPID (client) |
| Variables d'env | Connexion DB + Firebase + secret cron | Voir `socle/.env.example` |

**Dégradation gracieuse voulue :** si Firebase n'est pas configuré, la réservation et le
centre de notifications fonctionnent quand même (la notif est écrite et visible) ; seule la
push est sautée. On peut donc valider 80 % du POC avec Postgres seul, puis brancher Firebase
pour la push.

---

## 5. Scénario de test manuel (le « bout en bout »)

**Préparation**
1. Base prête : appliquer le schéma puis la migration anti-collision, et créer le pro de démo.
2. Renseigner les variables d'environnement (DB ; Firebase si on veut la push).
3. Lancer l'application en local.

**Déroulé de la démo (une seule page « démo » joue le rôle du professionnel)**
1. **Activer les notifications** → le navigateur demande la permission ; le token FCM est
   obtenu et enregistré pour l'utilisateur `pro-demo`.
   *Vérification :* une ligne apparaît dans `appareils_fcm`.
2. **Créer une réservation test** → l'API écrit la réservation et notifie le pro.
   *Vérification A (push) :* une notification système/onglet apparaît immédiatement.
   *Vérification B (in-app) :* la liste du centre de notifications affiche « Nouvelle réservation ».
3. **Tester l'anti-collision** → recréer la même réservation sur le même créneau.
   *Vérification :* l'API renvoie **409 « créneau déjà pris »** (garanti par la base).
4. **Tester le rappel programmé** → créer une réservation dont l'heure est proche (les rappels
   J-1/H-1 tombent alors dans le passé et deviennent « dus »), puis **déclencher le cron**.
   *Vérification :* les rappels partent et apparaissent dans le centre in-app.

**Push en arrière-plan (onglet fermé)**
5. Fermer/masquer l'onglet, recréer une réservation via un autre appareil ou l'API.
   *Vérification :* le **service worker** affiche la notification hors application.

---

## 6. Points de vérification (critères de réussite)

- [ ] Le token FCM est bien stocké et unique par appareil.
- [ ] La push `reservation_recue` arrive en **moins de 3 s** au premier plan.
- [ ] La même notification est **persistée** et lisible dans le centre in-app.
- [ ] Un créneau déjà pris est **refusé par la base** (409), pas par le code applicatif.
- [ ] Les rappels programmés partent via le **cron**, et un échec est **rejoué**.
- [ ] Un token invalide (app désinstallée) est **purgé** automatiquement.
- [ ] Sans Firebase configuré, le **in-app fonctionne toujours** (push sautée proprement).

---

## 7. Limites assumées du POC

- **Auth simplifiée** : l'utilisateur `pro-demo` est fixé en dur ; la vraie auth (Better Auth)
  est dans le socle et sera branchée hors POC.
- **Client de démo = web** : le plus rapide à exécuter. Le comportement Flutter est identique
  côté API (mêmes endpoints, même token FCM) ; l'app pro Flutter est construite au bloc 2.
- **Cliente web sans app** : ne reçoit pas de rappel hors-app (cf. `ARCHITECTURE.md` §3) — hors
  périmètre de ce POC, qui valide la chaîne côté professionnel.
- **Cron local** : déclenché manuellement pour la démo ; en production c'est Vercel Cron
  (`socle/vercel.json`, chaque minute).

---

## 8. Ce que ce POC dérisque

Il valide la brique **F4 (notifications)** — le plus gros risque technique du projet — de bout
en bout : enregistrement, envoi immédiat, persistance in-app, envoi programmé et résilient, et
purge des tokens. Une fois ce POC vert, F4 n'est plus un risque mais une base acquise sur
laquelle l'app pro Flutter et le front-office viennent se brancher.
