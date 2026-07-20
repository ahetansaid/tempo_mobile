# TEMPO — Prompts de design

Deux prompts prêts à coller. Le n°1 fixe l'identité (logo + charte). Le n°2 génère les
écrans de maquette sur **Google Stitch**, en réutilisant les tokens du n°1.

---

# PROMPT 1 — Logo & charte graphique

> À coller dans un LLM multimodal (Claude, GPT-image, Ideogram) ou à donner à un DA.
> Un bloc « variante image-gen » est fourni en fin de prompt.

```
Tu es directeur artistique. Conçois l'identité visuelle complète de TEMPO.

## LE PRODUIT
TEMPO est une application de réservation et de gestion de clientèle pour les coiffeurs,
barbiers et salons de beauté du Bénin (Cotonou, Abomey-Calavi). Trois surfaces :
- une app mobile Android pour le PROFESSIONNEL (agenda, réservations, notifications) ;
- un site web mobile-first pour la CLIENTE (elle trouve un salon près d'elle et réserve
  en 30 secondes, sans créer de compte, souvent via un QR code en salon ou un lien Instagram) ;
- un back-office d'administration.

La promesse : « Le bon créneau, au bon moment. » TEMPO vend du temps maîtrisé, pas de la beauté.
Le produit n'a pas d'avis clients ; il a un score de fiabilité calculé sur des faits
(ponctualité, présence, annulations). L'honnêteté est un trait de marque.

## CONTRAINTES NON NÉGOCIABLES
- Marché : Afrique de l'Ouest francophone. Terminaux Android entrée de gamme, écrans
  bon marché, forte luminosité extérieure → contrastes élevés obligatoires, pas de gris
  clair sur blanc, pas de dégradés subtils qui disparaissent au soleil.
- Le logo doit rester lisible à 24×24 px (favicon, icône d'app, pin de carte) et en
  monochrome (tampon, sticker vitrine, flyer noir et blanc imprimé localement).
- Il sera imprimé sur des QR codes affichés en salon → il doit fonctionner sur fond blanc,
  sur fond sombre, et en gravure une seule couleur.
- Éviter le pastiche « Afrique » : pas de masque, pas de silhouette de continent, pas de
  motif wax décoratif, pas de dégradé vert-jaune-rouge du drapeau. L'ancrage local se fait
  par la couleur et la matière, pas par le folklore.
- Éviter aussi le cliché « barbershop » occidental : pas d'enseigne rayée rouge-blanc-bleu,
  pas de moustache, pas de rasoir coupe-choux vintage.

## CE QUE TU DOIS PRODUIRE

### 1. Plateforme de marque (court)
- Une phrase de positionnement.
- Trois attributs de personnalité, chacun traduit en une conséquence visuelle concrète.
- Ce que la marque n'est pas (3 lignes).

### 2. Logo
Explore et présente TROIS pistes distinctes, chacune décrite assez précisément pour être
tracée en vectoriel. Contrainte : le concept doit croiser le TEMPS et le GESTE DU COIFFEUR.
Pistes de départ (tu peux en proposer de meilleures) :
- (a) Monogramme « T » dont la hampe et la barre forment les deux aiguilles d'une horloge,
  inscrit dans un cercle ouvert.
- (b) Un peigne vu de face dont les dents deviennent les graduations d'un cadran.
- (c) Une paire de ciseaux dont les branches ouvertes dessinent l'angle d'une heure lue.

Pour chaque piste, livre :
- le concept en une phrase et pourquoi il tient à 24 px ;
- la construction géométrique (grille, cercle porteur, épaisseur de trait, angles) ;
- le lock-up horizontal (symbole + wordmark) et le lock-up empilé ;
- la version symbole seul (icône d'app Android, adaptive icon : zone sûre 66/108) ;
- la déclinaison monochrome positive et négative ;
- les zones de protection et la taille minimale.
Recommande ensuite UNE piste et défends le choix en 3 lignes.

### 3. Wordmark
Typographie du mot TEMPO. Propose une police de base (disponible sur Google Fonts, car
elle doit tourner sur Flutter et Next.js sans licence à acheter) et les corrections
manuelles à appliquer (approche, terminaisons, éventuelle ligature ou coupe du O).

### 4. Charte couleur
Livre la palette sous forme de tokens exploitables en code (nom sémantique + hex), pas
seulement des noms poétiques. Direction imposée :
- Une base sombre et profonde (l'app pro s'utilise en salon, souvent en intérieur peu éclairé)
  → un indigo nuit, pas un noir pur.
- Un accent chaud et métallique évoquant le laiton et le bronze — matière historiquement
  béninoise, comprise sans être illustrée. C'est la couleur des actions et des créneaux libres.
- Une neutre chaude « sable » pour les fonds clairs du web cliente.
- Les statuts métier ont des couleurs propres et NON interchangeables, car ils portent le sens
  du produit : en attente / confirmée / terminée / annulée / absente (no-show).
Pour chaque couleur : usage autorisé, usage interdit, et le ratio de contraste vérifié
contre ses fonds admis (viser AA 4.5:1 sur le texte, 3:1 sur les éléments d'interface).
Fournis la palette en clair ET en sombre.

### 5. Typographie
Deux familles maximum. Échelle typographique complète (display → caption) avec taille,
graisse, interlignage et usage. Impose des chiffres à chasse fixe (tabular) pour les heures
de l'agenda et les prix en FCFA — les colonnes de chiffres doivent s'aligner.

### 6. Système
- Grille de 4 px, échelle d'espacement.
- Rayons de bordure (cartes, boutons, champs, pastilles).
- Élévation : combien de niveaux, et à quoi ils servent.
- Iconographie : style, épaisseur de trait, jeu de référence.
- Photographie : ce qu'on montre d'un salon béninois, ce qu'on ne montre pas, traitement.
- Ton de voix en français : tutoiement ou vouvoiement pour la cliente, pour le pro, et
  trois exemples de microcopie (bouton de réservation, confirmation, rappel push 1 h avant).

### 7. Application
Montre la charte appliquée à trois objets : l'icône d'app Android, un rappel push sur écran
verrouillé, et le sticker QR code posé sur le miroir du salon.

## FORMAT DE SORTIE
Markdown structuré. Les couleurs en tableau (token / hex / usage / contraste). Les logos
décrits en géométrie précise, plus un fichier SVG inline pour la piste recommandée.
Pas de superlatifs, pas de justification marketing creuse : chaque choix est motivé par une
contrainte listée plus haut.
```

