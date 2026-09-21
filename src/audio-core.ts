import { t as i18nText } from "./i18n";
import type { PlaybackPreferences } from "./playback-preferences";
import { stickClickSamples } from "./stick-click";
import {
  beatEvents,
  locate,
  makeCycle,
  cyclePosition,
  type Cycle,
  type Song,
  type Loop,
} from "./model";
import { portableWorkerURL } from "./audio-worker";
import { createMixLimiterCurve, MIX_INPUT_GAIN } from "./audio-levels";
export class Player {
  ctx: AudioContext;
  music: GainNode;
  click: GainNode;
  original?: AudioBuffer;
  rendered?: AudioBuffer;
  renderRate = 1;
  song?: Song;
  loop?: Loop;
  playing = false;
  position = 0;
  cycles: Cycle[] = [];
  nodes = new Set<AudioScheduledSourceNode>();
  timer = 0;
  nextClick = new Map<Cycle, number>();
  generation = 0;
  private playRequest = 0;
  private stickSound?: AudioBuffer;
  worker?: Worker;
  private cancelRender?: () => void;
  onstate = () => {};
  onprogress = (s: string) => {};
  constructor(
    private preferences: () => PlaybackPreferences = () => ({
      restartMeasure: true,
      countOff: true,
    }),
  ) {
    this.ctx = new AudioContext({ sampleRate: 32000 });
    this.music = this.ctx.createGain();
    this.click = this.ctx.createGain();
    const mix = this.ctx.createGain();
    const limiter = this.ctx.createWaveShaper();
    mix.gain.value = MIX_INPUT_GAIN;
    limiter.curve = createMixLimiterCurve();
    this.music.connect(mix);
    this.click.connect(mix);
    mix.connect(limiter);
    limiter.connect(this.ctx.destination);
    this.ctx.onstatechange = () => {
      if (this.playing && this.ctx.state !== "running") {
        this.pause();
        this.onprogress(i18nText("audio-core.message001"));
      }
    };
  }
  async load(blob: Blob, song: Song) {
    this.pause(false);
    this.loop = undefined;
    const generation = ++this.generation;
    this.cancelStretch();
    const buffer = await this.ctx.decodeAudioData(await blob.arrayBuffer());
    if (generation !== this.generation) return;
    this.original = buffer;
    this.rendered = buffer;
    this.renderRate = 1;
    this.song = song;
    this.position = Math.min(song.settings.position, buffer.duration);
    this.volumes();
  }
  volumes() {
    if (!this.song) return;
    this.music.gain.value = this.song.settings.musicVolume;
    this.click.gain.value = this.song.settings.click
      ? this.song.settings.clickVolume
      : 0;
  }
  get duration() {
    return this.original?.duration || 0;
  }
  current() {
    if (!this.playing) return this.position;
    const now = this.ctx.currentTime;
    const c =
      [...this.cycles].reverse().find((c) => now >= c.at) || this.cycles[0];
    return c ? cyclePosition(c, now) : this.position;
  }
  count() {
    if (!this.playing) return 0;
    const now = this.ctx.currentTime;
    const c = this.cycles.find(
      (c) =>
        c.count > 0 &&
        now >= c.countAt &&
        now < c.countAt + c.count * c.countBeatSeconds,
    );
    return c
      ? (Math.floor((now - c.countAt) / c.countBeatSeconds) % c.beats) + 1
      : 0;
  }
  pause(notify = true) {
    // A user pause/seek/load also cancels play requests still awaiting WebKit
    // activation or a time-stretch result, before any source has been started.
    ++this.playRequest;
    this.stopPlayback(notify);
  }
  private stopPlayback(notify = true) {
    this.position = this.current();
    this.playing = false;
    clearInterval(this.timer);
    for (const n of this.nodes) {
      try {
        n.stop();
      } catch {}
      n.disconnect();
    }
    this.nodes.clear();
    this.cycles = [];
    this.nextClick.clear();
    if (notify) this.onstate();
  }
  async setRate(rate: number) {
    const was = this.playing;
    this.pause();
    const request = this.playRequest;
    if (!(await this.renderAtRate(rate)) || request !== this.playRequest)
      return;
    if (was) await this.play(false, false);
    this.onstate();
  }
  private cancelStretch() {
    this.cancelRender?.();
    this.cancelRender = undefined;
    this.worker?.terminate();
    this.worker = undefined;
  }
  private async renderAtRate(rate: number) {
    const gen = ++this.generation;
    this.cancelStretch();
    if (!this.original || !this.song) return false;
    const original = this.original;
    this.song.settings.rate = rate;
    if (rate === 1) {
      this.rendered = this.original;
      this.renderRate = 1;
    } else {
      this.onprogress(i18nText("audio-core.message002"));
      const l = this.original.getChannelData(0).slice(),
        r = this.original
          .getChannelData(Math.min(1, this.original.numberOfChannels - 1))
          .slice();
      const portableURL = portableWorkerURL();
      const worker = portableURL
        ? new Worker(portableURL)
        : new Worker(new URL("./stretch-worker.ts", import.meta.url), {
            type: "module",
          });
      this.worker = worker;
      let result: { left: Float32Array; right: Float32Array } | undefined;
      try {
        result = await new Promise<typeof result>((resolve, reject) => {
          this.cancelRender = () => resolve(undefined);
          worker.onmessage = (e) => {
            if (gen !== this.generation) return;
            if (e.data.progress !== undefined) {
              this.onprogress(
                i18nText("audio-core.message003", {
                  value1: Math.round(e.data.progress * 100),
                }),
              );
              return;
            }
            if (e.data.error) reject(Error(e.data.error));
            else resolve(e.data);
          };
          worker.onerror = (e) => reject(Error(e.message));
          worker.postMessage(
            { left: l, right: r, sr: original.sampleRate, rate },
            [l.buffer, r.buffer],
          );
        });
      } finally {
        worker.terminate();
        if (portableURL) URL.revokeObjectURL(portableURL);
        if (this.worker === worker) {
          this.worker = undefined;
          this.cancelRender = undefined;
        }
      }
      if (!result || gen !== this.generation) return false;
      const b = this.ctx.createBuffer(
        2,
        result.left.length,
        original.sampleRate,
      );
      b.copyToChannel(result.left as Float32Array<ArrayBuffer>, 0);
      b.copyToChannel(result.right as Float32Array<ArrayBuffer>, 1);
      this.rendered = b;
      this.renderRate = rate;
    }
    this.onprogress(i18nText("audio-core.message004"));
    return true;
  }
  async prepare() {
    // WebKit can otherwise treat Web Audio as ambient audio and obey silent mode.
    // Request media playback on each play, before resuming the shared music/click context.
    try {
      const session =
        typeof navigator === "undefined"
          ? undefined
          : (navigator as Navigator & { audioSession?: { type: string } })
              .audioSession;
      if (session) session.type = "playback";
    } catch {
      // Older browsers and embedded viewers may not allow this optional API.
    }
    await this.ctx.resume();
  }
  async play(count = true, fromMeasureStart?: boolean) {
    const preferences = this.preferences();
    const restartMeasure = fromMeasureStart ?? preferences.restartMeasure;
    if (!this.song?.measures.length || !this.rendered)
      throw Error(i18nText("audio-core.message005"));
    const request = ++this.playRequest;
    await this.prepare();
    if (request !== this.playRequest) return;
    this.stopPlayback(false);
    if (this.renderRate !== this.song.settings.rate) {
      if (!(await this.renderAtRate(this.song.settings.rate))) return;
      if (request !== this.playRequest) return;
    }
    if (
      this.loop &&
      (this.position < this.loop.start || this.position >= this.loop.end)
    )
      this.position = this.loop.start;
    if (this.position >= this.duration) this.position = 0;
    if (restartMeasure) {
      const m = locate(this.song, this.position).measure;
      if (m && this.position >= m.start) this.position = m.start;
    }
    this.playing = true;
    this.addCycle(
      this.ctx.currentTime + 0.08,
      this.position,
      count && preferences.countOff,
    );
    this.tick();
    this.timer = window.setInterval(() => this.tick(), 25);
    this.onstate();
  }
  seek(time: number) {
    const was = this.playing;
    this.pause();
    this.position = Math.max(0, Math.min(time, this.duration));
    if (was) void this.play(false, false);
    else this.onstate();
  }
  addCycle(at: number, from: number, countOff: boolean) {
    const s = this.song!;
    const to = Math.min(this.loop?.end ?? this.duration, this.duration);
    const m = locate(s, from).measure;
    if (!m || to <= from) return;
    const c = makeCycle(at, from, to, s.settings.rate, 0, m, countOff);
    this.cycles.push(c);
    this.nextClick.set(c, 0);
    const source = this.ctx.createBufferSource();
    source.buffer = this.rendered!;
    source.connect(this.music);
    this.track(source);
    source.start(c.musicAt, from / c.rate, (to - from) / c.rate);
  }
  track(n: AudioScheduledSourceNode) {
    this.nodes.add(n);
    n.onended = () => {
      n.disconnect();
      this.nodes.delete(n);
    };
  }
  pulse(at: number, accent: boolean, count = false) {
    if (count) {
      if (!this.stickSound) {
        const samples = stickClickSamples(this.ctx.sampleRate);
        this.stickSound = this.ctx.createBuffer(
          1,
          samples.length,
          this.ctx.sampleRate,
        );
        this.stickSound.copyToChannel(samples, 0);
      }
      const source = this.ctx.createBufferSource();
      source.buffer = this.stickSound;
      source.connect(this.ctx.destination);
      this.track(source);
      source.start(at);
      return;
    }
    const o = this.ctx.createOscillator(),
      g = this.ctx.createGain();
    o.frequency.value = accent ? 1500 : 1000;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(0.8, at + 0.001);
    g.gain.setValueAtTime(0.8, at + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, at + 0.075);
    o.connect(g);
    g.connect(this.click);
    this.track(o);
    o.addEventListener("ended", () => g.disconnect());
    o.start(at);
    o.stop(at + 0.08);
  }
  tick() {
    if (!this.playing || !this.song) return;
    const now = this.ctx.currentTime;
    let last = this.cycles.at(-1)!;
    if (this.loop && now > last.endAt + 0.1) {
      this.pause();
      this.onprogress(i18nText("audio-core.message006"));
      return;
    }
    if (this.loop && last.endAt < now + 1) {
      this.addCycle(last.endAt, this.loop.start, false);
      last = this.cycles.at(-1)!;
    }
    for (const c of this.cycles) {
      const events = [
        ...Array.from({ length: c.count }, (_, i) => ({
          at: c.countAt + i * c.countBeatSeconds,
          accent: i % c.beats === 0,
          count: true,
        })),
        ...beatEvents(this.song, c.from, c.to).map((b) => ({
          at: c.musicAt + (b.time - c.from) / c.rate,
          accent: b.accent,
          count: false,
        })),
      ];
      let i = this.nextClick.get(c) || 0;
      while (i < events.length && events[i].at < now + 0.15) {
        const e = events[i++];
        if (e.at >= now - 0.005)
          this.pulse(Math.max(now, e.at), e.accent, e.count);
      }
      this.nextClick.set(c, i);
    }
    while (this.cycles.length > 1 && this.cycles[0].endAt < now) {
      this.nextClick.delete(this.cycles[0]);
      this.cycles.shift();
    }
    if (!this.loop && now >= last.endAt) {
      this.pause();
      this.position = this.duration;
      this.onstate();
    }
  }
}
