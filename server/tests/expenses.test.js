import request from 'supertest';

// Point DB to in-memory SQLite before any app import
process.env.DB_PATH = ':memory:';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';

const { default: app } = await import('../app.js');

const BASE = {
  amount:          1500,
  category:        'Groceries',
  description:     'Big Basket weekly order',
  date:            '2025-04-10',
  idempotencyKey:  '550e8400-e29b-41d4-a716-446655440000',
};

describe('POST /expenses', () => {
  test('creates expense → 201 with correct fields', async () => {
    const res = await request(app).post('/expenses').send(BASE);
    expect(res.status).toBe(201);
    expect(res.body.amount).toBe('1500.00');
    expect(res.body.category).toBe('Groceries');
    expect(res.body.idempotencyKey).toBe(BASE.idempotencyKey);
  });

  test('duplicate idempotencyKey → 200, returns original, only one row in DB', async () => {
    await request(app).post('/expenses').send(BASE);
    const res = await request(app).post('/expenses').send(BASE);
    expect(res.status).toBe(200);
    expect(res.body.idempotencyKey).toBe(BASE.idempotencyKey);
    // Verify DB directly — only one record with this key
    const { getDb } = await import('../src/config/database.js');
    const count = getDb().prepare(
      "SELECT COUNT(*) as c FROM expenses WHERE idempotency_key = ?"
    ).get(BASE.idempotencyKey);
    expect(count.c).toBe(1);
  });

  test('negative amount → 422 with field error on amount', async () => {
    const res = await request(app).post('/expenses').send({
      ...BASE, amount: -500, idempotencyKey: '550e8400-e29b-41d4-a716-446655440001'
    });
    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe('amount');
  });

  test('missing idempotencyKey → 422', async () => {
    const { idempotencyKey, ...body } = BASE;
    const res = await request(app).post('/expenses').send(body);
    expect(res.status).toBe(422);
  });

  test('future date → 422', async () => {
    const res = await request(app).post('/expenses').send({
      ...BASE, date: '2099-01-01', idempotencyKey: '550e8400-e29b-41d4-a716-446655440002'
    });
    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe('date');
  });
});

describe('GET /expenses', () => {
  beforeEach(async () => {
    await request(app).post('/expenses').send(BASE);
    await request(app).post('/expenses').send({
      ...BASE, category: 'Rent', amount: 18500,
      idempotencyKey: '550e8400-e29b-41d4-a716-446655440003'
    });
  });

  test('?category=Groceries → only Groceries records', async () => {
    const res = await request(app).get('/expenses?category=Groceries');
    expect(res.status).toBe(200);
    expect(res.body.data.every(e => e.category === 'Groceries')).toBe(true);
  });

  test('total is correct string sum of visible records', async () => {
    const res = await request(app).get('/expenses?category=Groceries');
    expect(res.body.total).toBe('1500.00');
  });

  test('?sort=date_asc → oldest record is first', async () => {
    await request(app).post('/expenses').send({
      ...BASE, date: '2025-03-01', idempotencyKey: '550e8400-e29b-41d4-a716-446655440004'
    });
    const res = await request(app).get('/expenses?sort=date_asc');
    const dates = res.body.data.map(e => e.date);
    expect(dates[0] <= dates[dates.length - 1]).toBe(true);
  });
});

describe('PUT /expenses/:id', () => {
  let createdId;

  beforeEach(async () => {
    const res = await request(app).post('/expenses').send({
      ...BASE,
      idempotencyKey: '550e8400-e29b-41d4-a716-446655440010',
    });
    createdId = res.body.id;
  });

  test('updates expense → 200 with correct paise conversion', async () => {
    const res = await request(app).put(`/expenses/${createdId}`).send({
      amount: 2500.50,
      category: 'Rent',
      description: 'Updated rent description',
      date: '2025-04-15',
    });
    expect(res.status).toBe(200);
    expect(res.body.amount).toBe('2500.50');
    expect(res.body.category).toBe('Rent');
    expect(res.body.description).toBe('Updated rent description');
    expect(res.body.date).toBe('2025-04-15');

    // Verify paise in DB directly
    const { getDb } = await import('../src/config/database.js');
    const row = getDb().prepare('SELECT amount_paise FROM expenses WHERE id = ?').get(createdId);
    expect(row.amount_paise).toBe(250050);
  });

  test('update non-existent id → 404', async () => {
    const res = await request(app).put('/expenses/999999').send({
      amount: 100,
      category: 'Groceries',
      description: 'Does not exist',
      date: '2025-04-01',
    });
    expect(res.status).toBe(404);
  });

  test('update with invalid data → 422', async () => {
    const res = await request(app).put(`/expenses/${createdId}`).send({
      amount: -100,
      category: 'Groceries',
      description: 'Bad amount',
      date: '2025-04-01',
    });
    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe('amount');
  });
});

describe('DELETE /expenses/:id', () => {
  let createdId;

  beforeEach(async () => {
    const res = await request(app).post('/expenses').send({
      ...BASE,
      idempotencyKey: '550e8400-e29b-41d4-a716-446655440020',
    });
    createdId = res.body.id;
  });

  test('deletes expense → 200, record removed from DB', async () => {
    const res = await request(app).delete(`/expenses/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.id).toBe(createdId);

    // Verify removed from DB
    const { getDb } = await import('../src/config/database.js');
    const row = getDb().prepare('SELECT * FROM expenses WHERE id = ?').get(createdId);
    expect(row).toBeUndefined();
  });

  test('delete non-existent id → 404', async () => {
    const res = await request(app).delete('/expenses/999999');
    expect(res.status).toBe(404);
  });

  test('total count decreases after delete', async () => {
    const before = await request(app).get('/expenses');
    const countBefore = before.body.count;

    await request(app).delete(`/expenses/${createdId}`);

    const after = await request(app).get('/expenses');
    expect(after.body.count).toBe(countBefore - 1);
  });
});

describe('GET /health', () => {
  test('returns ok when DB is reachable', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

