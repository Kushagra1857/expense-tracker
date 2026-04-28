import * as service from '../services/expenseService.js';

export const createExpense = (req, res, next) => {
  try {
    const result = service.createExpense(req.body);
    return res.status(result.status).json(result.data);
  } catch (err) { next(err); }
};

export const getExpenses = (req, res, next) => {
  try {
    const result = service.getExpenses(req.query);
    return res.status(200).json(result);
  } catch (err) { next(err); }
};

export const updateExpense = (req, res, next) => {
  try {
    const result = service.updateExpense(req.params.id, req.body);
    return res.status(result.status).json(result.data);
  } catch (err) { next(err); }
};

export const deleteExpense = (req, res, next) => {
  try {
    const result = service.deleteExpense(req.params.id);
    return res.status(result.status).json(result.data);
  } catch (err) { next(err); }
};
