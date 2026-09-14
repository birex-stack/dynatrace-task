import { Plus } from 'lucide-react';
import type { Decision } from '../../data/notebookData';
import './DecisionsSection.css';

interface DecisionsSectionProps {
  decisions: Decision[];
  onViewInChat?: () => void;
  onAdd?: () => void;
}

export function DecisionsSection({
  decisions,
  onViewInChat,
  onAdd,
}: DecisionsSectionProps) {
  return (
    <section className="decisions">
      <div className="section-head section-head--with-action">
        <h2 className="section-head__title">Decisions</h2>
        <button type="button" className="section-head__add" onClick={onAdd}>
          <Plus size={12} strokeWidth={2} />
          Add decision
        </button>
      </div>
      <div className="decisions__list">
        {decisions.map((decision) => (
          <article key={decision.id} className="decision-card">
            <p className="decision-card__text">{decision.text}</p>
            <p className="decision-card__reason">
              <span>Reason:</span> {decision.reason}
            </p>
            <div className="decision-card__footer">
              <p className="decision-card__meta">
                Decided at {decision.decidedAt} · By {decision.by}
              </p>
              {decision.fromChat && onViewInChat && (
                <button
                  type="button"
                  className="decision-card__chat-link"
                  onClick={onViewInChat}
                >
                  View in chat
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
