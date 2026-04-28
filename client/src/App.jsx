import { useState, useCallback } from 'react';
import { useServerStatus } from './hooks/useServerStatus';
import { useExpenses }     from './hooks/useExpenses';
import ServerWakeUp        from './components/ServerWakeUp';
import ExpenseForm         from './components/ExpenseForm';
import FilterSortBar       from './components/FilterSortBar';
import ExpenseList         from './components/ExpenseList';
import SummaryPanel        from './components/SummaryPanel';
import Toast               from './components/Toast';

export default function App() {
  const serverStatus = useServerStatus();
  const {
    expenses, total, count, loading, error,
    filters, setFilters,
    addExpense, updateExistingExpense, deleteExistingExpense,
    editingExpense, setEditingExpense,
  } = useExpenses();

  // Global toast state — triggers on add, edit, delete
  const [toast, setToast] = useState(null);

  const handleToast = useCallback((t) => setToast(t), []);

  const handleDelete = async (id) => {
    try {
      await deleteExistingExpense(id);
      setToast({ type: 'success', message: 'Expense deleted successfully.' });
    } catch {
      setToast({ type: 'error', message: 'Could not delete expense. Please try again.' });
    }
  };

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-content">
          <h1 className="app__title">
            <span className="app__logo">₹</span>
            Expense Tracker
          </h1>
          <p className="app__subtitle">Track your personal expenses with precision</p>
        </div>
      </header>

      <main className="app__main">
        <ServerWakeUp status={serverStatus} />

        <div className="app__grid">
          <div className="app__left">
            <ExpenseForm
              onAdd={addExpense}
              onUpdate={updateExistingExpense}
              editingExpense={editingExpense}
              onCancelEdit={() => setEditingExpense(null)}
              onToast={handleToast}
            />
            <SummaryPanel expenses={expenses} total={total} />
          </div>
          <div className="app__right">
            <FilterSortBar filters={filters} onChange={setFilters} />
            <ExpenseList
              expenses={expenses} total={total} count={count}
              loading={loading} error={error}
              onEdit={setEditingExpense}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </main>

      <footer className="app__footer">
        <p>Built with React + Express + SQLite · Money stored as integer paise · Zero float risk</p>
      </footer>

      {/* Global toast — top-center, high-contrast */}
      <div className="toast-container">
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    </div>
  );
}
