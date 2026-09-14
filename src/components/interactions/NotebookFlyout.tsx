import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { ChevronDown, Info, MoreVertical, X } from 'lucide-react';
import { NotebookIcon } from '../icons/NotebookIcon';
import { NOTEBOOK_TARGET } from '../../data/mockData';
import './NotebookFlyout.css';

export interface FlyoutObservation {
  id: string;
  text: string;
  source: string;
  time: string;
  addedBy: string;
  isNew?: boolean;
  note?: string;
}

export type AddObservationOptions = {
  openFlyout?: boolean;
  pulseBadge?: boolean;
};

interface NotebookFlyoutProps {
  observations: FlyoutObservation[];
  notebookActive: boolean;
  onNotebookActiveChange: (active: boolean) => void;
  onClose: () => void;
  onOpenNotebook: () => void;
  onDeleteObservations?: (ids: string[]) => void;
}

const BULK_ACTIONS = [
  { id: 'dashboard', label: 'Add to dashboard' },
  { id: 'notebook', label: 'Add to notebook' },
  { id: 'delete', label: 'Delete', danger: true },
] as const;

const ACTIVE_TOOLTIP =
  'When on, one-click capture adds observations directly to this notebook. When off, capture opens the full Add observation form.';

const TOOLTIP_GAP = 8;
const TOOLTIP_VIEWPORT_MARGIN = 8;

function getViewportTooltipStyle(
  trigger: DOMRect,
  tipWidth: number,
  tipHeight: number,
): CSSProperties {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = TOOLTIP_VIEWPORT_MARGIN;
  const gap = TOOLTIP_GAP;

  const spaceAbove = trigger.top - margin;
  const spaceBelow = vh - trigger.bottom - margin;
  const fitsAbove = tipHeight + gap <= spaceAbove;
  const fitsBelow = tipHeight + gap <= spaceBelow;

  let placeAbove: boolean;
  if (fitsAbove) {
    placeAbove = true;
  } else if (fitsBelow) {
    placeAbove = false;
  } else {
    placeAbove = spaceAbove >= spaceBelow;
  }

  let top = placeAbove
    ? trigger.top - tipHeight - gap
    : trigger.bottom + gap;
  top = Math.max(margin, Math.min(top, vh - tipHeight - margin));

  let left = trigger.left + trigger.width / 2 - tipWidth / 2;
  left = Math.max(margin, Math.min(left, vw - tipWidth - margin));

  return {
    position: 'fixed',
    top,
    left,
    bottom: 'auto',
    right: 'auto',
    transform: 'none',
  };
}

