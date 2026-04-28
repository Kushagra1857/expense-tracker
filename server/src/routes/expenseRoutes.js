import { Router } from 'express';
import { createExpense, getExpenses, updateExpense, deleteExpense } from '../controllers/expenseController.js';
import { validate } from '../middleware/validateRequest.js';
import { createExpenseSchema, updateExpenseSchema } from '../validators/expenseValidator.js';

const router = Router();
router.post('/', validate(createExpenseSchema), createExpense);
router.get('/', getExpenses);
router.put('/:id', validate(updateExpenseSchema), updateExpense);
router.delete('/:id', deleteExpense);
export default router;