**Variante image-gen** (Midjourney / Ideogram / GPT-image), une fois la piste choisie :

```
Logo mark for "TEMPO", a barbershop booking app in Benin, West Africa.
Concept: the letter T whose stem and crossbar read as the two hands of a clock,
enclosed in an open circle. Geometric vector construction, single continuous stroke
weight, flat, no gradient, no bevel, no shadow, no 3D. Brass-gold #E0A458 on deep
indigo #141B34. Centered, generous negative space, legible at 24 pixels.
Style: contemporary Swiss logotype, Pentagram-like restraint.
--no text, no tagline, no mockup, no scissors clipart, no tribal pattern, no flag colors
```

---

# PROMPT 2 — Écrans de maquette sur Stitch

> **Mode d'emploi Stitch.** Stitch génère un écran à la fois de façon fiable. Colle le
> **BLOC A (système)** une fois pour poser la direction, puis enchaîne les écrans en collant
> **BLOC A + un écran du BLOC B/C/D**. Choisis le canvas *Mobile* pour les blocs B et C,
> *Web* pour le bloc D. Si un écran dérive, régénère-le seul plutôt que de corriger.

## BLOC A — Système de design (à rappeler à chaque écran)

```
Design system for TEMPO, a barbershop booking app in Benin (Cotonou). All UI text in FRENCH.
Currency is FCFA, written as "8 000 FCFA" (space as thousands separator, no decimals).
Times on 24-hour clock ("14:30"). Dates in French ("Mar. 12 nov.").

Target: low-end Android phones, small screens, used in bright daylight and in dim salons.
Therefore: high contrast, large tap targets (min 48dp), generous spacing, no thin grey
text on white, no subtle gradients, no glassmorphism.

COLORS
- Indigo Nuit #141B34 — primary surface of the pro app, all headers, all body text on light.
- Laiton #E0A458 — brass gold. The ONLY colour for primary actions and free time slots.
  Always paired with #141B34 text on top of it, never white text.
- Sable #F6F4F1 — light background of the client web.
- Blanc #FFFFFF — cards.
- Bordure #E5E1DB, Texte secondaire #6B6760.
STATUS COLORS (never reuse them for decoration):
- En attente #F59E0B · Confirmée #16A34A · Terminée #6B6760 · Annulée #DC2626 · Absente #7C2D12

TYPE
- Headings: Sora, semibold, tight tracking. Body: Inter.
- Display 28/34, H1 22/28, H2 18/24, Body 16/24, Label 14/20, Caption 12/16.
- Hours and prices use tabular figures so digits align in columns.

SHAPE
- 4px spacing grid. Cards radius 16, buttons radius 12 and height 52, inputs radius 12 and
  height 52, status pills fully rounded.
- One elevation level only: a soft shadow on cards over Sable. Nothing floats twice.

ICONS: Lucide, 2px stroke, 24px.
BRAND: wordmark "TEMPO" in Sora semibold; the mark is a "T" reading as two clock hands
inside an open circle, brass on indigo.
```

