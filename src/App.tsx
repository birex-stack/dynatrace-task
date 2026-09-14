import { useCallback, useEffect, useState } from 'react';
import { ReleaseMonitoring } from './components/dashboard/ReleaseMonitoring';
import { NotebookScreen } from './components/notebook/NotebookScreen';
import { LogsScreen } from './components/logs/LogsScreen';
import type { NotebookMode } from './components/notebook/NotebookHeader';
import type {
  AddObservationOptions,
  FlyoutObservation,
} from './components/interactions/NotebookFlyout';
import { INITIAL_OBSERVATIONS } from './data/observationsData';
import {
  navIdForScreen,
  screenForNavId,
  type NavId,
  type ScreenId,
} from './navigation';

export type { AddObservationOptions } from './components/interactions/NotebookFlyout';

export default function App() {
  const [screen, setScreen] = useState<ScreenId>('release-monitoring');
  const [notebookMode, setNotebookMode] = useState<NotebookMode>('document');
  const [observations, setObservations] =
    useState<FlyoutObservation[]>(INITIAL_OBSERVATIONS);
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const [badgePulse, setBadgePulse] = useState(false);
  const [notebookActive, setNotebookActive] = useState(true);

  useEffect(() => {
    if (!badgePulse) return;
    const timer = window.setTimeout(() => setBadgePulse(false), 900);
    return () => window.clearTimeout(timer);
  }, [badgePulse]);

  const handleNavigate = useCallback((id: NavId) => {
    const next = screenForNavId(id);
    if (!next) return;
    if (next === 'notebook') {
      setNotebookMode('document');
      setFlyoutOpen(false);
    }
    setScreen(next);
  }, []);

  const openNotebookDocument = useCallback(() => {
    setNotebookMode('document');
    setFlyoutOpen(false);
    setScreen('notebook');
  }, []);

  const addObservation = useCallback(
    (
      observation: FlyoutObservation,
      options: AddObservationOptions = {},
    ) => {
      const { openFlyout = true, pulseBadge = false } = options;
      setObservations((prev) => [
        observation,
        ...prev.map((item) => ({ ...item, isNew: false })),
      ]);
      if (openFlyout) setFlyoutOpen(true);
      if (pulseBadge) setBadgePulse(true);
    },
    [],
  );

  const deleteObservations = useCallback((ids: string[]) => {
    setObservations((prev) => prev.filter((o) => !ids.includes(o.id)));
  }, []);

  if (screen === 'notebook') {
    return (
      <NotebookScreen
        initialMode={notebookMode}
        onNavigate={handleNavigate}
        activeNav={navIdForScreen(screen)}
      />
    );
  }

  if (screen === 'logs') {
    return (
      <LogsScreen
        onNavigate={handleNavigate}
        onOpenNotebookDocument={openNotebookDocument}
        observations={observations}
        flyoutOpen={flyoutOpen}
        badgePulse={badgePulse}
        notebookActive={notebookActive}
        onNotebookActiveChange={setNotebookActive}
        onToggleFlyout={() => setFlyoutOpen((open) => !open)}
        onCloseFlyout={() => setFlyoutOpen(false)}
        onAddObservation={addObservation}
        onDeleteObservations={deleteObservations}
      />
    );
  }

  return (
    <ReleaseMonitoring
      onNavigate={handleNavigate}
      onOpenNotebookDocument={openNotebookDocument}
      observations={observations}
      flyoutOpen={flyoutOpen}
      badgePulse={badgePulse}
      notebookActive={notebookActive}
      onNotebookActiveChange={setNotebookActive}
      onToggleFlyout={() => setFlyoutOpen((open) => !open)}
      onCloseFlyout={() => setFlyoutOpen(false)}
      onAddObservation={addObservation}
      onDeleteObservations={deleteObservations}
    />
  );
}
