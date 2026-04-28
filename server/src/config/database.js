import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// On Render: DB_PATH env var points to /data/expenses.db (persistent volume)
// Locally: falls back to /server/data/expenses.db
const DB_PATH = process.env.DB_PATH ||
  path.resolve(__dirname, '../../data/expenses.db');

let db;

export const getDb = () => {
  if (db) return db;

  db = new Database(DB_PATH);

  // WAL mode: better concurrent read performance
  db.pragma('journal_mode = WAL');
  // Enforce foreign keys
  db.pragma('foreign_keys = ON');

  // Create table and indexes once
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      amount_paise     INTEGER NOT NULL CHECK(amount_paise > 0),
      category         TEXT    NOT NULL,
      description      TEXT    NOT NULL,
      date             TEXT    NOT NULL,
      idempotency_key  TEXT    NOT NULL UNIQUE,
      created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_category ON expenses(category);
    CREATE INDEX IF NOT EXISTS idx_date     ON expenses(date DESC);
    CREATE INDEX IF NOT EXISTS idx_cat_date ON expenses(category, date DESC);
  `);

  console.log('SQLite connected:', DB_PATH);
  return db;
};
