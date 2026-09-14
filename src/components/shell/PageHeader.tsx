import type { LucideIcon } from 'lucide-react';
import { HelpCircle, MoreVertical, Share2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { ObsBadge } from './ObsBadge';
import './PageHeader.css';

interface ObservationBadgeProps {
  count: number;
  active: boolean;
  pulse?: boolean;
  onClick: () => void;
}

interface PageHeaderProps {
  breadcrumb: string[];
  title: string;
  subtitle: string;
  titleIcon?: LucideIcon;
  observationBadge?: ObservationBadgeProps;
}

export function PageHeader({
  breadcrumb,
  title,
  subtitle,
  titleIcon: TitleIcon,
  observationBadge,
}: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__left">
        <nav className="page-header__breadcrumb" aria-label="Breadcrumb">
          {breadcrumb.map((crumb, index) => (
            <span key={crumb} className="page-header__crumb-wrap">
              {index > 0 && <span className="page-header__sep">/</span>}
              <span
                className={
                  index === breadcrumb.length - 1
                    ? 'page-header__crumb is-current'
                    : 'page-header__crumb'
                }
              >
                {crumb}
              </span>
            </span>
          ))}
        </nav>
        <div className="page-header__titles">
          <h1 className="page-header__title">
            {TitleIcon && (
              <TitleIcon size={18} strokeWidth={1.8} aria-hidden />
            )}
            <span>{title}</span>
          </h1>
          <p className="page-header__subtitle">{subtitle}</p>
        </div>
      </div>
      <div className="page-header__actions">
        <Button variant="ghost" size="sm" ariaLabel="Share">
          <Share2 size={14} strokeWidth={1.7} />
          Share
        </Button>
        <Button variant="ghost" size="sm" ariaLabel="More actions">
          <MoreVertical size={16} strokeWidth={1.7} />
        </Button>
        <button
          type="button"
          className="page-header__help"
          aria-label="Help"
        >
          <HelpCircle size={16} strokeWidth={1.7} />
        </button>
        {observationBadge && (
          <ObsBadge
            count={observationBadge.count}
            active={observationBadge.active}
            pulse={observationBadge.pulse}
            onClick={observationBadge.onClick}
          />
        )}
      </div>
    </header>
  );
}
