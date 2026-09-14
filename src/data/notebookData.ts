export type HypothesisStatus = 'supported' | 'conflicting' | 'ruled-out';
export type EvidenceSource = 'Dashboard' | 'Logs' | 'Traces' | 'Events' | 'Metrics';

export interface HypothesisObservation {
  id: string;
  text: string;
  kind: 'supporting' | 'contradicting';
  source: EvidenceSource;
  time: string;
  addedBy: string;
  highlight?: boolean;
}

export interface Hypothesis {
  id: string;
  title: string;
  status: HypothesisStatus;
  observations: HypothesisObservation[];
  contributors: string[];
  sourceLinks: string[];
}

export interface Finding {
  id: string;
  kind: 'confirmed' | 'open';
  body: string;
  meta?: string;
  confirmedBy: string;
}

export interface OpenQuestion {
  id: string;
  text: string;
}

export interface Decision {
  id: string;
  text: string;
  reason: string;
  decidedAt: string;
  by: string;
  fromChat?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  kind: 'human' | 'agent';
}

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  detail: string;
  time: string;
  fromChat?: boolean;
}

export const NOTEBOOK_META = {
  title: 'Payment rollout investigation',
  goal: 'Is v4.28 safe to continue?',
  lastUpdated: 'Last updated 5 min ago',
  tags: ['payment-service', 'production', 'v4.28', 'release'] as const,
  context: {
    service: 'payment-service',
    environment: 'production',
    version: 'v4.28',
    timeframe: '11:42–12:20 today',
  },
  fullContext: {
    summary:
      'Decide whether the payment-service v4.28 canary is safe to expand beyond the current 20% rollout, given a post-deploy p95 latency rise that is not yet a confirmed incident.',
    sections: [
      {
        id: 'trigger',
        title: 'Trigger',
        paragraphs: [
          'At 11:42, payment-service v4.28 started rolling out to production. Within minutes, Release Monitoring showed p95 latency climbing on payment while checkout and cart stayed near baseline.',
          'The investigation was opened from the Release Monitoring dashboard after capturing the latency anomaly as an observation — not from a paging incident.',
        ],
      },
      {
        id: 'scope',
        title: 'Scope',
        items: [
          { label: 'Primary service', value: 'payment-service' },
          { label: 'Environment', value: 'production' },
          { label: 'Release / version', value: 'v4.28 canary · currently ~20%' },
          { label: 'Time window', value: '11:42–12:20 today (deploy + ~40 min)' },
          {
            label: 'Related services',
            value: 'checkout-service, cart-service (comparison only)',
          },
          {
            label: 'Signal sources',
            value: 'Release Monitoring, traces, logs, deployment events',
          },
        ],
      },
      {
        id: 'symptom',
        title: 'Leading symptom',
        paragraphs: [
          'payment-service p95 rose from ~410 ms baseline to ~892 ms (+118%). Error rate remained roughly stable (~0.76%). Throughput is nearly flat.',
          'Early evidence points at database connection-pool pressure (pool exhausted events, DB wait +31%), which may or may not be caused by the deploy itself.',
        ],
        bullets: [
          'Authorize and capture endpoints contribute most of the p95 increase',
          'Sibling services did not show a matching regression',
          'Pool exhaustion may have started before traffic reached v4.28',
        ],
      },
      {
        id: 'decision',
        title: 'Decision to make',
        paragraphs: [
          'The team needs a clear go / no-go on expanding the canary. Continuing blindly risks compounding pool pressure; freezing forever blocks a release that might be unrelated to the root cause.',
        ],
        bullets: [
          'Expand beyond 20% only if deployment is ruled out and remaining risk is understood',
          'Hold or roll back if the binary/config change is the likely cause',
          'Keep at 20% while validating a non-deploy explanation (e.g. background workload)',
        ],
      },
      {
        id: 'constraints',
        title: 'Constraints & assumptions',
        bullets: [
          'No confirmed SEV / customer-facing outage yet — treat as proactive release risk',
          'Maciej K. is the decision owner; Anna S. (service owner) and Piotr W. (SRE) are active reviewers',
          'AI agents may propose evidence and hypotheses, but humans confirm decisions',
          'Do not change production pool size or kill workloads from this notebook alone',
        ],
      },
      {
        id: 'out-of-scope',
        title: 'Out of scope (for now)',
        bullets: [
          'Broader multi-region capacity planning',
          'Non-payment services except as latency baselines',
          'Long-term schema or ORM redesign work',
          'Customer communication / status page updates',
        ],
      },
    ],
  },
};

