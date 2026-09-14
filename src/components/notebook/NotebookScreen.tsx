import { useCallback, useMemo, useState } from 'react';
import { AppShell } from '../shell/AppShell';
import { Toast } from '../interactions/Toast';
import { NotebookHeader, type NotebookMode } from './NotebookHeader';
import { GoalCard } from './GoalCard';
import { AiSummaryCard } from './AiSummaryCard';
import { HypothesesSection } from './HypothesesSection';
import { FindingsSection } from './FindingsSection';
import { OpenQuestions } from './OpenQuestions';
import { DecisionsSection } from './DecisionsSection';
import { TeamPanel } from './TeamPanel';
import { DocumentView } from './DocumentView';
import { RuleOutDialog } from './RuleOutDialog';
import {
  DEPLOY_HYPOTHESIS_ID,
  InvestigationDiscussion,
  WORKLOAD_HYPOTHESIS_ID,
  WORKLOAD_HYPOTHESIS_TITLE,
  WORKLOAD_OBSERVATION_TEXT,
} from './InvestigationDiscussion';
import {
  INITIAL_ACTIVITY,
  INITIAL_DECISIONS,
  INITIAL_FINDINGS,
  INITIAL_HYPOTHESES,
  INITIAL_QUESTIONS,
  type ActivityItem,
  type Decision,
  type Finding,
  type Hypothesis,
  type OpenQuestion,
} from '../../data/notebookData';
import type { NavId } from '../../navigation';
import './NotebookScreen.css';

interface NotebookScreenProps {
  onNavigate?: (id: NavId) => void;
  activeNav?: NavId;
  initialMode?: NotebookMode;
}

