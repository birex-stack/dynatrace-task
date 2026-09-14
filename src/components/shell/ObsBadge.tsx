import './ObsBadge.css';

interface ObsBadgeProps {
  count: number;
  active?: boolean;
  pulse?: boolean;
  onClick: () => void;
}

export function ObsBadge({
  count,
  active = false,
  pulse = false,
  onClick,
}: ObsBadgeProps) {
  if (count <= 0) return null;

  return (
    <button
      type="button"
      className={`obs-badge ${active ? 'is-active' : ''} ${pulse ? 'is-pulse' : ''}`}
      onClick={onClick}
      aria-label={`Open notebook flyout, ${count} observations`}
      aria-pressed={active}
      title="Open notebook observations"
    >
      {count} {count === 1 ? 'observation' : 'observations'}
    </button>
  );
}
