/** Hold hints never turn into a click. Only actionable hints may survive release. */
export function bindHelpHold(options: {
  target: (event: Event) => HTMLElement | undefined;
  show: (target: HTMLElement) => void;
  hide: () => void;
  enabled: () => boolean;
  interactive?: () => boolean;
  inside?: (event: Event) => boolean;
  release?: () => void;
}) {
  let press:
    | { target: HTMLElement; id: number; x: number; y: number; shown: boolean }
    | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let suppressed: HTMLElement | undefined;
  const abort = new AbortController();
  const listen = (type: string, fn: EventListener) =>
    window.addEventListener(type, fn, { capture: true, signal: abort.signal });
  const clear = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    press = undefined;
    options.hide();
  };
  listen("pointerdown", (event) => {
    if (options.inside?.(event)) return;
    clear();
    suppressed = undefined;
    const e = event as PointerEvent;
    if (e.button !== 0 || e.isPrimary === false || !options.enabled()) return;
    const target = options.target(event);
    if (!target) return;
    press = {
      target,
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      shown: false,
    };
    timer = setTimeout(() => {
      if (!press || !target.isConnected) return;
      press.shown = true;
      suppressed = target;
      options.show(target);
    }, 650);
  });
  listen("pointermove", (event) => {
    const e = event as PointerEvent;
    if (
      press &&
      e.pointerId === press.id &&
      Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10
    )
      clear();
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
    listen(type, (event) => {
      if (!press || (event as PointerEvent).pointerId !== press.id) return;
      if (type === "pointerup" && press.shown && options.interactive?.()) {
        press = undefined;
        options.release?.();
      } else clear();
    });
  listen("click", (event) => {
    if (
      suppressed &&
      event.target instanceof Node &&
      (suppressed.contains(event.target) ||
        event.target === suppressed.closest("label"))
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      suppressed = undefined;
    }
  });
  listen("contextmenu", (event) => {
    // Keep an explicit desktop right-click menu; suppress touch callouts during a hold.
    if (press) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
  for (const type of ["scroll", "pagehide"]) listen(type, clear);
  listen("blur", (event) => {
    if (event.target === event.currentTarget) clear();
  });
  listen("keydown", (event) => {
    suppressed = undefined;
    if (options.interactive?.()) {
      if ((event as KeyboardEvent).key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    clear();
  });
  return () => {
    clear();
    abort.abort();
  };
}
