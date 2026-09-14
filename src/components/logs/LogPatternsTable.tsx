import {
  LOG_PATTERNS,
  LOG_STATUS_COLORS,
  type LogPatternRow,
  type LogStatus,
} from '../../data/logsData';
import { Badge } from '../ui/Badge';
import { QuickCaptureButton } from '../interactions/QuickCaptureButton';
import './LogPatternsTable.css';

interface LogPatternsTableProps {
  enabledStatuses: Set<LogStatus>;
  onErrorRowClick: (anchor: { x: number; y: number }) => void;
  onQuickCapture?: () => void;
}

function badgeTone(status: LogStatus) {
  if (status === 'ERROR') return 'danger' as const;
  if (status === 'WARN') return 'warning' as const;
  if (status === 'INFO') return 'info' as const;
  return 'neutral' as const;
}

function renderPattern(pattern: string, highlights?: string[]) {
  if (!highlights?.length) return pattern;

  const escaped = highlights
    .map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  if (!escaped) return pattern;

  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = pattern.split(regex);

  return parts.map((part, index) => {
    const isHighlight = highlights.some(
      (h) => h.toLowerCase() === part.toLowerCase(),
    );
    if (!isHighlight) return <span key={index}>{part}</span>;
    return (
      <mark key={index} className="log-patterns__highlight">
        {part}
      </mark>
    );
  });
}

export function LogPatternsTable({
  enabledStatuses,
  onErrorRowClick,
  onQuickCapture,
}: LogPatternsTableProps) {
  const rows = LOG_PATTERNS.filter((row) => enabledStatuses.has(row.status));

  return (
    <section className="log-patterns">
      <div className="log-patterns__header has-quick-capture">
        <h2 className="log-patterns__title">Patterns</h2>
        {onQuickCapture && (
          <QuickCaptureButton
            label="Add table as observation"
            onClick={onQuickCapture}
          />
        )}
      </div>
      <div className="log-patterns__scroll">
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Count</th>
              <th>Pattern</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <PatternRow
                key={row.id}
                row={row}
                onErrorRowClick={onErrorRowClick}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PatternRow({
  row,
  onErrorRowClick,
}: {
  row: LogPatternRow;
  onErrorRowClick: (anchor: { x: number; y: number }) => void;
}) {
  const highlighted = row.status === 'ERROR' && row.id === 'p1';

  return (
    <tr
      className={highlighted ? 'is-highlighted' : undefined}
      onClick={(e) => {
        if (row.status !== 'ERROR') return;
        onErrorRowClick({ x: e.clientX, y: e.clientY });
      }}
      style={row.status === 'ERROR' ? { cursor: 'pointer' } : undefined}
    >
      <td>
        <span className="log-patterns__status">
          <span
            className="log-patterns__status-dot"
            style={{ background: LOG_STATUS_COLORS[row.status] }}
            aria-hidden
          />
          <Badge tone={badgeTone(row.status)}>{row.status}</Badge>
        </span>
      </td>
      <td className="is-numeric">{row.count}</td>
      <td>
        <div className="log-patterns__pattern">
          {renderPattern(row.pattern, row.highlights)}
        </div>
      </td>
    </tr>
  );
}
