import { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  FileSearch,
} from 'lucide-react';
import { StickyNotePlusIcon } from '../icons/StickyNotePlusIcon';
import { StratoChatIcon } from '../icons/StratoChatIcon';
import { PersonAvatar } from './PersonAvatar';
import './InvestigationDiscussion.css';

export const DEPLOY_HYPOTHESIS_ID = 'hyp-deploy';
export const DEPLOY_HYPOTHESIS_TITLE =
  'The deployment itself introduced the regression';
export const WORKLOAD_HYPOTHESIS_ID = 'hyp-workload';
export const WORKLOAD_HYPOTHESIS_TITLE =
  'A background workload is increasing DB connection demand';
export const WORKLOAD_OBSERVATION_TEXT =
  'Reporting workload increased active DB connections 3.8×';
export const RULE_OUT_REASON =
  'Database pressure started before rollout and no deployment configuration change explains the behavior.';

type Phase =
  | 'intro'
  | 'decide'
  | 'confirm'
  | 'next'
  | 'loading'
  | 'observation'
  | 'final';

interface InvestigationDiscussionProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onRuleOutDeployHypothesis: (reason: string, note: string) => void;
  onAddWorkloadObservation: () => void;
  onViewInvestigation: () => void;
  onToast: (message: string) => void;
  focusKey?: number;
}

