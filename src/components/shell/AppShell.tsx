import type { ReactNode } from 'react';
import { LeftNav } from './LeftNav';
import type { NavId } from '../../navigation';
import './AppShell.css';

interface AppShellProps {
  children: ReactNode;
  activeNav?: NavId;
  onNavigate?: (id: NavId) => void;
}

export function AppShell({
  children,
  activeNav = 'dashboards',
  onNavigate,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <LeftNav activeId={activeNav} onNavigate={onNavigate} />
      <div className="app-shell__main">{children}</div>
    </div>
  );
}
