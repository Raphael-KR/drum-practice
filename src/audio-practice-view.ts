import { beatTime, type Song, type Measure } from "./model";
import { markedMeasureIndices } from "./marker-slots";
import { markerIcon } from "./marker-icon";
import { t } from "./i18n";
/** A waveform/beat grid, not score artwork. Retains common measure hit targets. */
export function audioMeasureHTML(s: Song, m: Measure, i: number, width: number) {
  const a = s.audioPractice!, peaks = a.peaks;
  const bars = 48;
  const wave = Array.from({length:bars}, (_, j) => {
    const from = Math.floor((m.start + (m.end-m.start)*j/bars) / a.duration * peaks.length);
    const to = Math.ceil((m.start + (m.end-m.start)*(j+1)/bars) / a.duration * peaks.length);
    let value = 0;
    for(let k = Math.max(0,from); k < Math.min(peaks.length,to); k++) value = Math.max(value, peaks[k]);
    return `<rect x="${j*100/bars}" y="${50-value*40}" width="${80/bars}" height="${Math.max(.3,value*80)}"/>`;
  }).join('');
  const marked = markedMeasureIndices(s).has(i);
  return `<div class="measure audio-measure${marked ? ' is-marked' : ''}${m.audioPrelude ? ' is-prelude' : ''}" data-index="${i}" style="width:${width}px"><span class="measure-state-layer" aria-hidden="true"></span><span class="label"><span class="measure-marker" ${marked ? '' : 'hidden'}>${markerIcon}</span>${m.audioPrelude ? t("audioPractice.prelude") : t("main.message235",{value4:m.label})}<span class="measure-beat">${m.audioPrelude ? "" : "1"}</span><small class="measure-signature">${m.audioPrelude ? "" : `${m.beats}/${m.denominator}`}</small></span><div class="crop" style="height:100px;width:${width}px"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${wave}</svg><div class="audio-beat-grid">${Array.from({length:m.audioPrelude ? 0 : m.beats}, (_, b) => `<span style="left:${(beatTime(m,b)-m.start)/(m.end-m.start)*100}%">${b+1}</span>`).join('')}</div></div><div class="lyrics"></div></div>`;
}
