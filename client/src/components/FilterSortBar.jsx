import { CATEGORIES } from '../constants/categories';

export default function FilterSortBar({ filters, onChange }) {
  const handleCategory = (e) => {
    onChange({ ...filters, category: e.target.value });
  };

  const handleSort = (e) => {
    onChange({ ...filters, sort: e.target.value });
  };

  return (
    <section className="card filter-bar">
      <div className="filter-bar__controls">
        <div className="field field--inline">
          <label htmlFor="filter-category">Filter by Category</label>
          <select
            id="filter-category"
            value={filters.category}
            onChange={handleCategory}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="field field--inline">
          <label htmlFor="sort-order">Sort by Date</label>
          <select
            id="sort-order"
            value={filters.sort}
            onChange={handleSort}
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
          </select>
        </div>
      </div>
    </section>
  );
}
