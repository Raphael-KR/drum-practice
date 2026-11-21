import { xAtBeat, type Song } from "../../model/model";
import type { RecordData } from "../../model/record";
import { displayPage } from "../../modules/score/score-pages";
import { t } from "../../shared/i18n/i18n";
import { lyricAxis, moveLyric } from "./lyric-editing";
import { lyricBoxes, type LyricBox } from "./lyric-svg-geometry";
import type { createLyricEditor } from "./editor-lyrics";
import type { ScoreReview } from "./score-review";

interface Host {
  record(): RecordData | undefined;
  editor: ReturnType<typeof createLyricEditor>;
  engine(): { pause(): void };
  editable(): boolean;
  position(index: number, beat: number, width: number): number;
  review(): ScoreReview["layout"];
  error(error: unknown): void;
}
interface Frame {
  index: number;
  rect: DOMRect;
  position(beat: number): number;
}

/** Transparent targets follow native SVG glyph bounds; the score keeps sole ownership of visible text. */
export function installLyricStage(h: Host) {
  const stage = document.getElementById("stage")!;
  const cache = new Map<string, Promise<LyricBox[]>>();
  const events = new AbortController();
  const capture = { capture: true, signal: events.signal };
  let generation = 0,
    paint = 0,
    focusId: string | undefined,
    signature = "",
    loading: RecordData | undefined;
  let comparePages: LyricBox[][] = [];
  let drag:
    | {
        id: string;
        source: Song;
        x: number;
        y: number;
        target: number;
        moved: boolean;
        pointer: number;
        button: HTMLElement;
        failure?: unknown;
      }
    | undefined;
  const previews = document.createElement("div");
  previews.className = "lyric-drag-preview";
  const clearPreview = () => {
    previews.replaceChildren();
    previews.remove();
    stage.classList.remove("lyric-dragging");
  };
  function cancel() {
    if (drag?.button.hasPointerCapture(drag.pointer))
      drag.button.releasePointerCapture(drag.pointer);
    drag = undefined;
    clearPreview();
  }
  function frames(): Frame[] {
    const r = h.record();
    if (!r) return [];
    if (r.song.settings.view === "compare") {
      const canvas = document
        .getElementById("review-canvas")!
        .getBoundingClientRect();
      return h.review().map((f) => ({
        index: f.index,
        rect: new DOMRect(
          canvas.x + f.x,
          canvas.y + f.clipTop,
          f.width,
          f.clipBottom - f.clipTop,
        ),
        position: (beat: number) =>
          xAtBeat(f.region, r.song.measures[f.index], beat) * f.width,
      }));
    }
    return [...stage.querySelectorAll<HTMLElement>(".measure[data-index]")].map(
      (el) => {
        const index = Number(el.dataset.index),
          rect = el.querySelector(".crop")!.getBoundingClientRect();
        return {
          index,
          rect,
          position: (beat: number) => h.position(index, beat, rect.width),
        };
      },
    );
  }
  function targetAt(x: number, y: number) {
    const r = h.record()!,
      axis = lyricAxis(r.song);
    const choices = frames().sort(
      (a, b) =>
        Math.abs(a.rect.y + a.rect.height / 2 - y) -
        Math.abs(b.rect.y + b.rect.height / 2 - y),
    );
    const row = choices[0];
    if (!row) return undefined;
    const sameRow = choices.filter((f) => Math.abs(f.rect.y - row.rect.y) < 4);
    const f = sameRow.reduce((a, b) =>
      Math.max(a.rect.x - x, 0, x - a.rect.right) <=
      Math.max(b.rect.x - x, 0, x - b.rect.right)
        ? a
        : b,
    );
    const m = r.song.measures[f.index];
    let low = 0,
      high = m.beats;
    for (let i = 0; i < 24; i++) {
      const mid = (low + high) / 2;
      if (f.position(mid) < x - f.rect.x) low = mid;
      else high = mid;
    }
    return axis.starts[f.index] + ((low + high) * 2) / m.denominator;
  }
  function preview(target: number) {
    if (!drag) return;
    const record = h.record()!,
      axis = lyricAxis(drag.source);
    const lyrics = moveLyric(
      drag.source,
      drag.id,
      target,
      h.editor.grid(),
      record.lyricWork?.groups,
    );
    previews.replaceChildren();
    stage.append(previews);
    stage.classList.add("lyric-dragging");
    const bounds = stage.getBoundingClientRect(),
      visible = frames();
    for (const frame of visible) {
      const m = record.song.measures[frame.index];
      const grid = document.createElement("div");
      grid.className = "lyric-grid-preview";
      const first = frame.position(0),
        step =
          frame.position(
            record.song.measures[frame.index].denominator / h.editor.grid(),
          ) - first;
      Object.assign(grid.style, {
        left: `${frame.rect.x - bounds.x + stage.scrollLeft + first}px`,
        top: `${frame.rect.y - bounds.y + stage.scrollTop}px`,
        width: `${Math.max(0, frame.rect.width - first)}px`,
        height: `${frame.rect.height}px`,
        backgroundSize: `${step}px 100%`,
      });
      previews.append(grid);
      for (const lyric of lyrics.filter(
        (l) => l.scorePosition?.measureId === m.id,
      )) {
        const original = drag.source.lyrics.find((l) => l.id === lyric.id)!;
        if (Math.abs(axis.at(original) - axis.at(lyric)) < 1e-8) continue;
        const ghost = document.createElement("span");
        ghost.className = "lyric-preview-label";
        const beat = (lyric.scorePosition!.quarterOffset * m.denominator) / 4;
        ghost.textContent = `${lyric.text} · ${t("editorWork.beat", { value: Number((beat + 1).toFixed(4)) })}`;
        Object.assign(ghost.style, {
          left: `${frame.rect.x - bounds.x + stage.scrollLeft + frame.position(beat)}px`,
          top: `${frame.rect.bottom - bounds.y + stage.scrollTop - 32}px`,
        });
        previews.append(ghost);
      }
    }
  }
  function button(
    host: HTMLElement,
    box: LyricBox,
    left: number,
    top: number,
    width: number,
    height: number,
  ) {
    const lyric = h.record()?.song.lyrics.find((l) => l.id === box.id);
    if (!lyric) return;
    const target = document.createElement("button");
    target.type = "button";
    target.className = "lyric-hit";
    target.dataset.lyricHit = box.id;
    target.setAttribute("aria-label", lyric.text);
    target.title = lyric.text;
    target.setAttribute(
      "aria-pressed",
      String(h.editor.selected().has(box.id)),
    );
    target.addEventListener("blur", () => {
      if (!drag && document.activeElement !== document.body)
        focusId = undefined;
    });
    if (focusId === box.id)
      queueMicrotask(() => {
        if (
          target.isConnected &&
          focusId === box.id &&
          document.activeElement === document.body
        )
          target.focus({ preventScroll: true });
      });
    Object.assign(target.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${Math.max(8, width)}px`,
      height: `${Math.max(14, height)}px`,
    });
    host.append(target);
  }
  async function draw() {
    const r = h.record();
    if (!r || r !== loading) return;
    const token = generation,
      drawing = ++paint;
    const focused = document.activeElement as HTMLElement | null;
    focusId = focused?.dataset.lyricHit ?? focusId;
    stage
      .querySelectorAll(".lyric-hit,.lyric-compare-layer")
      .forEach((el) => el.remove());
    if (r.song.settings.view === "compare") {
      const layer = document.createElement("div");
      layer.className = "lyric-compare-layer";
      stage.append(layer);
      const canvas = document
          .getElementById("review-canvas")!
          .getBoundingClientRect(),
        bounds = stage.getBoundingClientRect();
      const dx = canvas.x - bounds.x + stage.scrollLeft,
        dy = canvas.y - bounds.y + stage.scrollTop;
      for (const f of h.review())
        for (const box of comparePages[f.page] ?? []) {
          const lyric = r.song.lyrics.find((l) => l.id === box.id);
          if (lyric?.scorePosition?.measureId !== r.song.measures[f.index].id)
            continue;
          const y = f.y + ((box.y - f.region.y) / f.region.h) * f.height;
          if (
            y + (box.h / f.region.h) * f.height < f.clipTop ||
            y > f.clipBottom
          )
            continue;
          button(
            layer,
            box,
            dx + f.x + ((box.x - f.region.x) / f.region.w) * f.width,
            dy + y,
            (box.w / f.region.w) * f.width,
            (box.h / f.region.h) * f.height,
          );
        }
      return;
    }
    for (const measure of stage.querySelectorAll<HTMLElement>(
      ".measure[data-index]",
    )) {
      const svg = measure.querySelector<SVGSVGElement>("svg.score-engraving"),
        image = svg?.querySelector("image");
      if (!svg || !image) continue;
      const url = image.href.baseVal;
      if (!cache.has(url))
        cache.set(
          url,
          fetch(url)
            .then((response) => response.text())
            .then((text) =>
              lyricBoxes(
                text,
                r.song.lyrics.map((l) => l.id),
              ),
            ),
        );
      const boxes = await cache.get(url)!;
      if (token !== generation || drawing !== paint || !measure.isConnected)
        return;
      const index = Number(measure.dataset.index),
        crop = measure.querySelector<HTMLElement>(".crop")!;
      const scale = svg.clientWidth / svg.viewBox.baseVal.width;
      for (const box of boxes) {
        if (
          r.song.lyrics.find((l) => l.id === box.id)?.scorePosition
            ?.measureId !== r.song.measures[index]?.id
        )
          continue;
        button(
          crop,
          box,
          (image.x.baseVal.value + box.x * image.width.baseVal.value) * scale,
          (image.y.baseVal.value + box.y * image.height.baseVal.value) * scale,
          box.w * image.width.baseVal.value * scale,
          box.h * image.height.baseVal.value * scale,
        );
      }
    }
  }
  function refresh(selectionOnly = false) {
    if (!h.record()) return;
    if (selectionOnly) {
      stage
        .querySelectorAll<HTMLElement>("[data-lyric-hit]")
        .forEach((el) =>
          el.setAttribute(
            "aria-pressed",
            String(h.editor.selected().has(el.dataset.lyricHit!)),
          ),
        );
      return;
    }
    const key = `${h.record()!.song.settings.view}:${h.record()!.song.settings.zoom}:${stage.clientWidth}:${h.review()[0]?.index ?? -1}:${h.review()[0]?.height ?? 0}`;
    if (key === signature || drag) return;
    signature = key;
    void draw().catch(h.error);
  }
  const observer = new MutationObserver((records) => {
    if (
      records.some((record) =>
        [...record.addedNodes].some(
          (node) =>
            node instanceof Element &&
            (node.matches(".measure,.score-row") ||
              node.querySelector(".measure")),
        ),
      )
    ) {
      signature = "";
      refresh();
    }
  });
  observer.observe(stage, { childList: true, subtree: true });
  stage.addEventListener(
    "pointerdown",
    (event) => {
      const target = (event.target as Element).closest<HTMLElement>(
        "[data-lyric-hit]",
      );
      if (!target) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!h.editable()) return;
      h.engine().pause();
      focusId = target.dataset.lyricHit;
      try {
        h.editor.selection(target.dataset.lyricHit!);
      } catch (e) {
        h.error(e);
        return;
      }
      target.focus({ preventScroll: true });
      const source = structuredClone(h.record()!.song),
        lyric = source.lyrics.find((l) => l.id === target.dataset.lyricHit)!;
      drag = {
        id: lyric.id,
        source,
        x: event.clientX,
        y: event.clientY,
        target: lyricAxis(source).at(lyric),
        moved: false,
        pointer: event.pointerId,
        button: target,
      };
      target.setPointerCapture(event.pointerId);
    },
    capture,
  );
  stage.addEventListener(
    "pointermove",
    (event) => {
      if (!drag) return;
      event.stopImmediatePropagation();
      if (Math.abs(event.clientX - drag.x) < 3 && !drag.moved) return;
      const target = targetAt(event.clientX, drag.y);
      if (target === undefined) return;
      try {
        preview(target);
        drag.target = target;
        drag.moved = true;
        drag.failure = undefined;
      } catch (e) {
        clearPreview();
        drag.moved = false;
        drag.failure = e;
      }
    },
    capture,
  );
  stage.addEventListener(
    "pointerup",
    (event) => {
      if (!drag) return;
      event.stopImmediatePropagation();
      event.preventDefault();
      const value = drag;
      cancel();
      if (value.failure) {
        h.error(value.failure);
        return;
      }
      if (value.moved)
        try {
          h.editor.move(value.id, value.target, value.source);
        } catch (e) {
          h.error(e);
        }
    },
    capture,
  );
  stage.addEventListener("pointercancel", cancel, capture);
  stage.addEventListener(
    "click",
    (event) => {
      if ((event.target as Element).closest("[data-lyric-hit]")) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    },
    capture,
  );
  stage.addEventListener(
    "dblclick",
    (event) => {
      if ((event.target as Element).closest("[data-lyric-hit]"))
        event.stopImmediatePropagation();
    },
    capture,
  );
  stage.addEventListener(
    "focusin",
    (event) => {
      const id = (event.target as HTMLElement).dataset.lyricHit;
      if (id && !drag && !h.editor.selected().has(id))
        try {
          h.editor.selection(id);
        } catch (e) {
          h.error(e);
        }
      if (!id) focusId = undefined;
    },
    { signal: events.signal },
  );
  stage.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" && drag) {
        event.preventDefault();
        event.stopImmediatePropagation();
        cancel();
        return;
      }
      const target = (event.target as Element).closest<HTMLElement>(
        "[data-lyric-hit]",
      );
      if (
        !target ||
        !["ArrowLeft", "ArrowRight"].includes(event.key) ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.isComposing ||
        !h.editable()
      )
        return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const s = h.record()!.song,
        id = target.dataset.lyricHit!,
        l = s.lyrics.find((l) => l.id === id)!;
      try {
        h.editor.move(
          id,
          lyricAxis(s).at(l) +
            ((event.key === "ArrowRight" ? 1 : -1) * 4) / h.editor.grid(),
        );
      } catch (e) {
        h.error(e);
      }
    },
    capture,
  );
  function clear() {
    generation++;
    loading = undefined;
    signature = "";
    cache.clear();
    comparePages = [];
    cancel();
    stage
      .querySelectorAll(".lyric-hit,.lyric-compare-layer")
      .forEach((el) => el.remove());
  }
  return {
    clear,
    dispose() {
      events.abort();
      observer.disconnect();
      clear();
    },
    refresh,
    dragging: () => !!drag,
    load(record: RecordData) {
      const focused = (document.activeElement as HTMLElement | null)?.dataset
        .lyricHit;
      const previous = loading;
      clear();
      focusId = previous === record ? focused : undefined;
      loading = record;
      const token = generation;
      if (record.song.scoreFormat !== "musicxml") return;
      void Promise.all(
        record.pages.map(async (page) =>
          lyricBoxes(
            await (await displayPage(page)).text(),
            record.song.lyrics.map((l) => l.id),
          ),
        ),
      )
        .then((pages) => {
          if (token !== generation) return;
          comparePages = pages;
          signature = "";
          refresh();
        })
        .catch(h.error);
    },
  };
}
