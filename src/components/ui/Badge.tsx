import './Badge.css';

interface BadgeProps {
  children: string;
  tone?: 'neutral' | 'warning' | 'danger' | 'success' | 'info';
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
