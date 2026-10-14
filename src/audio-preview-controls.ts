import { icon, svgFromPath } from './icon-svg';
import { iconButtonHTML, setIconButton } from './icon-button';
import { t } from './i18n';

const PREVIEW_RATES = [0.1, 0.25, 0.5, 1];
const clock = (value: number) => {
  const seconds = Math.max(0, Math.floor(value));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
};

/** App-owned controls keep the correction speeds identical across browsers. */
export function bindAudioPreviewControls(audio: HTMLAudioElement, duration: number, onError: (error: unknown) => void) {
  const controls = document.createElement('div');
  controls.className = 'audio-preview-controls';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', t('audioPractice.preview'));
  controls.innerHTML = `${iconButtonHTML('', icon('play'), t('audioPractice.play'))}
    <span data-current>00:00</span>
    <input data-seek type="range" min="0" max="${duration}" step="0.001" value="0" aria-label="${t('audioPractice.seek')}">
    <span data-duration>${clock(duration)}</span>
    <div class="audio-preview-speed">${svgFromPath('<path d="m5 4 8 8-8 8m7-16 8 8-8 8"/>')}<select data-speed aria-label="${t('audioPractice.speed')}" title="${t('audioPractice.speed')}">${PREVIEW_RATES.map(rate => `<option value="${rate}" ${rate === 1 ? 'selected' : ''}>${rate}×</option>`).join('')}</select></div>`;
  audio.controls = false; audio.hidden = true;
  audio.volume = 1; audio.muted = false;
  audio.after(controls);
  const listeners = new AbortController();
  const listen = (target: EventTarget, event: string, fn: () => void) => target.addEventListener(event, fn, {signal: listeners.signal});
  const play = controls.querySelector<HTMLButtonElement>(':scope > .icon-button')!;
  const seek = controls.querySelector<HTMLInputElement>('[data-seek]')!;
  const speed = controls.querySelector<HTMLSelectElement>('[data-speed]')!;
  const render = () => {
    seek.value = String(audio.currentTime);
    controls.querySelector('[data-current]')!.textContent = clock(audio.currentTime);
    setIconButton(play, icon(audio.paused ? 'play' : 'pause'), t(audio.paused ? 'audioPractice.play' : 'audioPractice.pause'));
    speed.value = String(audio.playbackRate);
  };
  listen(play, 'click', () => {
    if (audio.paused) void audio.play().catch(onError);
    else audio.pause();
  });
  listen(seek, 'input', () => { audio.currentTime = Number(seek.value); render(); });
  listen(speed, 'change', () => {
    const rate = Number(speed.value);
    if (!PREVIEW_RATES.includes(rate)) return;
    try { audio.playbackRate = rate; }
    catch (error) { onError(error); }
    render();
  });
  for (const event of ['play', 'pause', 'ended', 'timeupdate', 'seeking', 'seeked', 'loadedmetadata', 'ratechange']) listen(audio, event, render);
  render();
  return {dispose: () => { listeners.abort(); controls.remove(); }};
}
