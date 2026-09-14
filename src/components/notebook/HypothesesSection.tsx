import { useEffect, useRef, useState } from 'react';
import { MoreVertical, Plus } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  statusLabel,
  statusTone,
  type Hypothesis,
  type HypothesisObservation,
} from '../../data/notebookData';
import { ContributorIcons } from './ContributorIcons';
import './HypothesesSection.css';

interface HypothesesSectionProps {
  hypotheses: Hypothesis[];
  expandedId: string | null;
  onToggle: (id: string) => void;
  onConfirm: (id: string) => void;
  onRuleOut: (id: string) => void;
  onKeepOpen: (id: string) => void;
  onAdd?: () => void;
}

export function HypothesesSection({
  hypotheses,
  expandedId,
  onToggle,
  onConfirm,
  onRuleOut,
  onKeepOpen,
  onAdd,
}: HypothesesSectionProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <section className="hypotheses">
      <div className="section-head section-head--with-action">
        <div className="section-head__text">
          <h2 className="section-head__title">Hypotheses</h2>
          <p className="section-head__sub">
            Ranked explanations with linked observations and evidence
          </p>
        </div>
        <button type="button" className="section-head__add" onClick={onAdd}>
          <Plus size={12} strokeWidth={2} />
          Add hypothesis
        </button>
      </div>

      <div className="hypotheses__list">
        {hypotheses.map((hypothesis, index) => {
          const expanded = expandedId === hypothesis.id;
          const supporting = hypothesis.observations.filter(
            (o) => o.kind === 'supporting',
          );
          const contradicting = hypothesis.observations.filter(
            (o) => o.kind === 'contradicting',
          );

          return (
            <article
              key={hypothesis.id}
              className={`hypothesis-row ${expanded ? 'is-expanded' : ''} status-${hypothesis.status}`}
            >
              <button
                type="button"
                className="hypothesis-row__summary"
                onClick={() => onToggle(hypothesis.id)}
                aria-expanded={expanded}
              >
                <span className="hypothesis-row__index">{index + 1}</span>
                <span className="hypothesis-row__body">
                  <span className="hypothesis-row__title">{hypothesis.title}</span>
                  <span className="hypothesis-row__meta">
                    {hypothesis.observations.length} observations
                    {supporting.length > 0 &&
                      ` · ${supporting.length} supporting`}
                    {contradicting.length > 0 &&
                      ` · ${contradicting.length} contradicting`}
                  </span>
                </span>
                <Badge tone={statusTone(hypothesis.status)}>
                  {statusLabel(hypothesis.status)}
                </Badge>
              </button>

              {expanded && (
                <div className="hypothesis-row__detail">
                  <div className="hypothesis-observations">
                    <h4 className="hypothesis-observations__title">
                      Observations & evidence
                    </h4>

                    {supporting.length > 0 && (
                      <div className="hypothesis-observations__group">
                        <div className="hypothesis-observations__group-label is-supporting">
                          Supporting
                        </div>
                        <div className="hypothesis-observations__list">
                          {supporting.map((item) => (
                            <ObservationCard
                              key={item.id}
                              item={item}
                              menuOpen={openMenuId === item.id}
                              onToggleMenu={() =>
                                setOpenMenuId((id) =>
                                  id === item.id ? null : item.id,
                                )
                              }
                              onCloseMenu={() => setOpenMenuId(null)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {contradicting.length > 0 && (
                      <div className="hypothesis-observations__group">
                        <div className="hypothesis-observations__group-label is-contradicting">
                          Contradicting
                        </div>
                        <div className="hypothesis-observations__list">
                          {contradicting.map((item) => (
                            <ObservationCard
                              key={item.id}
                              item={item}
                              menuOpen={openMenuId === item.id}
                              onToggleMenu={() =>
                                setOpenMenuId((id) =>
                                  id === item.id ? null : item.id,
                                )
                              }
                              onCloseMenu={() => setOpenMenuId(null)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {hypothesis.observations.length === 0 && (
                      <p className="hypothesis-empty">No observations yet</p>
                    )}
                  </div>

                  {hypothesis.status !== 'ruled-out' && (
                    <div className="hypothesis-detail__actions">
                      <Button
                        variant="subtle"
                        size="sm"
                        className="hypothesis-action--recommended"
                        onClick={() => onConfirm(hypothesis.id)}
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onRuleOut(hypothesis.id)}
                      >
                        Rule out
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onKeepOpen(hypothesis.id)}
                      >
                        Keep open
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ObservationCard({
  item,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
}: {
  item: HypothesisObservation;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseMenu();
    };
    const onPointer = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onCloseMenu();
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onPointer);
    };
  }, [menuOpen, onCloseMenu]);

  return (
    <article className={`hypothesis-obs-card is-${item.kind}`}>
      <div className="hypothesis-obs-card__content">
        <div className="hypothesis-obs-card__title-row">
          <ContributorIcons names={item.addedBy} />
          <p className="hypothesis-obs-card__text">{item.text}</p>
        </div>
        <div className="hypothesis-obs-card__meta">
          <span>Source: {item.source}</span>
          <span>Time: {item.time}</span>
          <span>Added by: {item.addedBy}</span>
        </div>
      </div>

      <div className="hypothesis-obs-card__menu-wrap" ref={menuRef}>
        <button
          type="button"
          className="hypothesis-obs-card__kebab"
          aria-label="Observation actions"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={onToggleMenu}
        >
          <MoreVertical size={16} strokeWidth={1.7} />
        </button>

        {menuOpen && (
          <div className="hypothesis-obs-card__menu" role="menu">
            <button
              type="button"
              role="menuitem"
              className="hypothesis-obs-card__menu-item is-emphasize"
              onClick={onCloseMenu}
            >
              View details
            </button>
            <button
              type="button"
              role="menuitem"
              className="hypothesis-obs-card__menu-item"
              onClick={onCloseMenu}
            >
              Remove from hypothesis
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
