const key = 'drum-practice.recent-scores';
let memory: string[] = [];
export function recentScoreIds(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) || '[]');
    if (Array.isArray(value)) memory = value.filter((id): id is string => typeof id === 'string');
  } catch { /* Keep the current session usable when storage is unavailable. */ }
  return memory;
}
export function rememberScore(id: string) {
  memory = [id, ...recentScoreIds().filter(value => value !== id)].slice(0, 100);
  try { localStorage.setItem(key, JSON.stringify(memory)); } catch { /* Session-only fallback. */ }
}
export function chooseRecent<T extends { song: { id: string } }>(records: T[]): T | undefined {
  for (const id of recentScoreIds()) {
    const record = records.find(r => r.song.id === id);
    if (record) return record;
  }
  // Older installations have saved scores but no activity history yet.
  return records[0];
}
