export interface PlaybackPreferences {
  restartMeasure: boolean;
  countOff: boolean;
}
const KEY = 'drum-practice.playback';
let fallback: PlaybackPreferences = { restartMeasure: true, countOff: true };
let sessionOnly = false;
export function readPlaybackPreferences(): PlaybackPreferences {
  if (sessionOnly) return { ...fallback };
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '{}');
    return {
      restartMeasure: typeof value?.restartMeasure === 'boolean' ? value.restartMeasure : true,
      countOff: typeof value?.countOff === 'boolean' ? value.countOff : true,
    };
  } catch { return { ...fallback }; }
}
export function savePlaybackPreferences(value: PlaybackPreferences): boolean {
  fallback = { ...value };
  try { localStorage.setItem(KEY, JSON.stringify(value)); sessionOnly = false; return true; }
  catch { sessionOnly = true; return false; }
}
