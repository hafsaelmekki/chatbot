# GlutenScan

GlutenScan est une application web Next.js permettant de scanner des produits alimentaires et d''�valuer leur compatibilit� avec un r�gime sans gluten.

## Fonctionnalit�s

- T�l�versement d''image ou scan cam�ra
- OCR local (Tesseract.js) ou cloud (Google Vision) pour extraire les ingr�dients
- Heuristiques et mod�le de langage pour interpr�ter les ingr�dients
- Recherche d''alternatives via l''API Open Food Facts
- Tests unitaires, API et end-to-end

## D�marrage

```bash
npm install
npm run dev
```

## Scripts utiles

- `npm run test` : lance les tests unitaires et d''API (Vitest)
- `npm run test:e2e` : lance les tests E2E (Playwright)
- `npm run gen:openapi` : g�n�re `public/openapi.json` � partir des sch�mas Zod

## Configuration

Copiez `.env.example` en `.env.local` et renseignez les cl�s n�cessaires (LLM, OCR, Open Food Facts).

## Licence

Ce projet est publi� sous licence MIT. Voir [LICENSE](LICENSE).
