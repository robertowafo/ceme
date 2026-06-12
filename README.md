# Chapelle de l'Éternel Mon Étendard

Site web officiel de la Chapelle de l'Éternel Mon Étendard (CEME).

## Stack technique

- **Frontend** : React 19 + TypeScript + Vite + TailwindCSS
- **Backend** : Cloudflare Pages Functions (Hono)
- **Base de données** : Cloudflare D1 (SQLite)
- **Stockage fichiers** : Cloudflare R2
- **Auth** : Google OAuth + JWT (jose)

## Développement local

```bash
npm install
npm run dev
```

## Déploiement

Le site est déployé automatiquement sur Cloudflare Pages à chaque push sur `master`.

```bash
# Initialiser la base de données en production
npx wrangler d1 execute ceme-db --remote --file=db/schema.sql
```
