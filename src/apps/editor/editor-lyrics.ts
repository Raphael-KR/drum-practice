import {
  gridLabel,
  lyricGridPoint,
  lyricGridStep,
  lyricGridTickForMeasure,
  lyricGridTicks,
  setLyricGrid,
} from "../../modules/lyrics/lyric-grid";
import {
  advanceLyricPosition,
  lyricDurationBeats,
} from "../../modules/lyrics/lyric-score";
import { t as i18nText } from "../../shared/i18n/i18n";

import { uid, type Song } from "../../model/model";
import { escapeHTML as esc } from "../../shared/ui/html";
import { $ } from "./editor-dom";
interface LyricEditorHost {
  song(): Song;
  selected(): number;
  edit(mut: (song: Song) => void): void;
  current(): number;
  action(id: string, fn: () => unknown): void;
  error(error: unknown): void;
}
export function createLyricEditor(h: LyricEditorHost) {
  const { song, edit, action, error } = h;
  const engine = () => ({ current: h.current });
  let lyricPage = 0,
    lyricNear = false;
  action("lyrics-prev", () => {
    lyricPage = Math.max(0, lyricPage - 1);
    renderLyricEditor(lyricNear, true);
  });
  action("lyrics-next", () => {
    lyricPage++;
    renderLyricEditor(lyricNear, true);
  });
  function lyricGridEditor(l: Song["lyrics"][number]) {
    const point = lyricGridPoint(song(), l);
    const m = song().measures.find((m) => m.id === point.measureId)!;
    const measures = song()
      .measures.map(
        (x) =>
          '<option value="' +
          String(esc(x.id)) +
          '" ' +
          String(x.id === m.id ? "selected" : "") +
          ">" +
          i18nText("main.message316", { value3: esc(x.label) }) +
          "</option>",
      )
      .join("");
    const ticks = lyricGridTicks(m, point.tick)
      .map(
        (tick) =>
          '<option value="' +
          String(tick) +
          '" ' +
          String(tick === point.tick ? "selected" : "") +
          ">" +
          (tick === m.beats * 4
            ? gridLabel(m, tick)
            : Number.isInteger(tick / lyricGridStep(m))
              ? i18nText("main.message318", {
                  value3: tick / 4 + 1,
                  value4: "",
                })
              : i18nText("main.message317", {
                  value2: tick / 4 + 1,
                })) +
          "</option>",
      )
      .join("");
    return (
      '<div class="lyric-grid-controls"><select data-field="grid-measure" aria-label="' +
      i18nText("main.message319") +
      '">' +
      String(measures) +
      '</select><select data-field="grid-tick" aria-label="' +
      i18nText("main.message320") +
      '">' +
      String(ticks) +
      "</select></div>"
    );
  }
  function durationStep(l: Song["lyrics"][number]) {
    const point = lyricGridPoint(song(), l);
    const measure = song().measures.find((m) => m.id === point.measureId)!;
    const step = lyricGridStep(measure) / 4;
    // Native arrows use the base unit; existing tuplets stay valid numeric input.
    return Number.isInteger(lyricDurationBeats(song(), l) / step)
      ? step
      : "any";
  }
  function renderLyricEditor(near: boolean, keepPage = false) {
    if (!keepPage) lyricPage = 0;
    lyricNear = near;
    $("show-near").setAttribute("aria-pressed", String(near));
    $("show-all").setAttribute("aria-pressed", String(!near));
    const m = song().measures[h.selected()];
    const list = song().lyrics.filter(
      (l) => !near || !m || (l.time >= m.start - 1 && l.time < m.end + 1),
    );
    const perPage = Math.max(
      2,
      Math.min(6, Math.floor((window.innerHeight - 370) / 62)),
    );
    const pages = Math.max(1, Math.ceil(list.length / perPage));
    lyricPage = Math.min(lyricPage, pages - 1);
    $("lyrics-page").textContent = i18nText("main.message321", {
      value1: lyricPage + 1,
      pages: pages,
      value3: list.length,
    });
    $<HTMLButtonElement>("lyrics-prev").disabled = lyricPage === 0;
    $<HTMLButtonElement>("lyrics-next").disabled = lyricPage === pages - 1;
    $("lyric-editor").innerHTML = list
      .slice(lyricPage * perPage, (lyricPage + 1) * perPage)
      .map(
        (l) =>
          '<tr data-lyric="' +
          String(esc(l.id)) +
          '"><td><input data-field="text" value="' +
          String(esc(l.text)) +
          '" aria-label="' +
          i18nText("main.message279") +
          '"></td><td>' +
          String(lyricGridEditor(l)) +
          '</td><td><input data-field="duration-beats" type="number" min="0" step="' +
          String(durationStep(l)) +
          '" value="' +
          String(lyricDurationBeats(song(), l)) +
          '" aria-label="' +
          i18nText("main.message322") +
          '"></td><td><input data-field="confirmed" type="checkbox" ' +
          String(l.confirmed ? "checked" : "") +
          ' aria-label="' +
          i18nText("main.message232") +
          '"></td><td><button data-split-lyric="' +
          String(esc(l.id)) +
          '" title="' +
          i18nText("main.message323") +
          '">÷</button><button data-delete-lyric="' +
          String(esc(l.id)) +
          '" aria-label="' +
          i18nText("main.message324") +
          '">×</button></td></tr>',
      )
      .join("");
  }
  $("lyric-editor").onchange = (e) => {
    const input = e.target as HTMLInputElement;
    const id = input.closest<HTMLElement>("[data-lyric]")?.dataset.lyric;
    const field = input.dataset.field;
    if (!id || !field) return;
    try {
      edit((s) => {
        const l = s.lyrics.find((l) => l.id === id)!;
        if (field === "text") l.text = input.value;
        if (field === "grid-measure" || field === "grid-tick") {
          const point = lyricGridPoint(s, l);
          const measureId =
            field === "grid-measure" ? input.value : point.measureId;
          const measure = s.measures.find((m) => m.id === measureId)!;
          setLyricGrid(s, l, {
            measureId,
            tick:
              field === "grid-tick"
                ? Number(input.value)
                : lyricGridTickForMeasure(measure, point.tick),
          });
        }
        if (field === "duration-beats") {
          const m = s.measures.find(
            (m) => m.id === l.scorePosition!.measureId,
          )!;
          l.scorePosition!.durationQuarters =
            (Number(input.value) * 4) / m.denominator;
        }
        if (field === "confirmed") l.confirmed = input.checked;
        s.lyrics.sort((a, b) => a.time - b.time);
      });
      renderLyricEditor(false);
    } catch (e) {
      error(e);
      renderLyricEditor(false);
    }
  };
  $("lyric-editor").onclick = (e) => {
    const b = (e.target as HTMLElement).closest("button");
    if (!b) return;
    try {
      edit((s) => {
        if (b.dataset.deleteLyric)
          s.lyrics = s.lyrics.filter((l) => l.id !== b.dataset.deleteLyric);
        if (b.dataset.splitLyric) {
          const i = s.lyrics.findIndex((l) => l.id === b.dataset.splitLyric),
            l = s.lyrics[i],
            letters = [...l.text.replace(/\s/g, "")];
          s.lyrics.splice(
            i,
            1,
            ...letters.map((text, n) => ({
              id: uid(),
              text,
              time: 0,
              end: 0,
              confirmed: false,
              scorePosition: {
                ...advanceLyricPosition(
                  s,
                  l.scorePosition!,
                  (l.scorePosition!.durationQuarters * n) / letters.length,
                ),
                durationQuarters:
                  l.scorePosition!.durationQuarters / letters.length,
              },
            })),
          );
        }
      });
      renderLyricEditor(false);
    } catch (e) {
      error(e);
    }
  };
  action("show-near", () => renderLyricEditor(true));
  action("show-all", () => renderLyricEditor(false));
  action("add-lyric", () => {
    const text = prompt(i18nText("main.message325"));
    if (!text) return;
    edit((s) => {
      const t = engine().current();
      s.lyrics.push({ id: uid(), text, time: t, end: t + 1, confirmed: false });
      s.lyrics.sort((a, b) => a.time - b.time);
    });
    renderLyricEditor(false);
  });
  return {
    render: renderLyricEditor,
    get near() {
      return lyricNear;
    },
  };
}
