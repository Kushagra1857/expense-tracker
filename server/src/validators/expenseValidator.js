import Joi from 'joi';
import { CATEGORIES } from '../constants/categories.js';

export const createExpenseSchema = Joi.object({
  amount: Joi.number().positive().max(9999999).precision(2).required()
    .messages({
      'number.base':      'Amount must be a number',
      'number.positive':  'Amount must be greater than ₹0',
      'number.max':       'Amount cannot exceed ₹99,99,999',
      'number.precision': 'Amount may have at most 2 decimal places',
    }),
  category: Joi.string().valid(...CATEGORIES).required()
    .messages({ 'any.only': 'Please select a valid category' }),
  description: Joi.string().min(3).max(200).required()
    .messages({
      'string.min': 'Description must be at least 3 characters',
      'string.max': 'Description cannot exceed 200 characters',
    }),
  date: Joi.string().isoDate().required()
    .custom((value, helpers) => {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (new Date(value) > today) return helpers.error('date.future');
      return value;
    })
    .messages({
      'string.isoDate': 'Date must be a valid date',
      'date.future':    'Date cannot be in the future',
    }),
  idempotencyKey: Joi.string().uuid({ version: 'uuidv4' }).required()
    .messages({ 'string.guid': 'Invalid request signature — refresh and try again' }),
});

// Update schema — same fields minus idempotencyKey
export const updateExpenseSchema = Joi.object({
  amount: Joi.number().positive().max(9999999).precision(2).required()
    .messages({
      'number.base':      'Amount must be a number',
      'number.positive':  'Amount must be greater than ₹0',
      'number.max':       'Amount cannot exceed ₹99,99,999',
      'number.precision': 'Amount may have at most 2 decimal places',
    }),
  category: Joi.string().valid(...CATEGORIES).required()
    .messages({ 'any.only': 'Please select a valid category' }),
  description: Joi.string().min(3).max(200).required()
    .messages({
      'string.min': 'Description must be at least 3 characters',
      'string.max': 'Description cannot exceed 200 characters',
    }),
  date: Joi.string().isoDate().required()
    .custom((value, helpers) => {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (new Date(value) > today) return helpers.error('date.future');
      return value;
    })
    .messages({
      'string.isoDate': 'Date must be a valid date',
      'date.future':    'Date cannot be in the future',
    }),
});
