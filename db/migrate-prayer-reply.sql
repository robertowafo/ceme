-- Migration : ajouter les colonnes de réponse admin aux requêtes de prière
-- Exécuter sur la prod : wrangler d1 execute ceme-db --file=db/migrate-prayer-reply.sql
-- (sur le compte robertowafo, pas ImpactTech)

ALTER TABLE prayer_requests ADD COLUMN admin_reply TEXT;
ALTER TABLE prayer_requests ADD COLUMN replied_at TEXT;
