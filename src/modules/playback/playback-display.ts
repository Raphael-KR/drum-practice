import { readRecordingTempo } from "../../content/recording-tempo";
import { metronomeVolume } from "../../model/metronome";
import { t } from "../../shared/i18n/i18n";
import { tempoNote } from "../../shared/ui/icon-svg";
import { originalTempoMode } from "../audio/audio-time-map";
import { formatSongTitle } from "../library/song-title";
import { sliderFromZoom } from "../score/score-zoom";
import type { PlaybackScreenHost } from "./playback-screen";
import {
  syncMetronomeControls,
  syncSettingsChoices,
} from "./playback-settings";
import type { installPhoneLandscapeSettings } from "./playback-settings-layout";
import type { createPlaybackTempo } from "./playback-tempo";
import type { installScoreOnlyView } from "./score-only-view";

interface DisplayControls {
  get<T extends HTMLElement = HTMLElement>(id: string): T;
  input(id: string): HTMLInputElement;
  tempo: ReturnType<typeof createPlaybackTempo>;
  scoreOnlyView: ReturnType<typeof installScoreOnlyView>;
  settingsLayout: ReturnType<typeof installPhoneLandscapeSettings>;
  requestFrame(): void;
  syncRepeatAvailability(): void;
  isDisposed(): boolean;
}

/** Synchronize existing controls; the screen retains playback state and persistence. */
export function createPlaybackDisplay(
  h: PlaybackScreenHost,
  controls: DisplayControls,
) {
  const { root, ids } = h;
  const {
    get,
    input,
    scoreOnlyView,
    settingsLayout,
    requestFrame,
    syncRepeatAvailability,
    isDisposed,
  } = controls;
  const {
    refreshSources,
    prepareTempo,
    originalAudioBpm,
    headerBpm,
    minimumPracticeBpm,
  } = controls.tempo;
  // A pending host view change is serialized and stops synchronizing after screen disposal.
  let applyingDisplayMode = false;
  function sync() {
    if (!h.ready()) return;
    refreshSources();
    prepareTempo();
    const s = h.song(),
      bpm = originalTempoMode(s)
        ? s.bpm
        : Number((originalAudioBpm() * s.settings.rate).toFixed(3));
    get(ids.title).textContent = formatSongTitle(s);
    const info = root.querySelector<HTMLElement>("#recording-tempo-info");
    if (info) {
      const recording = readRecordingTempo(h.canonicalXML?.());
      info.hidden = !recording;
      info.textContent = recording
        ? t("tempo.recordingEstimate", {
            score: s.bpm,
            recording: recording.bpmEstimate,
            firstBeat: recording.firstBeatEstimateSeconds,
          })
        : "";
    }
    const tempo = get<HTMLButtonElement>(ids.tempo);
    tempo.hidden = tempo.disabled = false;
    tempo.innerHTML = `${tempoNote}<span id="original-tempo-value">= ${headerBpm()}</span>`;
    tempo.setAttribute(
      "aria-label",
      t("main.message210", { value1: headerBpm() }),
    );
    tempo.title = t("main.message211");
    const v = input(ids.tempoInput);
    if (!h.busy()) v.value = String(bpm);
    v.min = String(minimumPracticeBpm());
    v.max = String(Math.floor(originalAudioBpm() * 1.2));
    for (const [key, value] of [
      ["now", v.value],
      ["min", v.min],
      ["max", v.max],
    ])
      v.setAttribute(`aria-value${key}`, value);
    syncMetronomeControls(root, s.settings);
    input("music-volume").value = String(s.settings.musicVolume);
    input("click-volume").value = String(metronomeVolume(s.settings));
    for (const id of ["music-volume", "click-volume"]) {
      const output = root.querySelector(`#${id}-value`);
      if (output)
        output.textContent = `${Math.round(Number(input(id).value) * 100)}%`;
    }
    input("zoom").value = String(sliderFromZoom(s.settings.zoom));
    input("zoom").setAttribute(
      "aria-valuetext",
      `${Math.round(s.settings.zoom * 100)}%`,
    );
    get("zoom-value").textContent = `${Math.round(s.settings.zoom * 100)}%`;
    input("view").value = s.settings.view;
    root.querySelectorAll<HTMLElement>("[data-tempo]").forEach((b) => {
      const active =
        b.id === "tempo-reset"
          ? originalTempoMode(s)
          : !originalTempoMode(s) &&
            Math.abs(Number(b.dataset.tempo) - bpm) < 0.01;
      b.classList.toggle("primary", active);
      b.setAttribute("aria-pressed", String(active));
    });
    syncDisplay();
    h.player().volumes();
    h.settingsChanged?.();
  }
  function syncDisplay() {
    requestFrame();
    scoreOnlyView.sync();
    if (h.ready()) prepareTempo();
    settingsLayout.sync(scoreOnlyView.active());
    syncPhoneDisplayMode();
    syncRepeatAvailability();
    syncSettingsChoices(root);
    const view = h.ready() ? h.song().settings.view : input("view").value;
    const zoom = input("zoom");
    zoom.closest("label")!.hidden =
      view !== "ribbon" && !scoreOnlyView.active();
    zoom.disabled = view !== "ribbon";
    root
      .querySelectorAll<HTMLButtonElement>("[data-row-view]")
      .forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.rowView === view),
        );
        button.disabled = !h.ready() || h.busy();
      });
    get("view-description").textContent = t(
      view === "compare"
        ? "main.message224"
        : view === "rows"
          ? "main.message225"
          : "main.message226",
    );
    const pdf = h.ready() && h.song().scoreFormat !== "musicxml";
    const spacing = input("uniform-spacing");
    spacing.disabled =
      !h.ready() ||
      pdf ||
      view === "compare" ||
      !h.assets().ribbon?.get(0)?.grid;
    spacing.checked = h.ready() && !!h.song().settings.uniformSpacing;
    get("uniform-spacing-description").textContent = t(
      spacing.disabled
        ? "settings.uniformSpacingUnavailable"
        : "settings.uniformSpacingDescription",
    );
    const control = input(h.display.highlightId);
    control.disabled = view === "compare" || pdf;
    control.checked =
      !control.disabled && (scoreOnlyView.active() || h.highlight());
    get("note-highlight-description").textContent = t(
      view === "compare"
        ? "main.message252"
        : pdf
          ? h.formats().includes("musicxml")
            ? "main.message253"
            : "main.message254"
          : "main.message255",
    );
  }
  function syncPhoneDisplayMode() {
    if (
      !h.ready() ||
      h.busy() ||
      applyingDisplayMode ||
      !h.display.setPhoneLandscape
    )
      return;
    const phone = scoreOnlyView.active();
    applyingDisplayMode = true;
    void Promise.resolve()
      .then(() => {
        if (!isDisposed() && h.ready() && !h.busy())
          return h.display.setPhoneLandscape!(phone);
      })
      .catch(h.fail)
      .finally(() => {
        applyingDisplayMode = false;
        if (!isDisposed() && phone !== scoreOnlyView.active()) syncDisplay();
      });
  }

  return { sync, syncDisplay };
}
