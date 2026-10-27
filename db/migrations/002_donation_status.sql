-- Migration : statut des dons (en attente / confirmé).
-- Un don saisi en ligne n'est qu'une déclaration : il reste « pending » et ne
-- compte PAS dans les totaux publics tant qu'un admin ne l'a pas confirmé.
-- Les dons existants sont conservés comme « confirmed » (valeur par défaut).
--
-- À exécuter UNE FOIS sur la base de prod (console D1 du compte robertowafo).
-- Le code fonctionne avant et après : tant que la colonne n'existe pas, tous les
-- dons comptent comme avant ; une fois ajoutée, les nouveaux dons passent en « pending ».
--
-- Si la colonne existe déjà, SQLite répond « duplicate column name » : sans gravité.

ALTER TABLE donations ADD COLUMN status TEXT NOT NULL DEFAULT 'confirmed';
