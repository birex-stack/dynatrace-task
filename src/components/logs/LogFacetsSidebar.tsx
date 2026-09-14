import { useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import {
  LOG_FACETS,
  LOG_STATUS_COLORS,
  type LogStatus,
} from '../../data/logsData';
import './LogFacetsSidebar.css';

interface LogFacetsSidebarProps {
  enabledStatuses: Set<LogStatus>;
  onToggleStatus: (status: LogStatus) => void;
}

export function LogFacetsSidebar({
  enabledStatuses,
  onToggleStatus,
}: LogFacetsSidebarProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(LOG_FACETS.map((g) => [g.id, Boolean(g.open)])),
  );

  return (
    <aside className="log-facets" aria-label="Log facets">
      <div className="log-facets__head">
        <h2 className="log-facets__title">Facets</h2>
      </div>
      <div className="log-facets__body">
        {LOG_FACETS.map((group) => {
          const isOpen = openGroups[group.id];
          return (
            <div
              key={group.id}
              className={`log-facets__group ${isOpen ? 'is-open' : ''}`}
            >
              <button
                type="button"
                className="log-facets__group-head"
                onClick={() =>
                  setOpenGroups((prev) => ({
                    ...prev,
                    [group.id]: !prev[group.id],
                  }))
                }
                aria-expanded={isOpen}
              >
                <ChevronRight size={14} className="log-facets__chevron" />
                {group.label}
              </button>
              {isOpen && group.items && (
                <div className="log-facets__items">
                  {group.items.map((item) => {
                    const status = item.label as LogStatus;
                    const checked = enabledStatuses.has(status);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`log-facets__item ${checked ? 'is-checked' : ''}`}
                        onClick={() => onToggleStatus(status)}
                        aria-pressed={checked}
                      >
                        <span className="log-facets__check" aria-hidden>
                          {checked && <Check size={10} strokeWidth={3} />}
                        </span>
                        <span
                          className="log-facets__dot"
                          style={{ background: LOG_STATUS_COLORS[status] }}
                          aria-hidden
                        />
                        <span className="log-facets__label">{item.label}</span>
                        <span className="log-facets__count">{item.count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
