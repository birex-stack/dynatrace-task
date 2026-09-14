import { useEffect, useRef, useState } from 'react';
import { MoreVertical, Plus } from 'lucide-react';
import type { Finding } from '../../data/notebookData';
import { ContributorIcons } from './ContributorIcons';
import './FindingsSection.css';

interface FindingsSectionProps {
  findings: Finding[];
  onAdd?: () => void;
}

export function FindingsSection({ findings, onAdd }: FindingsSectionProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <section className="findings">
      <div className="section-head section-head--with-action">
        <h2 className="section-head__title">Other findings</h2>
        <button type="button" className="section-head__add" onClick={onAdd}>
          <Plus size={12} strokeWidth={2} />
          Add finding
        </button>
      </div>
      <div className="findings__list">
        {findings.map((finding) => (
          <FindingCard
            key={finding.id}
            finding={finding}
            menuOpen={openMenuId === finding.id}
            onToggleMenu={() =>
              setOpenMenuId((id) => (id === finding.id ? null : finding.id))
            }
            onCloseMenu={() => setOpenMenuId(null)}
          />
        ))}
      </div>
    </section>
  );
}

function FindingCard({
  finding,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
}: {
  finding: Finding;
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
    <article className={`finding-card is-${finding.kind}`}>
      <div className="finding-card__content">
        <div className="finding-card__title-row">
          {finding.kind === 'confirmed' && (
            <ContributorIcons names={finding.confirmedBy} />
          )}
          <p className="finding-card__body">{finding.body}</p>
        </div>
        <div className="finding-card__meta">
          <span>
            {finding.kind === 'confirmed'
              ? `Confirmed by: ${finding.confirmedBy}`
              : 'Unconfirmed'}
          </span>
          {finding.meta && <span>{finding.meta}</span>}
        </div>
      </div>

      <div className="finding-card__menu-wrap" ref={menuRef}>
        <button
          type="button"
          className="finding-card__kebab"
          aria-label="Finding actions"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={onToggleMenu}
        >
          <MoreVertical size={16} strokeWidth={1.7} />
        </button>

        {menuOpen && (
          <div className="finding-card__menu" role="menu">
            {finding.kind === 'open' && (
              <button
                type="button"
                role="menuitem"
                className="finding-card__menu-item is-emphasize"
                onClick={onCloseMenu}
              >
                Confirm
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              className={`finding-card__menu-item ${finding.kind === 'confirmed' ? 'is-emphasize' : ''}`}
              onClick={onCloseMenu}
            >
              Add to hypothesis
            </button>
            <button
              type="button"
              role="menuitem"
              className="finding-card__menu-item"
              onClick={onCloseMenu}
            >
              View details
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
