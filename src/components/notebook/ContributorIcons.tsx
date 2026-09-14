import { PersonAvatar } from './PersonAvatar';
import './ContributorIcons.css';

export { isAgentName } from './avatarColors';

interface ContributorIconsProps {
  names: string | string[];
}

export function ContributorIcons({ names }: ContributorIconsProps) {
  const list = (Array.isArray(names) ? names : names.split(','))
    .map((n) => n.trim())
    .filter(Boolean);

  return (
    <span className="contributor-icons" aria-hidden>
      {list.map((name) => (
        <PersonAvatar key={name} name={name} size="sm" />
      ))}
    </span>
  );
}
