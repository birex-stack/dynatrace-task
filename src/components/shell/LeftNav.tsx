import {
  Activity,
  LayoutDashboard,
  Search,
  Sparkles,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { AppLogo } from '../icons/AppLogo';
import { NotebookIcon } from '../icons/NotebookIcon';
import { NAV_ITEMS } from '../../data/mockData';
import type { NavId } from '../../navigation';
import './LeftNav.css';

type NavIcon = LucideIcon | typeof NotebookIcon;

const ICONS: Record<NavId, NavIcon> = {
  logs: Search,
  observe: Activity,
  dashboards: LayoutDashboard,
  notebooks: NotebookIcon,
  automations: Sparkles,
  settings: Settings,
};

interface LeftNavProps {
  activeId?: NavId;
  onNavigate?: (id: NavId) => void;
}

export function LeftNav({ activeId = 'dashboards', onNavigate }: LeftNavProps) {
  return (
    <nav className="left-nav" aria-label="Primary">
      <div className="left-nav__brand" title="Observability">
        <AppLogo className="left-nav__logo" width={40} height={36} />
      </div>
      <ul className="left-nav__list">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.id];
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <button
                type="button"
                className={`left-nav__item ${active ? 'is-active' : ''}`}
                title={item.label}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                onClick={() => onNavigate?.(item.id)}
              >
                <Icon size={18} strokeWidth={1.6} />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
