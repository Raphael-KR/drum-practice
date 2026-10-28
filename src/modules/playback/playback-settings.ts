import { enterFullscreen } from "../../platform/browser/fullscreen";
import { clamp } from "../../model/model";
import {
  nextMetronomeMode,
  setMetronomeMode,
  type MetronomeMode,
} from "../../model/metronome";
import {
  readTitleOrder,
  saveTitleOrder,
  type TitleOrder,
} from "../library/song-title";
import { snapZoomSlider, zoomFromSlider } from "../score/score-zoom";
import type { PlaybackScreenHost } from "./playback-screen";

interface SettingsBindings {
  root: HTMLElement;
  get<T extends HTMLElement = HTMLElement>(id: string): T;
  input(id: string): HTMLInputElement;
  listen(target: EventTarget, type: string, listener: EventListener): void;
  run(fn: () => unknown): void;
  available(): boolean;
  sync(): void;
  renderTrack(): void;
  frame(): void;
}

// The screen owns listener registration/disposal; settings only bind their controls.
export function bindSoundAndViewSettings(
  h: PlaybackScreenHost,
  bindings: SettingsBindings,
) {
  const { root, get, input, listen, run, available, sync, renderTrack } =
    bindings;
  const changeMetronome = (mode: MetronomeMode) => {
    if (!available()) return;
    if (!setMetronomeMode(h.song().settings, mode)) return;
    h.player().updateMetronome();
    sync();
    h.changed();
  };
  listen(get("click"), "click", () => {
    if (available()) changeMetronome(nextMetronomeMode(h.song().settings));
  });
  // Keep native button activation from also reaching playback shortcuts.
  listen(get("click"), "keydown", (event) => {
    const key = event as KeyboardEvent;
    if (key.code === "Space" || key.key === "Enter") event.stopPropagation();
  });
  root
    .querySelectorAll<HTMLButtonElement>(
      "#metronome-choices [data-metronome-mode]",
    )
    .forEach((button) => {
      listen(button, "click", () =>
        changeMetronome(button.dataset.metronomeMode as MetronomeMode),
      );
    });
  for (const [id, key] of [
    ["music-volume", "musicVolume"],
    ["click-volume", "clickVolume"],
  ] as const) {
    const change = () => {
      if (!available()) return;
      h.song().settings[key] = clamp(Number(input(id).value), 0, 1);
      const output = root.querySelector(`#${id}-value`);
      if (output)
        output.textContent = `${Math.round(h.song().settings[key] * 100)}%`;
      h.player().volumes();
      h.changed();
    };
    listen(input(id), "input", change);
    listen(input(id), "change", change);
  }
  root
    .querySelectorAll<HTMLButtonElement>("[data-row-view]")
    .forEach((button) => {
      listen(button, "click", () => {
        if (!available()) return;
        input("view").value = button.dataset.rowView!;
        input("view").dispatchEvent(new Event("change"));
      });
    });
  for (const id of ["view", "zoom"])
    listen(input(id), "change", () =>
      run(() => {
        if (!h.ready()) {
          h.settingsChanged?.();
          return;
        }
        if (h.busy()) return;
        const s = h.song().settings;
        if (id === "view") {
          const view = input(id).value as typeof s.view;
          try {
            h.validateView?.(view);
          } catch (e) {
            sync();
            throw e;
          }
          s.view = view;
        } else s.zoom = zoomFromSlider(Number(input(id).value));
        sync();
        renderTrack();
        h.changed();
      }),
    );
  let draggingZoom = false;
  listen(input("zoom"), "pointerdown", () => {
    draggingZoom = true;
  });
  listen(window, "pointerup", () => {
    draggingZoom = false;
  });
  listen(window, "pointercancel", () => {
    draggingZoom = false;
  });
  listen(input("zoom"), "keydown", () => {
    draggingZoom = false;
  });
  listen(input("zoom"), "input", () => {
    if (!available()) return;
    if (draggingZoom)
      input("zoom").value = String(snapZoomSlider(Number(input("zoom").value)));
    h.song().settings.zoom = zoomFromSlider(Number(input("zoom").value));
    input("zoom").setAttribute(
      "aria-valuetext",
      `${Math.round(h.song().settings.zoom * 100)}%`,
    );
    get("zoom-value").textContent =
      `${Math.round(h.song().settings.zoom * 100)}%`;
    renderTrack();
    h.changed();
  });
}

export function bindPlaybackPreferences(
  h: PlaybackScreenHost,
  bindings: SettingsBindings,
) {
  const { root, input, listen, run, available, sync, renderTrack, frame } =
    bindings;
  const titleButtons = Array.from(
    root.querySelectorAll<HTMLButtonElement>("[data-title-order]"),
  );
  const syncTitleOrder = () =>
    titleButtons.forEach((button) => {
      const selected = button.dataset.titleOrder === readTitleOrder();
      button.classList.toggle("primary", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  syncTitleOrder();
  titleButtons.forEach((button) =>
    listen(button, "click", () =>
      run(() => {
        saveTitleOrder(button.dataset.titleOrder as TitleOrder);
        syncTitleOrder();
        sync();
      }),
    ),
  );
  const prefs = h.preferences;
  input(prefs.restartId).checked = prefs.read().restartMeasure;
  input(prefs.countoffId).checked = prefs.read().countOff;
  for (const id of [prefs.restartId, prefs.countoffId])
    listen(input(id), "change", () =>
      run(() =>
        prefs.write({
          restartMeasure: input(prefs.restartId).checked,
          countOff: input(prefs.countoffId).checked,
        }),
      ),
    );
  input(h.display.fullscreenId).checked = h.display.fullscreen();
  listen(input(h.display.fullscreenId), "change", () =>
    run(async () => {
      const value = input(h.display.fullscreenId).checked;
      h.display.setFullscreen(value);
      if (value && h.ready()) await enterFullscreen(h.display.report);
      else if (!value) {
        if (document.fullscreenElement) await document.exitFullscreen();
        h.display.report("");
      }
    }),
  );
  listen(input("uniform-spacing"), "change", () => {
    if (!available() || input("uniform-spacing").disabled) return;
    h.song().settings.uniformSpacing = input("uniform-spacing").checked;
    renderTrack();
    sync();
    frame();
    h.changed();
  });
  listen(input(h.display.highlightId), "change", () => {
    const inputElement = input(h.display.highlightId);
    if (!inputElement.disabled) h.display.setHighlight(inputElement.checked);
    if (h.ready()) {
      sync();
      frame();
    }
  });
}
