import { useCallback, useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { AppShell } from '../shell/AppShell';
import { PageHeader } from '../shell/PageHeader';
import { FilterRow } from './FilterRow';
import { KpiRow } from './KpiRow';
import { LatencyChart } from './LatencyChart';
import { ServicesTable } from './ServicesTable';
import { ServicePanel } from './ServicePanel';
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
import type { NavId } from '../../navigation';
import './ReleaseMonitoring.css';

type InteractionMode = 'idle' | 'menu' | 'popover';

interface ReleaseMonitoringProps {
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

export function ReleaseMonitoring({
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
}: ReleaseMonitoringProps) {
  const [mode, setMode] = useState<InteractionMode>('idle');
  const [anchor, setAnchor] = useState<MenuAnchor>({ x: 0, y: 0 });
  const [toast, setToast] = useState<string | null>(null);
  const [pendingCapture, setPendingCapture] = useState<{
    text: string;
    source: string;
  } | null>(null);

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
        text: pendingCapture?.text ?? NOTEBOOK_TARGET.defaultObservation,
        source: pendingCapture?.source ?? 'Dashboard',
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

  return (
    <AppShell activeNav="dashboards" onNavigate={onNavigate}>
      <div className={`release-layout ${flyoutOpen ? 'has-flyout' : ''}`}>
        <div className="release-layout__main">
          <PageHeader
            breadcrumb={['Dashboards', 'Engineering', 'Release Monitoring']}
            title="Release Monitoring"
            subtitle="Real-time health and performance after deployments"
            titleIcon={LayoutDashboard}
            observationBadge={{
              count: observations.length,
              active: flyoutOpen,
              pulse: badgePulse,
              onClick: onToggleFlyout,
            }}
          />

          <div className="release-page">
            <div className="release-page__toolbar">
              <FilterRow />
            </div>

            <KpiRow />

            <div className="release-page__body">
              <div className="release-page__primary">
                <LatencyChart
                  onPaymentPointClick={openMenu}
                  onQuickCapture={() =>
                    handleQuickCapture(
                      'Latency (p95) — by service chart',
                      'Dashboard',
                    )
                  }
                />
                <ServicesTable
                  onPaymentRowClick={openMenu}
                  onQuickCapture={() =>
                    handleQuickCapture('Services table', 'Dashboard')
                  }
                  onRowQuickCapture={(row) =>
                    handleQuickCapture(
                      `${row.name} — p95 ${row.p95Ms} ms, error rate ${row.errorRate}`,
                      'Dashboard',
                    )
                  }
                />
              </div>
              <ServicePanel />
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
