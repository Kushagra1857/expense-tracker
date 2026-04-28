import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let DB_PATH = process.env.DB_PATH || path.resolve(__dirname, '../../data/expenses.db');

// FREE TIER PROTECTION: If DB_PATH is incorrectly set to the absolute path '/data/...'
// (which requires a paid persistent disk and causes EACCES on free tier),
// we forcefully redirect it into the local project directory.
if (DB_PATH !== ':memory:' && DB_PATH.startsWith('/data')) {
  DB_PATH = path.resolve(__dirname, '../../', DB_PATH.replace(/^\/+/, ''));
} else if (DB_PATH !== ':memory:' && !path.isAbsolute(DB_PATH)) {
  // If it's './data/expenses.db', resolve it safely against the project root
  DB_PATH = path.resolve(process.cwd(), DB_PATH);
}

let db;

export const getDb = () => {
  if (db) return db;

  // Ensure data directory exists (only if not an in-memory DB)
  if (DB_PATH !== ':memory:') {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

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
