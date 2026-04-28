import { getDb } from '../config/database.js';
import { toPaise, toRupees } from '../utils/moneyUtils.js';

const rowToExpense = (row) => ({
  id:              row.id,
  amount:          toRupees(row.amount_paise),   // "4250.75" — string, never float
  category:        row.category,
  description:     row.description,
  date:            row.date,
  idempotencyKey:  row.idempotency_key,
  createdAt:       row.created_at,
});

export const createExpense = (body) => {
  const db = getDb();

  // Check idempotency BEFORE attempting insert
  const existing = db.prepare(
    'SELECT * FROM expenses WHERE idempotency_key = ?'
  ).get(body.idempotencyKey);

  if (existing) {
    // Duplicate request — return original record, signal 200
    return { status: 200, data: rowToExpense(existing) };
  }

  let newRow;
  try {
    const stmt = db.prepare(`
      INSERT INTO expenses (amount_paise, category, description, date, idempotency_key)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      toPaise(body.amount),
      body.category,
      body.description.trim(),
      body.date,
      body.idempotencyKey,
    );
    newRow = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      // Race condition: another concurrent request inserted just before this one
      // Fetch and return the original — still 200
      const race = db.prepare(
        'SELECT * FROM expenses WHERE idempotency_key = ?'
      ).get(body.idempotencyKey);
      return { status: 200, data: rowToExpense(race) };
    }
    throw err; // re-throw unknown errors to global error handler
  }

  return { status: 201, data: rowToExpense(newRow) };
};

export const getExpenses = (query) => {
  const db = getDb();

  // Build SQL dynamically — filtering and sorting done in DB, never in JS
  let sql = 'SELECT * FROM expenses';
  const params = [];

  if (query.category) {
    sql += ' WHERE category = ?';
    params.push(query.category);
  }

  sql += query.sort === 'date_asc'
    ? ' ORDER BY date ASC, id ASC'
    : ' ORDER BY date DESC, id DESC';

  const rows = db.prepare(sql).all(...params);
  const expenses = rows.map(rowToExpense);

  // Sum is integer paise arithmetic — zero float risk
  const totalPaise = rows.reduce((sum, r) => sum + r.amount_paise, 0);

  return {
    data:  expenses,
    total: toRupees(totalPaise),
    count: expenses.length,
  };
};

export const updateExpense = (id, body) => {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE expenses
    SET amount_paise = ?, category = ?, description = ?, date = ?
    WHERE id = ?
  `);

  const result = stmt.run(
    toPaise(body.amount),
    body.category,
    body.description.trim(),
    body.date,
    id
  );

  if (result.changes === 0) {
    const err = new Error('Expense not found');
    err.code = 'NOT_FOUND';
    throw err;
  }

  const updatedRow = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
  return { status: 200, data: rowToExpense(updatedRow) };
};

export const deleteExpense = (id) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM expenses WHERE id = ?').run(id);

  if (result.changes === 0) {
    const err = new Error('Expense not found');
    err.code = 'NOT_FOUND';
    throw err;
  }

  return { status: 200, data: { success: true, id: Number(id) } };
};

