# TEMPO — Étude de faisabilité MVP

> Analyse technique et produit du MVP. Les chiffres et le business plan sont
> volontairement laissés de côté. Périmètre : les 7 fonctionnalités V1.

---

## 1. Verdict global

**Projet techniquement très faisable, et bien discipliné.** Le périmètre est resserré
(7 fonctions), pas de production de contenu lourde, pas de paiement intégré en V1, pas de
marketplace tripartite. Un porteur solo compétent peut livrer ça en 16 semaines.

Le risque ne se situe pas dans le code des écrans, mais sur **trois points produit/technique** :

1. **L'amorçage à deux faces (cold start).** Les clientes viennent s'il y a des salons ;
   les salons restent s'il y a des clientes. C'est le risque structurel de toute marketplace.
2. **La fiabilité des rappels programmés (F4).** C'est la valeur n°1 du produit et la brique
   la plus lourde à construire correctement. *(Résolu en grande partie par le passage à la
   push native FCM — voir ARCHITECTURE.md.)*
3. **La réservation sans collision (F3).** Le double-booking est un bug classique à éliminer
   par la base de données, pas par le code applicatif.

---

## 2. Faisabilité des 7 fonctionnalités

Estimation pour un porteur solo compétent, stack maîtrisée :

| Fonction | Difficulté | Charge | Le vrai enjeu |
|---|---|---|---|
| F1 Géoloc + recherche | Moyenne | ~40h | Requêtes spatiales indexées (PostGIS), pas un calcul de distance naïf. |
| F2 Fiche professionnel | Faible | ~30h | Page publique **SSR** (lien Instagram → réservation, SEO local). |
| **F3 Réservation créneau** | **Haute** | **~60h** | **Anti-double-booking** au niveau base (contrainte d'exclusion SQL). |
| **F4 Notifications** | **Haute** | **~55h** | Rappels programmés 24h/1h fiables + push FCM + centre in-app. |
| F5 Navigation carto | Faible | ~8h | Simple deep-link Google Maps / Waze / OSM. Trivial. |
| F6 Agenda professionnel | Haute | ~55h | Vues calendrier, blocage dispo, stats, temps réel. |
| F7 Score de fiabilité | Moyenne | ~20h | Calcul programmé sur indicateurs objectifs. Bien vu (pas d'avis libres). |
| Transverse (auth OTP, push, offline, design system, onboarding, stores, tests) | — | ~90h | Toujours sous-estimé, alourdi par le natif. |

**Total ≈ 360-380h.** Tenable sur 16 semaines en solo dédié (~23h/sem), tendu mais réaliste.
Le centre de gravité de l'effort : **F3 et F4**.

---

## 3. Points de fragilité à traiter en priorité

### a) L'économie des notifications — résolue par la push native
Le document s'appuyait sur une hypothèse fausse (« WhatsApp gratuit » — le WhatsApp
automatisé est payant à la conversation via l'API Cloud). **La décision de passer à des
notifications 100 % in-app (push FCM + centre de notifications) supprime ce problème** :
FCM est gratuit et fiable. Voir ARCHITECTURE.md §3.

**Angle mort résiduel :** une cliente qui réserve sur le web sans rien installer ne reçoit
aucun rappel hors-app. Filet gratuit optionnel : l'email (le doc le déprioritise mais il est gratuit).

### b) Le double-booking — à régler par la base, pas par le code
Deux clientes réservant le même créneau simultanément. Il faut une **contrainte d'exclusion
PostgreSQL** (`EXCLUDE USING gist`) ou une transaction verrouillée sur le créneau, pas un
« lire puis écrire » applicatif qui laisse passer les collisions.

### c) La fiabilité des rappels programmés (F4)
« Rappel 1h avant » suppose un déclencheur qui tire à l'heure dite, durable même en cas
d'échec. Recommandation : **table de rappels dus + cron minute** (pg_cron / Edge Function
planifiée) qui écrit dans le centre de notifications et pousse via FCM.

### d) Le cold start à deux faces — la parade produit
Donner de la valeur au pro **même sans aucune cliente TEMPO** : l'agenda F6 doit être utile
en *solo* (le coiffeur y saisit ses walk-ins et RDV WhatsApp à la main → gain d'organisation
immédiat). Ce « single-player mode » retient les pros pendant que la demande se construit.
Côté clientes, la géoloc F1 (« trouver un salon ouvert près de moi maintenant ») apporte de
la valeur *avant* toute réservation.

### e) Fiabilité de la push
Sur mobile natif (Flutter + FCM) : excellente, y compris entrée de gamme Android. Sur web,
le Web Push iOS exige une PWA installée (iOS 16.4+) — impact limité car marché très
majoritairement Android, mais l'onboarding « garder l'app » devient une étape produit.

---

## 4. Ce qu'il faut dérisquer AVANT de coder le produit

1. **POC notifications** (le plus urgent) : push FCM (Flutter + web) + centre in-app +
   déclencheur horaire des rappels 24h/1h. C'est F4, le plus gros risque.
2. **POC géo** : PostGIS + `ST_DWithin` + carte MapLibre sur 10 salons fictifs.
3. **Anti-double-booking** : écrire la contrainte d'exclusion et la tester en concurrence.
4. **Trancher les surfaces** : confirmer le séquençage app pro / web cliente / back-office
   (voir ARCHITECTURE.md §5) pour tenir les 16 semaines en solo.

---

## 5. Synthèse

Techniquement très faisable, scope sain. Le vrai travail d'ingénierie se concentre sur
**F3 (réservation sans collision)** et **F4 (rappels fiables)** ; le vrai travail produit sur
**l'amorçage à deux faces**. Le passage aux notifications in-app est une bonne décision qui
élimine le principal risque de coût.
