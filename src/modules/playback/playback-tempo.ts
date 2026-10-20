import type { PlaybackScreenHost } from "./playback-screen";
import { clamp, type Song } from "../../model/model";
import { currentAudioBpm, originalTempoMode } from "../audio/audio-time-map";
import { readRecordingTempo } from "../../content/recording-tempo";
import { t } from "../../shared/i18n/i18n";
interface TempoControls {
  get<T extends HTMLElement = HTMLElement>(id: string): T;
  input(id: string): HTMLInputElement;
  available(): boolean;
  isDisposed(): boolean;
  sync(): void;
  open(id: string): void;
  action(id: string, fn: () => unknown): void;
  listen(target: EventTarget, type: string, fn: EventListener): void;
  run(fn: () => unknown): void;
}
/** One tempo input pipeline for manual input and preset buttons. */
export function createPlaybackTempo(
  h: PlaybackScreenHost,
  controls: TempoControls,
) {
  const { root, ids } = h;
  const { get, input, available, isDisposed, sync, open, action, listen, run } =
    controls;
  let tempoSong: Song | undefined, liveBpm: number | undefined;
  function headerBpm() {
    const s = h.song();
    if (tempoSong !== s) {
      tempoSong = s;
      liveBpm = undefined;
    }
    if (!originalTempoMode(s))
      return String(Number((originalAudioBpm() * s.settings.rate).toFixed(3)));
    if (h.player().playing) liveBpm = currentAudioBpm(s, h.player().current());
    return (liveBpm ?? s.bpm).toFixed(1);
  }
  function syncHeaderBpm() {
    const bpm = headerBpm(),
      label = `= ${bpm}`;
    const value = root.querySelector("#original-tempo-value");
    if (value && value.textContent !== label) {
      value.textContent = label;
      get(ids.tempo).setAttribute(
        "aria-label",
        t("main.message210", { value1: bpm }),
      );
    }
  }
  function originalAudioBpm() {
    const song = h.song();
    if (song.measures.some((m) => m.beatTimes)) return song.bpm;
    const recording = readRecordingTempo(h.canonicalXML?.());
    return recording?.scoreBpm === song.bpm ? recording.bpmEstimate : song.bpm;
  }
  function minimumPracticeBpm() {
    // Keep integer BPM presets at or above the supported 0.5 playback rate.
    return Math.ceil(originalAudioBpm() * 0.5);
  }
  async function rate(bpm: number, original = false) {
    if (!available()) return;
    h.setBusy(true);
    const notice = get("tempo-status");
    notice.textContent = "";
    notice.classList.remove("error");
    const report = (message: string) => {
      if (!isDisposed()) notice.textContent = message;
    };
    try {
      if (!Number.isFinite(bpm) || bpm <= 0) throw Error(t("main.message248"));
      const baseBpm = originalAudioBpm();
      await h
        .player()
        .setRate(
          original
            ? 1
            : clamp(bpm / baseBpm, minimumPracticeBpm() / baseBpm, 1.2),
          original,
          report,
        );
      if (original) liveBpm = currentAudioBpm(h.song(), h.player().current());
      h.changed();
    } catch (error) {
      notice.classList.add("error");
      report(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      h.setBusy(false);
      sync();
    }
  }
  function openTempo() {
    const original = originalAudioBpm();
    get("tempo-options").innerHTML = [
      ...new Set(
        [0.5, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95].map((f) =>
          Math.ceil(original * f),
        ),
      ),
    ]
      .map(
        (bpm) =>
          `<button title="${t("tooltip.tempo", { bpm })}" data-tempo="${bpm}">${bpm} BPM</button>`,
      )
      .join("");
    get("tempo-reset").dataset.tempo = String(original);
    get("tempo-score").dataset.tempo = String(h.song().bpm);
    get("tempo-score").textContent = `${h.song().bpm} BPM`;
    get("tempo-score").title = t("tooltip.tempo", { bpm: h.song().bpm });
    sync();
    open("tempo");
  }
  action(ids.tempo, openTempo);
  function applyTempoInput(original = false) {
    const value = input(ids.tempoInput);
    value.setAttribute("aria-valuenow", value.value);
    return rate(Number(value.value), original);
  }
  function selectTempo(bpm: number, original = false) {
    if (!available()) return;
    input(ids.tempoInput).value = String(bpm);
    return applyTempoInput(original);
  }
  action("tempo-reset", () => selectTempo(h.song().bpm, true));
  action("tempo-score", () => selectTempo(h.song().bpm));
  listen(get("tempo-options"), "click", (e) => {
    const b = (e.target as Element).closest<HTMLElement>("[data-tempo]");
    if (b && h.ready()) run(() => selectTempo(Number(b.dataset.tempo)));
  });
  listen(input(ids.tempoInput), "change", () => run(() => applyTempoInput()));
  return {
    rate,
    headerBpm,
    syncHeaderBpm,
    originalAudioBpm,
    minimumPracticeBpm,
  };
}
