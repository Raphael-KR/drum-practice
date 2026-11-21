import type { Song } from "../../model/model";
import type { RecordData } from "../../model/record";
import { t } from "../../shared/i18n/i18n";
import { escapeHTML as esc } from "../../shared/ui/html";
import {
  lyricAxis,
  moveLyric,
  mergeLyrics,
  splitLyrics,
} from "./lyric-editing";
import { $, val } from "./editor-dom";
interface Host {
  song(): Song;
  record(): RecordData;
  selected(): number;
  selectMeasure(index: number): void;
  flush(): void;
  edit(mut: (song: Song) => void, work?: RecordData["lyricWork"]): void;
  selectionChanged(ids: ReadonlySet<string>): void;
  error(error: unknown): void;
}
export function createLyricEditor(h: Host) {
  const pane = $("editor-lyrics"),
    cards = $("lyric-editor");
  let selected = new Set<string>(),
    anchor: string | undefined,
    selecting = false;
  let renderedSong: Song | undefined,
    renderedMeasure = -1;
  const run = (fn: () => void) => {
    try {
      fn();
    } catch (e) {
      h.error(e);
    }
  };
  const grid = () => Number(val("lyric-grid").value);
  function selection(id: string, range = false, focus = false) {
    h.flush();
    const lyrics = h.song().lyrics;
    const item = lyrics.find((l) => l.id === id);
    if (!item) return;
    if (range && anchor) {
      const a = lyrics.findIndex((l) => l.id === anchor),
        b = lyrics.indexOf(item);
      selected = new Set(
        lyrics.slice(Math.min(a, b), Math.max(a, b) + 1).map((l) => l.id),
      );
    } else {
      anchor = id;
      selected = new Set([id]);
    }
    const index = h
      .song()
      .measures.findIndex((m) => m.id === item.scorePosition?.measureId);
    if (index >= 0 && index !== h.selected()) h.selectMeasure(index);
    render();
    if (focus) pane.focus({ preventScroll: true });
  }
  function render() {
    const s = h.song(),
      index = h.selected(),
      m = s.measures[index];
    if (!m) return;
    selected = new Set(
      [...selected].filter((id) => s.lyrics.some((l) => l.id === id)),
    );
    const items = s.lyrics.filter((l) => l.scorePosition?.measureId === m.id);
    if (renderedSong !== s || renderedMeasure !== index) {
      cards.innerHTML =
        items
          .map(
            (l) =>
              `<div class="lyric-card" data-lyric="${esc(l.id)}" role="option" aria-selected="${selected.has(l.id)}"><input data-field="text" aria-label="${esc(t("main.message279"))}" value="${esc(l.text)}"><small>${t("editorWork.beat", { value: Number((1 + (l.scorePosition!.quarterOffset * m.denominator) / 4).toFixed(4)) })}${h.record().lyricWork?.groups?.[l.id] ? " · S" : ""}</small><label><input type="checkbox" data-field="confirmed" ${l.confirmed ? "checked" : ""}>${t("editorWork.confirmed")}</label></div>`,
          )
          .join("") || `<p>${t("editorWork.noLyrics")}</p>`;
      renderedSong = s;
      renderedMeasure = index;
    }
    cards
      .querySelectorAll<HTMLElement>("[data-lyric]")
      .forEach((el) =>
        el.setAttribute(
          "aria-selected",
          String(selected.has(el.dataset.lyric!)),
        ),
      );
    $("lyric-summary").textContent = t("editorWork.summary", {
      measure: m.label,
      count: items.length,
      selected: selected.size,
    });
    h.selectionChanged(selected);
  }
  cards.setAttribute("role", "listbox");
  cards.setAttribute("aria-multiselectable", "true");
  cards.addEventListener("pointerdown", (e) => {
    if ((e.target as Element).closest("input,textarea,button,select")) return;
    const item = (e.target as Element).closest<HTMLElement>("[data-lyric]");
    if (!item) return;
    selection(item.dataset.lyric!, e.shiftKey, true);
    selecting = true;
    e.preventDefault();
  });
  cards.addEventListener("pointerover", (e) => {
    if (!selecting || !e.buttons) return;
    const item = (e.target as Element).closest<HTMLElement>("[data-lyric]");
    if (item) selection(item.dataset.lyric!, true);
  });
  const stopSelecting = () => {
    selecting = false;
  };
  window.addEventListener("pointerup", stopSelecting);
  cards.addEventListener("focusin", (e) => {
    const item = (e.target as Element).closest<HTMLElement>("[data-lyric]");
    if (item) selection(item.dataset.lyric!);
  });
  cards.addEventListener("change", (e) =>
    run(() => {
      const input = e.target as HTMLInputElement,
        id = input.closest<HTMLElement>("[data-lyric]")?.dataset.lyric;
      if (!id) return;
      h.edit((s) => {
        const l = s.lyrics.find((l) => l.id === id)!;
        if (input.dataset.field === "text") l.text = input.value;
        else if (input.dataset.field === "confirmed")
          l.confirmed = input.checked;
      });
      render();
    }),
  );
  function move(id: string, target: number, source = h.song()) {
    const lyrics = moveLyric(
      source,
      id,
      target,
      grid(),
      h.record().lyricWork?.groups,
    );
    h.edit((s) => {
      s.lyrics = lyrics;
    });
    render();
  }
  pane.addEventListener("keydown", (e) => {
    if (
      e.isComposing ||
      e.metaKey ||
      e.ctrlKey ||
      e.altKey ||
      (e.target as Element).closest(
        "input,textarea,select,[contenteditable=true]",
      )
    )
      return;
    if (!["m", "s", "arrowleft", "arrowright"].includes(e.key.toLowerCase()))
      return;
    e.preventDefault();
    e.stopPropagation();
    run(() => {
      if (e.key.startsWith("Arrow")) {
        const id = [...selected][0],
          l = h.song().lyrics.find((l) => l.id === id);
        if (l)
          move(
            id,
            lyricAxis(h.song()).at(l) +
              ((e.key === "ArrowRight" ? 1 : -1) * 4) / grid(),
          );
        return;
      }
      const r = h.record(),
        ids = [...selected];
      const result = (e.key.toLowerCase() === "m" ? mergeLyrics : splitLyrics)(
        h.song(),
        ids,
        r.lyricWork?.groups,
      );
      // edit() snapshots the complete record before replacing component evidence.
      h.edit(
        (s) => {
          s.lyrics = result.lyrics;
        },
        { ...r.lyricWork, groups: result.groups },
      );
      renderedSong = undefined;
      render();
    });
  });
  return {
    render,
    selection,
    selected: () => selected,
    move,
    grid,
    dispose: () => window.removeEventListener("pointerup", stopSelecting),
  };
}
