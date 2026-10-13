import { createDialog } from "./dialog-ui";
import { retimeAudio, followAudioTempo, reanalyzeAudioPractice, setAudioBarOne } from "./audio-practice";
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
      <div class="audio-anchor-editor">
        <p>${t("audioPractice.anchorHint")}</p>
        <div class="audio-anchor-wave" data-wave role="group" aria-label="${t("audioPractice.timeline")}"></div>
        <label>${t("audioPractice.browse")}<input name="browse" type="range" min="0" max="${Math.max(0,a.duration-12)}" step="0.1" value="${Math.max(0,(a.barOne?.time ?? s.firstBeat)-3)}"></label>
        <p data-anchor-info role="status"></p>
        <div class="audio-setup-grid">      <label>${t("audioPractice.first")}<input name="first" type="number" min="0" max="${Math.max(0,a.duration-.001)}" step="0.001" required value="${s.firstBeat}"></label>
      <button type="button" data-first title="${t("audioPractice.here")}">${t("audioPractice.here")}</button>
        </div>
      </div>
      <label><input name="follow" type="checkbox">${t("audioPractice.followTempo")}</label>
      <button type="button" data-reanalyze title="${t("audioPractice.reanalyze")}">${t("audioPractice.reanalyze")}</button><p role="status" data-status></p>
      <div class="audio-setup-grid">
      <label>${t("audioPractice.title")}<input name="title" required value="${esc(s.title)}"></label>
      <label>${t("audioPractice.artist")}<input name="artist" value="${esc(s.artist || "")}"></label>
      <label>${t("audioPractice.bpm")}<input name="bpm" type="number" min="20" max="300" step="0.001" required value="${s.bpm}"></label>
      <button type="button" data-tap title="${t("audioPractice.tap")}">${t("audioPractice.tap")}</button>
      <label>${t("audioPractice.beats")}<input name="beats" type="number" min="1" max="16" step="1" required value="${a.beats}"></label>
      <label>${t("audioPractice.denominator")}<select name="denominator">${[2,4,8,16].map(n => `<option ${n === a.denominator ? 'selected' : ''}>${n}</option>`).join('')}</select></label>

      </div><label><input name="click" type="checkbox" ${s.settings.click ? 'checked' : ''}>${t("audioPractice.click")}</label>
      <p class="subtle">${t("audioPractice.retimeHint")}</p><p class="subtle">${t("audioPractice.savedLocal")}</p>
      <p class="audio-error" role="alert"></p><div class="actions"><button type="button" data-cancel title="${t("audioPractice.cancel")}">${t("audioPractice.cancel")}</button><button type="submit" class="primary" title="${t("audioPractice.apply")}">${t("audioPractice.apply")}</button></div>`;
    d.append(form);
    const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement;
    const audio = form.querySelector('audio')!;
    const url = URL.createObjectURL(record.audio);
    audio.src = url;
    audio.onloadedmetadata=()=>{audio.currentTime=s.firstBeat;};
    audio.onerror = () => { form.querySelector('.audio-error')!.textContent = t("audioPractice.decodeError", {detail:audio.error?.message || String(audio.error?.code || '')}); };
    let result: RecordData | undefined;
    let candidate = record, busy = false, closed = false, anchorChanged = false;
    const abort = new AbortController();
    const follow = field('follow');
    const status = form.querySelector('[data-status]')!;
    const errorText = form.querySelector('.audio-error')!;
    const reanalyze = form.querySelector<HTMLButtonElement>('[data-reanalyze]')!;
    const updateTiming = () => {
      follow.disabled = busy || !candidate.song.audioPractice?.beatTimes;
      for (const name of ['bpm','beats','denominator']) field(name).disabled = busy || follow.checked;
      for (const selector of ['[data-tap]']) form.querySelector<HTMLButtonElement>(selector)!.disabled = busy || follow.checked;
      field('first').disabled = busy;
      field('browse').disabled = busy;
      form.querySelector<HTMLButtonElement>('[data-first]')!.disabled = busy;
      form.querySelectorAll<HTMLButtonElement>('[data-beat]').forEach(button=>{button.disabled=busy;});
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
        if(anchorChanged) candidate={...candidate,song:setAudioBarOne(candidate.song,Number(field('first').value))};
        candidate = await reanalyzeAudioPractice(candidate, text => { if (!closed) status.textContent = text; }, abort.signal);
        if (closed) return;
        follow.checked = true;
        field('bpm').value = String(candidate.song.bpm);
        field('first').value = String(candidate.song.firstBeat);
        anchorChanged = false; renderWave();
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
    const wave=form.querySelector<HTMLElement>('[data-wave]')!;
    const anchorInfo=form.querySelector<HTMLElement>('[data-anchor-info]')!;
    const displayAnchor=() => {
      const value=Number(field('first').value);
      const source=anchorChanged ? 'manual' : candidate.song.audioPractice?.barOne?.source;
      anchorInfo.textContent=t(source==='manual' ? 'audioPractice.anchorManual' : source==='estimated' ? 'audioPractice.anchorEstimated' : 'audioPractice.anchorUnknown', {time:value.toFixed(3)});
    };
    const selectTime=(time:number) => { if(busy)return; audio.pause(); audio.currentTime=time; renderWave(); };
    const renderWave=() => {
      const start=Number(field('browse').value),end=Math.min(a.duration,start+12),duration=end-start;
      const bars=Array.from({length:160},(_,i)=>{
        const from=Math.floor((start+duration*i/160)/a.duration*a.peaks.length),to=Math.ceil((start+duration*(i+1)/160)/a.duration*a.peaks.length);
        let peak=0;for(let j=from;j<to;j++)peak=Math.max(peak,a.peaks[j] ?? 0);
        return `<rect x="${i*100/160}" y="${50-peak*40}" width=".5" height="${Math.max(.5,peak*80)}"/>`;
      }).join('');
      const times=candidate.song.audioPractice?.beatTimes ?? [];
      wave.innerHTML=`<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${bars}</svg>` +
        times.filter(t=>t>=start && t<end).map(time=>`<button type="button" data-beat="${time}" style="left:${(time-start)/duration*100}%" aria-label="${t('audioPractice.selectBeat',{time:time.toFixed(3)})}" title="${t('audioPractice.selectBeat',{time:time.toFixed(3)})}"></button>`).join('') +
        `<span class="audio-anchor-cursor" style="left:${Math.max(0,Math.min(100,(audio.currentTime-start)/duration*100))}%"></span>`;
      wave.querySelectorAll<HTMLButtonElement>('[data-beat]').forEach(button=>{button.disabled=busy;button.onclick=()=>selectTime(Number(button.dataset.beat));});
      displayAnchor();
    };
    field('browse').oninput=renderWave;
    wave.onclick=e=>{
      if(busy || (e.target as HTMLElement).closest('button'))return;
      const rect=wave.getBoundingClientRect(),start=Number(field('browse').value);
      if(rect.width)selectTime(start+Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width))*Math.min(12,a.duration-start));
    };
    audio.ontimeupdate=()=>{
      const cursor=wave.querySelector<HTMLElement>('.audio-anchor-cursor');
      if(cursor)cursor.style.left=`${Math.max(0,Math.min(100,(audio.currentTime-Number(field('browse').value))/Math.min(12,a.duration-Number(field('browse').value))*100))}%`;
    };
    field('first').oninput=()=>{anchorChanged=true;displayAnchor();};
    form.querySelector<HTMLButtonElement>('[data-first]')!.onclick=()=>{
      try {
        const reference=follow.checked ? followAudioTempo(candidate.song) : retimeAudio(candidate.song,Number(field('bpm').value),Number(field('first').value),Number(field('beats').value),Number(field('denominator').value));
        const anchored=setAudioBarOne(reference,audio.currentTime);
        field('first').value=String(anchored.firstBeat);anchorChanged=true;displayAnchor();
      } catch(error) {errorText.textContent=String(error);}
    };
    renderWave();
    form.querySelector<HTMLButtonElement>('[data-cancel]')!.onclick = () => d.close();
    form.onsubmit = e => {
      e.preventDefault();
      if (busy) return;
      try {
        let song = follow.checked ? followAudioTempo(candidate.song) : retimeAudio(candidate.song, Number(field('bpm').value), Number(field('first').value), Number(field('beats').value), Number(field('denominator').value));
        if(anchorChanged) song=setAudioBarOne(song,Number(field('first').value));
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
