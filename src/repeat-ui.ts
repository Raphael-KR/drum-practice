import { locate, beatTime, uid, type Song, type Loop } from "./model";
import { centeredRange, loopMeasureRange } from "./practice-controls";
import { t } from "./i18n";
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
export function repeatFields(s: Song, l: Pick<Loop, "start" | "end">) {
  const a = locate(s, l.start),
    range = loopMeasureRange(s, l.start, l.end),
    last = s.measures[range.last];
  const endBeat = ((l.end - last.start) / (last.end - last.start)) * last.beats;
  return {
    startMeasure: a.index + 1,
    endMeasure: range.last + 1,
    startBeat: Number((a.beat + 1).toFixed(4)),
    endBeat: Number((endBeat + 1).toFixed(4)),
    precise:
      Math.abs(l.start - a.measure.start) > 1e-5 ||
      Math.abs(l.end - last.end) > 1e-5,
  };
}
export function fillRepeatFields(
  root: HTMLElement,
  s: Song,
  l: Pick<Loop, "start" | "end">,
) {
  const f = repeatFields(s, l);
  for (const [id, value] of [
    ["loop-a", f.startMeasure],
    ["loop-b", f.endMeasure],
    ["loop-ab", f.startBeat],
    ["loop-bb", f.endBeat],
  ] as const)
    (root.querySelector(`#${id}`) as HTMLInputElement).value = String(value);
  return f;
}
export function repeatPoint(
  s: Song,
  measure: number,
  beat: number | undefined,
  end: boolean,
) {
  const m = s.measures[measure - 1];
  if (!Number.isInteger(measure) || !m) throw Error(t("main.message261"));
  if (beat === undefined) return end ? m.end : m.start;
  if (!Number.isFinite(beat) || beat < 1 || beat > m.beats + 1)
    throw Error(t("main.message262"));
  return beatTime(m, beat - 1);
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
) {
  const range = loop && loopMeasureRange(s, loop.start, loop.end);
  root.querySelector(`#${bindings.summary}`)!.textContent = range
    ? t("main.message269", {
        value1: range.first + 1,
        value2: range.last + 1,
        value3: range.last - range.first + 1,
      })
    : t("main.message270");
  (root.querySelector(`#${bindings.stop}`) as HTMLElement).hidden = !loop;
  (root.querySelector("#recenter-loop") as HTMLElement).hidden = !loop;
  root.querySelector(`#${bindings.adjust}`)?.classList.toggle("is-on", !!loop);
  root.querySelectorAll<HTMLElement>(`[${bindings.attribute}]`).forEach((b) => {
    const active =
      !!loop && Number(b.getAttribute(bindings.attribute)) === radius;
    b.classList.toggle("primary", active);
    b.setAttribute("aria-pressed", String(active));
  });
}
