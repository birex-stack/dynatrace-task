import { useEffect, useRef } from 'react';
import {
  Search,
  MessageSquare,
  Box,
  FileText,
  GitBranch,
} from 'lucide-react';
import { NotebookIcon } from '../icons/NotebookIcon';
import './ContextMenu.css';

export interface MenuAnchor {
  x: number;
  y: number;
}

interface ContextMenuProps {
  anchor: MenuAnchor;
  onClose: () => void;
  onAddObservation: () => void;
}

const ITEMS = [
  {
    id: 'add-observation',
    label: 'Add observation',
    description: 'Capture this signal with context',
    icon: NotebookIcon,
    emphasize: true,
  },
  {
    id: 'investigate',
    label: 'Investigate',
    description: 'Open with this timeframe',
    icon: Search,
  },
  {
    id: 'ask',
    label: 'Ask Dynatrace',
    description: 'Explain this anomaly',
    icon: MessageSquare,
  },
  {
    id: 'view-service',
    label: 'View service',
    icon: Box,
  },
  {
    id: 'view-logs',
    label: 'View related logs',
    icon: FileText,
  },
  {
    id: 'view-traces',
    label: 'View traces',
    icon: GitBranch,
  },
] as const;

export function ContextMenu({ anchor, onClose, onAddObservation }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onPointer);
    };
  }, [onClose]);

  const left = Math.min(anchor.x, window.innerWidth - 300);
  const top = Math.min(anchor.y, window.innerHeight - 360);

  return (
    <div
      ref={ref}
      className="context-menu"
      style={{ left, top }}
      role="menu"
      aria-label="Signal actions"
    >
      {ITEMS.map((item, index) => {
        const Icon = item.icon;
        const emphasize = 'emphasize' in item && item.emphasize;
        return (
          <div key={item.id}>
            {index === 3 && <div className="context-menu__divider" />}
            <button
              type="button"
              role="menuitem"
              className={`context-menu__item ${emphasize ? 'is-emphasize' : ''}`}
              onClick={() => {
                if (item.id === 'add-observation') {
                  onAddObservation();
                } else {
                  onClose();
                }
              }}
            >
              <span className="context-menu__icon">
                <Icon size={15} strokeWidth={1.7} />
              </span>
              <span className="context-menu__text">
                <span className="context-menu__label">{item.label}</span>
                {'description' in item && item.description && (
                  <span className="context-menu__desc">{item.description}</span>
                )}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