export const AI_SUMMARY = {
  summary: [
    'payment-service v4.28 shows a clear p95 latency regression after the 11:42 deploy, but sibling services stayed flat and error rate remained stable.',
    'The strongest explanation is connection pool saturation — supported by traces, logs, and DB wait metrics — while the deployment-as-root-cause hypothesis is now conflicting because pool pressure started before rollout.',
    'The team should hold the canary at 20% until the pre-deploy workload and pool consumers around 11:39–11:42 are validated.',
  ],
  keyPoints: [
    'P95 latency up ~118% on payment-service; checkout and cart unchanged',
    'Pool exhaustion and DB wait (+31%) are the top contributing signals',
    'Deployment regression hypothesis weakened by evidence predating rollout',
    'Current decision: investigate further — do not expand rollout yet',
  ],
};

export const INITIAL_HYPOTHESES: Hypothesis[] = [
  {
    id: 'hyp-pool',
    title: 'Connection pool saturation is causing the latency increase',
    status: 'supported',
    observations: [
      {
        id: 'hp-o1',
        text: 'P95 latency increased by 14% after rollout',
        kind: 'supporting',
        source: 'Dashboard',
        time: '11:43',
        addedBy: 'Maciej K.',
        highlight: true,
      },
      {
        id: 'hp-o2',
        text: 'Database connection pool exhausted events increased',
        kind: 'supporting',
        source: 'Logs',
        time: '11:46',
        addedBy: 'Logs Agent',
      },
      {
        id: 'hp-o3',
        text: 'DB wait time increased by 31%',
        kind: 'supporting',
        source: 'Traces',
        time: '11:48',
        addedBy: 'Trace Agent',
      },
    ],
    contributors: ['Trace Agent', 'Logs Agent', 'Maciej K.'],
    sourceLinks: ['payment-service traces', 'DB pool logs', 'Release Monitoring'],
  },
  {
    id: 'hyp-deploy',
    title: 'The deployment itself introduced the regression',
    status: 'conflicting',
    observations: [
      {
        id: 'hd-o1',
        text: 'Latency increased close to deployment time',
        kind: 'supporting',
        source: 'Dashboard',
        time: '11:43',
        addedBy: 'Maciej K.',
      },
      {
        id: 'hd-o2',
        text: 'Only v4.28 shows regression',
        kind: 'supporting',
        source: 'Dashboard',
        time: '11:45',
        addedBy: 'Deployment Agent',
      },
      {
        id: 'hd-o3',
        text: 'Connection pool exhaustion started 94 seconds before rollout',
        kind: 'contradicting',
        source: 'Logs',
        time: '11:46',
        addedBy: 'Logs Agent',
      },
      {
        id: 'hd-o4',
        text: 'DB wait increase also predates rollout',
        kind: 'contradicting',
        source: 'Traces',
        time: '11:48',
        addedBy: 'Trace Agent',
      },
    ],
    contributors: ['Deployment Agent', 'Trace Agent', 'Anna S.'],
    sourceLinks: ['Deployment timeline', 'Trace comparison', 'Pool saturation logs'],
  },
  {
    id: 'hyp-traffic',
    title: 'Increased traffic is the primary cause',
    status: 'ruled-out',
    observations: [
      {
        id: 'ht-o1',
        text: 'Throughput rose slightly (+3%) during the window',
        kind: 'supporting',
        source: 'Metrics',
        time: '11:44',
        addedBy: 'Analysis Agent',
      },
      {
        id: 'ht-o2',
        text: 'Error rate remains stable',
        kind: 'contradicting',
        source: 'Dashboard',
        time: '11:50',
        addedBy: 'Anna S.',
      },
      {
        id: 'ht-o3',
        text: 'Checkout completion remains stable',
        kind: 'contradicting',
        source: 'Dashboard',
        time: '11:52',
        addedBy: 'Analysis Agent',
      },
    ],
    contributors: ['Analysis Agent', 'Anna S.'],
    sourceLinks: ['Throughput series', 'Historical baselines'],
  },
];

