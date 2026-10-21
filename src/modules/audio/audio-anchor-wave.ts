const WAVEFORM_COLUMNS = 160;

/** Five-second waveform viewport shared by playback, seeking and manual browsing. */
export function bindAudioAnchorWave(
  wave: HTMLElement,
  audio: HTMLAudioElement,
  options: {
    duration: number;
    peaks: number[];
    beatTimes: () => number[];
    firstBeat: () => number;
    firstBeatLabel: string;
    beatLabel: (time: number) => string;
  },
) {
  const { duration, peaks } = options;
  const span = Math.min(5, duration);
  const clampStart = (time: number) =>
    Math.max(0, Math.min(duration - span, time));
  let start = 0,
    following = true,
    frame = 0,
    disposed = false;
  let gesture:
    | { id: number; x: number; y: number; start: number; dragged: boolean }
    | undefined;
  let suppressClick = false;
  const events = new AbortController();
  const listen = (
    target: EventTarget,
    type: string,
    handler: EventListener,
    extra = {},
  ) =>
    target.addEventListener(type, handler, { ...extra, signal: events.signal });

  const render = () => {
    if (disposed) return;
    if (following) start = clampStart(audio.currentTime - span / 2);
    const end = start + span;
    wave.dataset.start = String(start);
    const bars = Array.from({ length: WAVEFORM_COLUMNS }, (_, i) => {
      const from = Math.floor(
        ((start + (span * i) / WAVEFORM_COLUMNS) / duration) * peaks.length,
      );
      const to = Math.ceil(
        ((start + (span * (i + 1)) / WAVEFORM_COLUMNS) / duration) *
          peaks.length,
      );
      let peak = 0;
      for (let j = from; j < to; j++) peak = Math.max(peak, peaks[j] ?? 0);
      return `<rect x="${(i * 100) / WAVEFORM_COLUMNS}" y="${50 - peak * 40}" width=".5" height="${Math.max(0.5, peak * 80)}"/>`;
    }).join("");
    wave.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${bars}</svg>`;
    const beatTimes = options.beatTimes();
    for (const time of beatTimes) {
      if (time < start || time >= end) continue;
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.beat = String(time);
      button.style.left = `${((time - start) / span) * 100}%`;
      button.setAttribute("aria-label", options.beatLabel(time));
      button.title = options.beatLabel(time);
      wave.append(button);
    }
    const firstTime = options.firstBeat();
    const first = document.createElement("span");
    first.className = "audio-anchor-first";
    first.style.width = `${100 / WAVEFORM_COLUMNS}%`;
    first.dataset.time = String(firstTime);
    first.setAttribute("role", "img");
    first.setAttribute("aria-label", options.firstBeatLabel);
    first.hidden =
      !Number.isFinite(firstTime) || firstTime < start || firstTime > end;
    if (Number.isFinite(firstTime))
      first.style.left = `${((firstTime - start) / span) * 100}%`;
    wave.append(first);
    const cursor = document.createElement("span");
    cursor.className = "audio-anchor-cursor";
    cursor.hidden = audio.currentTime < start || audio.currentTime > end;
    cursor.style.left = `${((audio.currentTime - start) / span) * 100}%`;
    wave.append(cursor);
  };
  const tick = () => {
    render();
    if (!audio.paused && !audio.ended && !disposed)
      frame = requestAnimationFrame(tick);
  };
  const followPosition = () => {
    following = true;
    render();
  };
  const seek = (time: number) => {
    audio.pause();
    audio.currentTime = Math.max(0, Math.min(duration, time));
    followPosition();
  };
  listen(audio, "loadedmetadata", followPosition);
  listen(audio, "seeking", followPosition);
  listen(audio, "seeked", followPosition);
  listen(audio, "timeupdate", render);
  listen(audio, "play", () => {
    following = true;
    cancelAnimationFrame(frame);
    tick();
  });
  for (const type of ["pause", "ended"])
    listen(audio, type, () => {
      cancelAnimationFrame(frame);
      render();
    });
  listen(
    wave,
    "wheel",
    ((event: WheelEvent) => {
      const width = wave.getBoundingClientRect().width;
      if (!width) return;
      event.preventDefault();
      following = false;
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      const pixels =
        delta *
        (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? width : 1);
      start = clampStart(start + (pixels / width) * span);
      render();
    }) as EventListener,
    { passive: false },
  );
  listen(wave, "pointerdown", ((event: PointerEvent) => {
    if (event.button !== 0 || !event.isPrimary) return;
    suppressClick = false;
    gesture = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      start,
      dragged: false,
    };
    wave.setPointerCapture(event.pointerId);
  }) as EventListener);
  listen(wave, "pointermove", ((event: PointerEvent) => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x,
      dy = event.clientY - gesture.y;
    if (!gesture.dragged && Math.abs(dx) <= 6) return;
    if (!gesture.dragged && Math.abs(dy) > Math.abs(dx)) return;
    const width = wave.getBoundingClientRect().width;
    if (!width) return;
    gesture.dragged = true;
    following = false;
    start = clampStart(gesture.start - (dx / width) * span);
    render();
  }) as EventListener);
  const endGesture = (event: PointerEvent) => {
    if (!gesture || gesture.id !== event.pointerId) return;
    suppressClick = gesture.dragged || event.type === "pointercancel";
    gesture = undefined;
    if (wave.hasPointerCapture(event.pointerId))
      wave.releasePointerCapture(event.pointerId);
  };
  listen(wave, "pointerup", endGesture as EventListener);
  listen(wave, "pointercancel", endGesture as EventListener);
  listen(wave, "click", ((event: MouseEvent) => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    const rect = wave.getBoundingClientRect();
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-beat]",
    );
    // Pointer capture targets the container; recover the beat hit area for a tap.
    const hit =
      button ??
      [...wave.querySelectorAll<HTMLButtonElement>("[data-beat]")].find((b) => {
        const r = b.getBoundingClientRect();
        return event.clientX >= r.left && event.clientX <= r.right;
      });
    if (!hit && !rect.width) return;
    const time = hit
      ? Number(hit.dataset.beat)
      : start +
        Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)) *
          span;
    seek(time);
  }) as EventListener);
  render();
  return {
    render,
    stepColumn(direction: -1 | 1) {
      seek(audio.currentTime + (direction * span) / WAVEFORM_COLUMNS);
    },
    dispose() {
      disposed = true;
      events.abort();
      cancelAnimationFrame(frame);
    },
  };
}
