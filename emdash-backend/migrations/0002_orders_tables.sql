-- Phase 2: Orders and Order Items Tables for Allbirds EmDash Backend
CREATE TABLE IF NOT EXISTS orders (
  id               TEXT PRIMARY KEY,
  order_token      TEXT NOT NULL UNIQUE,
  email            TEXT NOT NULL,
  shipping_name    TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city    TEXT NOT NULL,
  shipping_state   TEXT NOT NULL,
  shipping_zip     TEXT NOT NULL,
  subtotal         REAL NOT NULL,
  tax              REAL NOT NULL,
  shipping         REAL NOT NULL,
  total            REAL NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending',
  payment_method   TEXT,
  payment_status   TEXT NOT NULL DEFAULT 'unpaid',
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id         TEXT NOT NULL,
  order_id   TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  price      TEXT NOT NULL,
  size       REAL NOT NULL,
  color      TEXT NOT NULL,
  image      TEXT NOT NULL,
  quantity   INTEGER NOT NULL,
  PRIMARY KEY (id, order_id)
);

CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_token ON orders(order_token);
