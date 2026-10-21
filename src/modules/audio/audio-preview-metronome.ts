import { Player } from "./audio-core";
import { beatEvents, preludeCountBeats, type Song } from "../../model/model";

// The correction preview plays music at unity; lift the short stick count-in.
const PREVIEW_COUNT_OFF_GAIN = 3;

/** Use the normal player's voices, but follow the native preview's source clock. */
export function bindAudioPreviewMetronome(
  audio: HTMLAudioElement,
  checkbox: HTMLInputElement,
  root: HTMLElement,
  getSong: () => Song,
  onError: (error: unknown) => void,
) {
  const listeners = new AbortController();
  let voice: Player | undefined;
  let timer: ReturnType<typeof setInterval> | undefined;
  let generation = 0,
    disposed = false;
  const stop = () => {
    generation++;
    clearInterval(timer);
    timer = undefined;
    voice?.pause(false);
  };
  const unlock = async () => {
    if (disposed || !checkbox.checked) return;
    voice ??= new Player();
    voice.countOff.gain.value = PREVIEW_COUNT_OFF_GAIN;
    if (voice.ctx.state === "suspended") await voice.ctx.resume();
  };
  const start = async () => {
    stop();
    const request = generation;
    if (
      disposed ||
      !checkbox.checked ||
      audio.paused ||
      audio.seeking ||
      audio.muted
    )
      return;
    try {
      await unlock();
      if (disposed || request !== generation || !voice || audio.paused) return;
      const song = getSong();
      voice.song = {
        ...song,
        settings: { ...song.settings, click: true, clickVolume: 1 },
      };
      voice.volumes();
      const events = [
        ...beatEvents(song, 0, Infinity).map((b) => ({ ...b, count: false })),
        ...preludeCountBeats(song).map((time) => ({
          time,
          accent: false,
          count: true,
        })),
      ].sort((a, b) => a.time - b.time);
      let next = events.findIndex((e) => e.time >= audio.currentTime - 0.01);
      if (next < 0) return;
      const tick = () => {
        if (!voice || audio.paused || audio.seeking || !checkbox.checked) {
          stop();
          return;
        }
        const time = audio.currentTime,
          rate = audio.playbackRate;
        if (rate <= 0) return;
        const now = voice.ctx.currentTime;
        while (next < events.length && events[next].time < time + 0.1 * rate) {
          const event = events[next++];
          if (event.time >= time - 0.015 * rate)
            voice.pulse(
              now + Math.max(0, (event.time - time) / rate),
              event.accent,
              event.count,
            );
        }
      };
      tick();
      timer = setInterval(tick, 25);
    } catch (error) {
      stop();
      onError(error);
    }
  };
  const listen = (target: EventTarget, event: string, callback: () => void) =>
    target.addEventListener(event, callback, {
      signal: listeners.signal,
      capture: true,
    });
  // Resume Web Audio in the actual gesture, before native audio emits playing.
  for (const event of ["pointerdown", "keydown"])
    listen(root, event, () => {
      void unlock().catch(onError);
    });
  listen(audio, "playing", () => {
    void start();
  });
  for (const event of ["pause", "ended", "seeking", "waiting", "emptied"])
    listen(audio, event, stop);
  for (const event of ["seeked", "ratechange", "volumechange"])
    listen(audio, event, () => {
      void start();
    });
  listen(checkbox, "change", () => {
    stop();
    if (checkbox.checked) void unlock().then(start).catch(onError);
  });
  return {
    refresh: () => {
      void start();
    },
    dispose: () => {
      disposed = true;
      listeners.abort();
      stop();
      if (voice) void voice.ctx.close().catch(onError);
    },
  };
}
