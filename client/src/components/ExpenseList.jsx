import { formatINR } from '../utils/formatCurrency';
import { formatDateDDMMYYYY } from '../utils/dateUtils';
import CategoryBadge from './CategoryBadge';
import SkeletonLoader from './SkeletonLoader';

export default function ExpenseList({ expenses, total, count, loading, error, onEdit, onDelete }) {
  if (loading) return <SkeletonLoader />;

  if (error) {
    return (
      <section className="card">
        <div className="error-state">
          <span className="error-state__icon">⚠️</span>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  if (expenses.length === 0) {
    return (
      <section className="card">
        <div className="empty-state">
          <span className="empty-state__icon">📋</span>
          <h3>No expenses yet</h3>
          <p>Add your first expense using the form above.</p>
        </div>
      </section>
    );
  }

  const handleDelete = (exp) => {
    if (window.confirm(`Delete "${exp.description}" (${formatINR(exp.amount)})?`)) {
      onDelete(exp.id);
    }
  };

  return (
    <section className="card expense-list">
      <div className="expense-list__header">
        <h2 className="card__title">
          <span className="card__title-icon">📋</span>
          Expenses
        </h2>
        <span className="expense-list__count">{count} record{count !== 1 ? 's' : ''}</span>
      </div>

      <div className="expense-list__items">
        {expenses.map((exp) => (
          <article className="expense-item" key={exp.id}>
            <div className="expense-item__main">
              <div className="expense-item__top">
                <CategoryBadge category={exp.category} />
                <span className="expense-item__date">{formatDateDDMMYYYY(exp.date)}</span>
              </div>
              <p className="expense-item__description">{exp.description}</p>
            </div>
            <div className="expense-item__right">
              <div className="expense-item__amount">{formatINR(exp.amount)}</div>
              <div className="expense-item__actions">
                <button
                  className="action-btn action-btn--edit"
                  onClick={() => onEdit(exp)}
                  title="Edit expense"
                  aria-label={`Edit ${exp.description}`}
                >
                  ✏️
                </button>
                <button
                  className="action-btn action-btn--delete"
                  onClick={() => handleDelete(exp)}
                  title="Delete expense"
                  aria-label={`Delete ${exp.description}`}
                >
                  🗑️
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="expense-list__footer">
        <span>Total ({count} items)</span>
        <span className="expense-list__footer-total">{formatINR(total)}</span>
      </div>
    </section>
  );
}
