import { t } from "./i18n";
import { escapeHTML as esc } from "./html";
import { locate, type Song, type Loop } from "./model";
import type { createPlaybackScreen } from "./playback-screen";

export function practiceLoopHTML(heading = false) {
  return `${heading ? `<h2>${t("main.message132")}</h2>` : ""}<div class="flex"><button id="set-a">${t("workspace.message557")}</button><button id="set-b">${t("workspace.message558")}</button></div><div class="flex"><input id="loop-name" type="text" placeholder="${t("main.message139")}" aria-label="${t("main.message140")}"><button id="save-loop">${t("main.message141")}</button><button id="new-loop">${t("main.message142")}</button><button id="stop-loop">${t("main.message143")}</button></div><div class="list" id="loops"></div>`;
}
export function practiceMarkerHTML(heading = false) {
  return `${heading ? `<h2>${t("icons.message069")}</h2>` : ""}<div class="flex"><input id="marker-name" type="text" placeholder="${t("main.message144")}" aria-label="${t("main.message145")}"><button id="add-marker">${t("icons.message061")}</button></div><div id="markers" class="list"></div>`;
}
type Playback = Pick<
  ReturnType<typeof createPlaybackScreen>,
  | "loopFromForm"
  | "clearPreset"
  | "useLoop"
  | "stopLoop"
  | "updateLoopBeatBounds"
  | "mark"
  | "renderLists"
  | "seek"
>;
interface Options {
  root: HTMLElement;
  song(): Song;
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
  let editingLoopId: string | undefined;
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
  const reset = () => {
    editingLoopId = undefined;
    input("loop-name").value = "";
    get("save-loop").textContent = t("main.message264");
  };
  const draft = () => ({ id: editingLoopId, name: input("loop-name").value });
  function loopChanged(loop?: Loop) {
    if (!loop) return;
    editingLoopId = h.song().loops.some((l) => l.id === loop.id)
      ? loop.id
      : undefined;
    input("loop-name").value = loop.name;
    get("save-loop").textContent = t(
      editingLoopId ? "main.message263" : "main.message264",
    );
  }
  function markerName() {
    const name = input("marker-name").value.trim();
    input("marker-name").value = "";
    return name;
  }
  listen("save-loop", () => {
    const loop = h
      .playback()
      .loopFromForm(editingLoopId, input("loop-name").value);
    const index = h.song().loops.findIndex((l) => l.id === loop.id);
    if (index < 0) h.song().loops.push(loop);
    else h.song().loops[index] = loop;
    h.playback().clearPreset();
    h.playback().useLoop(loop, true);
    h.changed();
  });
  listen("stop-loop", () => h.playback().stopLoop());
  listen("new-loop", reset);
  for (const [id, prefix] of [
    ["set-a", "loop-a"],
    ["set-b", "loop-b"],
  ])
    listen(id, () => {
      const position = locate(h.song(), h.player().current());
      input(prefix).value = String(position.index + 1);
      input(prefix === "loop-a" ? "loop-ab" : "loop-bb").value = String(
        Math.floor(position.beat * 4) / 4 + 1,
      );
      h.playback().updateLoopBeatBounds();
    });
  for (const id of ["add-marker", "quick-add-marker"])
    listen(id, () => h.playback().mark());
  const refresh = () => {
    h.playback().renderLists();
    h.changed();
  };
  listen("markers", (event) => {
    const button = (event.target as HTMLElement).closest("button");
    if (!button) return;
    const song = h.song();
    if (button.dataset.marker) {
      const marker = song.markers.find((m) => m.id === button.dataset.marker);
      if (marker) h.playback().seek(marker.time);
    }
    if (button.dataset.renameMarker) {
      const marker = song.markers.find(
        (m) => m.id === button.dataset.renameMarker,
      );
      if (marker) {
        const name = prompt(t("main.message145"), marker.name);
        if (name?.trim()) marker.name = name.trim();
      }
    }
    if (button.dataset.deleteMarker)
      song.markers = song.markers.filter(
        (m) => m.id !== button.dataset.deleteMarker,
      );
    refresh();
  });
  listen("loops", (event) => {
    const button = (event.target as HTMLElement).closest("button");
    if (!button) return;
    const song = h.song();
    if (button.dataset.loop) {
      h.playback().clearPreset();
      h.playback().useLoop(
        song.loops.find((l) => l.id === button.dataset.loop),
      );
    }
    if (button.dataset.renameLoop) {
      const loop = song.loops.find((l) => l.id === button.dataset.renameLoop);
      if (loop) {
        const name = prompt(t("main.message140"), loop.name);
        if (name?.trim()) {
          loop.name = name.trim();
          if (h.player().loop?.id === loop.id)
            h.player().loop!.name = loop.name;
          loopChanged(loop);
        }
      }
    }
    if (button.dataset.deleteLoop) {
      if (h.player().loop?.id === button.dataset.deleteLoop)
        h.playback().useLoop();
      song.loops = song.loops.filter((l) => l.id !== button.dataset.deleteLoop);
      if (editingLoopId === button.dataset.deleteLoop) reset();
    }
    refresh();
  });
  function render() {
    const song = h.song(),
      active = h.player().loop;
    const activeLabel = get("active-loop");
    if (activeLabel)
      activeLabel.textContent = active
        ? t("main.message271", { value1: active.name })
        : t("main.message270");
    const time = (seconds: number) =>
      `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
    get("markers").innerHTML = song.markers
      .map(
        (m) =>
          `<span class="listitem"><button data-marker="${esc(m.id)}">${esc(m.name)} <small>${time(m.time)}</small></button><button data-rename-marker="${esc(m.id)}" aria-label="${t("main.message274")}">✎</button><button data-delete-marker="${esc(m.id)}" aria-label="${t("main.message275")}">×</button></span>`,
      )
      .join("");
    get("loops").innerHTML = song.loops
      .map(
        (l) =>
          `<span class="listitem ${active?.id === l.id ? "active" : ""}"><button data-loop="${esc(l.id)}">${esc(l.name)}</button><button data-rename-loop="${esc(l.id)}" aria-label="${t("main.message276")}">✎</button><button data-delete-loop="${esc(l.id)}" aria-label="${t("main.message277")}">×</button></span>`,
      )
      .join("");
    h.paginate?.("markers");
    h.paginate?.("loops");
  }
  return {
    render,
    reset,
    draft,
    loopChanged,
    markerName,
    dispose: () => dispose.splice(0).forEach((f) => f()),
  };
}
