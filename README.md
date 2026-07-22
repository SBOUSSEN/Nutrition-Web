# Nutrition Web

Prototype séparé de la future version web en `Next.js + TypeScript`.

Ce dossier est volontairement indépendant de l'application Streamlit existante.

## Objectif

Préparer une version :

- élégante
- déployable
- multi-utilisateur
- extensible vers tablette et mobile web

## Statut

Prototype web distinct de l'application Streamlit.
Le chargement des sources métier est désormais fait au démarrage de la page.
Aucun impact sur l'application Streamlit actuelle.

## Sources métier utilisées

- Source locale prioritaire si disponible :
  - `/Users/salahboussen2/Documents/recherche/NUTRITION/nutrition_solutes.csv`
  - `/Users/salahboussen2/Documents/recherche/NUTRITION/nutrition_rules_v0_2.json`
- Source embarquée de secours pour déploiement :
  - `nutrition-web/data/nutrition_solutes.csv`
  - `nutrition-web/data/nutrition_rules_v0_2.json`

Le prototype web charge automatiquement :

1. les fichiers externes locaux si présents
2. sinon la copie embarquée dans le projet, compatible Vercel

Les données métier ne sont pas recopiées dans le code Python ou TypeScript métier.
Elles restent dans des fichiers CSV/JSON dédiés.

## Compatibilité Vercel

Le projet est désormais préparé pour Vercel :

- en local, il continue à utiliser les fichiers métier externes historiques si disponibles
- en déploiement, il peut fonctionner sans chemin `/Users/...` grâce aux fichiers embarqués

Variables d'environnement optionnelles :

- `NUTRITION_RULES_PATH`
- `NUTRITION_SOLUTES_PATH`

Si ces deux variables sont définies, elles prennent la priorité sur les chemins par défaut.

## Structure

```text
nutrition-web/
├── README.md
├── package.json
├── tsconfig.json
├── next.config.ts
├── .gitignore
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/
│   │   ├── hero.tsx
│   │   └── shell.tsx
│   └── nutrition/
│       ├── patient-panel.tsx
│       ├── summary-panel.tsx
│       └── tabs-shell.tsx
├── lib/
│   ├── nutrition/
│   │   ├── patient.ts
│   │   ├── targets.ts
│   │   ├── non-nutritional.ts
│   │   ├── eer.ts
│   │   ├── optimizer.ts
│   │   └── plan.ts
│   └── rules/
│       ├── loader.ts
│       └── normalizer.ts
├── public/
│   └── .gitkeep
└── types/
    └── nutrition.ts
```

## Points métier encore non figés

Le fichier JSON source contient encore des éléments explicitement marqués comme `validation_needed`.
Ils ne sont pas inventés ni masqués dans cette version web. À la date du `2026-07-20`, cela inclut notamment :

- la concentration locale utilisée pour le citrate/Regiocit
- la stratégie de saisie des concentrations de propofol
- le choix de la cible par défaut à l'intérieur d'une fourchette
- la conduite à tenir si aucune prescription ne permet d'atteindre la cible sans dépassement

## Étapes suivantes

1. Copier les assets visuels utiles dans `public/`
2. Fixer les types métier TypeScript
3. Affiner le design visuel final
4. Ajouter la gestion d'erreurs et les états de chargement
5. Déployer ensuite sur Vercel

## Modules déjà portés

- calcul IMC
- poids idéal, poids ajusté, poids de calcul
- cibles caloriques et protéiques
- propofol
- glucose IV
- EER / Regiocit / citrate
- conversion citrate en kcal
- synthèse clinique
- plan progressif J1/J2/J3
- optimiseur de propositions nutritionnelles
- chargement des sources métier CSV/JSON au démarrage

## Prochaine étape recommandée

Travailler maintenant le design visuel final :

- hiérarchie visuelle
- identité graphique
- lisibilité mobile/tablette
- mise en avant de la meilleure proposition

## Commandes prévues

```bash
pnpm install
pnpm dev
```

## Déploiement Vercel recommandé

1. pousser `nutrition-web` sur GitHub
2. importer le dépôt dans Vercel
3. laisser Vercel construire le projet
4. partager l'URL de preview à la spécialiste

Les fichiers embarqués dans `nutrition-web/data/` permettent au déploiement Vercel de fonctionner même sans accès au dossier local historique.
