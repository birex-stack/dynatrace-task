import { useCallback, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { AppShell } from '../shell/AppShell';
import { PageHeader } from '../shell/PageHeader';
import {
  ContextMenu,
  type MenuAnchor,
} from '../interactions/ContextMenu';
import { AddObservationPopover } from '../interactions/AddObservationPopover';
import {
  NotebookFlyout,
  type AddObservationOptions,
  type FlyoutObservation,
} from '../interactions/NotebookFlyout';
import { Toast } from '../interactions/Toast';
import { NOTEBOOK_TARGET } from '../../data/mockData';
import type { LogStatus } from '../../data/logsData';
import type { NavId } from '../../navigation';
import { LogFacetsSidebar } from './LogFacetsSidebar';
import { LogVolumeChart } from './LogVolumeChart';
import { LogPatternsTable } from './LogPatternsTable';
import '../dashboard/FilterRow.css';
import './LogsScreen.css';

type InteractionMode = 'idle' | 'menu' | 'popover';

const LOG_FILTERS = [
  { id: 'time', label: 'Last 30 minutes' },
  { id: 'service', label: 'Service: payment-service' },
  { id: 'env', label: 'Environment: Production' },
];

const ALL_STATUSES: LogStatus[] = ['NONE', 'INFO', 'WARN', 'ERROR'];

interface LogsScreenProps {
  onNavigate?: (id: NavId) => void;
  onOpenNotebookDocument?: () => void;
  observations: FlyoutObservation[];
  flyoutOpen: boolean;
  badgePulse?: boolean;
  notebookActive: boolean;
  onNotebookActiveChange: (active: boolean) => void;
  onToggleFlyout: () => void;
  onCloseFlyout: () => void;
  onAddObservation: (
    observation: FlyoutObservation,
    options?: AddObservationOptions,
  ) => void;
  onDeleteObservations: (ids: string[]) => void;
}

export function LogsScreen({
  onNavigate,
  onOpenNotebookDocument,
  observations,
  flyoutOpen,
  badgePulse = false,
  notebookActive,
  onNotebookActiveChange,
  onToggleFlyout,
  onCloseFlyout,
  onAddObservation,
  onDeleteObservations,
}: LogsScreenProps) {
  const [mode, setMode] = useState<InteractionMode>('idle');
  const [anchor, setAnchor] = useState<MenuAnchor>({ x: 0, y: 0 });
  const [toast, setToast] = useState<string | null>(null);
  const [pendingCapture, setPendingCapture] = useState<{
    text: string;
    source: string;
  } | null>(null);
  const [enabledStatuses, setEnabledStatuses] = useState(
    () => new Set<LogStatus>(ALL_STATUSES),
  );

  const openMenu = useCallback((next: MenuAnchor) => {
    setAnchor(next);
    setMode('menu');
  }, []);

  const closeAll = useCallback(() => {
    setMode('idle');
    setPendingCapture(null);
  }, []);

  const handleAddObservationClick = useCallback(() => {
    setPendingCapture(null);
    setMode('popover');
  }, []);

  const handleConfirmObservation = useCallback(
    ({ note, notebookName }: { note: string; notebookName: string }) => {
      onAddObservation({
        id: `obs-${Date.now()}`,
        text: pendingCapture?.text ?? 'Log volume spike around ERROR patterns',
        source: pendingCapture?.source ?? 'Logs',
        time: 'Just now',
        addedBy: 'Maciej K.',
        isNew: true,
        note: note.trim() || undefined,
      });
      setPendingCapture(null);
      setMode('idle');
      setToast(`Observation added to ${notebookName}`);
    },
    [onAddObservation, pendingCapture],
  );

  const handleQuickCapture = useCallback(
    (text: string, source: string) => {
      if (!notebookActive) {
        setPendingCapture({ text, source });
        setMode('popover');
        return;
      }
      onAddObservation(
        {
          id: `obs-${Date.now()}`,
          text,
          source,
          time: 'Just now',
          addedBy: 'Maciej K.',
          isNew: true,
        },
        { openFlyout: false, pulseBadge: true },
      );
      setToast(`Observation added to ${NOTEBOOK_TARGET.name}`);
    },
    [notebookActive, onAddObservation],
  );

  const handleToggleStatus = useCallback((status: LogStatus) => {
    setEnabledStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        if (next.size === 1) return prev;
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  }, []);

  return (
    <AppShell activeNav="logs" onNavigate={onNavigate}>
      <div className={`logs-layout ${flyoutOpen ? 'has-flyout' : ''}`}>
        <div className="logs-layout__main">
          <PageHeader
            breadcrumb={['Logs', 'payment-service']}
            title="Logs"
            subtitle="Log volume and patterns for payment-service"
            titleIcon={Search}
            observationBadge={{
              count: observations.length,
              active: flyoutOpen,
              pulse: badgePulse,
              onClick: onToggleFlyout,
            }}
          />

          <div className="logs-page">
            <div className="logs-page__toolbar">
              <div className="filter-row" role="toolbar" aria-label="Log filters">
                {LOG_FILTERS.map((filter) => (
                  <button key={filter.id} type="button" className="filter-chip">
                    {filter.label}
                  </button>
                ))}
                <button type="button" className="filter-chip filter-chip--add">
                  <Plus size={12} strokeWidth={2} />
                  Add filter
                </button>
              </div>
            </div>

            <div className="logs-page__body">
              <LogFacetsSidebar
                enabledStatuses={enabledStatuses}
                onToggleStatus={handleToggleStatus}
              />
              <div className="logs-page__primary">
                <LogVolumeChart
                  enabledStatuses={enabledStatuses}
                  onPointClick={openMenu}
                  onQuickCapture={() =>
                    handleQuickCapture('Log volume chart', 'Logs')
                  }
                />
                <LogPatternsTable
                  enabledStatuses={enabledStatuses}
                  onErrorRowClick={openMenu}
                  onQuickCapture={() =>
                    handleQuickCapture('Log patterns table', 'Logs')
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {flyoutOpen && (
          <NotebookFlyout
            observations={observations}
            notebookActive={notebookActive}
            onNotebookActiveChange={onNotebookActiveChange}
            onClose={onCloseFlyout}
            onOpenNotebook={() => onOpenNotebookDocument?.()}
            onDeleteObservations={onDeleteObservations}
          />
        )}
      </div>

      {mode === 'menu' && (
        <ContextMenu
          anchor={anchor}
          onClose={closeAll}
          onAddObservation={handleAddObservationClick}
        />
      )}

      {mode === 'popover' && (
        <AddObservationPopover
          onCancel={closeAll}
          onConfirm={handleConfirmObservation}
        />
      )}

      {toast && (
        <Toast message={toast} onDismiss={() => setToast(null)} />
      )}
    </AppShell>
  );
}
