# GlutenScan

GlutenScan est une application web Next.js permettant de scanner des produits alimentaires et d''évaluer leur compatibilité avec un régime sans gluten.

## Fonctionnalités

- Téléversement d''image ou scan caméra
- OCR local (Tesseract.js) ou cloud (Google Vision) pour extraire les ingrédients
- Heuristiques et modèle de langage pour interpréter les ingrédients
- Recherche d''alternatives via l''API Open Food Facts
- Tests unitaires, API et end-to-end

## Démarrage

```bash
npm install
npm run dev
```

## Scripts utiles

- `npm run test` : lance les tests unitaires et d''API (Vitest)
- `npm run test:e2e` : lance les tests E2E (Playwright)
- `npm run gen:openapi` : génère `public/openapi.json` à partir des schémas Zod

## Configuration

Copiez `.env.example` en `.env.local` et renseignez les clés nécessaires (LLM, OCR, Open Food Facts).

## Licence

Ce projet est publié sous licence MIT. Voir [LICENSE](LICENSE).
