import { SparkleIcon } from '../icons/SparkleIcon';
import {
  agentIconColor,
  avatarInitials,
  humanAvatarBg,
  isAgentName,
} from './avatarColors';
import './PersonAvatar.css';

interface PersonAvatarProps {
  name: string;
  kind?: 'human' | 'agent';
  size?: 'sm' | 'md';
  className?: string;
}

export function PersonAvatar({
  name,
  kind,
  size = 'md',
  className = '',
}: PersonAvatarProps) {
  const resolvedKind = kind ?? (isAgentName(name) ? 'agent' : 'human');
  const tone =
    resolvedKind === 'human' ? humanAvatarBg(name) : agentIconColor(name);

  return (
    <span
      className={`person-avatar person-avatar--${resolvedKind} person-avatar--${size} ${className}`.trim()}
      style={
        resolvedKind === 'human'
          ? { background: tone, color: '#fff' }
          : { color: tone }
      }
      aria-hidden
      title={name}
    >
      {resolvedKind === 'agent' ? (
        <SparkleIcon size={size === 'sm' ? 20 : 24} />
      ) : (
        <span className="person-avatar__initials">{avatarInitials(name)}</span>
      )}
    </span>
  );
}