export function NotebookFlyout({
  observations,
  notebookActive,
  onNotebookActiveChange,
  onClose,
  onOpenNotebook,
  onDeleteObservations,
}: NotebookFlyoutProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<CSSProperties>();
  const bulkRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  const observationIds = useMemo(
    () => observations.map((o) => o.id),
    [observations],
  );

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => observationIds.includes(id)));
  }, [observationIds]);

  useEffect(() => {
    if (!bulkOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setBulkOpen(false);
    };
    const onPointer = (e: MouseEvent) => {
      if (bulkRef.current && !bulkRef.current.contains(e.target as Node)) {
        setBulkOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onPointer);
    };
  }, [bulkOpen]);

  const updateTooltipPosition = useCallback(() => {
    const trigger = infoRef.current;
    const tip = tooltipRef.current;
    if (!trigger || !tip) return;
    const triggerRect = trigger.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();
    setTooltipStyle(
      getViewportTooltipStyle(triggerRect, tipRect.width, tipRect.height),
    );
  }, []);

  useLayoutEffect(() => {
    if (!tooltipOpen) return;
    updateTooltipPosition();
    const onReposition = () => updateTooltipPosition();
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [tooltipOpen, updateTooltipPosition]);

  const allSelected =
    observations.length > 0 && selectedIds.length === observations.length;
  const someSelected =
    selectedIds.length > 0 && selectedIds.length < observations.length;

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : observationIds);
    setBulkOpen(false);
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    setBulkOpen(false);
  };

  const runBulkAction = (actionId: (typeof BULK_ACTIONS)[number]['id']) => {
    if (actionId === 'delete') {
      onDeleteObservations?.(selectedIds);
      setSelectedIds([]);
    }
    setBulkOpen(false);
  };

  return (
    <aside className="notebook-flyout" aria-label="Notebook flyout">
      <div className="notebook-flyout__header">
        <div className="notebook-flyout__title-row">
          <button
            type="button"
            className="notebook-flyout__title"
            onClick={onOpenNotebook}
            title="Open notebook Workspace view"
          >
            <NotebookIcon size={16} strokeWidth={1.8} />
            <span>{NOTEBOOK_TARGET.name}</span>
          </button>
          <button
            type="button"
            className="notebook-flyout__icon-btn"
            aria-label="Notebook menu"
          >
            <MoreVertical size={16} strokeWidth={1.7} />
          </button>
          <button
            type="button"
            className="notebook-flyout__icon-btn"
            aria-label="Close flyout"
            onClick={onClose}
          >
            <X size={16} strokeWidth={1.7} />
          </button>
        </div>
        <p className="notebook-flyout__subtitle">
          {observations.length}{' '}
          {observations.length === 1 ? 'Observation' : 'Observations'} in this
          notebook
        </p>
        <div className="notebook-flyout__active">
          <button
            type="button"
            className="notebook-flyout__active-toggle"
            onClick={() => onNotebookActiveChange(!notebookActive)}
          >
            <span
              className={`notebook-flyout__switch ${notebookActive ? 'is-on' : ''}`}
              role="switch"
              aria-checked={notebookActive}
            >
              <span className="notebook-flyout__switch-thumb" />
            </span>
            <span className="notebook-flyout__active-label">Set as active</span>
          </button>
          <span
            className="notebook-flyout__info"
            ref={infoRef}
            tabIndex={0}
            aria-describedby={tooltipOpen ? 'notebook-active-tooltip' : undefined}
            onMouseEnter={() => setTooltipOpen(true)}
            onMouseLeave={() => setTooltipOpen(false)}
            onFocus={() => setTooltipOpen(true)}
            onBlur={() => setTooltipOpen(false)}
          >
            <Info size={13} strokeWidth={1.8} aria-hidden />
            <span
              id="notebook-active-tooltip"
              className={`notebook-flyout__tooltip${tooltipOpen ? ' is-visible' : ''}`}
              ref={tooltipRef}
              role="tooltip"
              style={tooltipStyle}
            >
              {ACTIVE_TOOLTIP}
            </span>
          </span>
        </div>
      </div>

      <div className="notebook-flyout__body">
        {observations.length === 0 ? (
          <p className="notebook-flyout__empty">No observations yet.</p>
        ) : (
          <>
            <label className="notebook-flyout__select-all">
              <input
                type="checkbox"
                className="notebook-flyout__checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={toggleAll}
              />
              <span>Select all</span>
            </label>

            {observations.map((item) => (
              <FlyoutObservationCard
                key={item.id}
                item={item}
                selected={selectedIds.includes(item.id)}
                onToggleSelected={() => toggleOne(item.id)}
                menuOpen={openMenuId === item.id}
                onToggleMenu={() =>
                  setOpenMenuId((id) => (id === item.id ? null : item.id))
                }
                onCloseMenu={() => setOpenMenuId(null)}
              />
            ))}

            {selectedIds.length > 0 && (
              <div className="notebook-flyout__bulk" ref={bulkRef}>
                <button
                  type="button"
                  className="notebook-flyout__bulk-btn"
                  aria-expanded={bulkOpen}
                  aria-haspopup="menu"
                  onClick={() => setBulkOpen((v) => !v)}
                >
                  <span>
                    Actions for {selectedIds.length} selected
                  </span>
                  <ChevronDown
                    size={14}
                    strokeWidth={2}
                    className={bulkOpen ? 'is-open' : ''}
                    aria-hidden
                  />
                </button>
                {bulkOpen && (
                  <div className="notebook-flyout__bulk-menu" role="menu">
                    {BULK_ACTIONS.map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        role="menuitem"
                        className={`notebook-flyout__bulk-item ${
                          action.id === 'delete' ? 'is-danger' : ''
                        }`}
                        onClick={() => runBulkAction(action.id)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="notebook-flyout__footer">
        <button
          type="button"
          className="notebook-flyout__cta"
          onClick={onOpenNotebook}
        >
          View in notebook
        </button>
      </div>
    </aside>
  );
}

function FlyoutObservationCard({
  item,
  selected,
  onToggleSelected,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
}: {
  item: FlyoutObservation;
  selected: boolean;
  onToggleSelected: () => void;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseMenu();
    };
    const onPointer = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onCloseMenu();
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onPointer);
    };
  }, [menuOpen, onCloseMenu]);

  return (
    <article
      className={`notebook-flyout__card ${item.isNew ? 'is-new' : ''} ${
        selected ? 'is-selected' : ''
      }`}
    >
      <label className="notebook-flyout__card-check">
        <input
          type="checkbox"
          className="notebook-flyout__checkbox"
          checked={selected}
          onChange={onToggleSelected}
          aria-label={`Select observation: ${item.text}`}
        />
      </label>

      <div className="notebook-flyout__card-main">
        {item.isNew && (
          <div className="notebook-flyout__badge">Just added</div>
        )}
        <p className="notebook-flyout__card-text">{item.text}</p>
        {item.note && (
          <p className="notebook-flyout__card-note">{item.note}</p>
        )}
        <div className="notebook-flyout__card-meta">
          <span>{item.source}</span>
          <span>{item.time}</span>
          <span>{item.addedBy}</span>
        </div>
      </div>

      <div className="notebook-flyout__card-menu-wrap" ref={menuRef}>
        <button
          type="button"
          className="notebook-flyout__card-kebab"
          aria-label="Observation actions"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={onToggleMenu}
        >
          <MoreVertical size={16} strokeWidth={1.7} />
        </button>

        {menuOpen && (
          <div className="notebook-flyout__card-menu" role="menu">
            <button
              type="button"
              role="menuitem"
              className="notebook-flyout__card-menu-item is-emphasize"
              onClick={onCloseMenu}
            >
              View details
            </button>
            <button
              type="button"
              role="menuitem"
              className="notebook-flyout__card-menu-item"
              onClick={onCloseMenu}
            >
              Add to hypothesis
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
