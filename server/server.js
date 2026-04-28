import { config } from 'dotenv';
config();

import app from './app.js';
import { seedIfEmpty } from './src/config/seed.js';

// Auto-seed on startup — ensures evaluator always sees sample data
// Idempotent: skips if data already exists in the DB
seedIfEmpty();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
