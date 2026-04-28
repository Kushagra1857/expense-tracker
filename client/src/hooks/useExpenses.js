import { useState, useEffect, useCallback } from 'react';
import { fetchExpenses, postExpense, putExpense, removeExpense } from '../api/expensesApi';

export const useExpenses = () => {
  const [expenses,        setExpenses]       = useState([]);
  const [total,           setTotal]          = useState('0.00');
  const [count,           setCount]          = useState(0);
  const [loading,         setLoading]        = useState(false);
  const [error,           setError]          = useState(null);
  const [filters,         setFilters]        = useState({ category: '', sort: 'date_desc' });
  const [editingExpense,  setEditingExpense] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { sort: filters.sort };
      if (filters.category) params.category = filters.category;
      const res = await fetchExpenses(params);
      setExpenses(res.data.data);
      setTotal(res.data.total);
      setCount(res.data.count);
    } catch {
      setError('Could not load expenses. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const addExpense = async (formData, idempotencyKey) => {
    const res = await postExpense({ ...formData, idempotencyKey });
    await load();
    return res;
  };

  const updateExistingExpense = async (id, formData) => {
    const res = await putExpense(id, formData);
    setEditingExpense(null);
    await load();
    return res;
  };

  const deleteExistingExpense = async (id) => {
    const res = await removeExpense(id);
    await load();
    return res;
  };

  return {
    expenses, total, count, loading, error,
    filters, setFilters,
    addExpense, updateExistingExpense, deleteExistingExpense,
    editingExpense, setEditingExpense,
  };
};
