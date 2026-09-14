import { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import type { Hypothesis } from '../../data/notebookData';
import './RuleOutDialog.css';

interface RuleOutDialogProps {
  hypothesis: Hypothesis;
  onCancel: () => void;
  onConfirm: (reason: string, note: string) => void;
}

const DEFAULT_REASON =
  'Pool exhaustion and increased DB wait started before rollout.';

export function RuleOutDialog({
  hypothesis,
  onCancel,
  onConfirm,
}: RuleOutDialogProps) {
  const [note, setNote] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="ruleout-modal" role="presentation">
      <div className="ruleout-backdrop" onClick={onCancel} aria-hidden />
      <div
        className="ruleout-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ruleout-title"
      >
        <h3 id="ruleout-title" className="ruleout-dialog__title">
          Rule out this hypothesis?
        </h3>

        <label className="ruleout-field">
          <span className="ruleout-field__label">Hypothesis</span>
          <div className="ruleout-field__value">{hypothesis.title}</div>
        </label>

        <label className="ruleout-field">
          <span className="ruleout-field__label">Reason</span>
          <div className="ruleout-field__value">{DEFAULT_REASON}</div>
        </label>

        <label className="ruleout-field">
          <span className="ruleout-field__label">Optional note</span>
          <textarea
            className="ruleout-note"
            rows={3}
            placeholder="Add context for the team and agents…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        <p className="ruleout-shared-note">
          Agents will use this decision as context for further analysis.
        </p>

        <div className="ruleout-dialog__actions">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onConfirm(DEFAULT_REASON, note)}
          >
            Rule out hypothesis
          </Button>
        </div>
      </div>
    </div>
  );
}
