import { t } from "./i18n";
import { escapeHTML as esc } from "./html";
import { locate, uid, type Song, type Loop } from "./model";

export function savedLoopSlots(song: Song): (Loop | undefined)[] {
  const ids = song.repeatSlots ?? song.loops.slice(0, 12).map(l => l.id);
  return Array.from({ length: 12 }, (_, i) => song.loops.find(l => l.id === ids[i]));
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
}
export function edgeSpeed(position: number, low: number, high: number) {
  return position < low ? -Math.min(900, 80 + (low - position) * 6)
    : position > high ? Math.min(900, 80 + (position - high) * 6) : 0;
}
interface Host {
  song(): Song;
  player(): {loop?: Loop};
  ready(): boolean;
  pause(): void;
  use(loop?: Loop): void;
  changed(): void;
}
/** Owns range selection exclusively while armed; regular score gestures remain untouched otherwise. */
export function mountLoopSlots(root: HTMLElement, stage: HTMLElement, h: Host) {
  const grid = root.querySelector<HTMLElement>("#loop-slots")!;
  let armed: number | undefined, songId: string | undefined;
  let drag: {id:number; a:number; b:number; x:number; y:number} | undefined;
  let frame = 0, last = 0, menu: number | undefined;
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
    stage.querySelectorAll<HTMLElement>("[data-index]").forEach(el => {
      const i = Number(el.dataset.index);
      el.classList.toggle("range-selecting", !!drag && i >= Math.min(drag.a, drag.b) && i <= Math.max(drag.a, drag.b));
    });
  }
  function render() {
    if (!grid || !h.ready()) return;
    if (songId !== undefined && songId !== h.song().id) cancel();
    const slots = savedLoopSlots(h.song());
    grid.innerHTML = slots.slice(0, 9).map((loop, i) => {
      if (menu === i) return `<div class="loop-slot-menu"><button data-replace="${i}">${t("ranges.replace")}</button><button data-delete="${i}">${t("ranges.delete")}</button><button data-dismiss aria-label="${t("ranges.close")}">×</button></div>`;
      const label = armed === i ? (drag ? rangeLabel(measureLoop(h.song(), drag.a, drag.b, "preview")) : t("ranges.drag")) : loop ? rangeLabel(loop) : t("ranges.empty");
      return `<button data-loop-slot="${i}" class="${armed === i ? "armed" : ""}" aria-pressed="${!!loop && h.player().loop?.id === loop.id}" aria-label="${esc(t("ranges.slot", {number:i + 1, label}))}${armed === i ? t("ranges.cancelHint") : ''}">${esc(label)}</button>`;
    }).join("");
    paint();
  }
  function cancel() {
    const pointer = drag?.id;
    drag = undefined; armed = undefined; menu = undefined;
    cancelAnimationFrame(frame); frame = 0;
    if (pointer !== undefined && stage.hasPointerCapture?.(pointer)) stage.releasePointerCapture(pointer);
    stage.classList.remove("range-selection-mode");
    paint();
  }
  function arm(slot: number) {
    cancel(); h.pause(); armed = slot; songId = h.song().id;
    stage.classList.add("range-selection-mode"); render();
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
  function preview() {
    if (!drag) return;
    const index = indexAt(drag.x, drag.y);
    if (index !== undefined && index !== drag.b) { drag.b = index; render(); }
  }
  function tick(now: number) {
    if (!drag) return;
    const r = stage.getBoundingClientRect(), dt = Math.min(32, now - last || 16) / 1000;
    last = now;
    if (h.song().settings.view === "ribbon") stage.scrollLeft += edgeSpeed(drag.x, r.left, r.right) * dt;
    else stage.scrollTop += edgeSpeed(drag.y, r.top, r.bottom) * dt;
    preview(); frame = requestAnimationFrame(tick);
  }
  listen(stage, "pointerdown", ((e: PointerEvent) => {
    if (armed === undefined || e.button !== 0) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (drag) return;
    const index = indexAt(e.clientX, e.clientY);
    if (index === undefined) return;
    drag = { id:e.pointerId, a:index, b:index, x:e.clientX, y:e.clientY };
    stage.setPointerCapture?.(e.pointerId); last = 0; render(); frame = requestAnimationFrame(tick);
  }) as EventListener, true);
  listen(stage, "pointermove", ((e: PointerEvent) => {
    if (!drag || drag.id !== e.pointerId) return;
    e.preventDefault(); e.stopImmediatePropagation(); drag.x = e.clientX; drag.y = e.clientY; preview();
  }) as EventListener, true);
  listen(stage, "pointerup", ((e: PointerEvent) => {
    if (!drag || drag.id !== e.pointerId || armed === undefined) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const slot = armed, old = savedLoopSlots(h.song())[slot];
    const loop = measureLoop(h.song(), drag.a, drag.b, old?.id);
    const replaceActive = old && h.player().loop?.id === old.id;
    cancel(); storeLoopSlot(h.song(), slot, loop);
    if (replaceActive) h.use();
    h.changed(); render();
  }) as EventListener, true);
  for (const type of ["pointercancel", "lostpointercapture"]) listen(stage, type, (() => {
    if (drag) { cancel(); render(); }
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
    else { cancel(); h.use(h.player().loop?.id === loop.id ? undefined : loop); render(); }
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
  listen(document, "keydown", ((e: KeyboardEvent) => {
    if (e.key === "Escape" && (armed !== undefined || menu !== undefined)) { e.preventDefault(); e.stopImmediatePropagation(); cancel(); render(); }
    if (e.key === "F10" && e.shiftKey && grid.contains(document.activeElement)) {
      const el = document.activeElement as HTMLElement;
      if (el.dataset.loopSlot !== undefined && savedLoopSlots(h.song())[Number(el.dataset.loopSlot)]) { e.preventDefault(); menu = Number(el.dataset.loopSlot); render(); }
    }
  }) as EventListener, true);
  listen(document, "pointerdown", ((e: PointerEvent) => {
    if (armed !== undefined && !stage.contains(e.target as Node) && !grid.contains(e.target as Node)) { cancel(); render(); }
  }) as EventListener, true);
  listen(document, "visibilitychange", (() => { if (document.hidden && drag) { cancel(); render(); } }) as EventListener);
  return {render, cancel, get selecting() { return armed !== undefined; },
    focus() { grid.querySelector<HTMLElement>("button")?.focus(); },
    dispose() {clearPress(); cancel(); cleanups.forEach(f => f());},
  };
}
