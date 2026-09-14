import { useEffect, useState } from 'react';
import { BookMarked } from 'lucide-react';
import { Button } from '../ui/Button';
import { NOTEBOOK_META } from '../../data/notebookData';
import './SetAsGuideModal.css';

/** Davis event categories shown on Problems (e.g. Availability badge). */
const PROBLEM_TYPES = [
  {
    id: 'availability',
    label: 'Availability',
    hint: 'Outages, process/service down, synthetic failures',
  },
  {
    id: 'error',
    label: 'Error',
    hint: 'Elevated error rates and error-related incidents',
  },
  {
    id: 'slowdown',
    label: 'Slowdown',
    hint: 'Response-time or throughput degradation',
  },
  {
    id: 'resource',
    label: 'Resource',
    hint: 'CPU, memory, disk, or connection-pool contention',
  },
  {
    id: 'monitoring',
    label: 'Monitoring unavailable',
    hint: 'Widespread OneAgent / monitoring interruption',
  },
  {
    id: 'custom',
    label: 'Custom alert',
    hint: 'User-defined detectors without a standard category',
  },
] as const;

/** ITIL-aligned severity from Dynatrace standardized event severity. */
const SEVERITIES = [
  { id: 'any', label: 'Any severity' },
  { id: '1', label: 'Critical (SEV-1) and higher' },
  { id: '2', label: 'Major (SEV-2) and higher' },
  { id: '3', label: 'Minor (SEV-3) and higher' },
  { id: '4', label: 'Warning (SEV-4) and higher' },
] as const;

/** Impact areas from Problems filters / entity ribbon. */
const IMPACT_AREAS = [
  { id: 'any', label: 'Any impact area' },
  { id: 'services', label: 'Services' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'frontends', label: 'Frontends / applications' },
  { id: 'synthetic', label: 'Synthetic monitors' },
  { id: 'environment', label: 'Environment' },
] as const;

export type SetAsGuidePayload = {
  problemTypeLabel: string;
  minSeverityLabel: string;
  impactAreaLabel: string;
  titleMatch: string;
  description: string;
};

interface SetAsGuideModalProps {
  onCancel: () => void;
  onConfirm: (payload: SetAsGuidePayload) => void;
}

export function SetAsGuideModal({ onCancel, onConfirm }: SetAsGuideModalProps) {
  const [problemTypeId, setProblemTypeId] =
    useState<(typeof PROBLEM_TYPES)[number]['id']>('availability');
  const [severityId, setSeverityId] =
    useState<(typeof SEVERITIES)[number]['id']>('3');
  const [impactId, setImpactId] =
    useState<(typeof IMPACT_AREAS)[number]['id']>('services');
  const [titleMatch, setTitleMatch] = useState('Postgres*');
  const [description, setDescription] = useState(
    'Remediation steps for availability incidents affecting database-backed services. Use when Davis opens an Availability problem and the Troubleshooting tab needs a pinned notebook guide.',
  );

  const selectedType =
    PROBLEM_TYPES.find((t) => t.id === problemTypeId) ?? PROBLEM_TYPES[0];
  const selectedSeverity =
    SEVERITIES.find((s) => s.id === severityId) ?? SEVERITIES[0];
  const selectedImpact =
    IMPACT_AREAS.find((i) => i.id === impactId) ?? IMPACT_AREAS[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const canSubmit =
    Boolean(problemTypeId) && description.trim().length > 0;

  return (
    <div className="set-guide-modal" role="presentation">
      <div
        className="set-guide-modal__backdrop"
        onClick={onCancel}
        aria-hidden
      />
      <div
        className="set-guide-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="set-guide-title"
      >
        <div className="set-guide-modal__head">
          <div className="set-guide-modal__eyebrow">
            <BookMarked size={14} strokeWidth={1.8} aria-hidden />
            Troubleshooting guide
          </div>
          <h3 id="set-guide-title" className="set-guide-modal__title">
            Set as guide
          </h3>
          <p className="set-guide-modal__sub">
            Pin this notebook to matching Problems so it appears on the
            Troubleshooting tab for remediation (same place as “+ New”
            guides in Problems).
          </p>
        </div>

        <div className="set-guide-modal__body">
          <div className="set-guide-field">
            <span className="set-guide-field__label">Notebook</span>
            <div className="set-guide-field__value">{NOTEBOOK_META.title}</div>
          </div>

          <label className="set-guide-field">
            <span className="set-guide-field__label">Problem type</span>
            <select
              className="set-guide-field__control"
              value={problemTypeId}
              onChange={(e) =>
                setProblemTypeId(
                  e.target.value as (typeof PROBLEM_TYPES)[number]['id'],
                )
              }
            >
              {PROBLEM_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
            <span className="set-guide-field__hint">{selectedType.hint}</span>
          </label>

          <label className="set-guide-field">
            <span className="set-guide-field__label">Minimum severity</span>
            <select
              className="set-guide-field__control"
              value={severityId}
              onChange={(e) =>
                setSeverityId(
                  e.target.value as (typeof SEVERITIES)[number]['id'],
                )
              }
            >
              {SEVERITIES.map((sev) => (
                <option key={sev.id} value={sev.id}>
                  {sev.label}
                </option>
              ))}
            </select>
            <span className="set-guide-field__hint">
              Matches Problems severity filters (Critical → Informational)
            </span>
          </label>

          <label className="set-guide-field">
            <span className="set-guide-field__label">Impact area</span>
            <select
              className="set-guide-field__control"
              value={impactId}
              onChange={(e) =>
                setImpactId(
                  e.target.value as (typeof IMPACT_AREAS)[number]['id'],
                )
              }
            >
              {IMPACT_AREAS.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.label}
                </option>
              ))}
            </select>
            <span className="set-guide-field__hint">
              Optional filter by impacted layer (Services, Infrastructure, …)
            </span>
          </label>

          <label className="set-guide-field">
            <span className="set-guide-field__label">
              Problem title match
            </span>
            <input
              className="set-guide-field__control"
              value={titleMatch}
              onChange={(e) => setTitleMatch(e.target.value)}
              placeholder="e.g. Postgres* or payment-service*"
            />
            <span className="set-guide-field__hint">
              Optional pattern for problem titles (leave empty for all titles
              of this type)
            </span>
          </label>

          <label className="set-guide-field">
            <span className="set-guide-field__label">Guide description</span>
            <textarea
              className="set-guide-field__textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="When should this guide appear and what does it help remediate?"
            />
          </label>
        </div>

        <div className="set-guide-modal__actions">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (!canSubmit) return;
              onConfirm({
                problemTypeLabel: selectedType.label,
                minSeverityLabel: selectedSeverity.label,
                impactAreaLabel: selectedImpact.label,
                titleMatch: titleMatch.trim(),
                description: description.trim(),
              });
            }}
          >
            Set as guide
          </Button>
        </div>
      </div>
    </div>
  );
}
