import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SparkleIcon } from '../icons/SparkleIcon';
import { Button } from '../ui/Button';
import {
  NOTEBOOK_OPTIONS,
  NOTEBOOK_TARGET,
  OBSERVATION_CONTEXT,
} from '../../data/mockData';
import './AddObservationPopover.css';

interface AddObservationPopoverProps {
  onCancel: () => void;
  onConfirm: (payload: { note: string; notebookName: string }) => void;
}

export function AddObservationPopover({
  onCancel,
  onConfirm,
}: AddObservationPopoverProps) {
  const [note, setNote] = useState('');
  const [notebookId, setNotebookId] = useState<string>(
    NOTEBOOK_OPTIONS.find((n) => n.recommended)?.id ?? NOTEBOOK_OPTIONS[0].id,
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const selected =
    NOTEBOOK_OPTIONS.find((n) => n.id === notebookId) ?? NOTEBOOK_OPTIONS[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (pickerOpen) setPickerOpen(false);
        else onCancel();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel, pickerOpen]);

  useEffect(() => {
    if (!pickerOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node)
      ) {
        setPickerOpen(false);
      }
    };
    window.addEventListener('mousedown', onPointer);
    return () => window.removeEventListener('mousedown', onPointer);
  }, [pickerOpen]);

  const contextItems = [
    OBSERVATION_CONTEXT.service,
    OBSERVATION_CONTEXT.environment,
    OBSERVATION_CONTEXT.version,
    OBSERVATION_CONTEXT.timeframe,
    OBSERVATION_CONTEXT.dashboard,
    OBSERVATION_CONTEXT.deployment,
  ];

  return (
    <div className="observation-modal" role="presentation">
      <div className="observation-backdrop" onClick={onCancel} aria-hidden />
      <div
        ref={ref}
        className="observation-popover"
        role="dialog"
        aria-modal="true"
        aria-labelledby="observation-title"
      >
        <h3 id="observation-title" className="observation-popover__title">
          Add observation to
        </h3>

        <div className="observation-field">
          <span className="observation-field__label">Notebook</span>
          <div className="observation-notebook" ref={pickerRef}>
            <button
              type="button"
              className={`observation-notebook__trigger ${
                selected.recommended ? 'is-recommended' : ''
              }`}
              aria-haspopup="listbox"
              aria-expanded={pickerOpen}
              onClick={() => setPickerOpen((v) => !v)}
            >
              <span className="observation-notebook__main">
                {selected.recommended && (
                  <span className="observation-notebook__ai" aria-hidden>
                    <SparkleIcon size={28} />
                  </span>
                )}
                <span className="observation-notebook__name">{selected.name}</span>
                {selected.recommended && (
                  <span className="observation-notebook__badge">Recommended</span>
                )}
              </span>
              <ChevronDown
                size={14}
                strokeWidth={2}
                className={`observation-notebook__chevron ${
                  pickerOpen ? 'is-open' : ''
                }`}
                aria-hidden
              />
            </button>

            {pickerOpen && (
              <ul className="observation-notebook__menu" role="listbox">
                {NOTEBOOK_OPTIONS.map((option) => (
                  <li key={option.id} role="option" aria-selected={option.id === notebookId}>
                    <button
                      type="button"
                      className={`observation-notebook__option ${
                        option.id === notebookId ? 'is-selected' : ''
                      }`}
                      onClick={() => {
                        setNotebookId(option.id);
                        setPickerOpen(false);
                      }}
                    >
                      <span className="observation-notebook__option-row">
                        {option.recommended ? (
                          <SparkleIcon size={26} />
                        ) : (
                          <span className="observation-notebook__option-spacer" />
                        )}
                        <span>{option.name}</span>
                      </span>
                      {option.recommended && (
                        <span className="observation-notebook__badge">Recommended</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {selected.recommended && 'reason' in selected && selected.reason && (
            <p className="observation-notebook__reason">{selected.reason}</p>
          )}
        </div>

        <label className="observation-field">
          <span className="observation-field__label">Observation</span>
          <div className="observation-field__value observation-field__value--emphasis">
            {NOTEBOOK_TARGET.defaultObservation}
          </div>
        </label>

        <div className="observation-field">
          <span className="observation-field__label">Automatically captured context</span>
          <ul className="observation-context">
            {contextItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <label className="observation-field">
          <span className="observation-field__label">Add note</span>
          <textarea
            className="observation-note"
            rows={3}
            placeholder="Optional note for the investigation…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        <div className="observation-popover__actions">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              onConfirm({
                note,
                notebookName: selected.name,
              })
            }
          >
            Add observation
          </Button>
        </div>
      </div>
    </div>
  );
}
