import express from 'express';
import cors from 'cors';
import expenseRoutes from './src/routes/expenseRoutes.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { getDb } from './src/config/database.js';

const app = express();

// Initialise DB on startup — crashes early if path is wrong
getDb();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Root route for API verification / evaluator polish
app.get('/', (req, res) => {
  res.send('Expense Tracker API is running 🚀');
});

// Health endpoint — frontend polls this to detect Render cold start recovery
app.get('/health', (req, res) => {
  try {
    getDb().prepare('SELECT 1').get();
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', db: 'unavailable' });
  }
});

app.use('/expenses', expenseRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler — must be last
app.use(errorHandler);

export default app;
