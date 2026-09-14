import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  DEPLOYMENT,
  LATENCY_SERIES,
  SELECTED_TOOLTIP,
} from '../../data/mockData';
import { QuickCaptureButton } from '../interactions/QuickCaptureButton';
import './LatencyChart.css';

interface LatencyChartProps {
  onPaymentPointClick: (anchor: { x: number; y: number }) => void;
  onQuickCapture?: () => void;
}

function DeploymentFlagLabel(props: {
  viewBox?: { x?: number; y?: number; width?: number; height?: number };
}) {
  const x = props.viewBox?.x ?? 0;
  const y = props.viewBox?.y ?? 0;
  const flagWidth = 118;
  const flagHeight = 46;
  // Prefer opening to the left so it doesn't collide with the rising payment line
  const flagX = x - flagWidth - 6;
  const flagY = y + 10;

  return (
    <g className="deployment-flag" pointerEvents="none">
      <line
        x1={x}
        y1={y}
        x2={x}
        y2={flagY + 8}
        stroke="#5b6b82"
        strokeWidth={1.25}
      />
      <path
        d={`M ${x} ${flagY + 8} L ${x - 6} ${flagY + 14} L ${x} ${flagY + 20} Z`}
        fill="#5b6b82"
      />
      <rect
        x={flagX}
        y={flagY}
        width={flagWidth}
        height={flagHeight}
        rx={3}
        fill="#132033"
        stroke="#2f4259"
        strokeWidth={1}
      />
      <line
        x1={flagX + flagWidth}
        y1={flagY + 8}
        x2={x - 6}
        y2={flagY + 14}
        stroke="#5b6b82"
        strokeWidth={1}
      />
      <text
        x={flagX + 10}
        y={flagY + 14}
        fill="#9aa8bc"
        fontSize={9}
        fontWeight={600}
        letterSpacing="0.04em"
      >
        LAST DEPLOYMENT
      </text>
      <text
        x={flagX + 10}
        y={flagY + 28}
        fill="#e8eef6"
        fontSize={12}
        fontWeight={700}
      >
        {DEPLOYMENT.version}
      </text>
      <text
        x={flagX + 10}
        y={flagY + 41}
        fill="#9aa8bc"
        fontSize={10}
      >
        {DEPLOYMENT.when}
      </text>
    </g>
  );
}

