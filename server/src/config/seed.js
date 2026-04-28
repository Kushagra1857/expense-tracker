import { getDb } from './database.js';
import { toPaise } from '../utils/moneyUtils.js';

const SEEDS = [
  { amount: '4250.00',  category: 'Groceries',           description: 'Big Basket monthly order — pulses, oil, rice, atta',   date: '2025-04-01', idempotencyKey: 'seed-00000000-0000-0000-0000-000000000001' },
  { amount: '18500.00', category: 'Rent',                 description: 'April rent — 2BHK, Andheri West, Mumbai',             date: '2025-04-01', idempotencyKey: 'seed-00000000-0000-0000-0000-000000000002' },
  { amount: '1340.00',  category: 'Electricity',          description: 'MSEDCL bill for March — higher due to AC usage',      date: '2025-04-03', idempotencyKey: 'seed-00000000-0000-0000-0000-000000000003' },
  { amount: '2200.00',  category: 'Petrol',               description: 'Fuel top-up at Indian Oil pump, Thane',               date: '2025-04-05', idempotencyKey: 'seed-00000000-0000-0000-0000-000000000004' },
  { amount: '649.00',   category: 'OTT / Entertainment',  description: 'Netflix Premium monthly renewal',                     date: '2025-04-06', idempotencyKey: 'seed-00000000-0000-0000-0000-000000000005' },
  { amount: '3750.00',  category: 'School / Tuition',     description: 'Maths and Science tuition — Arjun, class 10',        date: '2025-04-08', idempotencyKey: 'seed-00000000-0000-0000-0000-000000000006' },
  { amount: '870.00',   category: 'Medicines',            description: 'BP tablets and Vitamin D — Apollo Pharmacy, Pune',   date: '2025-04-10', idempotencyKey: 'seed-00000000-0000-0000-0000-000000000007' },
  { amount: '1120.00',  category: 'Dining / Zomato',      description: 'Family biryani order — Paradise Biryani, 4 people', date: '2025-04-12', idempotencyKey: 'seed-00000000-0000-0000-0000-000000000008' },
  { amount: '299.00',   category: 'Mobile Recharge',      description: 'Airtel prepaid — unlimited calls + 2GB/day',        date: '2025-04-14', idempotencyKey: 'seed-00000000-0000-0000-0000-000000000009' },
  { amount: '580.00',   category: 'Auto / Cab',           description: 'Ola rides to office Mon–Wed, Powai to BKC',         date: '2025-04-15', idempotencyKey: 'seed-00000000-0000-0000-0000-000000000010' },
];

/**
 * Seed the database with sample expenses if empty.
 * Idempotent — safe to call on every startup.
 */
export const seedIfEmpty = () => {
  const db = getDb();
  const existing = db.prepare('SELECT COUNT(*) as c FROM expenses').get();

  if (existing.c > 0) {
    console.log('Seed data already present — skipping.');
    return;
  }

  const insert = db.prepare(`
    INSERT OR IGNORE INTO expenses (amount_paise, category, description, date, idempotency_key)
    VALUES (?, ?, ?, ?, ?)
  `);

  // Run all inserts in a single transaction — atomic, fast
  const insertAll = db.transaction((seeds) => {
    for (const s of seeds) {
      insert.run(toPaise(s.amount), s.category, s.description, s.date, s.idempotencyKey);
    }
  });

  insertAll(SEEDS);
  console.log(`Seeded ${SEEDS.length} expenses successfully.`);
};

// Allow running as CLI script: node src/config/seed.js
const isDirectRun = process.argv[1]?.includes('seed.js');
if (isDirectRun) {
  const { config } = await import('dotenv');
  config();
  seedIfEmpty();
  process.exit(0);
}