## BLOC B — Web cliente (canvas *Mobile*)

Cette surface se joue **sans compte** : la cliente arrive par QR code ou lien Instagram,
et doit avoir réservé en moins de 30 secondes. Chaque écran doit rester froidement utile.

```
[B1 — Recherche géolocalisée]
Screen: "Trouve un salon près de toi". Sable background.
Top: TEMPO wordmark, small. A search field "Coiffeur, barbier, tresses…" with a location
chip "Cotonou · 2 km" that opens a radius selector. Below, a horizontal row of filter chips:
"Ouvert maintenant", "Coupe homme", "Tresses", "Barbe", "Coloration". The first chip is active
(brass fill, indigo text). Below, a segmented control "Liste | Carte", "Liste" selected.
Then a vertical list of salon cards. Each card: 72px square photo, salon name in H2, a
reliability badge showing "Fiabilité 9,2" with a small shield icon, the distance "450 m",
the neighbourhood "Fidjrossè", an open-status line "Ouvert · ferme à 20:00" in green, and
a price hint "à partir de 3 000 FCFA". Show 4 cards, the last one partially cut off.
Bottom: nothing. No tab bar — this is a website, not an app.

[B2 — Vue carte]
Same screen with the "Carte" segment selected. Full-bleed OpenStreetMap-style map, muted
desaturated tiles so the pins pop. A "you are here" blue dot with an accuracy halo. Salon
pins are indigo teardrops carrying the brass T mark; the selected pin is larger and brass-filled.
A bottom sheet, half height, showing the selected salon card from B1 plus two buttons side by
side: "Réserver" (brass, primary) and "Itinéraire" (outlined, with a navigation arrow icon).
A floating "Recentrer" button above the sheet, right aligned.

[B3 — Fiche du professionnel]
A public salon profile page, the kind you land on from an Instagram link.
Hero: 240px photo of the salon interior, with a back arrow and a share icon overlaid on a
subtle dark scrim. Below the hero, overlapping it by 24px, a white card containing:
salon name in Display, a brass "Fiabilité 9,2 / 10" badge, then "Fidjrossè, Cotonou · 450 m".
An open-status line, and a row of three ghost buttons with icons: "Appeler", "Itinéraire",
"Partager".
Then a section "Prestations" — a list of services, each row: service name, duration "45 min",
price "5 000 FCFA" right-aligned in tabular figures, and a small brass "Choisir" button.
Show 4 services.
Then "Galerie" — a horizontally scrolling strip of 4 square photos of haircuts.
Then "Horaires" — a 7-row table, today's row highlighted, closed days showing "Fermé" in grey.
A sticky bottom bar, always visible: "Réserver" full-width brass button.

[B4 — Choix du créneau]
Header "Coupe + barbe · 45 min · 5 000 FCFA" as a compact recap strip pinned under the title.
A horizontal week strip of date pills (day letter above, number below), today outlined,
the selected date filled brass. An arrow to jump to next week.
Below, slots grouped under three subheads: "Matin", "Après-midi", "Soir".
Each slot is a pill with the hour "09:30" in tabular figures. Three states must be visually
distinct and legible without colour alone: available (white pill, indigo border, indigo text),
selected (brass fill, indigo text, check icon), taken (grey fill, struck-through text, not tappable).
Show a realistic mix — several taken slots in the afternoon.
Under the grid, a quiet line: "Fuseau Cotonou (GMT+1)".
Sticky bottom bar: "Continuer" brass button, disabled until a slot is picked — show it enabled.

[B5 — Réservation invité]
Title "Presque terminé". Subtitle "Pas de compte à créer."
A recap card: salon name, service, "Mar. 12 nov. à 09:30", price. An edit pencil on the right.
Then two fields only: "Ton nom" and "Ton numéro" (with a "+229" country prefix inside the field).
A third optional field "Email (pour recevoir un rappel)" with a caption explaining that without
it, the reminder only arrives if she keeps the page installed on her phone.
A checkbox for accepting the cancellation policy: "J'annule au moins 2 h avant si empêchement."
Sticky bottom: "Confirmer la réservation" brass button. Below it, a caption: "Le salon confirme
sous 2 h. Tu recevras une notification."

[B6 — Confirmation]
Centered success state. A large circular brass check. Title "C'est réservé !".
A status pill "En attente de confirmation" in amber.
A ticket-shaped card with a perforated notch: salon name, address, date and time in Display size,
service, price, and a reference code "TMP-4821" in monospace.
Two secondary actions stacked: "Ajouter à mon agenda" and "Voir l'itinéraire".
Then an install prompt card, brass-outlined: "Garde TEMPO sur ton écran d'accueil pour recevoir
le rappel 1 h avant." with an "Installer" button and a dismissive "Plus tard" text link.

[B7 — Suivi de la réservation]
The page the client returns to via her confirmation link. Same ticket card, but the status pill
now reads "Confirmée" in green, and a timeline below shows three steps: "Réservée · 12:04",
"Confirmée par le salon · 12:31", "Rappel 1 h avant · 08:30" (the third greyed out, pending).
Two buttons: "Itinéraire" (outlined) and "Annuler la réservation" (text link, red).

[B8 — États vides et erreurs]
Three states on one board, side by side:
(1) Location denied: an illustration-free layout with a map-pin-off icon, "On ne sait pas où tu es",
    "Autorise la localisation ou saisis ton quartier", a brass button "Autoriser" and a text link
    "Saisir mon quartier".
(2) No result in radius: a compass icon, "Aucun salon dans 2 km", "Élargis la recherche",
    a stepper showing 2 km → 5 km, and a brass "Chercher dans 5 km".
(3) Slot just taken: a modal over B4, "Ce créneau vient d'être pris", "Choisis-en un autre",
    with the next three available slots offered as brass pills.
```

