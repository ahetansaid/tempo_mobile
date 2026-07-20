# TEMPO — Prototype cliquable (site statique)

Site statique prêt à déployer sur Vercel. Aucune étape de build.

## Déploiement (2 options)

### A. Vercel CLI (le plus rapide)
    npm i -g vercel
    cd tempo-proto
    vercel          # aperçu (preview)
    vercel --prod   # mise en production

### B. Depuis GitHub
1. Pousse ce dossier `tempo-proto/` dans un dépôt GitHub.
2. Sur vercel.com → Add New → Project → importe le dépôt.
3. Framework Preset : **Other** (site statique). Root Directory : `tempo-proto` si le
   repo contient d'autres dossiers, sinon laisse la racine. Deploy.

## Contenu
- `index.html` — la page et le viewer (tout le JS/CSS inline).
- `assets/*.webp` — les 23 écrans (générés depuis la maquette Stitch).
- `vercel.json` — URLs propres + cache long des images.

## Régénérer
Relance le script `build_static.py` (nécessite Python + Pillow).
