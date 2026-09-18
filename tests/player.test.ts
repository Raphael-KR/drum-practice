import { it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { Player } from "../src/audio";
class Node {
  gain = { value: 1, setValueAtTime() {}, exponentialRampToValueAtTime() {} };
  frequency = { value: 1 };
  buffer: unknown;
  onended = () => {};
  started: number[] = [];
  stopped = false;
  connect() {
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
  createGain() {
    return new Node();
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
