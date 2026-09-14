import { useState } from 'react';
import { Badge } from '../ui/Badge';
import { PAYMENT_PANEL } from '../../data/mockData';
import './ServicePanel.css';

const TABS = ['Overview', 'Dependencies', 'Deployments', 'Errors', 'Infrastructure'] as const;

export function ServicePanel() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Overview');
  const panel = PAYMENT_PANEL;

  return (
    <aside className="service-panel" aria-label="Service details">
      <div className="service-panel__head">
        <div className="service-panel__title-row">
          <h2 className="service-panel__name">{panel.name}</h2>
          <Badge tone="warning">{panel.badge}</Badge>
        </div>
        <p className="service-panel__meta">
          Version {panel.version} · Deployed {panel.deployedAt}
        </p>
      </div>

      <div className="service-panel__tabs" role="tablist">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            className={`service-panel__tab ${tab === item ? 'is-active' : ''}`}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === 'Overview' ? (
        <div className="service-panel__body">
          <div className="service-panel__metrics">
            {panel.metrics.map((metric) => (
              <div key={metric.label} className="service-metric">
                <div className="service-metric__label">{metric.label}</div>
                <div className="service-metric__value-row">
                  <span className="service-metric__value">{metric.value}</span>
                  {'delta' in metric && metric.delta && (
                    <span className={`service-metric__delta is-${metric.tone}`}>
                      {metric.delta}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="service-clue">
            <div className="service-clue__label">{panel.contributingFactor.title}</div>
            <div className="service-clue__title">{panel.contributingFactor.clue}</div>
            <div className="service-clue__detail">{panel.contributingFactor.detail}</div>
            <div className="service-clue__disclaimer">
              {panel.contributingFactor.disclaimer}
            </div>
          </div>
        </div>
      ) : (
        <div className="service-panel__placeholder">
          {tab} details are out of scope for this prototype screen.
        </div>
      )}
    </aside>
  );
}