export const INITIAL_FINDINGS: Finding[] = [
  {
    id: 'find-1',
    kind: 'confirmed',
    body: 'Connection pool saturation is the dominant contributor to the latency increase.',
    meta: 'Based on traces, logs, and DB metrics. · 3 supporting observations',
    confirmedBy: 'Trace Agent, Logs Agent, Maciej K.',
  },
  {
    id: 'find-2',
    kind: 'open',
    body: 'No significant impact on error rate or checkout completion',
    meta: 'Error rate and checkout KPIs remain within baseline',
    confirmedBy: 'Anna S., Analysis Agent',
  },
];

export const INITIAL_QUESTIONS: OpenQuestion[] = [
  {
    id: 'q-1',
    text: 'Why did connection pool exhaustion start before the full rollout?',
  },
  {
    id: 'q-2',
    text: 'Are any other services affected?',
  },
];

export const INITIAL_DECISIONS: Decision[] = [
  {
    id: 'dec-1',
    text: 'Continue investigation. Do not expand rollout yet.',
    reason: 'Latency impact is significant and not fully understood.',
    decidedAt: '12:05',
    by: 'Maciej K.',
  },
];

export const TEAM: TeamMember[] = [
  {
    id: 't-maciej',
    name: 'Maciej K.',
    role: 'Investigation lead',
    kind: 'human',
  },
  {
    id: 't-anna',
    name: 'Anna S.',
    role: 'Service owner',
    kind: 'human',
  },
  {
    id: 't-piotr',
    name: 'Piotr W.',
    role: 'SRE on-call',
    kind: 'human',
  },
  {
    id: 't-trace',
    name: 'Trace Agent',
    role: 'Analyzing distributed traces',
    kind: 'agent',
  },
  {
    id: 't-logs',
    name: 'Logs Agent',
    role: 'Scanning logs for anomalies',
    kind: 'agent',
  },
  {
    id: 't-deploy',
    name: 'Deployment Agent',
    role: 'Reviewing deployment and config deltas',
    kind: 'agent',
  },
  {
    id: 't-analysis',
    name: 'Analysis Agent',
    role: 'Correlating metrics and events',
    kind: 'agent',
  },
];

export const INITIAL_ACTIVITY: ActivityItem[] = [
  {
    id: 'act-1',
    actor: 'Logs Agent',
    action: 'added an observation',
    detail: 'Database connection pool exhausted…',
    time: '12:16',
  },
  {
    id: 'act-2',
    actor: 'Anna S.',
    action: 'challenged a hypothesis',
    detail: 'Is this caused by the deployment?',
    time: '12:11',
  },
  {
    id: 'act-3',
    actor: 'Trace Agent',
    action: 'added evidence',
    detail: 'DB wait time increased by 31%',
    time: '12:04',
  },
  {
    id: 'act-4',
    actor: 'Maciej K.',
    action: 'created a decision',
    detail: 'Do not expand rollout yet.',
    time: '11:58',
  },
];

export interface DocumentKpiItem {
  label: string;
  value: string;
  delta?: string;
  tone?: 'bad' | 'good' | 'neutral';
}

