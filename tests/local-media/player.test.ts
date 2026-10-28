import { it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { Player } from "../../src/apps/editor/audio";
import * as metronome from "../../src/model/metronome";
import { defaults, type Song } from "../../src/model/model";
class Node {
  gain = {
    value: 1,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
  frequency = { value: 1 };
  curve: Float32Array | null = null;
  buffer: unknown;
  onended = () => {};
  started: number[] = [];
  stopped = false;
  stops: number[] = [];
  connections: Node[] = [];
  connect(node: Node) {
    this.connections.push(node);
    return this;
  }
  disconnect() {}
  start(...a: number[]) {
    this.started = a;
  }
  stop(at = 0) {
    this.stopped = true;
    this.stops.push(at);
  }
  addEventListener() {}
}
class Context {
  currentTime = 0;
  state = "running";
  destination = new Node();
  onstatechange = () => {};
  sampleRate = 32000;
  nodes: Node[] = [];
  gains: Node[] = [];
  shapers: Node[] = [];
  createGain() {
    const n = new Node();
    this.gains.push(n);
    return n;
  }
  createWaveShaper() {
    const n = new Node();
    this.shapers.push(n);
    return n;
  }
  createOscillator() {
    const n = new Node();
    this.nodes.push(n);
    return n;
  }
  createBufferSource() {
    const n = new Node();
    this.nodes.push(n);
    return n;
  }
  createBuffer(channels: number, length: number, sampleRate: number) {
    return {
      numberOfChannels: channels,
      duration: length / sampleRate,
      sampleRate,
      copyToChannel() {},
    };
  }
  async resume() {}
  async decodeAudioData() {
    return { duration: 20 };
  }
}

function metronomePlayer(beats = 3, denominator = 8, countOff = false) {
  vi.stubGlobal("AudioContext", Context);
  vi.stubGlobal("window", { setInterval: () => 1 });
  const p = new Player(() => ({ restartMeasure: false, countOff }));
  const duration = ((beats * 4) / denominator) * 0.5;
  p.song = {
    version: 1,
    id: "phase",
    title: "phase",
    bpm: 120,
    firstBeat: 0,
    audioName: "",
    pdfName: "",
    pageCount: 0,
    regions: [],
    lyrics: [],
    markers: [],
    loops: [],
    settings: defaults(),
    measures: [
      {
        id: "m",
        label: "1",
        regionId: "",
        beats,
        denominator,
        start: 0,
        end: duration,
      },
    ],
  } satisfies Song;
  p.original = p.rendered = { duration } as AudioBuffer;
  p.loop = { id: "l", name: "l", start: 0, end: duration };
  return { p, ctx: p.ctx as unknown as Context };
}
it.each([4, 8] as const)(
  "keeps %s-note phase over natural odd-meter repeats, then resets on a user seek",
  async (division) => {
    const { p, ctx } = metronomePlayer();
    const pulses = vi.spyOn(p, "pulse").mockImplementation(() => {});
    try {
      p.song!.settings.clickDivision = division;
      await p.play(false, false);
      for (let now = 0.08; now < 3; now += 0.025) {
        ctx.currentTime = now;
        p.tick();
      }
      const calls = pulses.mock.calls;
      calls.forEach(([at, accent], index) => {
        expect(at).toBeCloseTo(0.08 + (index * 2) / division);
        if (division === 8) expect(accent).toBe(index % 2 === 0);
      });
      expect(p.cycles.length).toBeLessThanOrEqual(3);
      p.pause();
      p.seek(0.2);
      pulses.mockClear();
      await p.play(false, false);
      const c = p.cycles[0];
      ctx.currentTime = c.musicAt;
      p.tick();
      if (division === 4) {
        ctx.currentTime += 0.2;
        p.tick();
      }
      expect(pulses.mock.calls[0][0]).toBeCloseTo(
        c.musicAt + (division === 8 ? 0.05 : 0.3),
      );
      if (division === 8) expect(pulses.mock.calls[0][1]).toBe(false);
    } finally {
      p.pause();
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    }
  },
);
it("changes only pending ordinary clicks and leaves music/count-off sources running", async () => {
  const { p, ctx } = metronomePlayer(4, 4, true);
  try {
    await p.play(true, false);
    const c = p.cycles[0],
      music = ctx.nodes.find((n) =>
        n.connections.includes(p.music as unknown as Node),
      )!;
    ctx.currentTime = 0.49;
    p.tick();
    const counts = ctx.nodes.filter((n) =>
      n.connections.includes(p.countOff as unknown as Node),
    );
    expect(counts).toHaveLength(2);
    p.song!.settings.clickDivision = 8;
    p.updateMetronome();
    expect(counts.every((n) => n.stops.length === 0)).toBe(true);
    expect(p.cycles[0]).toBe(c);
    expect(music.stops).toEqual([]);
    ctx.currentTime = c.musicAt + 0.14;
    p.tick();
    const pending = ctx.nodes.find(
      (n) => !n.buffer && n.started[0] > ctx.currentTime,
    )!;
    expect(pending.started[0]).toBeCloseTo(c.musicAt + 0.25);
    p.song!.settings.click = false;
    p.updateMetronome();
    expect(pending.stops.at(-1)).toBe(0);
    expect(p.click.gain.value).toBe(0);
    const count = ctx.nodes.length;
    ctx.currentTime += 0.2;
    p.tick();
    expect(ctx.nodes).toHaveLength(count);
    p.song!.settings.click = true;
    p.updateMetronome();
    ctx.currentTime = c.musicAt + 0.4;
    p.tick();
    const next = ctx.nodes.at(-1)!;
    expect(next.started[0]).toBeCloseTo(c.musicAt + 0.5);
    expect(next.frequency.value).toBe(1500);
    expect(music.stops).toEqual([]);
    p.pause();
    expect(p.nodes.size).toBe(0);
    expect(p.cycles).toEqual([]);
  } finally {
    p.pause();
    vi.unstubAllGlobals();
  }
});
it("keeps the accumulated odd-loop phase across internal rate restart", async () => {
  const { p, ctx } = metronomePlayer();
  const pulses = vi.spyOn(p, "pulse").mockImplementation(() => {});
  try {
    p.song!.settings.clickDivision = 8;
    await p.play(false, false);
    for (let now = 0.1; now < 0.96; now += 0.025) {
      ctx.currentTime = now;
      p.tick();
    }
    ctx.currentTime = 0.93; // Second repeat, source .1, cumulative quarter 1.7.
    await p.setRate(1, true);
    pulses.mockClear();
    const c = p.cycles[0];
    ctx.currentTime = c.musicAt + 0.02;
    p.tick();
    expect(pulses.mock.calls[0][0]).toBeCloseTo(c.musicAt + 0.15);
    expect(pulses.mock.calls[0][1]).toBe(true); // Run quarter 2, not source quarter .5.
  } finally {
    p.pause();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  }
});
it("clears the previous song's active loop when loading another audio file", async () => {
  vi.stubGlobal("AudioContext", Context);
  const p = new Player();
  p.loop = { id: "old", name: "old", start: 60, end: 70 };
  const song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
  song.settings.position = 0;
  await p.load(new Blob(["audio"]), song);
  expect(p.loop).toBeUndefined();
  expect(p.position).toBe(0);
  vi.unstubAllGlobals();
});

it.each(["pause", "seek", "load"])(
  "does not start a delayed play after %s",
  async (action) => {
    let resume!: () => void;
    vi.stubGlobal(
      "AudioContext",
      class extends Context {
        resume() {
          return new Promise<void>((resolve) => {
            resume = resolve;
          });
        }
      },
    );
    vi.stubGlobal("window", { setInterval: () => 1 });
    const p = new Player();
    try {
      p.song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
      p.original = { duration: 296.88 } as AudioBuffer;
      p.rendered = {} as AudioBuffer;
      const pending = p.play(false);
      if (action === "pause") p.pause();
      if (action === "seek") p.seek(12);
      if (action === "load") {
        const next = structuredClone(p.song!);
        next.id = "next-song";
        next.settings.position = 4;
        await p.load(new Blob(["next"]), next);
      }
      resume();
      await pending;
      expect(p.playing).toBe(false);
      expect(p.nodes.size).toBe(0);
      expect(p.cycles).toHaveLength(0);
      if (action === "seek") expect(p.position).toBe(12);
      if (action === "load") {
        expect(p.song!.id).toBe("next-song");
        expect(p.position).toBe(4);
      }
    } finally {
      p.pause();
      vi.unstubAllGlobals();
    }
  },
);

it("does not let an older delayed play replace the newest playback", async () => {
  const resumes: Array<() => void> = [];
  vi.stubGlobal(
    "AudioContext",
    class extends Context {
      resume() {
        return new Promise<void>((resolve) => resumes.push(resolve));
      }
    },
  );
  vi.stubGlobal("window", { setInterval: () => 1 });
  const p = new Player();
  try {
    p.song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
    p.original = { duration: 296.88 } as AudioBuffer;
    p.rendered = {} as AudioBuffer;
    const first = p.play(false);
    p.seek(12);
    const second = p.play(false, false);
    resumes[1]();
    await second;
    const cycle = p.cycles[0];
    const sources = [...p.nodes];
    resumes[0]();
    await first;
    expect(p.playing).toBe(true);
    expect(p.cycles).toEqual([cycle]);
    expect(cycle.from).toBe(12);
    expect([...p.nodes]).toEqual(sources);
  } finally {
    p.pause();
    vi.unstubAllGlobals();
  }
});

it.each([
  ["play", "pause"],
  ["setRate", "pause"],
  ["play", "load"],
  ["setRate", "load"],
  ["play", "continue"],
  ["setRate", "continue"],
])(
  "honors %s playback intent after %s during rate preparation",
  async (entry, action) => {
    vi.stubGlobal("document", { getElementById: () => null });
    const workers: {
      onmessage: (event: { data: unknown }) => void;
      terminate: ReturnType<typeof vi.fn>;
    }[] = [];
    const worker = () => workers.at(-1)!;
    vi.stubGlobal(
      "Worker",
      class {
        onmessage: (event: { data: unknown }) => void = () => {};
        onerror = () => {};
        terminate = vi.fn();
        constructor() {
          workers.push(this);
        }
        postMessage() {}
      },
    );
    vi.stubGlobal("AudioContext", Context);
    vi.stubGlobal("window", { setInterval: () => 1 });
    const p = new Player();
    try {
      p.song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
      p.original = {
        duration: 296.88,
        sampleRate: 32000,
        numberOfChannels: 1,
        length: 32,
        getChannelData: () => new Float32Array(32),
        copyFromChannel() {},
        copyToChannel() {},
      } as AudioBuffer;
      p.rendered = p.original;
      if (entry === "setRate") await p.play(false);
      else p.song!.settings.rate = 0.8;
      const pending = entry === "setRate" ? p.setRate(0.8) : p.play(false);
      // play awaits prepare() before it creates the stretch worker().
      await vi.waitFor(() => expect(worker()).toBeDefined());
      if (action === "pause") p.pause();
      if (action === "load") {
        const next = structuredClone(p.song!);
        next.settings.rate = 1;
        next.settings.position = 4;
        // Terminating the old worker must settle its promise even if it never
        // responds, without accidentally resuming the newly loaded song.
        await p.load(new Blob(["next"]), next);
      } else {
        worker().onmessage({
          data: { left: new Float32Array(40), right: new Float32Array(40) },
        });
      }
      await pending;
      expect(worker().terminate).toHaveBeenCalled();
      expect(p.renderRate).toBe(action === "load" ? 1 : 0.8);
      expect(p.playing).toBe(action === "continue");
      expect(p.cycles).toHaveLength(action === "continue" ? 1 : 0);
      if (action !== "continue") expect(p.nodes.size).toBe(0);
    } finally {
      p.pause();
      vi.unstubAllGlobals();
    }
  },
);

it("keeps the louder music click under its volume control and the count-in independent", () => {
  vi.stubGlobal("AudioContext", Context);
  const p = new Player();
  try {
    p.song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
    const ctx = p.ctx as unknown as Context;
    p.song!.settings.click = true;
    p.song!.settings.clickVolume = 0;
    p.volumes();
    expect(p.click.gain.value).toBe(0);
    p.song!.settings.clickVolume = 1;
    p.volumes();
    expect(p.click.gain.value).toBe(1.5);
    p.song!.settings.clickVolume = 2 / 3;
    p.volumes();
    expect(p.click.gain.value).toBe(1);

    p.pulse(2, true);
    const accent = ctx.nodes.at(-1)!;
    const envelope = accent.connections[0];
    expect(accent.frequency.value).toBe(1500);
    expect(envelope.connections).toEqual([p.click]);
    expect(envelope.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
      0.8,
      2.001,
    );
    expect(envelope.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
      0.001,
      2.075,
    );

    p.song!.settings.click = false;
    p.volumes();
    expect(p.click.gain.value).toBe(0);
    p.pulse(3, false, true);
    const count = ctx.nodes.at(-1)!;
    expect(count.buffer).toBeDefined();
    expect(count.connections).toEqual([p.countOff]);
    expect(p.countOff.gain.value).toBe(1);
    expect(count.started).toEqual([3]);

    // Both audible music and click enter the same bounded output path.
    const musicMix = (p.music as unknown as Node).connections[0];
    expect((p.click as unknown as Node).connections[0]).toBe(musicMix);
    expect((p.countOff as unknown as Node).connections[0]).toBe(musicMix);
    expect(musicMix.connections).toEqual(ctx.shapers);
    expect(ctx.shapers[0].connections).toEqual([ctx.destination]);
  } finally {
    p.pause();
    vi.unstubAllGlobals();
  }
});

it("can unlock playback on the initial touch without starting sound", async () => {
  const order: string[] = [];
  vi.stubGlobal("navigator", {
    audioSession: {
      set type(value: string) {
        order.push(value);
      },
    },
  });
  vi.stubGlobal(
    "AudioContext",
    class extends Context {
      async resume() {
        order.push("resume");
      }
    },
  );
  try {
    const p = new Player();
    await p.prepare();
    expect(order).toEqual(["playback", "resume"]);
    expect(p.playing).toBe(false);
    expect(p.nodes.size).toBe(0);
  } finally {
    vi.unstubAllGlobals();
  }
});
it("schedules adjacent audio sources on exact loop boundaries and cancels queued audio", async () => {
  vi.stubGlobal("AudioContext", Context);
  vi.stubGlobal("window", { setInterval: () => 1 });
  const p = new Player();
  p.song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
  p.original = { duration: 296.88 } as AudioBuffer;
  p.rendered = {} as AudioBuffer;
  const a = p.song!.measures[83],
    b = p.song!.measures[85];
  p.loop = { id: "x", name: "5/4 loop", start: a.start, end: b.end };
  p.position = a.start;
  p.song!.settings.countIn = 0;
  await p.play(false);
  const first = p.cycles[0];
  (p.ctx as unknown as Context).currentTime = first.endAt - 0.5;
  p.tick();
  expect(p.cycles[1].at).toBe(first.endAt);
  expect(p.cycles[1].from).toBe(a.start);
  const nodes = [...p.nodes] as unknown as Node[];
  p.pause();
  expect(nodes.every((n) => n.stopped)).toBe(true);
  expect(p.cycles).toHaveLength(0);
  expect(p.playing).toBe(false);
  vi.unstubAllGlobals();
});

it.each(["supported", "missing", "rejected"])(
  "plays with %s Audio Session API",
  async (support) => {
    const order: string[] = [];
    const session = {
      set type(value: string) {
        order.push(value);
        if (support === "rejected")
          throw new Error("unsupported session policy");
      },
    };
    vi.stubGlobal(
      "navigator",
      support === "missing" ? {} : { audioSession: session },
    );
    vi.stubGlobal(
      "AudioContext",
      class extends Context {
        async resume() {
          order.push("resume");
        }
      },
    );
    vi.stubGlobal("window", { setInterval: () => 1 });
    const p = new Player();
    try {
      p.song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
      p.original = { duration: 296.88 } as AudioBuffer;
      p.rendered = {} as AudioBuffer;
      await p.play(false);
      expect(p.playing).toBe(true);
      p.pause();
      await p.play(false);
      expect(order).toEqual(
        support === "missing"
          ? ["resume", "resume"]
          : ["playback", "resume", "playback", "resume"],
      );
    } finally {
      p.pause();
      vi.unstubAllGlobals();
    }
  },
);

it.each([false, true])(
  "resumes paused music from the measure start with count-off=%s",
  async (countOff) => {
    vi.stubGlobal("localStorage", {
      getItem: () => JSON.stringify({ restartMeasure: true, countOff }),
    });
    vi.stubGlobal("AudioContext", Context);
    vi.stubGlobal("window", { setInterval: () => 1 });
    const p = new Player();
    try {
      p.song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
      p.original = { duration: 296.88 } as AudioBuffer;
      p.rendered = {} as AudioBuffer;
      p.song!.settings.countIn = 2; // Legacy song settings do not override app preferences.
      const m = p.song!.measures[24];
      p.position = m.start;
      await p.play();
      const first = p.cycles[0];
      (p.ctx as unknown as Context).currentTime = first.musicAt + 0.7;
      p.pause();
      expect(p.position).toBeCloseTo(m.start + 0.7);
      await p.play();
      const resumed = p.cycles[0];
      expect(resumed.from).toBe(m.start);
      expect(resumed.count).toBe(countOff ? 4 : 0);
      const source = [...p.nodes].find(
        (n) => (n as unknown as Node).buffer,
      ) as unknown as Node;
      expect(source.started[1]).toBe(m.start);
      (p.ctx as unknown as Context).currentTime = resumed.musicAt;
      p.tick();
      const clicks = [...p.nodes] as unknown as Node[];
      expect(
        clicks.some(
          (n) => !n.buffer && Math.abs(n.started[0] - resumed.musicAt) < 1e-8,
        ),
      ).toBe(true);
    } finally {
      p.pause();
      vi.unstubAllGlobals();
    }
  },
);

it.each([true, false])(
  "honors exact resume position with restartMeasure=%s and count-off independently",
  async (restartMeasure) => {
    vi.stubGlobal("AudioContext", Context);
    vi.stubGlobal("window", { setInterval: () => 1 });
    const p = new Player();
    try {
      p.song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
      p.original = { duration: 296.88 } as AudioBuffer;
      p.rendered = {} as AudioBuffer;
      const m = p.song!.measures[24];
      for (const countOff of [true, false]) {
        vi.stubGlobal("localStorage", {
          getItem: () => JSON.stringify({ restartMeasure, countOff }),
        });
        p.pause();
        p.position = m.start + 0.37;
        await p.play();
        const c = p.cycles[0];
        expect(c.from).toBeCloseTo(m.start + (restartMeasure ? 0 : 0.37));
        expect(c.count).toBe(countOff ? 4 : 0);
        if (countOff) expect(c.countAt).toBe(c.at);
        expect(c.musicAt - c.at).toBeCloseTo(
          countOff ? (4 * (m.end - m.start)) / m.beats : 0,
        );
      }
      p.pause();
      p.position = m.start + 0.37;
      await p.play(false, false); // Scrub/rate continuation overrides both options.
      expect(p.cycles[0].from).toBeCloseTo(m.start + 0.37);
      expect(p.cycles[0].count).toBe(0);
    } finally {
      p.pause();
      vi.unstubAllGlobals();
    }
  },
);

it.each([false, true])(
  "replays from zero after natural completion with restartMeasure=%s",
  async (restartMeasure) => {
    vi.stubGlobal("AudioContext", Context);
    vi.stubGlobal("window", { setInterval: () => 1 });
    const p = new Player(() => ({ restartMeasure, countOff: false }));
    try {
      p.song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
      p.original = { duration: 296.88 } as AudioBuffer;
      p.rendered = p.original;
      await p.play();
      (p.ctx as unknown as Context).currentTime = p.cycles[0].endAt + 0.01;
      p.tick();
      expect(p.playing).toBe(false);
      expect(p.position).toBe(p.duration);
      await p.play();
      expect(p.playing).toBe(true);
      expect(p.cycles[0].from).toBe(0);
      const source = [...p.nodes].find(
        (n) => (n as unknown as Node).buffer,
      ) as unknown as Node;
      expect(source.started[1]).toBe(0);
    } finally {
      p.pause();
      vi.unstubAllGlobals();
    }
  },
);

it.each([1, 0.8, 1.25])(
  "schedules tracked beats in original or normalized mode at rate %s across seeking and loop boundaries",
  async (rate) => {
    const { followAudioTempo, audioMeasures } =
      await import("../../src/modules/audio/audio-practice");
    const { defaults } = await import("../../src/model/model");
    vi.stubGlobal("AudioContext", Context);
    vi.stubGlobal("window", { setInterval: () => 1 });
    const times = [
      0.2, 0.7, 1.18, 1.64, 2.08, 2.5, 2.9, 3.28, 3.64, 3.98, 4.3, 4.6,
    ];
    const p = new Player(() => ({ restartMeasure: false, countOff: false }));
    try {
      p.song = followAudioTempo({
        version: 1,
        id: "live",
        title: "live",
        bpm: 120,
        firstBeat: 0.2,
        audioName: "a.mp3",
        pdfName: "",
        pageCount: 0,
        regions: [],
        lyrics: [],
        markers: [],
        loops: [],
        settings: defaults(),
        audioPractice: {
          duration: 5,
          beats: 4,
          denominator: 4,
          peaks: [1],
          beatTimes: times,
        },
        measures: audioMeasures(5, 120, 0.2, 4, 4),
      });
      p.song.settings.rate = rate;
      p.song.settings.tempoMode = rate === 1 ? "original" : "practice";
      p.renderRate = rate;
      p.renderedMap = (
        await import("../../src/modules/audio/audio-time-map")
      ).audioTimeMap(p.song, 5);
      p.original = { duration: 5 } as AudioBuffer;
      p.rendered = {} as AudioBuffer;
      p.position = 1.18;
      p.loop = { id: "l", name: "l", start: 1.18, end: 3.64 };
      const pulses = vi.spyOn(p, "pulse").mockImplementation(() => {});
      const events = vi.spyOn(metronome, "metronomeEvents");
      const cycles = vi.spyOn(p, "addCycle");
      await p.play(false, false);
      const first = p.cycles[0];
      const ctx = p.ctx as unknown as Context;
      for (let now = first.musicAt; now < first.endAt + 0.02; now += 0.02) {
        ctx.currentTime = now;
        p.tick();
      }
      expect(events).toHaveBeenCalledTimes(cycles.mock.calls.length);
      if (rate !== 1) {
        const calls = pulses.mock.calls.filter(
          (c) => c[0] >= first.musicAt && c[0] < first.endAt,
        );
        for (let i = 1; i < calls.length; i++)
          expect(calls[i][0] - calls[i - 1][0]).toBeCloseTo(0.5 / rate);
      }
      const second = p.cycles.find((c) => c !== first)!;
      expect(second.musicAt).toBeCloseTo(first.endAt);
      for (const sourceTime of times.filter((t) => t >= 1.18 && t < 3.64)) {
        const at =
          first.musicAt + p.outputTime(sourceTime) - p.outputTime(1.18);
        expect(
          pulses.mock.calls.filter((c) => Math.abs(c[0] - at) < 1e-7),
        ).toHaveLength(1);
      }
      expect(
        pulses.mock.calls.some((c) => Math.abs(c[0] - second.musicAt) < 1e-7),
      ).toBe(true);
      expect(pulses.mock.calls.every((c) => c[1] === false)).toBe(true);
      p.pause();
      p.seek(2.5);
      pulses.mockClear();
      await p.play(false, false);
      expect(p.cycles[0].from).toBe(2.5);
      expect(events).toHaveBeenCalledTimes(cycles.mock.calls.length);
    } finally {
      p.pause();
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    }
  },
);

it("uses the last observed beat interval for count-off in a long untracked fade-out", async () => {
  const { followAudioTempo, audioMeasures } =
    await import("../../src/modules/audio/audio-practice");
  const { defaults } = await import("../../src/model/model");
  vi.stubGlobal("AudioContext", Context);
  vi.stubGlobal("window", { setInterval: () => 1 });
  const p = new Player(() => ({ restartMeasure: false, countOff: true }));
  try {
    const times = [0.2, 0.7, 1.18, 1.64, 2.08, 2.5, 2.9, 3.28, 3.64];
    p.song = followAudioTempo({
      version: 1,
      id: "tail",
      title: "tail",
      bpm: 120,
      firstBeat: 0.2,
      audioName: "a.mp3",
      pdfName: "",
      pageCount: 0,
      regions: [],
      lyrics: [],
      markers: [],
      loops: [],
      settings: defaults(),
      audioPractice: {
        duration: 20,
        beats: 4,
        denominator: 4,
        peaks: [1],
        beatTimes: times,
      },
      measures: audioMeasures(20, 120, 0.2, 4, 4),
    });
    p.original = { duration: 20 } as AudioBuffer;
    p.rendered = p.original;
    p.position = 4;
    await p.play();
    expect(p.cycles[0].countBeatSeconds).toBeCloseTo(0.36);
    expect(p.cycles[0].musicAt - p.cycles[0].at).toBeCloseTo(1.44);
  } finally {
    p.pause();
    vi.unstubAllGlobals();
  }
});

it.each(["complete", "error", "switch"])(
  "prepares practice at 1x transactionally and handles %s",
  async (action) => {
    const { followAudioTempo, audioMeasures } =
      await import("../../src/modules/audio/audio-practice");
    const { defaults } = await import("../../src/model/model");
    type RenderWorker = {
      onmessage: (event: { data: unknown }) => void;
      onerror: (event: { message: string }) => void;
      terminate: ReturnType<typeof vi.fn>;
      data: { timeMap?: unknown };
    };
    const workers: RenderWorker[] = [];
    const worker = () => workers.at(-1)!;
    vi.stubGlobal("document", { getElementById: () => null });
    vi.stubGlobal(
      "Worker",
      class {
        onmessage!: (event: { data: unknown }) => void;
        onerror!: (event: { message: string }) => void;
        terminate = vi.fn();
        data!: { timeMap?: unknown };
        constructor() {
          workers.push(this);
        }
        postMessage(data: { timeMap?: unknown }) {
          this.data = data;
        }
      },
    );
    vi.stubGlobal("AudioContext", Context);
    vi.stubGlobal("window", { setInterval: () => 1 });
    const p = new Player(() => ({ restartMeasure: false, countOff: true }));
    try {
      p.song = followAudioTempo({
        version: 1,
        id: "live",
        title: "live",
        bpm: 120,
        firstBeat: 0.2,
        audioName: "a.mp3",
        pdfName: "",
        pageCount: 0,
        regions: [],
        lyrics: [],
        markers: [],
        loops: [],
        settings: defaults(),
        audioPractice: {
          duration: 5,
          beats: 4,
          denominator: 4,
          peaks: [1],
          beatTimes: [0.2, 0.7, 1.18, 1.64, 2.08, 2.5, 2.9, 3.28, 3.64],
        },
        measures: audioMeasures(5, 120, 0.2, 4, 4),
      });
      p.original = {
        duration: 5,
        sampleRate: 32000,
        numberOfChannels: 1,
        getChannelData: () => new Float32Array(160000),
      } as unknown as AudioBuffer;
      p.rendered = p.original;
      p.position = 1.18;
      const report = vi.fn();
      p.onprogress = vi.fn();
      const pending = p.setRate(1, false, report);
      worker().onmessage({ data: { progress: 0.42 } });
      expect(report).toHaveBeenLastCalledWith("BPM 변환 42%");
      expect(p.onprogress).not.toHaveBeenCalled();
      expect(worker().data.timeMap).toBeDefined();
      expect(p.song.settings.tempoMode).toBe("original");
      if (action === "error") {
        worker().onerror({ message: "render failed" });
        await expect(pending).rejects.toThrow("render failed");
        expect(p.song.settings.tempoMode).toBe("original");
        expect(p.rendered).toBe(p.original);
      } else if (action === "switch") {
        const old = worker();
        await p.setRate(1, true);
        await pending;
        old.onmessage({
          data: {
            left: new Float32Array(170000),
            right: new Float32Array(170000),
          },
        });
        expect(p.song.settings.tempoMode).toBe("original");
        expect(p.renderedMap).toBeUndefined();
        expect(p.rendered).toBe(p.original);
      } else {
        worker().onmessage({
          data: {
            left: new Float32Array(170000),
            right: new Float32Array(170000),
          },
        });
        await pending;
        expect(report).toHaveBeenLastCalledWith("");
        expect(p.song.settings.tempoMode).toBe("practice");
        expect(p.renderedMap).toBeDefined();
        await p.play(true, false);
        const c = p.cycles[0];
        expect(c.countBeatSeconds).toBe(0.5);
        (p.ctx as unknown as Context).currentTime = c.musicAt + 0.25;
        expect(p.current()).toBeCloseTo(1.41);
        p.pause();
        expect(p.position).toBeCloseTo(1.41);
        await p.setRate(1, true);
        expect(p.renderedMap).toBeUndefined();
        expect(p.rendered).toBe(p.original);
        expect(p.position).toBeCloseTo(1.41);
      }
      expect(worker().terminate).toHaveBeenCalled();
    } finally {
      p.pause();
      vi.unstubAllGlobals();
    }
  },
);

it("plays the recorded prelude without delaying audio, then accents anchored bar one", async () => {
  vi.stubGlobal("AudioContext", Context);
  vi.stubGlobal("window", { setInterval: () => 1 });
  vi.stubGlobal("localStorage", {
    getItem: () => JSON.stringify({ restartMeasure: true, countOff: true }),
  });
  const p = new Player();
  try {
    const { audioMeasures, followAudioTempo, setAudioBarOne } =
      await import("../../src/modules/audio/audio-practice");
    const { defaults } = await import("../../src/model/model");
    const times = Array.from({ length: 32 }, (_, i) => 0.2 + i * 0.5);
    p.song = setAudioBarOne(
      followAudioTempo({
        version: 1,
        id: "live",
        title: "Live",
        bpm: 120,
        firstBeat: 0.2,
        audioName: "a.mp3",
        pdfName: "",
        pageCount: 0,
        regions: [],
        lyrics: [],
        markers: [],
        loops: [],
        settings: defaults(),
        audioPractice: {
          duration: 18,
          beats: 4,
          denominator: 4,
          peaks: [],
          beatTimes: times,
        },
        measures: audioMeasures(18, 120, 0.2, 4, 4),
      }),
      times[17],
    );
    p.original = { duration: 18 } as AudioBuffer;
    p.rendered = p.original;
    p.position = 0;
    const pulse = vi.spyOn(p, "pulse");
    await p.play();
    const cycle = p.cycles[0];
    expect(cycle.count).toBe(0);
    expect(cycle.from).toBe(0);
    expect(pulse).not.toHaveBeenCalled();
    (p.ctx as unknown as Context).currentTime = cycle.musicAt + times[17];
    p.tick();
    expect(pulse).toHaveBeenCalledWith(
      expect.closeTo(cycle.musicAt + times[17]),
      true,
      false,
    );
    p.pause();
    p.position = times[17];
    await p.play();
    expect(p.cycles[0].count).toBe(4);
  } finally {
    p.pause();
    vi.unstubAllGlobals();
  }
});

for (const mode of ["original", "practice", "fixed"] as const)
  it(`overlays prelude count-off in ${mode} mode without silence or duplicate downbeats`, async () => {
    vi.stubGlobal("AudioContext", Context);
    vi.stubGlobal("window", { setInterval: () => 1 });
    const prefs = { restartMeasure: false, countOff: true };
    const p = new Player(() => prefs);
    try {
      const { audioMeasures, followAudioTempo, setAudioBarOne, retimeAudio } =
        await import("../../src/modules/audio/audio-practice");
      const { defaults, preludeCountBeats } =
        await import("../../src/model/model");
      const { audioTimeMap } =
        await import("../../src/modules/audio/audio-time-map");
      const times = [
        0.2, 0.7, 1.18, 1.64, 2.08, 2.5, 2.9, 3.28, 3.64, 4.02, 4.4, 4.78, 5.16,
      ];
      let song = setAudioBarOne(
        followAudioTempo({
          version: 1,
          id: "intro",
          title: "Intro",
          bpm: 120,
          firstBeat: 0.2,
          audioName: "a.mp3",
          pdfName: "",
          pageCount: 0,
          regions: [],
          lyrics: [],
          markers: [],
          loops: [],
          settings: defaults(),
          audioPractice: {
            duration: 7,
            beats: 4,
            denominator: 4,
            peaks: [],
            beatTimes: times,
          },
          measures: audioMeasures(7, 120, 0.2, 4, 4),
        }),
        3.64,
      );
      if (mode === "fixed") song = retimeAudio(song, 120, 3.64, 4, 4);
      if (mode === "practice") {
        song.settings.tempoMode = "practice";
        song.settings.rate = 0.75;
      }
      p.song = song;
      p.original = { duration: 7 } as AudioBuffer;
      p.rendered = p.original;
      p.renderRate = song.settings.rate;
      p.renderedMap = audioTimeMap(song, 7);
      const pulse = vi.spyOn(p, "pulse");
      const counts = preludeCountBeats(song);
      expect(counts).toHaveLength(4);
      counts.forEach((t, i) =>
        expect(t).toBeCloseTo(mode === "fixed" ? 1.64 + i * 0.5 : times[4 + i]),
      );
      await p.play();
      const c = p.cycles[0],
        ctx = p.ctx as unknown as Context;
      expect(c.musicAt).toBe(c.at);
      expect(c.count).toBe(0);
      expect(ctx.nodes[0].started[0]).toBe(c.at);
      expect(ctx.nodes[0].started[1]).toBe(0);
      const expected = counts.map((t) => c.musicAt + p.outputTime(t));
      expect(c.preludeClicks).toEqual(expected);
      if (mode === "practice")
        for (let i = 1; i < expected.length; i++)
          expect(expected[i] - expected[i - 1]).toBeCloseTo(60 / 90);
      for (const time of expected) {
        ctx.currentTime = time;
        p.tick();
      }
      expect(pulse.mock.calls.filter((v) => v[2])).toEqual(
        expected.map((t) => [t, false, true]),
      );
      const entrance = c.musicAt + p.outputTime(song.firstBeat);
      ctx.currentTime = entrance;
      p.tick();
      expect(
        pulse.mock.calls.filter((v) => Math.abs(v[0] - entrance) < 1e-7),
      ).toEqual([[entrance, true, false]]);
      p.pause();
      pulse.mockClear();
      p.position = counts[2] + 0.01;
      await p.play();
      expect(p.cycles[0].musicAt).toBe(p.cycles[0].at);
      expect(p.cycles[0].preludeClicks).toHaveLength(1);
      p.pause();
      prefs.countOff = false;
      p.position = 0;
      await p.play();
      expect(p.cycles[0].preludeClicks).toBeUndefined();
      expect(p.cycles[0].musicAt).toBe(p.cycles[0].at);
      p.pause();
      prefs.countOff = true;
      p.position = 0;
      await p.play(false, false);
      expect(p.cycles[0].preludeClicks).toHaveLength(4); // seeking/restarting the music preserves its embedded cue
    } finally {
      p.pause();
      vi.unstubAllGlobals();
    }
  });

it.each([true, false])(
  "button navigation replaces the active count and respects countOff=%s",
  async (countOff) => {
    vi.stubGlobal("AudioContext", Context);
    vi.stubGlobal("window", { setInterval: () => 1 });
    const p = new Player(() => ({ restartMeasure: false, countOff }));
    const { changePlaybackLoop } =
      await import("../../src/modules/playback/playback-actions");
    try {
      p.song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
      p.original = { duration: 296.88 } as AudioBuffer;
      p.rendered = {} as AudioBuffer;
      p.position = p.song!.measures[4].start;
      await p.play();
      const play = vi.spyOn(p, "play");
      const oldSources = [...p.nodes] as unknown as Node[];
      const target = p.song!.measures[8].start;
      p.seek(target, true);
      await play.mock.results.at(-1)!.value;
      expect(oldSources.every((node) => node.stopped)).toBe(true);
      expect(p.cycles).toHaveLength(1);
      expect(p.cycles[0].from).toBe(target);
      expect(p.cycles[0].count).toBe(countOff ? 4 : 0);
      expect(p.playing).toBe(true);
      const loop = {
        id: "l",
        name: "loop",
        start: p.song!.measures[10].start,
        end: p.song!.measures[12].end,
      };
      const fail = vi.fn();
      changePlaybackLoop(p, loop, false, () => {}, fail);
      await play.mock.results.at(-1)!.value;
      expect(p.cycles).toHaveLength(1);
      expect(p.cycles[0].from).toBe(loop.start);
      expect(p.cycles[0].count).toBe(countOff ? 4 : 0);
      changePlaybackLoop(p, undefined, false, () => {}, fail);
      await play.mock.results.at(-1)!.value;
      expect(p.cycles[0].count).toBe(0);
      p.seek(target);
      await play.mock.results.at(-1)!.value;
      expect(p.cycles[0].count).toBe(0);
      p.pause();
      play.mockClear();
      p.seek(target, true);
      expect(play).not.toHaveBeenCalled();
      expect(p.playing).toBe(false);
      await p.play();
      expect(p.cycles[0].count).toBe(countOff ? 4 : 0);
      expect(fail).not.toHaveBeenCalled();
    } finally {
      p.pause();
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    }
  },
);
