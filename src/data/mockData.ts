export type ServiceStatus = 'healthy' | 'degraded' | 'critical';

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  delta?: string;
  deltaTone?: 'bad' | 'good' | 'neutral';
  emphasize?: boolean;
}

export interface ServiceRow {
  id: string;
  name: string;
  version: string;
  p95Ms: number;
  errorRate: string;
  throughput: string;
  change: string;
  changeTone: 'up' | 'down' | 'neutral';
  status: ServiceStatus;
  highlighted?: boolean;
}

export interface LatencyPoint {
  time: string;
  minutes: number;
  payment: number;
  checkout: number;
  cart: number;
  isSelected?: boolean;
}

export interface CapturedContext {
  service: string;
  environment: string;
  version: string;
  timeframe: string;
  dashboard: string;
  deployment: string;
}

export const DEPLOYMENT = {
  version: 'v4.28',
  label: 'Last deployment',
  when: 'Today, 11:42',
  timeLabel: '11:42',
  minutes: 102, // 10:00 + 102min = 11:42
};

export const FILTERS = [
  { id: 'range', label: 'Last 2 hours' },
  { id: 'env', label: 'Environment: Production' },
  { id: 'service', label: 'Service: All' },
  { id: 'version', label: 'Version: All' },
];

export const KPIS: KpiMetric[] = [
  { id: 'services', label: 'Services', value: '24' },
  { id: 'error', label: 'Error rate', value: '0.42%' },
  {
    id: 'p95',
    label: 'P95 latency',
    value: '428 ms',
    delta: '+14%',
    deltaTone: 'bad',
    emphasize: true,
  },
  {
    id: 'throughput',
    label: 'Throughput',
    value: '1.2k req/s',
    delta: '+3%',
    deltaTone: 'good',
  },
  { id: 'apdex', label: 'Apdex', value: '0.94' },
];

/** Generate latency series 10:00–12:40 with deployment effect after 11:42 */
function buildLatencySeries(): LatencyPoint[] {
  const points: LatencyPoint[] = [];
  const startHour = 10;
  const endMinutes = 2 * 60 + 40; // 12:40 from 10:00
  const selectedMinutes = 125; // 12:05
  const riseWindow = 55; // minutes from deploy to near-peak

  const minutesToInclude = new Set<number>();
  for (let m = 0; m <= endMinutes; m += 5) minutesToInclude.add(m);
  minutesToInclude.add(DEPLOYMENT.minutes);
  minutesToInclude.add(selectedMinutes);

  const sortedMinutes = [...minutesToInclude].sort((a, b) => a - b);

  for (const m of sortedMinutes) {
    const hour = startHour + Math.floor(m / 60);
    const minute = m % 60;
    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    const afterDeploy = m >= DEPLOYMENT.minutes;

    const wobble = (seed: number, amp = 8) =>
      Math.sin((m + seed) / 11) * amp + Math.cos((m + seed) / 17) * (amp * 0.55);

    let payment: number;
    let checkout: number;
    let cart: number;

    if (!afterDeploy) {
      payment = Math.round(405 + wobble(1, 12));
      checkout = Math.round(306 + wobble(3, 6));
      cart = Math.round(188 + wobble(7, 4));
    } else {
      const t = Math.min(1, (m - DEPLOYMENT.minutes) / riseWindow);
      // Ease-out rise toward ~880–900 ms
      const eased = 1 - (1 - t) ** 1.35;
      payment = Math.round(410 + eased * 480 + wobble(2, 6));
      checkout = Math.round(306 + eased * 8 + wobble(3, 5));
      cart = Math.round(188 - eased * 3 + wobble(7, 3));
    }

    if (m === selectedMinutes) {
      payment = 892;
      checkout = 312;
      cart = 186;
    }

    points.push({
      time,
      minutes: m,
      payment,
      checkout,
      cart,
      isSelected: m === selectedMinutes,
    });
  }

  return points;
}

export const LATENCY_SERIES = buildLatencySeries();

