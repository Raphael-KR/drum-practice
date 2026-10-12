import { t } from "./i18n";
import { escapeHTML as esc } from "./html";
import { locate, uid, type Song, type Loop } from "./model";

export const LOOP_SLOT_COUNT = 9;
export function savedLoopSlots(song: Song): (Loop | undefined)[] {
  const ids = song.repeatSlots ?? song.loops.slice(0, 12).map(l => l.id);
  const visible = song.loops.filter(l => ids.slice(0, LOOP_SLOT_COUNT).includes(l.id))
    .sort((a, b) => a.start - b.start || a.end - b.end);
  // Preserve past hidden slots 10–12; only the visible nine are sorted/compacted.
  return [...Array.from({ length: LOOP_SLOT_COUNT }, (_, i) => visible[i]),
    ...Array.from({ length: 3 }, (_, i) => song.loops.find(l => l.id === ids[i + LOOP_SLOT_COUNT]))];
}
export function nextLoopSlot(song: Song): number {
  const slots = savedLoopSlots(song).slice(0, LOOP_SLOT_COUNT);
  const empty = slots.findIndex(loop => !loop);
  if (empty >= 0) return empty;
  // loops retains registration order even when repeatSlots is visually sorted.
  const oldest = song.loops.find(loop => slots.some(slot => slot?.id === loop.id))!;
  return slots.findIndex(loop => loop?.id === oldest.id);
}
export function measureLoop(song: Song, a: number, b: number, id: string = uid()): Loop {
  const first = song.measures[Math.min(a, b)], last = song.measures[Math.max(a, b)];
  return { id, name: `${first.label}~${last.label}`, start: first.start, end: last.end };
}
export function storeLoopSlot(song: Song, slot: number, loop?: Loop) {
  const slots = savedLoopSlots(song);
  const previous = slots[slot];
  song.repeatSlots = slots.map(l => l?.id ?? "");
  if (previous) song.loops = song.loops.filter(l => l.id !== previous.id);
  if (loop) song.loops.push(loop);
  song.repeatSlots[slot] = loop?.id ?? "";
  song.repeatSlots = savedLoopSlots(song).map(l => l?.id ?? "");
}
interface Host {
  song(): Song;
  player(): {loop?: Loop; current?(): number};
  ready(): boolean;
  pause(): void;
  use(loop?: Loop): void;
  changed(): void;
}
/** Owns range selection exclusively while armed; regular score gestures remain untouched otherwise. */
export function mountLoopSlots(root: HTMLElement, stage: HTMLElement, h: Host) {
  const grid = root.querySelector<HTMLElement>("#loop-slots")!;
  let armed: number | undefined, songId: string | undefined;
  let keyboardStart: number | undefined;
  let touchStart: number | undefined;
  let touch: {id:number; index:number; x:number; y:number; moved:boolean} | undefined;
  let menu: number | undefined;
  let press: ReturnType<typeof setTimeout> | undefined, suppressClick = false;
  const cleanups: (() => void)[] = [];
  const listen = (el: EventTarget, type: string, fn: EventListener, capture = false) => {
    el.addEventListener(type, fn, capture); cleanups.push(() => el.removeEventListener(type, fn, capture));
  };
  const rangeLabel = (loop: Loop) => {
    const song = h.song();
    return `${song.measures[locate(song, loop.start).index].label}~${song.measures[locate(song, Math.max(loop.start, loop.end - .001)).index].label}`;
  };
  function paint() {
    const a = touchStart ?? keyboardStart;
    const b = touchStart ?? (keyboardStart === undefined ? undefined : locate(h.song(), h.player().current?.() ?? 0).index);
    stage.querySelectorAll<HTMLElement>("[data-index]").forEach(el => {
      const i = Number(el.dataset.index);
      el.classList.toggle("range-selecting", a !== undefined && b !== undefined && i >= Math.min(a, b) && i <= Math.max(a, b));
    });
  }
  function render() {
    if (!grid || !h.ready()) return;
    if (songId !== undefined && songId !== h.song().id) cancel();
    const slots = savedLoopSlots(h.song());
    const keyboardSlot = keyboardStart === undefined ? undefined : nextLoopSlot(h.song());
    grid.innerHTML = slots.slice(0, LOOP_SLOT_COUNT).map((loop, i) => {
      if (keyboardSlot === i) return `<button data-loop-slot="${i}" class="armed" title="${esc(t("ranges.keyboardHint", {measure:h.song().measures[keyboardStart!].label}))}" aria-live="polite">${esc(t("ranges.keyboardEnd", {measure:h.song().measures[keyboardStart!].label}))}</button>`;
      if (menu === i) return `<div class="loop-slot-menu"><button title="${t("ranges.replace")}" data-replace="${i}">${t("ranges.replace")}</button><button title="${t("ranges.delete")}" data-delete="${i}">${t("ranges.delete")}</button><button data-dismiss title="${t("ranges.close")}" aria-label="${t("ranges.close")}">×</button></div>`;
      const label = armed === i ? (touchStart === undefined ? t("ranges.select") : t("ranges.tapEnd", {measure:h.song().measures[touchStart].label})) : loop ? rangeLabel(loop) : t("ranges.empty");
      return `<button data-loop-slot="${i}" class="${armed === i ? "armed" : loop ? "saved-range" : ""}" aria-pressed="${!!loop && h.player().loop?.id === loop.id}" title="${esc(armed === i ? t("tooltip.rangeCancel") : loop ? t("tooltip.rangeUse", {label}) : t("tooltip.rangeAdd"))}" aria-label="${esc(t("ranges.slot", {number:i + 1, label}))}${armed === i ? t("ranges.cancelHint") : ''}">${esc(label)}</button>`;
    }).join("");
    paint();
  }
  function cancel() {
    const pointer = touch?.id;
    touch = undefined; touchStart = undefined; armed = undefined; menu = undefined; keyboardStart = undefined;
    if (pointer !== undefined && stage.hasPointerCapture?.(pointer)) stage.releasePointerCapture(pointer);
    stage.classList.remove("range-selection-mode");
    paint();
  }
  function arm(slot: number) {
    cancel(); h.pause(); armed = slot; songId = h.song().id;
    stage.classList.add("range-selection-mode");
    render();
  }
  function indexAt(x: number, y: number) {
    const r = stage.getBoundingClientRect();
    const px = Math.max(r.left + 2, Math.min(r.right - 2, x));
    const py = Math.max(r.top + 30, Math.min(r.bottom - 2, y));
    let best: number | undefined, distance = Infinity;
    stage.querySelectorAll<HTMLElement>("[data-index]").forEach(el => {
      const b = el.getBoundingClientRect();
      if (b.bottom < r.top || b.top > r.bottom || b.right < r.left || b.left > r.right) return;
      const dx = Math.max(b.left - px, 0, px - b.right), dy = Math.max(b.top - py, 0, py - b.bottom);
      const d = dx * dx + dy * dy;
      if (d < distance) { distance = d; best = Number(el.dataset.index); }
    });
    return best;
  }
  function saveRange(a: number, b: number) {
    if (armed === undefined) return;
    const slot = armed, old = savedLoopSlots(h.song())[slot];
    const loop = measureLoop(h.song(), a, b, old?.id);
    const replaceActive = old && h.player().loop?.id === old.id;
    cancel(); storeLoopSlot(h.song(), slot, loop);
    if (replaceActive) h.use();
    h.changed(); render();
  }
  listen(stage, "pointerdown", ((e: PointerEvent) => {
    if (armed === undefined || e.button !== 0 || (e.pointerType !== "touch" && e.pointerType !== "mouse")) return;
    e.stopImmediatePropagation();
    if (e.isPrimary === false || touch) { touch = undefined; return; }
    const index = indexAt(e.clientX, e.clientY);
    if (index !== undefined) {
      touch = {id:e.pointerId, index, x:e.clientX, y:e.clientY, moved:false};
      if (e.pointerType === "mouse") {
        try { stage.setPointerCapture?.(e.pointerId); } catch { /* A cancelled pointer cannot be captured. */ }
      }
    }
  }) as EventListener, true);
  listen(stage, "pointermove", ((e: PointerEvent) => {
    if (armed === undefined || (e.pointerType !== "touch" && e.pointerType !== "mouse")) return;
    e.stopImmediatePropagation();
    if (touch?.id === e.pointerId && Math.hypot(e.clientX-touch.x,e.clientY-touch.y) > 8) touch.moved = true;
  }) as EventListener, true);
  listen(stage, "pointerup", ((e: PointerEvent) => {
    if (armed === undefined || (e.pointerType !== "touch" && e.pointerType !== "mouse")) return;
    e.stopImmediatePropagation();
    const tap = touch; touch = undefined;
    if (stage.hasPointerCapture?.(e.pointerId)) stage.releasePointerCapture(e.pointerId);
    if (!tap || tap.id !== e.pointerId || tap.moved || Math.hypot(e.clientX-tap.x,e.clientY-tap.y) > 8) return;
    e.preventDefault();
    if (touchStart === undefined) { touchStart = tap.index; render(); }
    else saveRange(touchStart, tap.index);
  }) as EventListener, true);
  for (const type of ["pointercancel", "lostpointercapture"]) listen(stage, type, ((e: PointerEvent) => {
    if (armed !== undefined && (e.pointerType === "touch" || e.pointerType === "mouse")) {
      e.stopImmediatePropagation(); touch = undefined;
    }
  }) as EventListener, true);
  listen(grid, "click", ((e: MouseEvent) => {
    if (suppressClick) { suppressClick = false; return; }
    const el = (e.target as Element).closest<HTMLElement>("button"); if (!el) return;
    if (el.hasAttribute("data-dismiss")) { menu = undefined; render(); return; }
    if (el.dataset.replace !== undefined) { arm(Number(el.dataset.replace)); return; }
    if (el.dataset.delete !== undefined) {
      const slot = Number(el.dataset.delete), loop = savedLoopSlots(h.song())[slot];
      if (loop && h.player().loop?.id === loop.id) h.use();
      cancel(); storeLoopSlot(h.song(), slot); h.changed(); render(); return;
    }
    if (el.dataset.loopSlot === undefined) return;
    const slot = Number(el.dataset.loopSlot);
    if (armed === slot) { cancel(); render(); return; }
    const loop = savedLoopSlots(h.song())[slot];
    if (!loop) arm(slot);
    else {
      const atStart = locate(h.song(), h.player().current?.() ?? 0).index === locate(h.song(), loop.start).index;
      if (atStart) {
        if (h.player().loop?.id === loop.id) h.use();
        cancel(); storeLoopSlot(h.song(), slot); h.changed(); render();
      } else {
        cancel(); h.use(loop); render();
      }
    }
  }) as EventListener);
  listen(grid, "pointerdown", ((e: PointerEvent) => {
    suppressClick = false;
    const el = (e.target as Element).closest<HTMLElement>("[data-loop-slot]");
    if (!el || !savedLoopSlots(h.song())[Number(el.dataset.loopSlot)]) return;
    const slot = Number(el.dataset.loopSlot);
    press = setTimeout(() => { press = undefined; suppressClick = true; cancel(); menu = slot; render(); }, 550);
  }) as EventListener);
  const clearPress = () => { if (press) clearTimeout(press); press = undefined; };
  for (const type of ["pointerup", "pointercancel", "pointerleave"]) listen(grid, type, clearPress);
  listen(grid, "contextmenu", ((e: Event) => {
    const el = (e.target as Element).closest<HTMLElement>("[data-loop-slot]");
    if (!el || !savedLoopSlots(h.song())[Number(el.dataset.loopSlot)]) return;
    e.preventDefault(); clearPress(); cancel(); menu = Number(el.dataset.loopSlot); render();
  }) as EventListener);
  function endpoint(index: number) {
    if (!h.ready() || !h.song().measures[index]) return;
    if (keyboardStart === undefined) {
      cancel(); h.pause(); keyboardStart = index; songId = h.song().id;
    } else {
      const slot = nextLoopSlot(h.song()), old = savedLoopSlots(h.song())[slot];
      const loop = measureLoop(h.song(), keyboardStart, index);
      const replaceActive = old && h.player().loop?.id === old.id;
      cancel(); storeLoopSlot(h.song(), slot, loop);
      if (replaceActive) h.use();
      h.changed();
    }
    render();
  }
  listen(document, "keydown", ((e: KeyboardEvent) => {
    if (e.key === "Enter" && h.ready() && !e.isComposing && !e.ctrlKey && !e.altKey && !e.metaKey &&
        !document.querySelector("dialog[open]") &&
        !(e.target as Element)?.closest?.("input,select,textarea,button,a,[contenteditable=true]")) {
      e.preventDefault(); e.stopImmediatePropagation();
      if (e.repeat || !h.song().measures.length) return;
      const index = locate(h.song(), h.player().current?.() ?? 0).index;
      endpoint(index);
      return;
    }
    if (e.key === "Escape" && (armed !== undefined || menu !== undefined || keyboardStart !== undefined)) { e.preventDefault(); e.stopImmediatePropagation(); cancel(); render(); }
    if (e.key === "F10" && e.shiftKey && grid.contains(document.activeElement)) {
      const el = document.activeElement as HTMLElement;
      if (el.dataset.loopSlot !== undefined && savedLoopSlots(h.song())[Number(el.dataset.loopSlot)]) { e.preventDefault(); menu = Number(el.dataset.loopSlot); render(); }
    }
  }) as EventListener, true);
  listen(document, "pointerdown", ((e: PointerEvent) => {
    if ((armed !== undefined || keyboardStart !== undefined) && !stage.contains(e.target as Node) && !grid.contains(e.target as Node)) { cancel(); render(); }
  }) as EventListener, true);
  listen(document, "visibilitychange", (() => { if (document.hidden && (touch || touchStart !== undefined)) { cancel(); render(); } }) as EventListener);
  return {render, cancel, endpoint, refreshKeyboardPreview() { if (keyboardStart !== undefined || touchStart !== undefined) paint(); }, get selecting() { return armed !== undefined; },
    focus() { grid.querySelector<HTMLElement>("button")?.focus(); },
    dispose() {clearPress(); cancel(); cleanups.forEach(f => f());},
  };
}
