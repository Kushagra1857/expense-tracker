import { formatINR } from '../utils/formatCurrency';

export default function SummaryPanel({ expenses, total }) {
  // Build per-category breakdown
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount);
    return acc;
  }, {});

  const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const maxVal = sorted.length > 0 ? sorted[0][1] : 0;

  return (
    <section className="card summary-panel">
      <div className="summary-panel__header">
        <h2 className="card__title">
          <span className="card__title-icon">📊</span>
          Summary
        </h2>
        <div className="summary-panel__total">
          <span className="summary-panel__total-label">Total</span>
          <span className="summary-panel__total-amount">{formatINR(total)}</span>
        </div>
      </div>

      {sorted.length > 0 && (
        <div className="summary-panel__breakdown">
          {sorted.map(([category, amount]) => (
            <div className="breakdown-row" key={category}>
              <div className="breakdown-row__header">
                <span className="breakdown-row__category">{category}</span>
                <span className="breakdown-row__amount">{formatINR(amount.toFixed(2))}</span>
              </div>
              <div className="breakdown-row__bar-track">
                <div
                  className="breakdown-row__bar-fill"
                  style={{ width: `${maxVal > 0 ? (amount / maxVal) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {sorted.length === 0 && (
        <p className="summary-panel__empty">No expenses to summarize.</p>
      )}
    </section>
  );
}
