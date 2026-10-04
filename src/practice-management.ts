import { readSectionShortcuts, sectionShortcutSlots } from "./section-shortcuts";
import { t } from "./i18n";
import { escapeHTML as esc } from "./html";
import { type Song, type Loop } from "./model";
import type { createPlaybackScreen } from "./playback-screen";

export function practiceLoopHTML(heading = false) {
  return `<div id="loop-slots" class="loop-slots" role="group" aria-label="${t("ranges.saved")}"></div>`;
}
export function practiceMarkerHTML(heading = false) {
  return `${heading ? `<h2>${t("icons.message069")}</h2>` : ""}<div id="section-shortcuts" class="section-shortcuts" role="group" aria-label="${t("sections.shortcuts")}"></div>`;
}
type Playback = Pick<ReturnType<typeof createPlaybackScreen>, "seek" | "mark" | "renderLists">;
interface Options {
  root: HTMLElement;
  song(): Song;
  canonicalXML?(): string | undefined;
  playback(): Playback;
  player(): { current(): number; loop?: Loop };
  changed(): void;
  fail(error: unknown): void;
  paginate?(id: string): void;
}
/** Named practice items belong to playback, including the author's preview. */
export function attachPracticeManagement(h: Options) {
  const get = (id: string) => h.root.querySelector<HTMLElement>(`#${id}`)!;
  const input = (id: string) => get(id) as HTMLInputElement;
  const dispose: (() => void)[] = [];
  const listen = (id: string, run: (event: MouseEvent) => void) => {
    const element = get(id);
    if (!element) return;
    const handler = (event: MouseEvent) => {
      try {
        run(event);
      } catch (error) {
        h.fail(error);
      }
    };
    element.addEventListener("click", handler);
    dispose.push(() => element.removeEventListener("click", handler));
  };
  listen("section-shortcuts", event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-section-measure]");
    if (!button || button.disabled) return;
    const measure = h.song().measures[Number(button.dataset.sectionMeasure)];
    if (measure) h.playback().seek(measure.start);
  });
  function render() {
    const song = h.song(),
      active = h.player().loop;
    const activeLabel = get("active-loop");
    if (activeLabel)
      activeLabel.textContent = active
        ? t("main.message271", { value1: active.name })
        : t("main.message270");
    get("section-shortcuts").innerHTML = sectionShortcutSlots(readSectionShortcuts(h.canonicalXML?.() ?? ""), song)
      .map((section, index) => section
        ? `<button type="button" data-section-measure="${section.measureIndex}" aria-label="${esc(section.name)} · ${esc(song.measures[section.measureIndex].label)}${t("sections.goMeasure")}"><strong>${esc(section.name)}</strong><span>${esc(song.measures[section.measureIndex].label)}&thinsp;${t("sections.measure")}</span></button>`
        : `<button type="button" disabled aria-label="${t("sections.empty", {number:index + 1})}">—</button>`)
      .join("");

  }
  return {
    render,
    dispose: () => dispose.splice(0).forEach((f) => f()),
  };
}