export function InvestigationDiscussion({
  collapsed,
  onToggleCollapsed,
  onRuleOutDeployHypothesis,
  onAddWorkloadObservation,
  onViewInvestigation,
  onToast,
  focusKey = 0,
}: InvestigationDiscussionProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [visibleCount, setVisibleCount] = useState(0);
  const [note, setNote] = useState('');
  const [systemUpdated, setSystemUpdated] = useState(false);
  const [decisionTrail, setDecisionTrail] = useState<
    { id: string; text: string; detail?: string }[]
  >([]);
  const [draft, setDraft] = useState('');
  const [userMessages, setUserMessages] = useState<
    {
      id: string;
      name: string;
      kind: 'human' | 'agent';
      text: string;
      loading?: boolean;
    }[]
  >([]);
  const bodyRef = useRef<HTMLDivElement>(null);

  const introComplete = visibleCount >= 7;

  const pushDecision = (entry: { id: string; text: string; detail?: string }) => {
    setDecisionTrail((prev) =>
      prev.some((d) => d.id === entry.id) ? prev : [...prev, entry],
    );
  };

  useEffect(() => {
    if (phase !== 'intro' || visibleCount >= 7) return;
    const delay = visibleCount === 0 ? 200 : 700;
    const timer = window.setTimeout(() => {
      setVisibleCount((n) => n + 1);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [phase, visibleCount]);

  useEffect(() => {
    if (phase !== 'loading') return;
    const timer = window.setTimeout(() => setPhase('observation'), 1400);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [
    phase,
    visibleCount,
    systemUpdated,
    decisionTrail,
    userMessages,
    focusKey,
    collapsed,
  ]);

  const sendDraft = () => {
    const text = draft.trim();
    if (!text) return;

    const humanId = `msg-${Date.now()}`;
    setUserMessages((prev) => [
      ...prev,
      { id: humanId, name: 'Maciej K.', kind: 'human', text },
    ]);
    setDraft('');

    const aiMention = text.match(/@ai\b/i);
    if (!aiMention) return;

    const question = text.replace(/@ai\b/gi, '').trim() || text;
    const loadingId = `msg-ai-loading-${Date.now()}`;
    setUserMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        name: 'Analysis Agent',
        kind: 'agent',
        text: 'Looking at the current investigation context…',
        loading: true,
      },
    ]);

    window.setTimeout(() => {
      setUserMessages((prev) =>
        prev
          .filter((m) => m.id !== loadingId)
          .concat({
            id: `msg-ai-${Date.now()}`,
            name: 'Analysis Agent',
            kind: 'agent',
            text: buildAiReply(question),
          }),
      );
    }, 900);
  };

  if (collapsed) {
    return (
      <aside className="discussion-panel is-collapsed" aria-label="Notebook discussion">
        <button
          type="button"
          className="discussion-panel__expand"
          onClick={onToggleCollapsed}
          aria-label="Expand investigation discussion"
          title="Notebook discussion"
        >
          <ChevronRight size={16} strokeWidth={1.8} />
          <StratoChatIcon size={14} className="discussion-panel__chat-icon" />
          <span className="discussion-panel__expand-label">Discussion</span>
        </button>
      </aside>
    );
  }

  return (
    <aside className="discussion-panel" aria-label="Notebook discussion">
      <header className="discussion-panel__header">
        <div className="discussion-panel__header-text">
          <h2 className="discussion-panel__title">
            <StratoChatIcon size={16} className="discussion-panel__title-icon" />
            Notebook discussion
          </h2>
          <p className="discussion-panel__goal">
            Is payment-service v4.28 safe to continue rolling out?
          </p>
        </div>
        <button
          type="button"
          className="discussion-panel__collapse"
          onClick={onToggleCollapsed}
          aria-label="Collapse discussion panel"
        >
          <ChevronLeft size={16} strokeWidth={1.8} />
        </button>
      </header>

      <div className="discussion-panel__body" ref={bodyRef}>
        {visibleCount >= 1 && (
          <Message
            name="Anna S."
            kind="human"
            text="I'm not convinced the deployment itself caused this. Did the DB pressure start before v4.28 began receiving traffic?"
          />
        )}

        {visibleCount >= 2 && (
          <Message
            name="Piotr W."
            kind="human"
            text="Good question — if pool saturation started earlier, we should also check whether any scheduled job kicked in around 11:39. Anyone seeing elevated DB consumers before the deploy marker?"
          />
        )}

        {visibleCount >= 3 && (
          <Message
            name="Anna S."
            kind="human"
            text="I added an observation to the notebook — checkout completion stayed flat while payment p95 climbed. Sharing that so everyone (and the agents) have a clearer sibling-service baseline for correlation."
            observation={{
              title: 'Checkout completion unchanged during payment latency spike',
              lines: [
                'Source: Release Monitoring · Added to notebook',
                'Time: 11:52 · By Anna S.',
              ],
            }}
          />
        )}

        {visibleCount >= 4 && (
          <Message
            name="Trace Agent"
            kind="agent"
            text="Yes. DB connection wait began increasing approximately 94 seconds before the rollout started."
            evidence={{
              title: 'DB wait +31%',
              lines: ['Source: distributed traces', 'Time: 11:40:26'],
              actions: [{ label: 'View evidence' }],
            }}
          />
        )}

        {visibleCount >= 5 && (
          <Message
            name="Logs Agent"
            kind="agent"
            text="I found connection pool exhaustion warnings before v4.28 began receiving production traffic."
            evidence={{
              title: '17 matching log events',
              lines: ['First occurrence: 11:40:41'],
              actions: [{ label: 'View logs' }],
            }}
          />
        )}

        {visibleCount >= 6 && (
          <Message
            name="Deployment Agent"
            kind="agent"
            text="I found no deployment or configuration change in v4.28 that modifies the database connection pool."
            evidence={{
              title: 'Deployment v4.28',
              lines: ['No relevant configuration delta detected'],
              actions: [{ label: 'View deployment' }],
            }}
          />
        )}

        {visibleCount >= 7 && (
          <div className="discussion-card discussion-card--synthesis">
            <div className="discussion-card__eyebrow">Shared assessment</div>
            <div className="discussion-card__row">
              <span className="discussion-card__label">Hypothesis</span>
              <span className="discussion-card__value">
                {DEPLOY_HYPOTHESIS_TITLE}
              </span>
            </div>
            <div className="discussion-card__stats">
              <div>
                <div className="discussion-card__stat-label">Current state</div>
                <div className="discussion-card__stat-value is-warning">
                  Conflicting
                </div>
              </div>
              <div>
                <div className="discussion-card__stat-label">Supporting</div>
                <div className="discussion-card__stat-value">2</div>
              </div>
              <div>
                <div className="discussion-card__stat-label">Contradicting</div>
                <div className="discussion-card__stat-value">3</div>
              </div>
            </div>
            <div className="discussion-card__row">
              <span className="discussion-card__label">Suggested action</span>
              <span className="discussion-card__value">Review and decide</span>
            </div>
            {phase === 'intro' && introComplete && (
              <button
                type="button"
                className="discussion-btn discussion-btn--primary"
                onClick={() => {
                  pushDecision({
                    id: 'review-hypothesis',
                    text: 'Reviewing hypothesis status.',
                    detail: DEPLOY_HYPOTHESIS_TITLE,
                  });
                  setPhase('decide');
                }}
              >
                Review hypothesis
              </button>
            )}
          </div>
        )}

        {decisionTrail.some((d) => d.id === 'review-hypothesis') && (
          <DecisionMessage
            text={
              decisionTrail.find((d) => d.id === 'review-hypothesis')!.text
            }
            detail={
              decisionTrail.find((d) => d.id === 'review-hypothesis')!.detail
            }
          />
        )}

        {phase === 'decide' && (
          <div className="discussion-card discussion-card--decide">
            <div className="discussion-card__eyebrow">Decide hypothesis status</div>
            <div className="discussion-card__row">
              <span className="discussion-card__label">Hypothesis</span>
              <span className="discussion-card__value">
                {DEPLOY_HYPOTHESIS_TITLE}
              </span>
            </div>
            <div className="discussion-evidence-split">
              <div>
                <div className="discussion-evidence-split__title is-support">
                  Supporting
                </div>
                <ul>
                  <li>latency increased close to rollout time</li>
                  <li>only v4.28 shows degraded latency</li>
                </ul>
              </div>
              <div>
                <div className="discussion-evidence-split__title is-contra">
                  Contradicting
                </div>
                <ul>
                  <li>DB wait increased 94 seconds before rollout</li>
                  <li>pool exhaustion started before rollout</li>
                  <li>no relevant deployment configuration change detected</li>
                </ul>
              </div>
            </div>
            <div className="discussion-card__actions">
              <button
                type="button"
                className="discussion-btn discussion-btn--ghost"
                onClick={() => setPhase('intro')}
              >
                Keep open
              </button>
              <button
                type="button"
                className="discussion-btn discussion-btn--primary"
                onClick={() => {
                  pushDecision({
                    id: 'choose-rule-out',
                    text: 'Chose: Rule out as primary cause.',
                    detail: DEPLOY_HYPOTHESIS_TITLE,
                  });
                  setPhase('confirm');
                }}
              >
                Rule out as primary cause
              </button>
            </div>
          </div>
        )}

        {decisionTrail.some((d) => d.id === 'choose-rule-out') &&
          phase !== 'decide' && (
            <DecisionMessage
              text={
                decisionTrail.find((d) => d.id === 'choose-rule-out')!.text
              }
              detail={
                decisionTrail.find((d) => d.id === 'choose-rule-out')!.detail
              }
            />
          )}

        {phase === 'confirm' && (
          <div className="discussion-card discussion-card--confirm">
            <div className="discussion-card__eyebrow">Rule out this hypothesis?</div>
            <label className="discussion-field">
              <span className="discussion-field__label">Reason</span>
              <div className="discussion-field__value">{RULE_OUT_REASON}</div>
            </label>
            <label className="discussion-field">
              <span className="discussion-field__label">Optional note</span>
              <textarea
                className="discussion-note"
                rows={2}
                placeholder="Add context for the team…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="discussion-btn discussion-btn--primary"
              onClick={() => {
                onRuleOutDeployHypothesis(RULE_OUT_REASON, note);
                pushDecision({
                  id: 'confirm-rule-out',
                  text: 'Confirmed: ruled out deployment as primary cause.',
                  detail: note.trim()
                    ? `${RULE_OUT_REASON} Note: ${note.trim()}`
                    : RULE_OUT_REASON,
                });
                setSystemUpdated(true);
                setPhase('next');
              }}
            >
              Confirm decision
            </button>
          </div>
        )}

        {decisionTrail.some((d) => d.id === 'confirm-rule-out') && (
          <DecisionMessage
            text={
              decisionTrail.find((d) => d.id === 'confirm-rule-out')!.text
            }
            detail={
              decisionTrail.find((d) => d.id === 'confirm-rule-out')!.detail
            }
          />
        )}

        {systemUpdated && (
          <div className="discussion-system">
            <div className="discussion-system__title">
              Shared investigation state updated
            </div>
            <div className="discussion-system__note">
              Agents will use this decision as context for further analysis.
            </div>
          </div>
        )}

        {(phase === 'next' ||
          phase === 'loading' ||
          phase === 'observation' ||
          phase === 'final') && (
          <Message
            name="Analysis Agent"
            kind="agent"
            text="With deployment regression ruled out, the strongest remaining explanation is increased database connection pressure."
          />
        )}

        {(phase === 'next' ||
          phase === 'loading' ||
          phase === 'observation' ||
          phase === 'final') && (
          <div className="discussion-card discussion-card--question">
            <div className="discussion-card__eyebrow">Open question</div>
            <div className="discussion-card__value">
              What increased connection demand before rollout?
            </div>
            <div className="discussion-card__label" style={{ marginTop: 10 }}>
              Suggested next checks
            </div>
            <ul className="discussion-checks">
              <li>Inspect background database workloads</li>
              <li>Compare connection consumers</li>
              <li>Check scheduled jobs</li>
            </ul>
            {phase === 'next' && (
              <div className="discussion-card__actions">
                <button
                  type="button"
                  className="discussion-btn discussion-btn--primary"
                  onClick={() => {
                    pushDecision({
                      id: 'investigate-workload',
                      text: 'Chose: Investigate background workload.',
                      detail:
                        'What increased connection demand before rollout?',
                    });
                    setPhase('loading');
                  }}
                >
                  Investigate background workload
                </button>
                <button type="button" className="discussion-btn discussion-btn--ghost">
                  Ask another question
                </button>
              </div>
            )}
          </div>
        )}

        {decisionTrail.some((d) => d.id === 'investigate-workload') &&
          phase !== 'next' && (
            <DecisionMessage
              text={
                decisionTrail.find((d) => d.id === 'investigate-workload')!
                  .text
              }
              detail={
                decisionTrail.find((d) => d.id === 'investigate-workload')!
                  .detail
              }
            />
          )}

        {phase === 'loading' && (
          <Message
            name="Analysis Agent"
            kind="agent"
            text="Checking database connection consumers…"
            loading
          />
        )}

        {(phase === 'observation' || phase === 'final') && (
          <Message
            name="Analysis Agent"
            kind="agent"
            text="I found a reporting workload that increased active database connections by 3.8× starting at 11:39."
            evidence={{
              title: WORKLOAD_OBSERVATION_TEXT,
              lines: [
                'Source: database analysis',
                'Started: 11:39',
                'Confidence: High',
              ],
              actions:
                phase === 'observation'
                  ? [
                      {
                        label: 'Add as observation',
                        primary: true,
                        onClick: () => {
                          onAddWorkloadObservation();
                          pushDecision({
                            id: 'add-observation',
                            text: 'Added observation to investigation record.',
                            detail: WORKLOAD_OBSERVATION_TEXT,
                          });
                          onToast('Observation added to investigation record');
                          setPhase('final');
                        },
                      },
                      { label: 'View source' },
                    ]
                  : [{ label: 'View source' }],
            }}
          />
        )}

        {decisionTrail.some((d) => d.id === 'add-observation') && (
          <DecisionMessage
            text={
              decisionTrail.find((d) => d.id === 'add-observation')!.text
            }
            detail={
              decisionTrail.find((d) => d.id === 'add-observation')!.detail
            }
          />
        )}

        {phase === 'final' && (
          <div className="discussion-card discussion-card--synthesis">
            <div className="discussion-card__eyebrow">Current understanding</div>
            <div className="discussion-summary-block">
              <div className="discussion-summary-block__label is-ruled">
                Ruled out
              </div>
              <div>Deployment itself introduced the regression</div>
            </div>
            <div className="discussion-summary-block">
              <div className="discussion-summary-block__label is-supported">
                Supported
              </div>
              <div>Connection pool saturation is causing latency</div>
            </div>
            <div className="discussion-summary-block">
              <div className="discussion-summary-block__label is-supported">
                New supported hypothesis
              </div>
              <div>
                A background reporting workload increased DB connection demand
              </div>
            </div>
            <div className="discussion-summary-block">
              <div className="discussion-summary-block__label">Decision</div>
              <div>
                Keep rollout at 20% while validating the background workload
                impact
              </div>
            </div>
            <button
              type="button"
              className="discussion-btn discussion-btn--primary"
              onClick={onViewInvestigation}
            >
              View Investigation record
            </button>
          </div>
        )}

        {userMessages.map((msg) => (
            <Message
              key={msg.id}
              name={msg.name}
              kind={msg.kind}
              text={msg.text}
              loading={msg.loading}
            />
          ))}
      </div>

      <form
        className="discussion-composer"
        onSubmit={(e) => {
          e.preventDefault();
          sendDraft();
        }}
      >
        <div className="discussion-composer__box">
          <textarea
            className="discussion-composer__input"
            rows={1}
            placeholder="Ask a question or add a comment…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendDraft();
              }
            }}
            aria-label="Ask a question or add a comment"
          />
          <button
            type="submit"
            className="discussion-composer__send"
            disabled={!draft.trim()}
            aria-label="Send"
          >
            <ArrowUp size={16} strokeWidth={2.2} />
          </button>
        </div>
        <p className="discussion-composer__hint">
          Mention @ai to get an agent response · Shared with the investigation team
        </p>
      </form>
    </aside>
  );
}

