import { SparkleIcon } from '../icons/SparkleIcon';
import { AI_SUMMARY } from '../../data/notebookData';
import './AiSummaryCard.css';

export function AiSummaryCard() {
  return (
    <section className="ai-summary" aria-labelledby="ai-summary-title">
      <div className="ai-summary__glow" aria-hidden />

      <div className="ai-summary__content">
        <header className="ai-summary__head">
          <div className="ai-summary__title-row">
            <SparkleIcon size={16} className="ai-summary__sparkle" color="#b8f0ff" />
            <h2 id="ai-summary-title" className="ai-summary__title">AI Summary</h2>
            <span className="ai-summary__badge">Beta</span>
          </div>
          <p className="ai-summary__sub">Key insights from this investigation</p>
        </header>

        <div className="ai-summary__body">
          {AI_SUMMARY.summary.map((paragraph) => (
            <p key={paragraph} className="ai-summary__text">{paragraph}</p>
          ))}
        </div>

        <div className="ai-summary__points">
          <h3 className="ai-summary__points-label">Key points</h3>
          <ul className="ai-summary__list">
            {AI_SUMMARY.keyPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