function nowTime() {
  return new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function NotebookScreen({
  onNavigate,
  activeNav = 'notebooks',
  initialMode = 'document',
}: NotebookScreenProps) {
  const [mode, setMode] = useState<NotebookMode>(initialMode);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>(INITIAL_HYPOTHESES);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [ruleOutId, setRuleOutId] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>(INITIAL_DECISIONS);
  const [activity, setActivity] = useState<ActivityItem[]>(INITIAL_ACTIVITY);
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);
  const [findings, setFindings] = useState<Finding[]>(INITIAL_FINDINGS);
  const [toast, setToast] = useState<string | null>(null);
  const [discussionCollapsed, setDiscussionCollapsed] = useState(false);
  const [chatFocusKey, setChatFocusKey] = useState(0);

  const handleViewInChat = useCallback(() => {
    setDiscussionCollapsed(false);
    setChatFocusKey((k) => k + 1);
  }, []);

  const rulingOut = useMemo(
    () => hypotheses.find((h) => h.id === ruleOutId) ?? null,
    [hypotheses, ruleOutId],
  );

  const handleModeChange = useCallback((next: NotebookMode) => {
    setMode(next);
    if (next === 'investigation') {
      setExpandedId(null);
    }
  }, []);

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleConfirm = useCallback(
    (id: string) => {
      setHypotheses((prev) =>
        prev.map((h) => (h.id === id ? { ...h, status: 'supported' } : h)),
      );
      const hyp = hypotheses.find((h) => h.id === id);
      if (hyp) {
        setActivity((prev) => [
          {
            id: `act-${Date.now()}`,
            actor: 'Maciej K.',
            action: 'confirmed a hypothesis',
            detail: hyp.title,
            time: nowTime(),
          },
          ...prev,
        ]);
      }
      setToast('Shared investigation state updated');
    },
    [hypotheses],
  );

  const handleKeepOpen = useCallback((id: string) => {
    setHypotheses((prev) =>
      prev.map((h) => (h.id === id ? { ...h, status: 'conflicting' } : h)),
    );
    setExpandedId(id);
  }, []);

  const handleRuleOutRequest = useCallback((id: string) => {
    setRuleOutId(id);
  }, []);

  const applyRuleOut = useCallback(
    (
      hypothesisId: string,
      reason: string,
      note: string,
      by: string,
      options?: { fromChat?: boolean },
    ) => {
      let hypTitle = '';
      setHypotheses((prev) => {
        const hyp = prev.find((h) => h.id === hypothesisId);
        if (!hyp) return prev;
        hypTitle = hyp.title;
        return prev.map((h) =>
          h.id === hypothesisId ? { ...h, status: 'ruled-out' } : h,
        );
      });

      if (!hypTitle) {
        hypTitle =
          hypothesisId === DEPLOY_HYPOTHESIS_ID
            ? 'The deployment itself introduced the regression'
            : hypothesisId;
      }

      const decisionReason = note.trim()
        ? `${reason} Note: ${note.trim()}`
        : reason;

      setDecisions((prev) => [
        {
          id: `dec-${Date.now()}`,
          text: `Ruled out: ${hypTitle}`,
          reason: decisionReason,
          decidedAt: nowTime(),
          by,
          fromChat: options?.fromChat,
        },
        ...prev,
      ]);

      setActivity((prev) => [
        {
          id: `act-${Date.now()}`,
          actor: by,
          action: 'ruled out a hypothesis',
          detail: hypTitle,
          time: nowTime(),
          fromChat: options?.fromChat,
        },
        ...prev,
      ]);

      setToast('Shared investigation state updated');
    },
    [],
  );

  const handleRuleOutConfirm = useCallback(
    (reason: string, note: string) => {
      if (!ruleOutId) return;
      applyRuleOut(ruleOutId, reason, note, 'Maciej K.');
      setRuleOutId(null);
      setExpandedId(ruleOutId);
    },
    [applyRuleOut, ruleOutId],
  );

  const handleDiscussionRuleOut = useCallback(
    (reason: string, note: string) => {
      applyRuleOut(DEPLOY_HYPOTHESIS_ID, reason, note, 'Maciej K.', {
        fromChat: true,
      });

      const openQuestion: OpenQuestion = {
        id: 'q-workload',
        text: 'What increased connection demand before rollout?',
      };
      setQuestions((prev) =>
        prev.some((q) => q.id === openQuestion.id)
          ? prev
          : [openQuestion, ...prev],
      );

      setHypotheses((prev) =>
        prev.map((h) => {
          if (h.id !== DEPLOY_HYPOTHESIS_ID) return h;
          const extra = {
            id: 'hd-o5',
            text: 'No relevant deployment configuration change for DB pool',
            kind: 'contradicting' as const,
            source: 'Events' as const,
            time: '11:41',
            addedBy: 'Deployment Agent',
          };
          if (h.observations.some((o) => o.id === extra.id)) return h;
          return { ...h, observations: [...h.observations, extra] };
        }),
      );
    },
    [applyRuleOut],
  );

  const handleAddWorkloadObservation = useCallback(() => {
    const observation = {
      id: 'hw-o1',
      text: WORKLOAD_OBSERVATION_TEXT,
      kind: 'supporting' as const,
      source: 'Metrics' as const,
      time: '11:39',
      addedBy: 'Analysis Agent',
      highlight: true,
    };

    setHypotheses((prev) => {
      const withoutDup = prev.filter((h) => h.id !== WORKLOAD_HYPOTHESIS_ID);
      const poolUpdated = withoutDup.map((h) => {
        if (h.id !== 'hyp-pool') return h;
        if (h.observations.some((o) => o.id === observation.id)) return h;
        return {
          ...h,
          observations: [...h.observations, observation],
          contributors: h.contributors.includes('Analysis Agent')
            ? h.contributors
            : [...h.contributors, 'Analysis Agent'],
        };
      });

      return [
        {
          id: WORKLOAD_HYPOTHESIS_ID,
          title: WORKLOAD_HYPOTHESIS_TITLE,
          status: 'supported',
          observations: [observation],
          contributors: ['Analysis Agent', 'Maciej K.'],
          sourceLinks: ['Database analysis', 'Connection consumers'],
        },
        ...poolUpdated,
      ];
    });

    setDecisions((prev) => [
      {
        id: `dec-rollout-${Date.now()}`,
        text: 'Keep rollout at 20% while validating the background workload impact',
        reason:
          'Deployment regression ruled out; background reporting workload increased DB connection demand 3.8×.',
        decidedAt: nowTime(),
        by: 'Maciej K.',
        fromChat: true,
      },
      ...prev,
    ]);

    setActivity((prev) => [
      {
        id: `act-${Date.now()}`,
        actor: 'Analysis Agent',
        action: 'added an observation',
        detail: WORKLOAD_OBSERVATION_TEXT,
        time: nowTime(),
        fromChat: true,
      },
      {
        id: `act-${Date.now() + 1}`,
        actor: 'Maciej K.',
        action: 'supported a hypothesis',
        detail: WORKLOAD_HYPOTHESIS_TITLE,
        time: nowTime(),
        fromChat: true,
      },
      ...prev,
    ]);

    setQuestions((prev) =>
      prev
        .filter((q) => q.id !== 'q-workload')
        .concat({
          id: 'q-validate-workload',
          text: 'Confirm reporting workload impact before expanding rollout beyond 20%',
        }),
    );
  }, []);

  const handleAddQuestion = useCallback(() => {
    const text = window.prompt('Add an open question');
    if (!text?.trim()) return;
    setQuestions((prev) => [
      ...prev,
      { id: `q-${Date.now()}`, text: text.trim() },
    ]);
  }, []);

  const handleAddHypothesis = useCallback(() => {
    const text = window.prompt('Add a hypothesis');
    if (!text?.trim()) return;
    const id = `hyp-${Date.now()}`;
    setHypotheses((prev) => [
      ...prev,
      {
        id,
        title: text.trim(),
        status: 'conflicting',
        observations: [],
        contributors: ['Maciej K.'],
        sourceLinks: [],
      },
    ]);
    setExpandedId(id);
    setToast('Hypothesis added');
  }, []);

  const handleAddFinding = useCallback(() => {
    const text = window.prompt('Add a finding');
    if (!text?.trim()) return;
    setFindings((prev) => [
      ...prev,
      {
        id: `find-${Date.now()}`,
        kind: 'open',
        body: text.trim(),
        confirmedBy: 'Maciej K.',
      },
    ]);
    setToast('Finding added');
  }, []);

  const handleAddDecision = useCallback(() => {
    const text = window.prompt('Add a decision');
    if (!text?.trim()) return;
    const reason =
      window.prompt('Reason for this decision')?.trim() ||
      'Recorded from Investigation record';
    setDecisions((prev) => [
      {
        id: `dec-${Date.now()}`,
        text: text.trim(),
        reason,
        decidedAt: nowTime(),
        by: 'Maciej K.',
      },
      ...prev,
    ]);
    setToast('Decision added');
  }, []);

  return (
    <AppShell activeNav={activeNav} onNavigate={onNavigate}>
      <div className="notebook-shell">
        <InvestigationDiscussion
          collapsed={discussionCollapsed}
          onToggleCollapsed={() => setDiscussionCollapsed((v) => !v)}
          onRuleOutDeployHypothesis={handleDiscussionRuleOut}
          onAddWorkloadObservation={handleAddWorkloadObservation}
          onViewInvestigation={() => handleModeChange('investigation')}
          onToast={setToast}
          focusKey={chatFocusKey}
        />
        <div className="notebook-shell__main">
          <NotebookHeader mode={mode} onModeChange={handleModeChange} />

          {mode === 'document' ? (
            <div className="notebook-page notebook-page--document">
              <div className="notebook-page__document">
                <DocumentView
                  onViewInvestigation={() => handleModeChange('investigation')}
                />
              </div>
            </div>
          ) : (
            <div className="notebook-page">
              <div className="notebook-page__main">
                <GoalCard />
                <AiSummaryCard />
                <HypothesesSection
                  hypotheses={hypotheses}
                  expandedId={expandedId}
                  onToggle={handleToggle}
                  onConfirm={handleConfirm}
                  onRuleOut={handleRuleOutRequest}
                  onKeepOpen={handleKeepOpen}
                  onAdd={handleAddHypothesis}
                />
                <FindingsSection findings={findings} onAdd={handleAddFinding} />
                <OpenQuestions questions={questions} onAdd={handleAddQuestion} />
                <DecisionsSection
                  decisions={decisions}
                  onViewInChat={handleViewInChat}
                  onAdd={handleAddDecision}
                />
              </div>

              <TeamPanel activity={activity} onViewInChat={handleViewInChat} />
            </div>
          )}
        </div>
      </div>

      {rulingOut && (
        <RuleOutDialog
          hypothesis={rulingOut}
          onCancel={() => setRuleOutId(null)}
          onConfirm={handleRuleOutConfirm}
        />
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </AppShell>
  );
}
