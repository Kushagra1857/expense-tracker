# Expense Tracker

## Live links
- Frontend: https://your-app.vercel.app
- API: https://your-api.onrender.com

## Note on first load
The backend runs on Render's free tier, which sleeps after 15 minutes
of inactivity. The first request after a period of inactivity takes
30–50 seconds. The app shows a "Server is waking up" banner and
automatically continues once ready. All subsequent requests respond
in under 200ms.

## Architecture
```
React (Vercel) → Express (Render) → SQLite (persistent disk)
```

## Why SQLite with `better-sqlite3`
SQLite is a fully relational, ACID-compliant database that runs as a file within the server process — zero external services, zero network latency to a DB host, zero IP whitelisting. `better-sqlite3` is synchronous, which eliminates async complexity in the data layer and makes the code easier to read and reason about. For this scale, it is the correct tool.

## Why money is stored as INTEGER (paise)
₹4,250.75 is stored as `425075` (integer paise). All arithmetic — totals, filters, aggregations — operates on integers. There is no floating point anywhere in the data pipeline. This is identical to how Stripe, Razorpay, and most payment processors store monetary values internally. The display layer divides by 100 and formats through `Intl.NumberFormat`. This approach eliminates the entire class of IEEE 754 float precision bugs (e.g. `0.1 + 0.2 !== 0.3`) without requiring a special type like `Decimal128`.

## Why a UNIQUE constraint handles idempotency
The `idempotency_key` column has a `UNIQUE` constraint at the SQLite schema level. Even if two concurrent requests with the same key reach the server simultaneously, SQLite's serialised write model means only one INSERT succeeds. The other receives a `SQLITE_CONSTRAINT_UNIQUE` error which the service layer catches and converts into a `200` response returning the original record. This is database-enforced — not application-enforced.

## Trade-off acknowledged
SQLite is single-writer and file-based. It does not support horizontal scaling across multiple server instances. For this assessment's scope — a single Render instance — it is entirely appropriate. MongoDB Atlas is the documented migration path if multi-instance scaling is required.

## Key design decisions
1. **Money as INTEGER paise** — ₹4,250.75 = 425075 in DB. Totals computed with integer arithmetic. No float risk anywhere.
2. **Idempotency** — UUID generated once per form lifecycle in `useRef`. Reused on retry, replaced on success. `UNIQUE` constraint in SQLite is the final safety net at the database level.
3. **Cold start handling** — `useServerStatus` polls `/health` every 5s. `ServerWakeUp` shows a user-readable banner. Axios timeout 60s.
4. **Service/controller separation** — all logic in `expenseService.js`.
5. **All API calls in `expensesApi.js`** — no Axios calls in components.
6. **Filtering and sorting in SQL `WHERE` / `ORDER BY`** — never in JS.

## Trade-offs made due to timebox
- No authentication (next: JWT + refresh tokens)
- No pagination (next: cursor-based for large data)
- No soft delete
- SQLite single-writer (next: migrate to PostgreSQL for horizontal scale)
- Render free tier cold start (paid tier eliminates this)

## Intentionally not built
- Multi-user support
- Export to CSV / PDF
- Recurring expenses

## How to run locally
```bash
# Backend
cd server && cp .env.example .env && npm install && node server.js

# Seed data (optional)
cd server && npm run seed

# Frontend (in a separate terminal)
cd client && cp .env.example .env && npm install && npm run dev
```

## How to run tests
```bash
cd server && npm test
```

## Sample requests
```bash
# Create expense
curl -X POST http://localhost:5000/expenses \
  -H "Content-Type: application/json" \
  -d '{"amount":4250,"category":"Groceries","description":"Big Basket order","date":"2025-04-01","idempotencyKey":"550e8400-e29b-41d4-a716-446655440000"}'

# List with filter
curl "http://localhost:5000/expenses?category=Groceries&sort=date_desc"

# Health check
curl http://localhost:5000/health
```

## Deployment

### Backend on Render
1. render.com → New Web Service → connect repo
2. Root directory: `server`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Environment variables:
   - `CLIENT_ORIGIN` = `https://your-app.vercel.app`
   - `DB_PATH` = `/data/expenses.db`
   - `NODE_ENV` = `production`
6. Under Settings → Disks: add a disk at mount path `/data`, size 1 GB

### Frontend on Vercel
1. vercel.com → Import → connect same repo
2. Root directory: `client`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variable: `VITE_API_URL` = `https://your-api.onrender.com`