export const SELECTED_POINT = LATENCY_SERIES.find((p) => p.isSelected)!;

export const SELECTED_TOOLTIP = {
  time: '12:05',
  rows: [
    { service: 'payment-service', value: '892 ms', delta: '+14%', tone: 'up' as const },
    { service: 'checkout-service', value: '312 ms', delta: '+2%', tone: 'up' as const },
    { service: 'cart-service', value: '186 ms', delta: '-1%', tone: 'down' as const },
  ],
};

export const SERVICES: ServiceRow[] = [
  {
    id: 'payment-service',
    name: 'payment-service',
    version: 'v4.28',
    p95Ms: 892,
    errorRate: '0.76%',
    throughput: '320 req/s',
    change: '+14%',
    changeTone: 'up',
    status: 'degraded',
    highlighted: true,
  },
  {
    id: 'checkout-service',
    name: 'checkout-service',
    version: 'v4.28',
    p95Ms: 312,
    errorRate: '0.21%',
    throughput: '280 req/s',
    change: '+2%',
    changeTone: 'up',
    status: 'healthy',
  },
  {
    id: 'cart-service',
    name: 'cart-service',
    version: 'v4.28',
    p95Ms: 186,
    errorRate: '0.08%',
    throughput: '420 req/s',
    change: '-1%',
    changeTone: 'down',
    status: 'healthy',
  },
  {
    id: 'frontend',
    name: 'frontend',
    version: 'v4.28',
    p95Ms: 142,
    errorRate: '0.05%',
    throughput: '1.8k req/s',
    change: '0%',
    changeTone: 'neutral',
    status: 'healthy',
  },
  {
    id: 'user-service',
    name: 'user-service',
    version: 'v4.28',
    p95Ms: 96,
    errorRate: '0.04%',
    throughput: '240 req/s',
    change: '-3%',
    changeTone: 'down',
    status: 'healthy',
  },
];

export const PAYMENT_PANEL = {
  name: 'payment-service',
  badge: 'Degraded' as const,
  version: 'v4.28',
  deployedAt: '11:42',
  metrics: [
    { label: 'P95 latency', value: '892 ms', delta: '+14%', tone: 'up' as const },
    { label: 'Error rate', value: '0.76%' },
    { label: 'Throughput', value: '320 req/s' },
  ],
  contributingFactor: {
    title: 'Top contributing factor',
    clue: 'Increased database wait time',
    detail: '+31% compared to previous version',
    disclaimer: 'Clue — not a confirmed root cause',
  },
};

export const NOTEBOOK_TARGET = {
  name: 'Payment rollout investigation',
  defaultObservation:
    'P95 latency increased by 14% after v4.28 rollout',
};

export const NOTEBOOK_OPTIONS = [
  {
    id: 'payment-rollout',
    name: 'Payment rollout investigation',
    recommended: true,
    reason:
      'Recommended because it already covers payment-service in production around this rollout — add this signal to the shared investigation instead of starting a separate notebook.',
  },
  {
    id: 'checkout-latency',
    name: 'Checkout latency watch',
    recommended: false,
  },
  {
    id: 'db-pool-capacity',
    name: 'DB pool capacity review',
    recommended: false,
  },
  {
    id: 'new',
    name: 'Create new notebook…',
    recommended: false,
  },
] as const;

export const OBSERVATION_CONTEXT: CapturedContext = {
  service: 'payment-service',
  environment: 'production',
  version: 'v4.28',
  timeframe: 'Last 2 hours · selected point 12:05',
  dashboard: 'Release Monitoring dashboard',
  deployment: 'deployment at 11:42',
};

export const NAV_ITEMS = [
  { id: 'logs', label: 'Logs' },
  { id: 'dashboards', label: 'Dashboards' },
  { id: 'notebooks', label: 'Notebooks' },
  { id: 'observe', label: 'Observe' },
  { id: 'automations', label: 'Automations' },
  { id: 'settings', label: 'Settings' },
] as const;