export interface DocumentTableData {
  columns: string[];
  rows: string[][];
  highlightRow?: number;
}

export interface DocumentChartPoint {
  time: string;
  [key: string]: string | number;
}

export type DocumentSection =
  | {
      id: string;
      type: 'markdown';
      title: string;
      body: string;
      bullets?: string[];
      chips?: string[];
    }
  | {
      id: string;
      type: 'prompt';
      title: string;
      body: string;
    }
  | {
      id: string;
      type: 'dql';
      title: string;
      query: string;
      result?: string;
      table?: DocumentTableData;
    }
  | {
      id: string;
      type: 'kpi';
      title: string;
      items: DocumentKpiItem[];
    }
  | {
      id: string;
      type: 'chart';
      title: string;
      caption: string;
      yLabel: string;
      series: { key: string; label: string; color: string }[];
      data: DocumentChartPoint[];
      markerTime?: string;
    }
  | {
      id: string;
      type: 'table';
      title: string;
      caption?: string;
      table: DocumentTableData;
    }
  | {
      id: string;
      type: 'result';
      title: string;
      body: string;
      bullets?: string[];
    };

export const DOC_LATENCY_SERIES: DocumentChartPoint[] = [
  { time: '11:20', payment: 405, checkout: 210, cart: 165 },
  { time: '11:30', payment: 412, checkout: 208, cart: 170 },
  { time: '11:40', payment: 418, checkout: 215, cart: 168 },
  { time: '11:42', payment: 455, checkout: 220, cart: 172 },
  { time: '11:50', payment: 620, checkout: 235, cart: 178 },
  { time: '12:00', payment: 780, checkout: 248, cart: 182 },
  { time: '12:10', payment: 860, checkout: 255, cart: 185 },
  { time: '12:20', payment: 892, checkout: 260, cart: 188 },
];

export const DOC_POOL_SERIES: DocumentChartPoint[] = [
  { time: '11:20', inUse: 42, waiting: 0, max: 80 },
  { time: '11:30', inUse: 48, waiting: 0, max: 80 },
  { time: '11:40', inUse: 61, waiting: 2, max: 80 },
  { time: '11:42', inUse: 74, waiting: 8, max: 80 },
  { time: '11:50', inUse: 80, waiting: 22, max: 80 },
  { time: '12:00', inUse: 80, waiting: 31, max: 80 },
  { time: '12:10', inUse: 79, waiting: 28, max: 80 },
  { time: '12:20', inUse: 80, waiting: 34, max: 80 },
];

export const DOC_ERROR_SERIES: DocumentChartPoint[] = [
  { time: '11:20', errors: 0.72, timeouts: 0.08 },
  { time: '11:30', errors: 0.74, timeouts: 0.09 },
  { time: '11:40', errors: 0.71, timeouts: 0.1 },
  { time: '11:42', errors: 0.75, timeouts: 0.14 },
  { time: '11:50', errors: 0.78, timeouts: 0.22 },
  { time: '12:00', errors: 0.76, timeouts: 0.29 },
  { time: '12:10', errors: 0.77, timeouts: 0.31 },
  { time: '12:20', errors: 0.76, timeouts: 0.33 },
];

