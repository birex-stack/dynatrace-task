import { DEPLOYMENT } from '../../data/mockData';
import './DeploymentSummary.css';

export function DeploymentSummary() {
  return (
    <div className="deployment-summary">
      <div className="deployment-summary__label">{DEPLOYMENT.label}</div>
      <div className="deployment-summary__row">
        <span className="deployment-summary__version">{DEPLOYMENT.version}</span>
        <span className="deployment-summary__dot" aria-hidden />
        <span className="deployment-summary__when">{DEPLOYMENT.when}</span>
      </div>
    </div>
  );
}
