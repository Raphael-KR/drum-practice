import { ANALYSIS_PATH, validAudioAnalysis, type AudioAnalysis } from './audio-analysis-contract';
export async function audioFileHash(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2,'0')).join('');
}
export async function loadAudioAnalysis(hash: string): Promise<AudioAnalysis | undefined> {
  try {
    const response = await fetch(`${ANALYSIS_PATH}${hash}`, {
      signal: AbortSignal.timeout(1500), credentials:'omit', cache:'no-store', redirect:'error',
    });
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return;
    const value: unknown = await response.json();
    return validAudioAnalysis(value, hash) ? value : undefined;
  } catch { return; }
}
export async function storeAudioAnalysis(value: AudioAnalysis): Promise<void> {
  if (!validAudioAnalysis(value, value.sha256)) return;
  try {
    await fetch(`${ANALYSIS_PATH}${value.sha256}`, {
      method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(value),
      signal:AbortSignal.timeout(1500), credentials:'omit', redirect:'error',
    });
  } catch { /* Offline or unavailable cache must never block local practice. */ }
}