## BLOC C — App PRO Flutter (canvas *Mobile*, thème sombre)

Cœur du produit. L'agenda doit être **utile même sans une seule cliente TEMPO** : le coiffeur
y saisit ses walk-ins à la main. C'est ce qui retient les pros pendant l'amorçage.

```
[C1 — Connexion pro]
Dark screen, Indigo Nuit background. The TEMPO mark, brass, centered in the upper third.
Title "Ton salon, à l'heure." Two fields, dark-filled with brass focus ring: "Email" and
"Mot de passe" with a show/hide eye. A "Mot de passe oublié ?" text link, right aligned.
Brass "Se connecter" button. Below, a divider and "Nouveau sur TEMPO ? Créer mon salon".
No phone number, no OTP, no social login — none of that exists in this product.

[C2 — Agenda, vue Jour] ← ÉCRAN PRINCIPAL, le plus soigné
Dark. Top bar: a date "Mardi 12 novembre" with left/right chevrons and a "Aujourd'hui" chip.
Right side: a bell icon with a brass unread dot, and an avatar.
Under it, a compact horizontal week strip of date pills; each pill carries a tiny row of dots
indicating how full that day is.
A summary strip: three stat blocks — "6 RDV", "24 000 FCFA", "1 absence" — separated by hairlines.
Then the day timeline, the heart of the screen: hours from 08:00 to 20:00 down the left gutter
in tabular figures, a horizontal hairline per hour, and a brass "now" line at 14:12 with a
small dot on the gutter.
Appointment blocks fill the timeline, height proportional to duration:
- 09:00 Awa Kpodo · Tresses · 2 h — status border-left green (confirmée)
- 11:30 Client walk-in · Coupe homme · 30 min — a block with a subtle dashed border (saisi à la main)
- 13:00 Blocked as "Pause" — a hatched, non-interactive block
- 15:00 Fatou Adjovi · Coupe + barbe · 45 min — status border-left amber (en attente), with two
  tiny inline buttons on the block: a check and a cross
- 17:00 Sègbédji M. · Coloration · 1 h 30 — green
Empty gaps show a faint "+" affordance on tap.
A brass FAB bottom-right with a plus icon.
Bottom navigation, dark, four items: Agenda (active, brass), Clientes, Stats, Profil.

[C3 — Agenda, vue Semaine]
Same top bar, but a "Jour | Semaine" segmented control now shows "Semaine".
A 7-column grid, hours down the left. Appointments are compressed to coloured slivers using
the status colours. Blocked periods hatched. Today's column has a subtle brass tint.
Tapping a day opens C2 — show a tap ripple on Thursday.

[C4 — Détail de la réservation]
A bottom sheet rising over C2, dark, radius 16 top corners, with a drag handle.
Client name in H1, phone number as a tappable row with a call icon and a WhatsApp icon.
A status pill "En attente" amber. Rows: service, "Mar. 12 nov. · 15:00 → 15:45", "5 000 FCFA".
A "Note" free-text row, empty, placeholder "Ex. : allergique au produit X".
A client history strip: "3 visites · 1 absence · Fiabilité 7,4".
Two primary actions side by side: "Confirmer" (brass) and "Décliner" (outlined, red text).
Below, a text link "Marquer comme terminée" and another "Signaler une absence".
Make the destructive actions visibly harder to hit than the constructive ones.

[C5 — Ajouter un rendez-vous à la main]
The screen that makes TEMPO useful on day one, before any client exists.
Title "Nouveau rendez-vous". A segmented control at the top: "Cliente TEMPO | Saisie manuelle",
with "Saisie manuelle" selected.
Fields: "Nom de la cliente" (with an autocomplete dropdown showing past clients), "Téléphone"
(optional), a service picker showing service chips with their durations, a date field, a start
time wheel, and an auto-computed end time shown as read-only text "Fin : 15:45".
A warning banner appears in amber if the slot overlaps an existing appointment:
"Ce créneau chevauche Fatou Adjovi (15:00)". The save button stays enabled but the banner
must be impossible to miss.
Bottom: brass "Enregistrer" button.

[C6 — Bloquer une indisponibilité]
Simple sheet: "Bloquer du temps". Reason chips: "Pause", "Course", "Fermé", "Perso".
Date, start and end time. A repeat option "Tous les mardis". Brass "Bloquer" button.
Preview of the resulting hatched block rendered inline above the button.

[C7 — Centre de notifications]
Dark list. Title "Notifications" with a "Tout marquer comme lu" text link.
Grouped by "Aujourd'hui" / "Hier".
Each row: a circular icon whose colour maps to the notification type, a bold title, a one-line
body, and a relative timestamp right-aligned. Unread rows carry a brass dot on the left and a
very slightly lighter background.
Show these six, in this order:
- "Nouvelle réservation" — "Fatou Adjovi · Coupe + barbe · demain 15:00" — 4 min — unread
- "Rappel 1 h" — "Awa Kpodo arrive à 09:00" — 1 h — unread
- "Annulation" — "Sègbédji M. a annulé le RDV de 17:00" — 3 h
- "Rappel J-1" — "3 rendez-vous demain" — hier
- "Absence signalée" — "Client walk-in ne s'est pas présenté" — hier
- "Modification" — "Awa Kpodo a déplacé son RDV à 10:00" — hier

[C8 — Notification push sur écran verrouillé]
A realistic Android lock screen, wallpaper darkened. A single notification card carrying the
TEMPO app icon (brass T on indigo): title "TEMPO", bold line "Fatou Adjovi arrive dans 1 h",
body "Coupe + barbe · 15:00 · 5 000 FCFA", two inline actions "Voir" and "Appeler".
Also render the Android adaptive app icon on a home screen row, next to other app icons, to
prove it survives the circular mask.

[C9 — Statistiques]
Dark. Title "Novembre". A month selector.
Four stat tiles in a 2×2 grid, each with a label, a large tabular number, and a small delta
versus last month coloured green or red: "Chiffre d'affaires 184 000 FCFA", "Rendez-vous 47",
"Taux d'absence 6 %", "Fiabilité 9,2".
Below, a bar chart of revenue per week — brass bars on a dark ground, hairline baseline, no
gridlines, values labelled directly above each bar. Four bars.
Below, "Prestations les plus demandées" — a horizontal bar list with counts.
Below, "Heures creuses" — a heatmap grid, 7 days × 12 hours, brass intensity = occupancy,
with a two-stop legend. Keep it readable: no more than five intensity steps.

[C10 — Clientes]
Dark. A search field. A list of clients: avatar initials in a brass circle, name, "8 visites",
last visit "il y a 3 semaines", and a reliability chip on the right. One client shows a red
"2 absences" chip. Tapping opens a detail with visit history as a vertical timeline.

[C11 — Profil et abonnement]
Dark. Salon header: cover photo, salon name, "Publié" green pill, an "Aperçu public" text link
that opens B3.
Rows with chevrons: "Fiche du salon", "Prestations et tarifs", "Horaires d'ouverture",
"Position sur la carte", "Notifications", "Aide".
Then a subscription card, brass-outlined: "Pilote gratuit" pill, "Ton abonnement est offert
jusqu'au 31 mars 2026", then "Ensuite : 1 USD / mois". A secondary "Gérer l'abonnement" button.
At the bottom, "Se déconnecter" as a plain red text link.

[C12 — Création du salon, onboarding]
A 4-step wizard shown as one board: a slim brass progress bar at 25/50/75/100 %.
Step 1 "Ton salon" — name, phone, address.
Step 2 "Où es-tu ?" — a map with a draggable pin, an address preview, and a caption
"Les clientes te trouveront par la distance."
Step 3 "Tes prestations" — an editable list, each row: name, duration stepper, price in FCFA,
plus an "Ajouter une prestation" ghost row.
Step 4 "Tes horaires" — seven day rows with time ranges and a "Fermé" toggle.
Each step has "Retour" (ghost) and "Continuer" (brass). The last step's button reads "Publier mon salon".
```

