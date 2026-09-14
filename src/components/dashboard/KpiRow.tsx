import { KPIS } from '../../data/mockData';
import { DeploymentSummary } from './DeploymentSummary';
import './KpiRow.css';

export function KpiRow() {
  return (
    <div className="kpi-row">
      <DeploymentSummary />
      {KPIS.map((kpi) => (
        <article
          key={kpi.id}
          className={`kpi-card ${kpi.emphasize ? 'kpi-card--emphasize' : ''}`}
        >
          <div className="kpi-card__label">{kpi.label}</div>
          <div className="kpi-card__value-row">
            <span className="kpi-card__value">{kpi.value}</span>
            {kpi.delta && (
              <span className={`kpi-card__delta kpi-card__delta--${kpi.deltaTone}`}>
                {kpi.delta}
              </span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
