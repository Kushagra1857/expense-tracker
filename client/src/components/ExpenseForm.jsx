import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CATEGORIES } from '../constants/categories';

const todayISO = () => new Date().toISOString().split('T')[0];
const EMPTY    = { amount: '', category: '', description: '', date: todayISO() };

export default function ExpenseForm({ onAdd, onUpdate, editingExpense, onCancelEdit, onToast }) {
  // UUID lives in a ref — survives re-renders, replaced only on successful save
  const idempotencyKey = useRef(uuidv4());

  const [form,         setForm]         = useState(EMPTY);
  const [errors,       setErrors]       = useState({});
  const [isSubmitting, setIsSubmitting]  = useState(false);

  // Populate form when editing an expense
  useEffect(() => {
    if (editingExpense) {
      setForm({
        amount:      editingExpense.amount,
        category:    editingExpense.category,
        description: editingExpense.description,
        date:        editingExpense.date,
      });
      setErrors({});
    }
  }, [editingExpense]);

  const clientValidate = () => {
    const e = {};
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0)   e.amount      = 'Enter a valid amount greater than ₹0';
    if (amt > 9999999)                             e.amount      = 'Amount cannot exceed ₹99,99,999';
    if (!form.category)                            e.category    = 'Please select a category';
    if (!form.description || form.description.trim().length < 3)
                                                   e.description = 'Description must be at least 3 characters';
    if (!form.date)                                e.date        = 'Date is required';
    if (form.date > todayISO())                    e.date        = 'Date cannot be in the future';
    return e;
  };

  const handleCancel = () => {
    setForm(EMPTY);
    setErrors({});
    onCancelEdit();
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const clientErrors = clientValidate();
    if (Object.keys(clientErrors).length > 0) { setErrors(clientErrors); return; }

    setErrors({});
    setIsSubmitting(true);  // disables button — prevents double-submit in flight

    try {
      if (editingExpense) {
        await onUpdate(editingExpense.id, form);
        onToast({ type: 'success', message: 'Expense updated successfully.' });
      } else {
        await onAdd(form, idempotencyKey.current);
        idempotencyKey.current = uuidv4();   // new UUID only after confirmed success
        onToast({ type: 'success', message: 'Expense saved successfully.' });
      }
      setForm(EMPTY);
    } catch (err) {
      // On failure: keep same UUID — user retrying is safe
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const mapped = {};
        apiErrors.forEach(({ field, message }) => { mapped[field] = message; });
        setErrors(mapped);
      } else {
        onToast({ type: 'error', message: 'Could not save expense. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = (name) => ({
    value:    form[name],
    disabled: isSubmitting,
    onChange: (e) => setForm(p => ({ ...p, [name]: e.target.value })),
  });

  return (
    <section className="card form-card">
      <h2 className="card__title">
        <span className="card__title-icon">{editingExpense ? '✏️' : '＋'}</span>
        {editingExpense ? 'Edit Expense' : 'Add New Expense'}
      </h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="amount">Amount (₹)</label>
            <input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g. 1500.00"
              {...field('amount')}
            />
            {errors.amount && <span className="field-error">{errors.amount}</span>}
          </div>

          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" {...field('category')}>
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <span className="field-error">{errors.category}</span>}
          </div>

          <div className="field field--full">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={2}
              placeholder="e.g. Big Basket monthly order — pulses, oil, rice"
              {...field('description')}
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </div>

          <div className="field">
            <label htmlFor="date">Date</label>
            <input id="date" type="date" max={todayISO()} {...field('date')} />
            {errors.date && <span className="field-error">{errors.date}</span>}
          </div>

          <div className="field field--submit">
            <div className="form-actions">
              <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="btn__spinner" />
                    Saving…
                  </>
                ) : editingExpense ? (
                  'Update Expense'
                ) : (
                  'Add Expense'
                )}
              </button>
              {editingExpense && (
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
