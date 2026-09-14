import { useState } from 'react';
import { ChevronDown, MoreVertical, Target } from 'lucide-react';
import { NOTEBOOK_META } from '../../data/notebookData';
import './GoalCard.css';

export function GoalCard() {
  const [expanded, setExpanded] = useState(false);
  const full = NOTEBOOK_META.fullContext;

  return (
    <section className={`goal-card ${expanded ? 'is-expanded' : ''}`}>
      <div className="goal-card__bar">
        <div className="goal-card__icon" aria-hidden>
          <Target size={16} strokeWidth={1.8} />
        </div>

        <p className="goal-card__goal">{NOTEBOOK_META.goal}</p>

        <div className="goal-card__actions">
          <button
            type="button"
            className="goal-card__link"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? 'Hide context' : 'View full context'}
            <ChevronDown
              size={14}
              strokeWidth={2}
              className={`goal-card__chevron ${expanded ? 'is-open' : ''}`}
              aria-hidden
            />
          </button>
          <button
            type="button"
            className="goal-card__kebab"
            aria-label="Goal actions"
          >
            <MoreVertical size={16} strokeWidth={1.7} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="goal-card__context" id="goal-full-context">
          <div className="goal-card__context-intro">
            <p className="goal-card__context-summary">{full.summary}</p>
            <button type="button" className="goal-card__link goal-card__edit">
              Edit
            </button>
          </div>

          <div className="goal-card__context-grid">
            {full.sections.map((section) => (
              <section key={section.id} className="goal-context-section">
                <h4 className="goal-context-section__title">{section.title}</h4>

                {section.paragraphs?.map((p) => (
                  <p key={p} className="goal-context-section__text">
                    {p}
                  </p>
                ))}

                {section.items && (
                  <dl className="goal-context-section__dl">
                    {section.items.map((item) => (
                      <div key={item.label} className="goal-context-section__row">
                        <dt>{item.label}</dt>
                        <dd>{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {section.bullets && (
                  <ul className="goal-context-section__list">
                    {section.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
