import { it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { Player } from "../src/audio";
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
  connections: Node[] = [];
  connect(node: Node) {
    this.connections.push(node);
    return this;
  }
  disconnect() {}
  start(...a: number[]) {
    this.started = a;
  }
  stop() {
    this.stopped = true;
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

it.each(["pause", "seek", "load"])("does not start a delayed play after %s", async (action) => {
  let resume!: () => void;
  vi.stubGlobal("AudioContext", class extends Context {
    resume() { return new Promise<void>(resolve => { resume = resolve; }); }
  });
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
});

it("does not let an older delayed play replace the newest playback", async () => {
  const resumes: Array<() => void> = [];
  vi.stubGlobal("AudioContext", class extends Context {
    resume() { return new Promise<void>(resolve => resumes.push(resolve)); }
  });
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
  ["play", "pause"], ["setRate", "pause"],
  ["play", "load"], ["setRate", "load"],
  ["play", "continue"], ["setRate", "continue"],
])("honors %s playback intent after %s during rate preparation", async (entry, action) => {
  vi.stubGlobal("document", { getElementById: () => null });
  let worker!: {
    onmessage: (event: { data: unknown }) => void;
    terminate: ReturnType<typeof vi.fn>;
  };
  vi.stubGlobal("Worker", class {
    onmessage = (_event: { data: unknown }) => {};
    onerror = () => {};
    terminate = vi.fn();
    constructor() { worker = this; }
    postMessage() {}
  });
  vi.stubGlobal("AudioContext", Context);
  vi.stubGlobal("window", { setInterval: () => 1 });
  const p = new Player();
  try {
    p.song = JSON.parse(readFileSync("public/demo/song.json", "utf8"));
    p.original = {
      duration: 296.88, sampleRate: 32000, numberOfChannels: 1, length: 32,
      getChannelData: () => new Float32Array(32),
      copyFromChannel() {}, copyToChannel() {},
    } as AudioBuffer;
    p.rendered = p.original;
    if (entry === "setRate") await p.play(false);
    else p.song!.settings.rate = 0.8;
    const pending = entry === "setRate" ? p.setRate(0.8) : p.play(false);
    // play awaits prepare() before it creates the stretch worker.
    await vi.waitFor(() => expect(worker).toBeDefined());
    if (action === "pause") p.pause();
    if (action === "load") {
      const next = structuredClone(p.song!);
      next.settings.rate = 1;
      next.settings.position = 4;
      // Terminating the old worker must settle its promise even if it never
      // responds, without accidentally resuming the newly loaded song.
      await p.load(new Blob(["next"]), next);
    } else {
      worker.onmessage({ data: { left: new Float32Array(40), right: new Float32Array(40) } });
    }
    await pending;
    expect(worker.terminate).toHaveBeenCalled();
    expect(p.renderRate).toBe(action === "load" ? 1 : 0.8);
    expect(p.playing).toBe(action === "continue");
    expect(p.cycles).toHaveLength(action === "continue" ? 1 : 0);
    if (action !== "continue") expect(p.nodes.size).toBe(0);
  } finally {
    p.pause();
    vi.unstubAllGlobals();
  }
});

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
    expect(p.click.gain.value).toBe(1);

    p.pulse(2, true);
    const accent = ctx.nodes.at(-1)!;
    const envelope = accent.connections[0];
    expect(accent.frequency.value).toBe(1500);
    expect(envelope.connections).toEqual([p.click]);
    expect(envelope.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.8, 2.001);
    expect(envelope.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.001, 2.075);

    p.song!.settings.click = false;
    p.volumes();
    expect(p.click.gain.value).toBe(0);
    p.pulse(3, false, true);
    const count = ctx.nodes.at(-1)!;
    expect(count.buffer).toBeDefined();
    expect(count.connections).toEqual([ctx.destination]);
    expect(count.started).toEqual([3]);

    // Both audible music and click enter the same bounded output path.
    const musicMix = (p.music as unknown as Node).connections[0];
    expect((p.click as unknown as Node).connections[0]).toBe(musicMix);
    expect(musicMix.connections).toEqual(ctx.shapers);
    expect(ctx.shapers[0].connections).toEqual([ctx.destination]);
  } finally {
    p.pause();
    vi.unstubAllGlobals();
  }
});

it("can unlock playback on the initial touch without starting sound", async () => {
  const order: string[] = [];
  vi.stubGlobal("navigator", { audioSession: {
    set type(value: string) { order.push(value); },
  } });
  vi.stubGlobal("AudioContext", class extends Context {
    async resume() { order.push("resume"); }
  });
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

it.each(["supported", "missing", "rejected"])("plays with %s Audio Session API", async (support) => {
  const order: string[] = [];
  const session = {
    set type(value: string) {
      order.push(value);
      if (support === "rejected") throw new Error("unsupported session policy");
    },
  };
  vi.stubGlobal("navigator", support === "missing" ? {} : { audioSession: session });
  vi.stubGlobal("AudioContext", class extends Context {
    async resume() { order.push("resume"); }
  });
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
    expect(order).toEqual(support === "missing"
      ? ["resume", "resume"]
      : ["playback", "resume", "playback", "resume"]);
  } finally {
    p.pause();
    vi.unstubAllGlobals();
  }
});

 it.each([false, true])("resumes paused music from the measure start with count-off=%s", async (countOff) => {
  vi.stubGlobal("localStorage", {getItem: () => JSON.stringify({restartMeasure:true,countOff})});
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
    const source = [...p.nodes].find(n => (n as unknown as Node).buffer) as unknown as Node;
    expect(source.started[1]).toBe(m.start);
    (p.ctx as unknown as Context).currentTime = resumed.musicAt;
    p.tick();
    const clicks = [...p.nodes] as unknown as Node[];
    expect(clicks.some(n => !n.buffer && Math.abs(n.started[0] - resumed.musicAt) < 1e-8)).toBe(true);
  } finally {
    p.pause();
    vi.unstubAllGlobals();
  }
});

it.each([true,false])('honors exact resume position with restartMeasure=%s and count-off independently',async(restartMeasure)=>{
  vi.stubGlobal('AudioContext',Context);
  vi.stubGlobal('window',{setInterval:()=>1});
  const p=new Player();
  try {
    p.song=JSON.parse(readFileSync('public/demo/song.json','utf8'));
    p.original={duration:296.88} as AudioBuffer;p.rendered={} as AudioBuffer;
    const m=p.song!.measures[24];
    for(const countOff of [true,false]) {
      vi.stubGlobal('localStorage',{getItem:()=>JSON.stringify({restartMeasure,countOff})});
      p.pause(); p.position=m.start+.37;
      await p.play();
      const c=p.cycles[0];
      expect(c.from).toBeCloseTo(m.start+(restartMeasure?0:.37));
      expect(c.count).toBe(countOff?4:0);
      if(countOff) expect(c.countAt).toBe(c.at);
      expect(c.musicAt-c.at).toBeCloseTo(countOff ? 4*(m.end-m.start)/m.beats : 0);
    }
    p.pause();p.position=m.start+.37;
    await p.play(false,false); // Scrub/rate continuation overrides both options.
    expect(p.cycles[0].from).toBeCloseTo(m.start+.37);
    expect(p.cycles[0].count).toBe(0);
  } finally {p.pause();vi.unstubAllGlobals();}
});
