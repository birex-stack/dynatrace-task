import { Plus } from 'lucide-react';
import { FILTERS } from '../../data/mockData';
import './FilterRow.css';

export function FilterRow() {
  return (
    <div className="filter-row" role="toolbar" aria-label="Dashboard filters">
      {FILTERS.map((filter) => (
        <button key={filter.id} type="button" className="filter-chip">
          {filter.label}
        </button>
      ))}
      <button type="button" className="filter-chip filter-chip--add">
        <Plus size={12} strokeWidth={2} />
        Add filter
      </button>
    </div>
  );
}
