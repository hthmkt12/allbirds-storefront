-- Phase 1: Content Tables for Allbirds EmDash Backend
CREATE TABLE IF NOT EXISTS hero_blocks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  headline    TEXT NOT NULL,
  body        TEXT NOT NULL,
  cta_label   TEXT NOT NULL,
  media       TEXT,
  theme_swatch TEXT
);

CREATE TABLE IF NOT EXISTS categories (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT NOT NULL,
  slug  TEXT NOT NULL UNIQUE,
  cta   TEXT NOT NULL,
  swatch TEXT NOT NULL,
  image TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  price        TEXT NOT NULL,
  fit          TEXT NOT NULL,
  rating       REAL NOT NULL,
  tags         TEXT NOT NULL DEFAULT '[]',
  sizes        TEXT NOT NULL DEFAULT '[]',
  slug         TEXT,
  description  TEXT,
  label        TEXT,
  color        TEXT,
  swatch       TEXT,
  image        TEXT,
  colorways    TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS promo_tiles (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  title  TEXT NOT NULL,
  swatch TEXT NOT NULL,
  image  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS materials (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  impact_note   TEXT NOT NULL,
  texture_image TEXT,
  source_region TEXT
);

CREATE TABLE IF NOT EXISTS reviews (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  quote         TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  detail        TEXT NOT NULL
);
