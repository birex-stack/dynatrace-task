import { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { NOTEBOOK_META, TEAM } from '../../data/notebookData';
import './AddAiSkillModal.css';

const EXISTING_SKILLS = [
  {
    id: 'payment-rollout-triage',
    name: 'payment-rollout-triage',
    description:
      'Triage payment-service canary regressions using latency, pool, and deploy evidence.',
  },
  {
    id: 'db-pool-saturation',
    name: 'db-pool-saturation-check',
    description:
      'Detect connection-pool pressure and compare against deploy timing.',
  },
  {
    id: 'release-canary-guard',
    name: 'release-canary-guard',
    description:
      'Recommend hold / expand / rollback for production canaries.',
  },
] as const;

const SUGGESTED_TOOLS = [
  'DQL query',
  'Traces',
  'Logs',
  'Metrics',
  'Deployment events',
  'Notebooks',
] as const;

interface AddAiSkillModalProps {
  onCancel: () => void;
  onConfirm: (payload: {
    agentName: string;
    skillName: string;
    mode: 'new' | 'existing';
  }) => void;
}

export function AddAiSkillModal({ onCancel, onConfirm }: AddAiSkillModalProps) {
  const agents = useMemo(() => TEAM.filter((m) => m.kind === 'agent'), []);
  const [agentId, setAgentId] = useState(agents[3]?.id ?? agents[0]?.id ?? '');
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [existingSkillId, setExistingSkillId] = useState<string>(
    EXISTING_SKILLS[0].id,
  );
  const [skillName, setSkillName] = useState('payment-v428-safe-to-continue');
  const [description, setDescription] = useState(
    'Decide whether payment-service v4.28 is safe to continue rolling out. Use when investigating post-deploy latency regressions, connection-pool saturation, or canary expansion risk for payment-service in production.',
  );
  const [comment, setComment] = useState('');
  const [tools, setTools] = useState<string[]>([
    'DQL query',
    'Traces',
    'Logs',
    'Metrics',
    'Deployment events',
  ]);

  const selectedAgent = agents.find((a) => a.id === agentId) ?? agents[0];
  const selectedExisting =
    EXISTING_SKILLS.find((s) => s.id === existingSkillId) ?? EXISTING_SKILLS[0];

  const scopeItems = useMemo(
    () => [
      `Goal: ${NOTEBOOK_META.goal}`,
      `Service: ${NOTEBOOK_META.context.service}`,
      `Environment: ${NOTEBOOK_META.context.environment}`,
      `Version: ${NOTEBOOK_META.context.version}`,
      `Timeframe: ${NOTEBOOK_META.context.timeframe}`,
      `Notebook: ${NOTEBOOK_META.title}`,
      'Include Workspace evidence (charts, DQL, tables) and Investigation record state',
      'Prefer ruling deployment in/out before expanding canary beyond 20%',
    ],
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  useEffect(() => {
    if (mode === 'existing') {
      setDescription(selectedExisting.description);
      setSkillName(selectedExisting.name);
    }
  }, [mode, selectedExisting]);

  const toggleTool = (tool: string) => {
    setTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool],
    );
  };

  const canSubmit =
    Boolean(selectedAgent) &&
    (mode === 'existing'
      ? Boolean(existingSkillId)
      : skillName.trim().length > 0 && description.trim().length > 0);

  return (
    <div className="ai-skill-modal" role="presentation">
      <div className="ai-skill-modal__backdrop" onClick={onCancel} aria-hidden />
      <div
        className="ai-skill-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-skill-title"
      >
        <div className="ai-skill-modal__head">
          <div className="ai-skill-modal__eyebrow">
            <Sparkles size={14} strokeWidth={1.8} aria-hidden />
            Agent skill
          </div>
          <h3 id="ai-skill-title" className="ai-skill-modal__title">
            Add as AI skill
          </h3>
          <p className="ai-skill-modal__sub">
            Capture this notebook’s investigation pattern so an agent can reuse
            it on similar rollouts.
          </p>
        </div>

        <div className="ai-skill-modal__body">
          <label className="ai-skill-field">
            <span className="ai-skill-field__label">Agent</span>
            <select
              className="ai-skill-field__control"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} · {agent.role}
                </option>
              ))}
            </select>
          </label>

          <div className="ai-skill-field">
            <span className="ai-skill-field__label">Skill</span>
            <div className="ai-skill-mode" role="radiogroup" aria-label="Skill mode">
              <button
                type="button"
                role="radio"
                aria-checked={mode === 'new'}
                className={mode === 'new' ? 'is-active' : ''}
                onClick={() => setMode('new')}
              >
                Create new skill
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={mode === 'existing'}
                className={mode === 'existing' ? 'is-active' : ''}
                onClick={() => setMode('existing')}
              >
                Update existing skill
              </button>
            </div>
          </div>

          {mode === 'existing' ? (
            <label className="ai-skill-field">
              <span className="ai-skill-field__label">Existing skill</span>
              <select
                className="ai-skill-field__control"
                value={existingSkillId}
                onChange={(e) => setExistingSkillId(e.target.value)}
              >
                {EXISTING_SKILLS.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="ai-skill-field">
              <span className="ai-skill-field__label">Skill name</span>
              <input
                className="ai-skill-field__control"
                value={skillName}
                onChange={(e) =>
                  setSkillName(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]+/g, '-')
                      .replace(/-+/g, '-')
                      .replace(/^-|-$/g, ''),
                  )
                }
                placeholder="lowercase-hyphenated-name"
              />
              <span className="ai-skill-field__hint">
                Lowercase letters, numbers, and hyphens only
              </span>
            </label>
          )}

          <label className="ai-skill-field">
            <span className="ai-skill-field__label">Description</span>
            <textarea
              className="ai-skill-field__textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What the skill does and when the agent should use it…"
            />
            <span className="ai-skill-field__hint">
              Used for skill discovery — include what + when
            </span>
          </label>

          <div className="ai-skill-field">
            <span className="ai-skill-field__label">
              Scope · auto-filled from notebook
            </span>
            <ul className="ai-skill-scope">
              {scopeItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="ai-skill-field">
            <span className="ai-skill-field__label">Allowed tools</span>
            <div className="ai-skill-tools">
              {SUGGESTED_TOOLS.map((tool) => {
                const active = tools.includes(tool);
                return (
                  <button
                    key={tool}
                    type="button"
                    className={`ai-skill-tool ${active ? 'is-active' : ''}`}
                    aria-pressed={active}
                    onClick={() => toggleTool(tool)}
                  >
                    {tool}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="ai-skill-field">
            <span className="ai-skill-field__label">Comment</span>
            <textarea
              className="ai-skill-field__textarea"
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional note for reviewers or future maintainers…"
            />
          </label>
        </div>

        <div className="ai-skill-modal__actions">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (!canSubmit || !selectedAgent) return;
              onConfirm({
                agentName: selectedAgent.name,
                skillName:
                  mode === 'existing' ? selectedExisting.name : skillName.trim(),
                mode,
              });
            }}
          >
            {mode === 'existing' ? 'Update skill' : 'Create skill'}
          </Button>
        </div>
      </div>
    </div>
  );
}
