-- Migration : contrôle d'accès par section pour les administrateurs (RBAC).
-- Ajoute la colonne `sections` (tableau JSON de clés de sections) à la table `admins`.
-- À exécuter UNE FOIS sur la base de prod AVANT le déploiement du code qui l'utilise.
--
-- Exécution (compte Cloudflare de robertowafo, où vit ceme-db) :
--   npx wrangler d1 execute ceme-db --remote --file=db/migrations/001_admin_sections.sql
-- ou via la console D1 du dashboard Cloudflare (copier la ligne ci-dessous).
--
-- NB : SQLite ne supporte pas `ADD COLUMN IF NOT EXISTS`. Si la colonne existe
-- déjà, la commande échoue avec « duplicate column name » — c'est sans gravité,
-- cela signifie simplement que la migration a déjà été appliquée.

ALTER TABLE admins ADD COLUMN sections TEXT;
