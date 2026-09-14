import { Plus } from 'lucide-react';
import { TEAM, type ActivityItem } from '../../data/notebookData';
import { PersonAvatar } from './PersonAvatar';
import './TeamPanel.css';

interface TeamPanelProps {
  activity: ActivityItem[];
  onViewInChat?: () => void;
}

export function TeamPanel({ activity, onViewInChat }: TeamPanelProps) {
  const humans = TEAM.filter((m) => m.kind === 'human');
  const agents = TEAM.filter((m) => m.kind === 'agent');

  return (
    <aside className="team-panel">
      <section className="team-panel__section">
        <div className="team-panel__title-row">
          <h3 className="team-panel__title">Team</h3>
          <button
            type="button"
            className="team-panel__add"
            aria-label="Add team member"
            title="Add team member"
          >
            <Plus size={14} strokeWidth={2} />
          </button>
        </div>

        <div className="team-group">
          <ul className="team-list">
            {humans.map((member) => (
              <li key={member.id} className="team-member">
                <PersonAvatar name={member.name} kind="human" />
                <span className="team-member__text">
                  <span className="team-member__name">{member.name}</span>
                  <span className="team-member__role">{member.role}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="team-group">
          <div className="team-group__label">AI agents</div>
          <ul className="team-list">
            {agents.map((member) => (
              <li key={member.id} className="team-member">
                <PersonAvatar name={member.name} kind="agent" />
                <span className="team-member__text">
                  <span className="team-member__name">{member.name}</span>
                  <span className="team-member__role">{member.role}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="team-panel__section">
        <h3 className="team-panel__title">Recent activity</h3>
        <ol className="activity-timeline">
          {activity.map((item) => (
            <li key={item.id} className="activity-timeline__item">
              <div className="activity-timeline__rail" aria-hidden>
                <span className="activity-timeline__dot" />
              </div>
              <div className="activity-timeline__content">
                <div className="activity-timeline__top">
                  <PersonAvatar name={item.actor} size="sm" />
                  <time className="activity-timeline__time">{item.time}</time>
                </div>
                <div className="activity-timeline__line">
                  <strong>{item.actor}</strong> {item.action}
                </div>
                <div className="activity-timeline__detail">{item.detail}</div>
                {item.fromChat && onViewInChat && (
                  <button
                    type="button"
                    className="activity-timeline__chat-link"
                    onClick={onViewInChat}
                  >
                    View in chat
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </aside>
  );
}
