import { createDialog } from "./dialog-ui";
import { retimeAudio, followAudioTempo, reanalyzeAudioPractice } from "./audio-practice";
import { escapeHTML as esc } from "./html";
import { t } from "./i18n";
import type { RecordData } from "./storage";
/** A cancellable local preview; the caller persists only the returned confirmed copy. */
export function setupAudioPractice(record: RecordData): Promise<RecordData | undefined> {
  return new Promise(resolve => {
    const s = record.song, a = s.audioPractice!;
    const d = createDialog("audio-practice-setup", t("audioPractice.setup"), "audio-setup");
    const form = document.createElement("form");
    form.innerHTML = `<p>${t("audioPractice.hint")}</p>
      <audio controls preload="metadata" aria-label="${t("audioPractice.preview")}"></audio>
      <label><input name="follow" type="checkbox">${t("audioPractice.followTempo")}</label>
      <button type="button" data-reanalyze title="${t("audioPractice.reanalyze")}">${t("audioPractice.reanalyze")}</button><p role="status" data-status></p>
      <div class="audio-setup-grid">
      <label>${t("audioPractice.title")}<input name="title" required value="${esc(s.title)}"></label>
      <label>${t("audioPractice.artist")}<input name="artist" value="${esc(s.artist || "")}"></label>
      <label>${t("audioPractice.bpm")}<input name="bpm" type="number" min="20" max="300" step="0.001" required value="${s.bpm}"></label>
      <button type="button" data-tap title="${t("audioPractice.tap")}">${t("audioPractice.tap")}</button>
      <label>${t("audioPractice.beats")}<input name="beats" type="number" min="1" max="16" step="1" required value="${a.beats}"></label>
      <label>${t("audioPractice.denominator")}<select name="denominator">${[2,4,8,16].map(n => `<option ${n === a.denominator ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      <label>${t("audioPractice.first")}<input name="first" type="number" min="0" max="${Math.max(0,a.duration-.001)}" step="0.001" required value="${s.firstBeat}"></label>
      <button type="button" data-first title="${t("audioPractice.here")}">${t("audioPractice.here")}</button>
      </div><label><input name="click" type="checkbox" ${s.settings.click ? 'checked' : ''}>${t("audioPractice.click")}</label>
      <p class="subtle">${t("audioPractice.retimeHint")}</p><p class="subtle">${t("audioPractice.savedLocal")}</p>
      <p class="audio-error" role="alert"></p><div class="actions"><button type="button" data-cancel title="${t("audioPractice.cancel")}">${t("audioPractice.cancel")}</button><button type="submit" class="primary" title="${t("audioPractice.apply")}">${t("audioPractice.apply")}</button></div>`;
    d.append(form);
    const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement;
    const audio = form.querySelector('audio')!;
    const url = URL.createObjectURL(record.audio);
    audio.src = url;
    audio.onerror = () => { form.querySelector('.audio-error')!.textContent = t("audioPractice.decodeError", {detail:audio.error?.message || String(audio.error?.code || '')}); };
    let result: RecordData | undefined;
    let candidate = record, busy = false, closed = false;
    const abort = new AbortController();
    const follow = field('follow');
    const status = form.querySelector('[data-status]')!;
    const errorText = form.querySelector('.audio-error')!;
    const reanalyze = form.querySelector<HTMLButtonElement>('[data-reanalyze]')!;
    const updateTiming = () => {
      follow.disabled = busy || !candidate.song.audioPractice?.beatTimes;
      for (const name of ['bpm','beats','denominator','first']) field(name).disabled = busy || follow.checked;
      for (const selector of ['[data-tap]','[data-first]']) form.querySelector<HTMLButtonElement>(selector)!.disabled = busy || follow.checked;
      reanalyze.disabled = busy;
      form.querySelector<HTMLButtonElement>('[type=submit]')!.disabled = busy;
      if (!busy) status.textContent = t(follow.checked ? 'audioPractice.trackedHint' : 'audioPractice.fixedHint');
    };
    follow.checked = !!a.followTempo;
    follow.onchange = updateTiming;
    updateTiming();
    reanalyze.onclick = async () => {
      busy = true; errorText.textContent = ''; audio.pause(); updateTiming();
      status.textContent = t('audioPractice.tracking');
      try {
        candidate = await reanalyzeAudioPractice(candidate, text => { if (!closed) status.textContent = text; }, abort.signal);
        if (closed) return;
        follow.checked = true;
        field('bpm').value = String(candidate.song.bpm);
        field('first').value = String(candidate.song.firstBeat);
        field('beats').value = '4'; field('denominator').value = '4';
      } catch (error) { if (!closed) errorText.textContent = String(error); }
      finally { busy = false; if (!closed) updateTiming(); }
    };
    let taps: number[] = [];
    form.querySelector<HTMLButtonElement>('[data-tap]')!.onclick = () => {
      const now = performance.now();
      if (taps.length && now - taps.at(-1)! > 2500) taps = [];
      taps.push(now); taps = taps.slice(-9);
      if (taps.length > 2) field('bpm').value = String(Math.min(300,Math.max(20,Math.round(60000*(taps.length-1)/(now-taps[0])))));
    };
    form.querySelector<HTMLButtonElement>('[data-first]')!.onclick = () => { field('first').value = audio.currentTime.toFixed(3); };
    form.querySelector<HTMLButtonElement>('[data-cancel]')!.onclick = () => d.close();
    form.onsubmit = e => {
      e.preventDefault();
      if (busy) return;
      try {
        const song = follow.checked ? followAudioTempo(candidate.song) : retimeAudio(candidate.song, Number(field('bpm').value), Number(field('first').value), Number(field('beats').value), Number(field('denominator').value));
        song.title = field('title').value.trim() || s.title;
        song.artist = field('artist').value.trim(); song.settings.click = field('click').checked;
        result = {...record, song}; d.close();
      } catch (error) { form.querySelector('.audio-error')!.textContent = String(error); }
    };
    d.addEventListener('close', () => {
      closed = true; abort.abort(); audio.pause(); audio.removeAttribute('src'); audio.load(); URL.revokeObjectURL(url); d.remove(); resolve(result);
    }, {once:true});
    d.showModal();
  });
}
