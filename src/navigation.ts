export type NavId =
  | 'logs'
  | 'observe'
  | 'dashboards'
  | 'notebooks'
  | 'automations'
  | 'settings';

export type ScreenId = 'release-monitoring' | 'notebook';

export function navIdForScreen(screen: ScreenId): NavId {
  if (screen === 'notebook') return 'notebooks';
  return 'dashboards';
}

export function screenForNavId(id: NavId): ScreenId | null {
  if (id === 'notebooks') return 'notebook';
  if (id === 'dashboards') return 'release-monitoring';
  return null;
}