## BLOC D — Back-office admin (canvas *Web*, desktop)

```
[D1 — Tableau de bord]
Desktop web admin, light theme on Sable, left sidebar in Indigo Nuit.
Sidebar: TEMPO mark, then nav items with icons — Tableau de bord (active), Professionnels,
Réservations, Notifications, Réglages. The active item carries a brass left rail.
Main area: title "Tableau de bord", a date-range picker top right.
A row of five KPI tiles: "Pros inscrits 128", "Pros publiés 94", "Réservations (30 j) 1 412",
"Taux de confirmation 87 %", "Taux d'absence 6 %". Each with a sparkline.
Below, two panels side by side: a line chart "Réservations par jour" (single brass line,
no fill, direct end-label) and a funnel "Recherche → Fiche → Créneau → Confirmation" with
absolute counts and drop-off percentages between stages.
Below, a table "Derniers pros inscrits" with a status column.

[D2 — Liste des professionnels]
A dense data table. Columns: Salon (with thumbnail), Ville, Prestations, Réservations 30 j,
Fiabilité, Abonnement (pill: Pilote gratuit / Actif / Suspendu / Résilié), Publié (toggle),
Inscrit le. Sortable headers, a search field, filter chips by city and by subscription status.
Row actions on hover: "Voir", "Publier", "Suspendre".
Bulk selection with a checkbox column and a contextual action bar that slides up when rows
are selected. Pagination showing "1–25 sur 128".

[D3 — Détail d'un professionnel]
Two columns. Left: identity card (photo, name, slug URL, phone, address, map thumbnail),
publication toggle, subscription block with a "Basculer en payant" button guarded by a
confirmation modal.
Right: tabs "Activité | Prestations | Réservations | Score".
The "Score" tab shows the reliability score broken into its factual inputs — punctuality,
attendance, cancellations — each as a labelled bar with the raw counts beside it, and a note:
"Aucun avis libre. Score calculé sur des faits." Make that note visible, not a footnote.

[D4 — Réservations]
Full-width table: Référence, Cliente, Téléphone, Salon, Prestation, Date, Statut (coloured pill),
Créée le. Filter bar with status chips and a date range. A row expands in place to reveal the
notification timeline for that booking: created, confirmed, J-1 reminder, H-1 reminder, each with
a sent/failed marker. Failed pushes show a red marker and a "Renvoyer" action.
```

---

## Notes d'usage

- **Ordre de génération recommandé** : C2 (agenda jour) en premier — c'est l'écran qui décide
  du reste. Puis B3 → B4 → B5 → B6 (le tunnel de réservation, la conversion). Le back-office
  en dernier, il ne conditionne rien.
- **Ce que Stitch rate souvent** : les états « pris / libre / sélectionné » de B4, la timeline
  de C2, et les chiffres tabulaires. Régénère ces trois-là séparément, en insistant.
- **Les statuts métier** (`en_attente`, `confirmee`, `terminee`, `annulee`, `absente`) viennent
  directement de l'enum `reservation_statut` dans `socle/db/schema.ts`. Les maquettes doivent
  les couvrir tous les cinq, sinon l'UI sera incomplète à l'implémentation.
