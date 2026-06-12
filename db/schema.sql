-- Schéma D1/SQLite pour Chapelle de l'Éternel Mon Étendard
-- Créer la base    : wrangler d1 create ceme-db
-- Initialiser (dev): wrangler d1 execute ceme-db --local --file=db/schema.sql
-- Initialiser (prod): wrangler d1 execute ceme-db --file=db/schema.sql

CREATE TABLE IF NOT EXISTS recommended_links (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  youtube_id  TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL DEFAULT 'Sermon'
);

CREATE TABLE IF NOT EXISTS gallery_photos (
  id       TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title    TEXT NOT NULL,
  location TEXT,
  url      TEXT NOT NULL,
  note     TEXT
);

CREATE TABLE IF NOT EXISTS church_events (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('special', 'upcoming', 'annonce')),
  date_str    TEXT NOT NULL,
  iso_date    TEXT NOT NULL,
  location    TEXT NOT NULL,
  preacher    TEXT,
  note        TEXT NOT NULL,
  badge       TEXT NOT NULL,
  badge_color TEXT,
  image       TEXT NOT NULL,
  is_popular  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS testimonials (
  id       TEXT PRIMARY KEY,
  author   TEXT NOT NULL,
  since    TEXT NOT NULL,
  text     TEXT NOT NULL,
  img      TEXT,
  category TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS study_documents (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  url         TEXT NOT NULL,
  category    TEXT,
  file_type   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS donations (
  id             TEXT PRIMARY KEY,
  donor_name     TEXT,
  phone          TEXT,
  amount         INTEGER NOT NULL,
  currency       TEXT NOT NULL DEFAULT 'FCFA',
  contrib_type   TEXT NOT NULL DEFAULT 'Offrande',
  payment_method TEXT NOT NULL DEFAULT 'OM',
  reference      TEXT,
  submitted_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS prayer_requests (
  id           TEXT PRIMARY KEY,
  name         TEXT,
  phone        TEXT,
  message      TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'prayer' CHECK (type IN ('prayer', 'testimony')),
  is_public    INTEGER NOT NULL DEFAULT 1,
  submitted_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS blog_categories (
  id   TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT 'Dévotions',
  author       TEXT NOT NULL,
  cover_image  TEXT,
  excerpt      TEXT,
  content      TEXT NOT NULL,
  published_at TEXT NOT NULL,
  is_published INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  subscribed_at TEXT NOT NULL
);
