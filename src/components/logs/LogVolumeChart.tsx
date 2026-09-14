import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  LOG_STATUS_COLORS,
  LOG_TIMESERIES,
  type LogStatus,
} from '../../data/logsData';
import { QuickCaptureButton } from '../interactions/QuickCaptureButton';
import './LogVolumeChart.css';

const SERIES_ORDER: LogStatus[] = ['NONE', 'INFO', 'WARN', 'ERROR'];

interface LogVolumeChartProps {
  enabledStatuses: Set<LogStatus>;
  onPointClick: (anchor: { x: number; y: number }) => void;
  onQuickCapture?: () => void;
}

function formatCount(value: number) {
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return String(value);
}

function VolumeTooltip({
  active,
  label,
  payload,
  onCapture,
}: {
  active?: boolean;
  label?: string;
  payload?: Array<{ dataKey?: string; value?: number }>;
  onCapture: (anchor: { x: number; y: number }) => void;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="log-volume-tooltip"
      onClick={(e) => {
        e.stopPropagation();
        onCapture({ x: e.clientX, y: e.clientY });
      }}
      onMouseDown={(e) => e.stopPropagation()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCapture({ x: 0, y: 0 });
        }
      }}
    >
      <div className="log-volume-tooltip__time">{label}</div>
      <ul className="log-volume-tooltip__list">
        {[...payload].reverse().map((row) => {
          const key = String(row.dataKey ?? '') as LogStatus;
          return (
            <li key={key} className="log-volume-tooltip__row">
              <span
                className="log-volume-tooltip__swatch"
                style={{ background: LOG_STATUS_COLORS[key] }}
              />
              <span className="log-volume-tooltip__name">{key}</span>
              <span className="log-volume-tooltip__value">
                {formatCount(row.value ?? 0)}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="log-volume-tooltip__hint">Click to capture</div>
    </div>
  );
}

export function LogVolumeChart({
  enabledStatuses,
  onPointClick,
  onQuickCapture,
}: LogVolumeChartProps) {
  const visibleSeries = SERIES_ORDER.filter((status) =>
    enabledStatuses.has(status),
  );

  return (
    <section className="log-volume-chart">
      <div className="log-volume-chart__header has-quick-capture">
        <h2 className="log-volume-chart__title">Log volume</h2>
        {onQuickCapture && (
          <QuickCaptureButton
            label="Add chart as observation"
            onClick={onQuickCapture}
          />
        )}
      </div>

      <div className="log-volume-chart__canvas">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart
            data={LOG_TIMESERIES}
            margin={{ top: 12, right: 18, left: 0, bottom: 8 }}
          >
            <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
              minTickGap={28}
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={42}
              tickFormatter={formatCount}
            />
            <Tooltip
              content={(props) => {
                const payload = (props.payload ?? []) as ReadonlyArray<{
                  dataKey?: string | number;
                  value?: number | string;
                }>;
                return (
                  <VolumeTooltip
                    active={props.active}
                    label={
                      typeof props.label === 'string' ? props.label : undefined
                    }
                    payload={payload.map((p) => ({
                      dataKey:
                        p.dataKey != null ? String(p.dataKey) : undefined,
                      value:
                        typeof p.value === 'number'
                          ? p.value
                          : Number(p.value),
                    }))}
                    onCapture={onPointClick}
                  />
                );
              }}
              cursor={{ stroke: 'var(--border-strong)', strokeDasharray: '3 3' }}
              wrapperStyle={{ outline: 'none', pointerEvents: 'auto' }}
            />
            {visibleSeries.map((status) => (
              <Area
                key={status}
                type="monotone"
                dataKey={status}
                stackId="volume"
                stroke={LOG_STATUS_COLORS[status]}
                fill={LOG_STATUS_COLORS[status]}
                fillOpacity={status === 'ERROR' ? 0.55 : 0.35}
                strokeWidth={1.25}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="log-volume-chart__legend" aria-hidden>
        {[...visibleSeries].reverse().map((status) => (
          <span key={status} className="log-volume-legend-item">
            <i
              className="log-volume-legend-swatch"
              style={{ background: LOG_STATUS_COLORS[status] }}
            />
            {status}
          </span>
        ))}
      </div>
    </section>
  );
}
