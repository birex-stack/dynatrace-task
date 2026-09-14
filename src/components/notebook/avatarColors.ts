const HUMAN_BG: Record<string, string> = {
  'Maciej K.': '#3d6ea8',
  'Anna S.': '#9b5ea8',
  'Piotr W.': '#2f8a7b',
};

const AGENT_ICON: Record<string, string> = {
  'Trace Agent': '#4d9fff',
  'Logs Agent': '#35d18a',
  'Deployment Agent': '#e2b15a',
  'Analysis Agent': '#c4a0ff',
};

const HUMAN_FALLBACK = ['#4a7ab5', '#b06a8a', '#5a8f6e', '#b0894a', '#6a7bb0'];
const AGENT_FALLBACK = ['#8cbcff', '#7dd3a8', '#e8c07a', '#d0b0ff', '#7ec8d8'];

function hashIndex(name: string, size: number) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % size;
}

export function isAgentName(name: string): boolean {
  return /agent/i.test(name);
}

export function humanAvatarBg(name: string): string {
  return HUMAN_BG[name] ?? HUMAN_FALLBACK[hashIndex(name, HUMAN_FALLBACK.length)];
}

export function agentIconColor(name: string): string {
  return AGENT_ICON[name] ?? AGENT_FALLBACK[hashIndex(name, AGENT_FALLBACK.length)];
}

export function avatarInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);
}
