import { useEffect, useRef, useState } from 'react';
import { MoreVertical, Share2 } from 'lucide-react';
import { NotebookIcon } from '../icons/NotebookIcon';
import { Button } from '../ui/Button';
import { Toast } from '../interactions/Toast';
import { NOTEBOOK_META } from '../../data/notebookData';
import { AddAiSkillModal } from './AddAiSkillModal';
import './NotebookHeader.css';

export type NotebookMode = 'document' | 'investigation';

interface NotebookHeaderProps {
  mode: NotebookMode;
  onModeChange: (mode: NotebookMode) => void;
}

const MORE_ACTIONS = [
  { id: 'ai-skill', label: 'Add as AI skill' },
  { id: 'dashboard', label: 'Save as dashboard' },
  { id: 'workflow', label: 'Create workflow' },
  { id: 'runbook', label: 'Save as guide' },
  { id: 'clone', label: 'Clone' },
  { id: 'delete', label: 'Delete', danger: true },
] as const;

export function NotebookHeader({ mode, onModeChange }: NotebookHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="notebook-header">
        <div className="notebook-header__top">
          <div className="notebook-header__left">
            <nav className="notebook-header__breadcrumb" aria-label="Breadcrumb">
              <span className="notebook-header__crumb">Notebooks</span>
              <span className="notebook-header__sep">/</span>
              <span className="notebook-header__crumb is-current">
                {NOTEBOOK_META.title}
              </span>
            </nav>
            <h1 className="notebook-header__title">
              <NotebookIcon size={18} strokeWidth={1.8} />
              <span>{NOTEBOOK_META.title}</span>
            </h1>
            <p className="notebook-header__subtitle">{NOTEBOOK_META.goal}</p>
            <div className="notebook-header__tags">
              {NOTEBOOK_META.tags.map((tag) => (
                <span key={tag} className="notebook-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="notebook-header__actions">
            <span className="notebook-header__updated">
              {NOTEBOOK_META.lastUpdated}
            </span>
            <Button variant="ghost" size="sm" ariaLabel="Share">
              <Share2 size={14} strokeWidth={1.7} />
              Share
            </Button>
            <div className="notebook-header__menu-wrap" ref={menuRef}>
              <Button
                variant="ghost"
                size="sm"
                ariaLabel="More actions"
                className={menuOpen ? 'is-menu-open' : ''}
                onClick={() => setMenuOpen((v) => !v)}
              >
                <MoreVertical size={16} strokeWidth={1.7} />
              </Button>
              {menuOpen && (
                <div className="notebook-header__menu" role="menu">
                  {MORE_ACTIONS.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      role="menuitem"
                      className={`notebook-header__menu-item ${
                        action.id === 'delete' ? 'is-danger' : ''
                      }`}
                      onClick={() => {
                        setMenuOpen(false);
                        if (action.id === 'ai-skill') setSkillModalOpen(true);
                      }}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className="notebook-header__tabs"
          role="tablist"
          aria-label="Notebook view"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'document'}
            className={`notebook-tab ${mode === 'document' ? 'is-active' : ''}`}
            onClick={() => onModeChange('document')}
          >
            Workspace
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'investigation'}
            className={`notebook-tab ${mode === 'investigation' ? 'is-active' : ''}`}
            onClick={() => onModeChange('investigation')}
          >
            Investigation record
          </button>
        </div>
      </header>

      {skillModalOpen && (
        <AddAiSkillModal
          onCancel={() => setSkillModalOpen(false)}
          onConfirm={({ agentName, skillName, mode: skillMode }) => {
            setSkillModalOpen(false);
            setToast(
              skillMode === 'existing'
                ? `Updated skill “${skillName}” for ${agentName}`
                : `Created skill “${skillName}” for ${agentName}`,
            );
          }}
        />
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </>
  );
}