function buildAiReply(question: string): string {
  const q = question.toLowerCase();

  if (/workload|report|11:39|background|consumer/.test(q)) {
    return 'The reporting job that started at 11:39 is the strongest remaining lead. It increased active DB connections by about 3.8× and lines up with pool exhaustion before the deploy finished. I would next compare connection consumers by host and confirm whether that job is still running.';
  }

  if (/deploy|v4\.28|rollout|binary|config/.test(q)) {
    return 'Current evidence argues against deployment as the primary cause: DB wait rose ~94s before traffic reached v4.28, pool exhaustion started beforehand, and Deployment Agent found no pool-related config delta. Prefer treating deployment as ruled out unless new contradicting evidence appears.';
  }

  if (/pool|latency|p95|saturat|connection/.test(q)) {
    return 'Connection pool saturation remains the best explanation for the p95 rise. Supporting signals: pool exhausted events, DB wait +31%, and stable error/checkout rates. The open question is what increased connection demand before rollout — background workload is the leading candidate.';
  }

  if (/safe|continue|expand|20%|canary/.test(q)) {
    return 'Based on the shared investigation state, keeping rollout at 20% while validating the reporting workload impact is the safest next step. Expanding further would risk compounding pool pressure before the consumer spike is confirmed and mitigated.';
  }

  return `Based on the current notebook context: deployment is unlikely the root cause, pool saturation is supported, and a background reporting workload starting at 11:39 is the strongest new lead. For “${question.slice(0, 120)}${question.length > 120 ? '…' : ''}”, I recommend checking connection consumers around 11:39–11:42 and confirming whether that workload is still active before expanding the canary.`;
}

