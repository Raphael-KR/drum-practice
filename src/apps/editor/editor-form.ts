import type { EditorForm } from "../../model/edit-history";
import type { Song } from "../../model/model";
import {
  nearestQuarterBeat,
  setLyricGrid,
} from "../../modules/lyrics/lyric-grid";
import { lyricDurationBeats } from "../../modules/lyrics/lyric-score";
import { t as i18nText } from "../../shared/i18n/i18n";
import { val } from "./editor-dom";
export const editorFields = [
  "edit-artist",
  "edit-title",
  "edit-original-title",
  "edit-lyricist",
  "edit-composer",
  "edit-bpm",
  "edit-first",
  "measure-label",
  "measure-beats",
  "measure-denominator",
  "measure-start",
  "measure-end",
  "beat-xs",
];
interface FormHost {
  song(): Song;
  selected(): number;
  edit(mut: (song: Song) => void): void;
  renderLyricEditor(near: boolean): void;
  updateSongHeading(): void;
}
export function createEditorForm(h: FormHost) {
  const { song, edit, renderLyricEditor, updateSongHeading } = h;
  function editorForm(): EditorForm {
    const fields = Object.fromEntries(
      editorFields.map((id) => [id, val(id).value]),
    );
    document
      .querySelectorAll<HTMLInputElement | HTMLSelectElement>(
        "#lyric-editor [data-field]",
      )
      .forEach((el) => {
        const key = `lyric:${el.closest<HTMLElement>("[data-lyric]")!.dataset.lyric}:${el.dataset.field}`;
        fields[key] =
          el instanceof HTMLInputElement && el.type === "checkbox"
            ? String(el.checked)
            : el.value;
      });
    return { selected: h.selected(), fields };
  }
  function fillMetadata() {
    for (const [id, key] of [
      ["edit-title", "title"],
      ["edit-original-title", "originalTitle"],
      ["edit-artist", "artist"],
      ["edit-composer", "composer"],
      ["edit-lyricist", "lyricist"],
      ["edit-bpm", "bpm"],
      ["edit-first", "firstBeat"],
    ] as const)
      val(id).value = String(song()[key] ?? "");
  }
  function pendingEditorValues() {
    const current = editorForm(),
      m = song().measures[h.selected()],
      region = song().regions.find((r) => r.id === m.regionId)!;
    const metadata = {
      title: current.fields["edit-title"].trim() || song().title,
      artist: current.fields["edit-artist"].trim(),
      originalTitle: current.fields["edit-original-title"].trim(),
      lyricist: current.fields["edit-lyricist"].trim(),
      composer: current.fields["edit-composer"].trim(),
    };
    const metaChanged = Object.entries(metadata).some(
      ([k, v]) => v !== String(song()[k as keyof Song] ?? ""),
    );
    const measureChanged =
      current.fields["measure-label"] !== m.label ||
      Number(current.fields["measure-beats"]) !== m.beats ||
      Number(current.fields["measure-denominator"]) !== m.denominator ||
      current.fields["measure-start"] !== m.start.toFixed(3) ||
      current.fields["measure-end"] !== m.end.toFixed(3) ||
      current.fields["beat-xs"] !== region.beatXs.join(",");
    const lyrics = song().lyrics.flatMap((l) => {
      const f = (key: string) => current.fields[`lyric:${l.id}:${key}`];
      if (f("text") === undefined) return [];
      const point = l.grid || {
        measureId: nearestQuarterBeat(song(), l.time).measure.id,
        tick: nearestQuarterBeat(song(), l.time).tick,
      };
      const values = {
        id: l.id,
        text: f("text"),
        measureId: f("grid-measure"),
        tick: Number(f("grid-tick")),
        duration: Number(f("duration-beats")),
        confirmed: f("confirmed") === "true",
      };
      return values.text !== l.text ||
        values.measureId !== point.measureId ||
        values.tick !== point.tick ||
        values.duration !== lyricDurationBeats(song(), l) ||
        values.confirmed !== !!l.confirmed
        ? [values]
        : [];
    });
    const tempoChanged =
      Number(current.fields["edit-bpm"]) !== song().bpm ||
      Number(current.fields["edit-first"]) !== song().firstBeat;
    return {
      current,
      metadata,
      metaChanged,
      measureChanged,
      lyrics,
      tempoChanged,
    };
  }
  function flushEditorForm() {
    const {
      current,
      metadata,
      metaChanged,
      measureChanged,
      lyrics,
      tempoChanged,
    } = pendingEditorValues();
    if (tempoChanged) throw Error(i18nText("main.message366"));
    if (!metaChanged && !measureChanged && !lyrics.length) return;
    edit((s) => {
      Object.assign(s, metadata);
      if (measureChanged) {
        Object.assign(s.measures[h.selected()], {
          label: current.fields["measure-label"],
          beats: Number(current.fields["measure-beats"]),
          denominator: Number(current.fields["measure-denominator"]),
          start: Number(current.fields["measure-start"]),
          end: Number(current.fields["measure-end"]),
        });
        const r = s.regions.find(
          (r) => r.id === s.measures[h.selected()].regionId,
        )!;
        r.beatXs = current.fields["beat-xs"].trim()
          ? current.fields["beat-xs"].split(",").map(Number)
          : [];
        if (
          r.beatXs.length &&
          r.beatXs.length !== s.measures[h.selected()].beats + 1
        )
          throw Error(i18nText("main.message367"));
      }
      for (const v of lyrics) {
        const l = s.lyrics.find((l) => l.id === v.id)!;
        l.text = v.text;
        l.confirmed = v.confirmed;
        const m = s.measures.find((m) => m.id === v.measureId);
        if (!m) throw Error(i18nText("main.message368"));
        setLyricGrid(s, l, {
          measureId: m.id,
          tick: Math.min(m.beats * 4 - 1, v.tick),
        });
        l.scorePosition!.durationQuarters = (v.duration * 4) / m.denominator;
      }
    });
    renderLyricEditor(false);
    updateSongHeading();
  }
  return { editorForm, fillMetadata, pendingEditorValues, flushEditorForm };
}
