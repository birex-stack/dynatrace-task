export type LogStatus = 'ERROR' | 'WARN' | 'INFO' | 'NONE';

export interface LogFacetGroup {
  id: string;
  label: string;
  open?: boolean;
  items?: { id: string; label: string; count: string; checked?: boolean }[];
}

export interface LogTimeseriesPoint {
  time: string;
  INFO: number;
  WARN: number;
  ERROR: number;
  NONE: number;
}

export interface LogPatternRow {
  id: string;
  status: LogStatus;
  count: string;
  pattern: string;
  highlights?: string[];
}

export const LOG_FACETS: LogFacetGroup[] = [
  {
    id: 'core',
    label: 'Core',
    open: true,
    items: [
      { id: 'none', label: 'NONE', count: '~928K', checked: true },
      { id: 'info', label: 'INFO', count: '~421K', checked: true },
      { id: 'error', label: 'ERROR', count: '~7K', checked: true },
      { id: 'warn', label: 'WARN', count: '~1K', checked: true },
    ],
  },
  { id: 'log-source', label: 'Log source' },
  { id: 'k8s', label: 'Kubernetes' },
  { id: 'k8s-ns', label: 'Kubernetes namespace labels' },
  { id: 'process', label: 'Process' },
  { id: 'host', label: 'Host' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'aws', label: 'AWS' },
  { id: 'azure', label: 'Azure' },
  { id: 'gcp', label: 'GCP' },
];

export const LOG_TIMESERIES: LogTimeseriesPoint[] = [
  { time: '21:45', INFO: 28000, WARN: 1200, ERROR: 1800, NONE: 9000 },
  { time: '21:48', INFO: 31000, WARN: 900, ERROR: 2200, NONE: 8500 },
  { time: '21:51', INFO: 26500, WARN: 1400, ERROR: 3100, NONE: 9200 },
  { time: '21:54', INFO: 34000, WARN: 1100, ERROR: 2500, NONE: 8800 },
  { time: '21:57', INFO: 29500, WARN: 1600, ERROR: 4200, NONE: 9500 },
  { time: '22:00', INFO: 36000, WARN: 1300, ERROR: 3800, NONE: 9100 },
  { time: '22:03', INFO: 32000, WARN: 1500, ERROR: 5100, NONE: 8700 },
  { time: '22:06', INFO: 27500, WARN: 1800, ERROR: 4600, NONE: 9300 },
  { time: '22:09', INFO: 35000, WARN: 1200, ERROR: 2900, NONE: 8900 },
  { time: '22:12', INFO: 30000, WARN: 1000, ERROR: 2100, NONE: 8600 },
];

export const LOG_PATTERNS: LogPatternRow[] = [
  {
    id: 'p1',
    status: 'ERROR',
    count: '2K',
    pattern: 'unavailable: upstream dependency not responding <*>',
    highlights: ['unavailable', 'upstream dependency'],
  },
  {
    id: 'p2',
    status: 'ERROR',
    count: '1K',
    pattern: 'RuntimeError: Service unavailable after retry budget exhausted',
    highlights: ['RuntimeError', 'Service unavailable'],
  },
  {
    id: 'p3',
    status: 'ERROR',
    count: '842',
    pattern: 'payment authorize failed: connection wait exceeded <*> ms',
    highlights: ['payment authorize failed', 'connection wait'],
  },
  {
    id: 'p4',
    status: 'WARN',
    count: '611',
    pattern: 'pool almost exhausted: active=<*> max=<*>',
    highlights: ['pool almost exhausted'],
  },
  {
    id: 'p5',
    status: 'ERROR',
    count: '482',
    pattern: 'timeout while waiting for db connection from pool',
    highlights: ['timeout', 'db connection'],
  },
  {
    id: 'p6',
    status: 'INFO',
    count: '318',
    pattern: 'canary rollout progress: version=v4.28 traffic=<*>',
    highlights: ['canary rollout', 'v4.28'],
  },
  {
    id: 'p7',
    status: 'ERROR',
    count: '274',
    pattern: 'circuit breaker open for checkout-service',
    highlights: ['circuit breaker open'],
  },
  {
    id: 'p8',
    status: 'WARN',
    count: '182',
    pattern: 'elevated p95 latency on POST /payments/authorize',
    highlights: ['elevated p95', '/payments/authorize'],
  },
  {
    id: 'p9',
    status: 'NONE',
    count: '156',
    pattern: 'health check probe succeeded for payment-service',
  },
  {
    id: 'p10',
    status: 'ERROR',
    count: '121',
    pattern: 'SQLState=<*> deadlock detected while updating payment ledger',
    highlights: ['deadlock detected'],
  },
];

export const LOG_STATUS_COLORS: Record<LogStatus, string> = {
  ERROR: '#f07178',
  WARN: '#e2b15a',
  INFO: '#3d8bfd',
  NONE: '#8aa0bc',
};