function DecisionMessage({
  text,
  detail,
}: {
  text: string;
  detail?: string;
}) {
  return (
    <div className="discussion-msg is-human is-decision">
      <PersonAvatar name="Maciej K." kind="human" />
      <div className="discussion-msg__body">
        <div className="discussion-msg__meta">
          <span className="discussion-msg__name">Maciej K.</span>
          <span className="discussion-msg__decision-badge">Decision</span>
        </div>
        <div className="discussion-msg__text">{text}</div>
        {detail && <div className="discussion-msg__decision-detail">{detail}</div>}
      </div>
    </div>
  );
}

function Message({
  name,
  kind,
  text,
  evidence,
  observation,
  loading,
}: {
  name: string;
  kind: 'human' | 'agent';
  text: string;
  loading?: boolean;
  evidence?: {
    title: string;
    lines: string[];
    actions?: { label: string; primary?: boolean; onClick?: () => void }[];
  };
  observation?: {
    title: string;
    lines: string[];
  };
}) {
  return (
    <div className={`discussion-msg is-${kind}`}>
      <PersonAvatar name={name} kind={kind} />
      <div className="discussion-msg__body">
        <div className="discussion-msg__meta">
          <span className="discussion-msg__name">{name}</span>
          {observation && (
            <span className="discussion-msg__observation-badge">Observation</span>
          )}
        </div>
        <div className={`discussion-msg__text ${loading ? 'is-loading' : ''}`}>
          {text}
        </div>
        {observation && (
          <div className="discussion-observation">
            <div className="discussion-observation__title">
              <StickyNotePlusIcon size={13} strokeWidth={1.8} />
              {observation.title}
            </div>
            {observation.lines.map((line) => (
              <div key={line} className="discussion-observation__line">
                {line}
              </div>
            ))}
          </div>
        )}
        {evidence && (
          <div className="discussion-evidence">
            <div className="discussion-evidence__title">
              <FileSearch size={13} strokeWidth={1.8} />
              {evidence.title}
            </div>
            {evidence.lines.map((line) => (
              <div key={line} className="discussion-evidence__line">
                {line}
              </div>
            ))}
            {evidence.actions && evidence.actions.length > 0 && (
              <div className="discussion-evidence__actions">
                {evidence.actions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className={`discussion-btn discussion-btn--sm ${
                      action.primary
                        ? 'discussion-btn--primary'
                        : 'discussion-btn--ghost'
                    }`}
                    onClick={action.onClick}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