function ChartTooltip({
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

  const isSelected = label === SELECTED_TOOLTIP.time;
  const rows = isSelected
    ? SELECTED_TOOLTIP.rows.map((row) => ({
        service: row.service,
        value: row.value,
        delta: row.delta,
        tone: row.tone,
        key: row.service.split('-')[0],
      }))
    : [
        {
          service: 'payment-service',
          value: `${payload.find((p) => p.dataKey === 'payment')?.value ?? '—'} ms`,
          delta: '',
          tone: 'up' as const,
          key: 'payment',
        },
        {
          service: 'checkout-service',
          value: `${payload.find((p) => p.dataKey === 'checkout')?.value ?? '—'} ms`,
          delta: '',
          tone: 'up' as const,
          key: 'checkout',
        },
        {
          service: 'cart-service',
          value: `${payload.find((p) => p.dataKey === 'cart')?.value ?? '—'} ms`,
          delta: '',
          tone: 'down' as const,
          key: 'cart',
        },
      ];

  return (
    <div
      className="chart-tooltip chart-tooltip--interactive"
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
      <div className="chart-tooltip__time">{label}</div>
      <ul className="chart-tooltip__list">
        {rows.map((row) => (
          <li key={row.service} className="chart-tooltip__row">
            <span className={`chart-tooltip__swatch chart-tooltip__swatch--${row.key}`} />
            <span className="chart-tooltip__name">{row.service}</span>
            <span className="chart-tooltip__value">{row.value}</span>
            {row.delta ? (
              <span className={`chart-tooltip__delta is-${row.tone}`}>{row.delta}</span>
            ) : (
              <span className="chart-tooltip__delta" />
            )}
          </li>
        ))}
      </ul>
      <div className="chart-tooltip__hint">Click to capture</div>
    </div>
  );
}

export function LatencyChart({
  onPaymentPointClick,
  onQuickCapture,
}: LatencyChartProps) {
  return (
    <section className="latency-chart">
      <div className="latency-chart__header has-quick-capture">
        <h2 className="latency-chart__title">Latency (p95) — by service</h2>
        {onQuickCapture && (
          <QuickCaptureButton
            label="Add chart as observation"
            onClick={onQuickCapture}
          />
        )}
      </div>

      <div className="latency-chart__canvas">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={LATENCY_SERIES}
            margin={{ top: 28, right: 18, left: 0, bottom: 8 }}
          >
            <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
              interval={5}
              minTickGap={28}
            />
            <YAxis
              domain={[0, 1000]}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={42}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              content={(props) => {
                const payload = (props.payload ?? []) as ReadonlyArray<{
                  dataKey?: string | number;
                  value?: number | string;
                }>;
                return (
                  <ChartTooltip
                    active={props.active}
                    label={typeof props.label === 'string' ? props.label : undefined}
                    payload={payload.map((p) => ({
                      dataKey: p.dataKey != null ? String(p.dataKey) : undefined,
                      value: typeof p.value === 'number' ? p.value : Number(p.value),
                    }))}
                    onCapture={onPaymentPointClick}
                  />
                );
              }}
              cursor={{ stroke: 'var(--border-strong)', strokeDasharray: '3 3' }}
              wrapperStyle={{ outline: 'none', pointerEvents: 'auto' }}
            />
            <ReferenceArea
              x1={DEPLOYMENT.timeLabel}
              x2="12:40"
              fill="var(--post-deploy-fill)"
              strokeOpacity={0}
            />
            <ReferenceLine
              x={DEPLOYMENT.timeLabel}
              stroke="#5b6b82"
              strokeDasharray="4 3"
              strokeWidth={1.25}
              label={(props) => <DeploymentFlagLabel {...props} />}
            />
            <Line
              type="monotone"
              dataKey="cart"
              name="cart-service"
              stroke="var(--chart-cart)"
              strokeWidth={1.75}
              dot={false}
              activeDot={{ r: 3.5 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="checkout"
              name="checkout-service"
              stroke="var(--chart-checkout)"
              strokeWidth={1.75}
              dot={false}
              activeDot={{ r: 3.5 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="payment"
              name="payment-service"
              stroke="var(--chart-payment)"
              strokeWidth={2.25}
              isAnimationActive={false}
              activeDot={(props) => {
                const { cx, cy } = props;
                if (cx == null || cy == null) return null;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill="var(--chart-payment)"
                    stroke="#fff"
                    strokeWidth={2}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPaymentPointClick({ x: e.clientX, y: e.clientY });
                    }}
                  />
                );
              }}
              dot={(props) => {
                const { cx, cy, payload, index } = props;
                if (!payload?.isSelected || cx == null || cy == null) {
                  return <g key={`dot-${index}`} />;
                }
                return (
                  <g key={`dot-${index}`} style={{ cursor: 'pointer' }}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={14}
                      fill="var(--chart-payment)"
                      opacity={0.12}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPaymentPointClick({ x: e.clientX, y: e.clientY });
                      }}
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill="var(--chart-payment)"
                      stroke="#fff"
                      strokeWidth={2}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPaymentPointClick({ x: e.clientX, y: e.clientY });
                      }}
                    />
                  </g>
                );
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="latency-chart__legend" aria-hidden>
        <span className="legend-item">
          <i className="legend-swatch legend-swatch--payment" />
          payment-service
        </span>
        <span className="legend-item">
          <i className="legend-swatch legend-swatch--checkout" />
          checkout-service
        </span>
        <span className="legend-item">
          <i className="legend-swatch legend-swatch--cart" />
          cart-service
        </span>
      </div>
    </section>
  );
}
