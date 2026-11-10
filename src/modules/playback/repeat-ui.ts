import { locate, uid, type Song, type Loop } from "../../model/model";
import { centeredRange, loopMeasureRange } from "./practice-controls";
import { t } from "../../shared/i18n/i18n";
export function repeatPreset(
  s: Song,
  time: number,
  duration: number,
  radius: number,
  center?: number,
) {
  const range = centeredRange(
    s.measures,
    center ?? locate(s, time).index,
    radius,
    duration,
  );
  if (range.end <= range.start) throw Error(t("main.message267"));
  return {
    center: range.center,
    loop: {
      id: uid(),
      name: t("main.message266", {
        value1: range.first + 1,
        value2: range.last + 1,
      }),
      start: range.start,
      end: range.end,
    },
  };
}
export function updateRepeatControls(
  root: HTMLElement,
  s: Song,
  loop: Loop | undefined,
  radius: number | undefined,
  bindings: {
    summary: string;
    stop: string;
    adjust: string;
    attribute: string;
  },
  presets: ReadonlyMap<number, Loop> = new Map(),
) {
  const toggle = root.querySelector<HTMLElement>(`#${bindings.adjust}`);
  toggle?.classList.toggle("primary", !!loop);
  toggle?.setAttribute("aria-pressed", String(!!loop));
  root.querySelectorAll<HTMLElement>(`[${bindings.attribute}]`).forEach((b) => {
    const active =
      !!loop && Number(b.getAttribute(bindings.attribute)) === radius;
    const saved =
      presets.get(Number(b.getAttribute(bindings.attribute))) ??
      (active ? loop : undefined);
    const range = saved && loopMeasureRange(s, saved.start, saved.end);
    b.textContent = range
      ? `${range.first + 1}~${range.last + 1}`
      : t("workspace.message550", {
          radius: Number(b.getAttribute(bindings.attribute)),
        });
    b.classList.toggle("primary", active);
    b.setAttribute("aria-pressed", String(active));
  });
}
