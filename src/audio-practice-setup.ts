import { bindAudioAnchorWave } from "./audio-anchor-wave";
import { bindAudioPreviewMetronome } from "./audio-preview-metronome";
import { bindAudioPreviewControls } from "./audio-preview-controls";
import { preludeCountBeats } from "./model";
import { audioSetupMetronomeHTML } from "./playback-shell";
import { createDialog, confirmDiscardChanges, requestDialogCancel } from "./dialog-ui";
import { setIconButton } from "./icon-button";
import { icon } from "./icon-svg";
import { retimeAudio, followAudioTempo, setAudioBarOne } from "./audio-practice";
import { escapeHTML as esc } from "./html";
import { t } from "./i18n";
import type { RecordData } from "./storage";
/** A cancellable local preview; the caller persists only the returned confirmed copy. */
export function setupAudioPractice(record: RecordData): Promise<RecordData | undefined> {
  return new Promise(resolve => {
    const s = record.song, a = s.audioPractice!;
    const d = createDialog("audio-practice-setup", t("audioPractice.setup"), "audio-setup");
    const currentMeter = `${a.beats}/${a.denominator}`;
    const meters = [...new Set(["4/4", "2/4", "3/4", "6/8", "9/8", "12/8", "2/2", "3/8", "5/4", "7/8", currentMeter])];
    const form = document.createElement("form");
    form.id = "audio-practice-setup-form";
    const save = document.createElement("button");
    save.type = "submit";
    save.setAttribute("form", form.id);
    setIconButton(save, icon("save"), t("audioPractice.apply"));
    save.classList.add("primary");
    const header = d.querySelector('.dialoghead')!;
    const actions = document.createElement("div");
    actions.className = "audio-setup-header-actions";
    actions.append(save, header.querySelector('.close-button')!);
    header.append(actions);
    form.innerHTML = `<div class="audio-anchor-editor audio-setup-panel">
        <h3 class="audio-section-heading">${t("audioPractice.timingHeading")}</h3>
        <p class="audio-field-hint">${t("audioPractice.anchorHint")}</p>
        <div class="audio-anchor-wave" data-wave role="group" aria-label="${t("audioPractice.timeline")}"></div>
        <audio hidden preload="metadata"></audio>
        <div class="audio-anchor-setting">
          <button type="button" data-first>${t("audioPractice.here")}</button>
          <label class="audio-anchor-time">${t("audioPractice.barOne")}<input name="first" type="number" min="0" max="${Math.max(0,a.duration-.001)}" step="0.001" required value="${s.firstBeat.toFixed(3)}">${t("audioPractice.seconds")}</label>
          ${audioSetupMetronomeHTML()}
        </div>
      </div>
      <div class="audio-setup-grid audio-setup-panel">
      <h3 class="audio-section-heading">${t("audioPractice.infoHeading")}</h3>
      <p class="audio-field-hint audio-grid-hint">${t("audioPractice.metadataHint")}<br>${t("audioPractice.meterHint")}</p>
      <label>${t("audioPractice.title")}<input name="title" required value="${esc(s.title)}"></label>
      <label>${t("audioPractice.artist")}<input name="artist" value="${esc(s.artist || "")}"></label>
      <label>${t("audioPractice.bpm")}<input name="bpm" type="number" min="20" max="300" step="0.001" required value="${s.bpm}"></label>
      <label>${t("audioPractice.meter")}<select name="meter">${meters.map(m => `<option ${m === currentMeter ? 'selected' : ''}>${m}</option>`).join('')}</select></label>

      </div>
      <p class="audio-error" role="alert"></p>`;
    d.append(form);
    const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement;
    const persistedFields = ['first', 'title', 'artist', 'bpm', 'meter'];
    const initialValues = persistedFields.map(name => field(name).value);
    let confirmingDiscard = false;
    d.querySelector<HTMLButtonElement>('.close-button')!.onclick = () => requestDialogCancel(d);
    d.addEventListener('cancel', event => {
      if (!confirmingDiscard && persistedFields.every((name, i) => field(name).value === initialValues[i])) return;
      event.preventDefault();
      if (confirmingDiscard) return;
      confirmingDiscard = true;
      void confirmDiscardChanges(d).then(discard => {
        confirmingDiscard = false;
        if (discard) d.close();
      });
    });
    const audio = form.querySelector('audio')!;
    const url = URL.createObjectURL(record.audio);
    audio.src = url;
    audio.onloadedmetadata=()=>{
      const counts = field('click').checked ? preludeCountBeats(previewSong()) : [];
      audio.currentTime = counts[0] ?? s.firstBeat;
    };
    audio.onerror = () => { form.querySelector('.audio-error')!.textContent = t("audioPractice.decodeError", {detail:audio.error?.message || String(audio.error?.code || '')}); };
    let result: RecordData | undefined;
    const candidate = record;
    let anchorChanged = false;
    const followsTempo = !!a.beatTimes?.length;
    const errorText = form.querySelector('.audio-error')!;
    const controls = bindAudioPreviewControls(audio, a.duration, error => { errorText.textContent = String(error); });
    const previewSong = () => {
      const bpm = Number(field('bpm').value);
      const [beats, denominator] = field('meter').value.split('/').map(Number);
      let song = followsTempo
        ? followAudioTempo({...candidate.song, bpm, audioPractice: {...a, beats, denominator}})
        : retimeAudio(candidate.song, bpm, Number(field('first').value), beats, denominator);
      if (anchorChanged) song = setAudioBarOne(song, Number(field('first').value));
      return song;
    };
    const metronome = bindAudioPreviewMetronome(audio, field('click'), d, previewSong,
      error => { errorText.textContent = String(error); });
    d.addEventListener('keydown', event => {
      if (!['Space', 'ArrowLeft', 'ArrowRight'].includes(event.code) || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
      const target = event.target as HTMLElement;
      if (target.closest('dialog') !== d) return;
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.code !== 'Space') {
        waveform.stepColumn(event.code === 'ArrowLeft' ? -1 : 1);
        return;
      }
      if (event.repeat) return;
      if (audio.paused) void audio.play().catch(error => { errorText.textContent = String(error); });
      else audio.pause();
    }, {capture: true});
    const wave=form.querySelector<HTMLElement>('[data-wave]')!;
    const waveform = bindAudioAnchorWave(wave, audio, {
      duration: a.duration,
      peaks: a.peaks,
      beatTimes: () => candidate.song.audioPractice?.beatTimes ?? [],
      firstBeat: () => field('first').valueAsNumber,
      firstBeatLabel: t('audioPractice.barOne'),
      beatLabel: time => t('audioPractice.selectBeat', {time: time.toFixed(3)}),
    });
    field('first').oninput=()=>{anchorChanged=true;waveform.render();metronome.refresh();};
    for (const name of ['bpm', 'meter']) field(name).onchange = () => metronome.refresh();
    form.querySelector<HTMLButtonElement>('[data-first]')!.onclick=()=>{
      try {
        const anchored=setAudioBarOne(previewSong(),audio.currentTime);
        field('first').value=anchored.firstBeat.toFixed(3);anchorChanged=true;
        waveform.render();
        metronome.refresh();
      } catch(error) {errorText.textContent=String(error);}
    };
    form.onsubmit = e => {
      e.preventDefault();
      try {
        const song = previewSong();
        song.title = field('title').value.trim() || s.title;
        song.artist = field('artist').value.trim();
        result = {...record, song}; d.close();
      } catch (error) { form.querySelector('.audio-error')!.textContent = String(error); }
    };
    d.addEventListener('close', () => {
      controls.dispose(); metronome.dispose(); waveform.dispose(); audio.pause(); audio.removeAttribute('src'); audio.load(); URL.revokeObjectURL(url); d.remove(); resolve(result);
    }, {once:true});
    d.showModal();
  });
}