export const DOCUMENT_SECTIONS: DocumentSection[] = [
  {
    id: 'md-1',
    type: 'markdown',
    title: 'Investigation goal',
    body: 'Determine whether **payment-service v4.28** is safe to continue rolling out to production. Focus on latency regression after the 11:42 deploy and whether connection-pool saturation is the root cause.',
    chips: ['payment-service', 'production', 'v4.28', '11:42–12:20'],
    bullets: [
      'Hold further canary expansion until pool pressure is explained',
      'Compare p95 vs baseline for payment, checkout, and cart',
      'Validate whether pool exhaustion started before the binary rolled out',
    ],
  },
  {
    id: 'prompt-1',
    type: 'prompt',
    title: 'Prompt',
    body: 'Summarize latency, error rate, and throughput for payment-service after the 11:42 deployment. Highlight anything that diverges from checkout and cart.',
  },
  {
    id: 'kpi-1',
    type: 'kpi',
    title: 'Post-deploy snapshot',
    items: [
      { label: 'P95 latency', value: '892 ms', delta: '+118%', tone: 'bad' },
      { label: 'Error rate', value: '0.76%', delta: '+0.04pp', tone: 'neutral' },
      { label: 'Throughput', value: '1.18k rps', delta: '-2%', tone: 'neutral' },
      { label: 'Pool wait', value: '34', delta: '+34', tone: 'bad' },
      { label: 'Apdex', value: '0.81', delta: '-0.13', tone: 'bad' },
    ],
  },
  {
    id: 'dql-1',
    type: 'dql',
    title: 'DQL · latency by service',
    query:
      'timeseries avg(dt.service.request.response_time), by:{dt.entity.service}\n| filter contains(dt.entity.service, "payment") or contains(dt.entity.service, "checkout") or contains(dt.entity.service, "cart")\n| timeframe from: -2h',
    result:
      'P95 latency rose from ~410 ms to 892 ms after 11:42 on payment-service. Checkout and cart remain near baseline. Error rate stable at 0.76%.',
    table: {
      columns: ['Service', 'Baseline p95', 'Current p95', 'Δ', 'Error rate', 'Status'],
      rows: [
        ['payment-service', '410 ms', '892 ms', '+118%', '0.76%', 'Degraded'],
        ['checkout-service', '210 ms', '260 ms', '+24%', '0.31%', 'Watch'],
        ['cart-service', '165 ms', '188 ms', '+14%', '0.18%', 'Healthy'],
      ],
      highlightRow: 0,
    },
  },
  {
    id: 'chart-1',
    type: 'chart',
    title: 'Latency · p95 by service',
    caption: 'Deployment marker at 11:42 · payment diverges while siblings stay flat',
    yLabel: 'ms',
    markerTime: '11:42',
    series: [
      { key: 'payment', label: 'payment-service', color: '#d64545' },
      { key: 'checkout', label: 'checkout-service', color: '#1f8a5b' },
      { key: 'cart', label: 'cart-service', color: '#5b6f8c' },
    ],
    data: DOC_LATENCY_SERIES,
  },
  {
    id: 'table-1',
    type: 'table',
    title: 'Top slow endpoints · payment-service',
    caption: 'Last 40 minutes · sorted by p95 contribution',
    table: {
      columns: ['Endpoint', 'Calls', 'p95', 'p99', 'DB wait share', 'Errors'],
      rows: [
        ['POST /payments/authorize', '48.2k', '1.12 s', '1.84 s', '61%', '0.9%'],
        ['POST /payments/capture', '31.6k', '980 ms', '1.41 s', '54%', '0.6%'],
        ['GET /payments/{id}', '22.1k', '410 ms', '620 ms', '18%', '0.2%'],
        ['POST /refunds', '4.8k', '760 ms', '1.05 s', '33%', '1.1%'],
      ],
      highlightRow: 0,
    },
  },
  {
    id: 'md-2',
    type: 'markdown',
    title: 'Observation · Release Monitoring',
    body: 'Captured from the Release Monitoring dashboard after clicking the payment-service series at **11:48**.',
    bullets: [
      'P95 latency increased by **14%** within 6 minutes of v4.28 rollout start',
      'No matching spike in checkout completion or global error budget burn',
      'Added to notebook as supporting evidence for connection-pool hypothesis',
    ],
  },
  {
    id: 'prompt-2',
    type: 'prompt',
    title: 'Prompt',
    body: 'What changed in database wait time and connection pool behavior around the rollout? Did saturation start before the deploy finished?',
  },
  {
    id: 'chart-2',
    type: 'chart',
    title: 'Connection pool · in use vs waiting',
    caption: 'Pool max = 80 · waiting clients climb before and after 11:42',
    yLabel: 'connections',
    markerTime: '11:42',
    series: [
      { key: 'inUse', label: 'In use', color: '#1473e6' },
      { key: 'waiting', label: 'Waiting', color: '#c47a12' },
      { key: 'max', label: 'Max pool', color: '#9aa5b5' },
    ],
    data: DOC_POOL_SERIES,
  },
  {
    id: 'table-2',
    type: 'table',
    title: 'Pool exhaustion events',
    caption: 'Events begin ~94s before rollout completes',
    table: {
      columns: ['Time', 'Event', 'In use', 'Waiting', 'Host', 'Severity'],
      rows: [
        ['11:40:28', 'Pool high watermark', '61 / 80', '2', 'pay-3a', 'Info'],
        ['11:41:06', 'Acquire timeout risk', '72 / 80', '6', 'pay-3a', 'Warning'],
        ['11:41:48', 'Pool exhausted', '80 / 80', '14', 'pay-3a', 'Critical'],
        ['11:42:12', 'Pool exhausted', '80 / 80', '22', 'pay-3b', 'Critical'],
        ['11:50:04', 'Sustained wait queue', '80 / 80', '31', 'pay-3a', 'Critical'],
      ],
      highlightRow: 2,
    },
  },
  {
    id: 'chart-3',
    type: 'chart',
    title: 'Errors vs request timeouts',
    caption: 'HTTP error rate stays flat; timeouts track pool wait pressure',
    yLabel: '%',
    markerTime: '11:42',
    series: [
      { key: 'errors', label: 'Error rate', color: '#5b6f8c' },
      { key: 'timeouts', label: 'Timeouts', color: '#d64545' },
    ],
    data: DOC_ERROR_SERIES,
  },
  {
    id: 'dql-2',
    type: 'dql',
    title: 'DQL · DB wait contribution',
    query:
      'fetch spans\n| filter dt.entity.service == "payment-service"\n| filter contains(span.name, "jdbc")\n| summarize avg(duration), by:{bin(timestamp, 5m)}',
    result:
      'Average JDBC span duration up +31% after 11:40. Wait-for-connection spans dominate authorize and capture endpoints.',
    table: {
      columns: ['Window', 'JDBC avg', 'Wait-for-conn', 'Query exec', 'Share waiting'],
      rows: [
        ['11:20–11:40', '86 ms', '12 ms', '74 ms', '14%'],
        ['11:40–12:00', '118 ms', '41 ms', '77 ms', '35%'],
        ['12:00–12:20', '129 ms', '52 ms', '77 ms', '40%'],
      ],
      highlightRow: 2,
    },
  },
  {
    id: 'result-2',
    type: 'result',
    title: 'Working conclusion',
    body: 'DB wait +31%. Pool exhaustion events begin ~94s before rollout completes. Saturation is therefore unlikely to be introduced solely by the new binary — look for traffic shape, pool sizing, or a latent leak amplified by the deploy.',
    bullets: [
      'Keep canary paused; do not expand beyond current stage',
      'Primary hypothesis: connection pool saturation → latency',
      'Secondary check: pre-deploy pool pressure on pay-3a / pay-3b',
    ],
  },
];

export function statusLabel(status: HypothesisStatus): string {
  switch (status) {
    case 'supported':
      return 'Supported';
    case 'conflicting':
      return 'Conflicting';
    case 'ruled-out':
      return 'Ruled out';
  }
}

export function statusTone(
  status: HypothesisStatus,
): 'success' | 'warning' | 'neutral' {
  switch (status) {
    case 'supported':
      return 'success';
    case 'conflicting':
      return 'warning';
    case 'ruled-out':
      return 'neutral';
  }
}
