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
    expect(p.click.gain.value).toBe(1.5);
    p.song!.settings.clickVolume = 2 / 3;
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


it.each([false, true])("replays from zero after natural completion with restartMeasure=%s", async (restartMeasure) => {
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
    const source = [...p.nodes].find(n => (n as unknown as Node).buffer) as unknown as Node;
    expect(source.started[1]).toBe(0);
  } finally {
    p.pause();
    vi.unstubAllGlobals();
  }
});

it.each([1,.8,1.25])('schedules tracked beats in original or normalized mode at rate %s across seeking and loop boundaries',async rate=>{
 const {followAudioTempo,audioMeasures}=await import('../src/audio-practice');
 const {defaults}=await import('../src/model');
 vi.stubGlobal('AudioContext',Context);vi.stubGlobal('window',{setInterval:()=>1});
 const times=[.2,.7,1.18,1.64,2.08,2.5,2.9,3.28,3.64,3.98,4.3,4.6];
 const p=new Player(()=>({restartMeasure:false,countOff:false}));
 try {
  p.song=followAudioTempo({version:1,id:'live',title:'live',bpm:120,firstBeat:.2,audioName:'a.mp3',pdfName:'',pageCount:0,regions:[],lyrics:[],markers:[],loops:[],settings:defaults(),audioPractice:{duration:5,beats:4,denominator:4,peaks:[1],beatTimes:times},measures:audioMeasures(5,120,.2,4,4)});
  p.song.settings.rate=rate;p.song.settings.tempoMode=rate===1?"original":"practice";p.renderRate=rate;
  p.renderedMap=(await import("../src/audio-time-map")).audioTimeMap(p.song,5);
  p.original={duration:5} as AudioBuffer;p.rendered={} as AudioBuffer;
  p.position=1.18;p.loop={id:'l',name:'l',start:1.18,end:3.64};
  const pulses=vi.spyOn(p,'pulse').mockImplementation(()=>{});
  await p.play(false,false);const first=p.cycles[0];
  const ctx=p.ctx as unknown as Context;
  for(let now=first.musicAt;now<first.endAt+.02;now+=.02){ctx.currentTime=now;p.tick();}
  if(rate!==1){const calls=pulses.mock.calls.filter(c=>c[0]>=first.musicAt&&c[0]<first.endAt);for(let i=1;i<calls.length;i++)expect(calls[i][0]-calls[i-1][0]).toBeCloseTo(.5/rate);}
  const second=p.cycles.find(c=>c!==first)!;expect(second.musicAt).toBeCloseTo(first.endAt);
  for(const sourceTime of times.filter(t=>t>=1.18&&t<3.64)){
   const at=first.musicAt+p.outputTime(sourceTime)-p.outputTime(1.18);
   expect(pulses.mock.calls.filter(c=>Math.abs(c[0]-at)<1e-7)).toHaveLength(1);
  }
  expect(pulses.mock.calls.some(c=>Math.abs(c[0]-second.musicAt)<1e-7)).toBe(true);
  expect(pulses.mock.calls.every(c=>c[1]===false)).toBe(true);
  p.pause();p.seek(2.5);pulses.mockClear();await p.play(false,false);
  expect(p.cycles[0].from).toBe(2.5);
 } finally {p.pause();vi.unstubAllGlobals();vi.restoreAllMocks();}
});

it('uses the last observed beat interval for count-off in a long untracked fade-out',async()=>{
 const {followAudioTempo,audioMeasures}=await import('../src/audio-practice');
 const {defaults}=await import('../src/model');
 vi.stubGlobal('AudioContext',Context);vi.stubGlobal('window',{setInterval:()=>1});
 const p=new Player(()=>({restartMeasure:false,countOff:true}));
 try {
  const times=[.2,.7,1.18,1.64,2.08,2.5,2.9,3.28,3.64];
  p.song=followAudioTempo({version:1,id:'tail',title:'tail',bpm:120,firstBeat:.2,audioName:'a.mp3',pdfName:'',pageCount:0,regions:[],lyrics:[],markers:[],loops:[],settings:defaults(),audioPractice:{duration:20,beats:4,denominator:4,peaks:[1],beatTimes:times},measures:audioMeasures(20,120,.2,4,4)});
  p.original={duration:20} as AudioBuffer;p.rendered=p.original;p.position=4;
  await p.play();expect(p.cycles[0].countBeatSeconds).toBeCloseTo(.36);
  expect(p.cycles[0].musicAt-p.cycles[0].at).toBeCloseTo(1.44);
 }finally{p.pause();vi.unstubAllGlobals();}
});

it.each(['complete','error','switch'])('prepares practice at 1x transactionally and handles %s',async action=>{
 const {followAudioTempo,audioMeasures}=await import('../src/audio-practice');
 const {defaults}=await import('../src/model');
 let worker:any;
 vi.stubGlobal('document',{getElementById:()=>null});
 vi.stubGlobal('Worker',class {onmessage:any;onerror:any;terminate=vi.fn();data:any;constructor(){worker=this;}postMessage(data:any){this.data=data;}});
 vi.stubGlobal('AudioContext',Context);vi.stubGlobal('window',{setInterval:()=>1});
 const p=new Player(()=>({restartMeasure:false,countOff:true}));
 try {
  p.song=followAudioTempo({version:1,id:'live',title:'live',bpm:120,firstBeat:.2,audioName:'a.mp3',pdfName:'',pageCount:0,regions:[],lyrics:[],markers:[],loops:[],settings:defaults(),audioPractice:{duration:5,beats:4,denominator:4,peaks:[1],beatTimes:[.2,.7,1.18,1.64,2.08,2.5,2.9,3.28,3.64]},measures:audioMeasures(5,120,.2,4,4)});
  p.original={duration:5,sampleRate:32000,numberOfChannels:1,getChannelData:()=>new Float32Array(160000)} as unknown as AudioBuffer;p.rendered=p.original;
  p.position=1.18;
  const report=vi.fn(); p.onprogress=vi.fn();
  const pending=p.setRate(1,false,report);
  worker.onmessage({data:{progress:.42}});
  expect(report).toHaveBeenLastCalledWith("BPM 변환 42%");
  expect(p.onprogress).not.toHaveBeenCalled();
  expect(worker.data.timeMap).toBeDefined();expect(p.song.settings.tempoMode).toBe('original');
  if(action==='error'){
   worker.onerror({message:'render failed'});await expect(pending).rejects.toThrow('render failed');
   expect(p.song.settings.tempoMode).toBe('original');expect(p.rendered).toBe(p.original);
  } else if(action==='switch'){
   const old=worker;await p.setRate(1,true);await pending;
   old.onmessage({data:{left:new Float32Array(170000),right:new Float32Array(170000)}});
   expect(p.song.settings.tempoMode).toBe('original');expect(p.renderedMap).toBeUndefined();expect(p.rendered).toBe(p.original);
  } else {
   worker.onmessage({data:{left:new Float32Array(170000),right:new Float32Array(170000)}});await pending;
   expect(report).toHaveBeenLastCalledWith('');
   expect(p.song.settings.tempoMode).toBe('practice');expect(p.renderedMap).toBeDefined();
   await p.play(true,false);const c=p.cycles[0];expect(c.countBeatSeconds).toBe(.5);
   (p.ctx as unknown as Context).currentTime=c.musicAt+.25;
   expect(p.current()).toBeCloseTo(1.41);
   p.pause();expect(p.position).toBeCloseTo(1.41);
   await p.setRate(1,true);expect(p.renderedMap).toBeUndefined();expect(p.rendered).toBe(p.original);
   expect(p.position).toBeCloseTo(1.41);
  }
  expect(worker.terminate).toHaveBeenCalled();
 }finally{p.pause();vi.unstubAllGlobals();}
});

it('plays the recorded prelude without delaying audio, then accents anchored bar one',async()=>{
 vi.stubGlobal('AudioContext',Context);vi.stubGlobal('window',{setInterval:()=>1});
 vi.stubGlobal('localStorage',{getItem:()=>JSON.stringify({restartMeasure:true,countOff:true})});
 const p=new Player();
 try {
  const {audioMeasures,followAudioTempo,setAudioBarOne}=await import('../src/audio-practice');
  const {defaults}=await import('../src/model');
  const times=Array.from({length:32},(_,i)=>.2+i*.5);
  p.song=setAudioBarOne(followAudioTempo({version:1,id:'live',title:'Live',bpm:120,firstBeat:.2,audioName:'a.mp3',pdfName:'',pageCount:0,regions:[],lyrics:[],markers:[],loops:[],settings:defaults(),audioPractice:{duration:18,beats:4,denominator:4,peaks:[],beatTimes:times},measures:audioMeasures(18,120,.2,4,4)}),times[17]);
  p.original={duration:18} as AudioBuffer;p.rendered=p.original;p.position=0;
  const pulse=vi.spyOn(p,'pulse');
  await p.play();const cycle=p.cycles[0];expect(cycle.count).toBe(0);expect(cycle.from).toBe(0);expect(pulse).not.toHaveBeenCalled();
  (p.ctx as unknown as Context).currentTime=cycle.musicAt+times[17];p.tick();
  expect(pulse).toHaveBeenCalledWith(expect.closeTo(cycle.musicAt+times[17]),true,false);
  p.pause();p.position=times[17];await p.play();expect(p.cycles[0].count).toBe(4);
 } finally {p.pause();vi.unstubAllGlobals();}
});

for (const mode of ['original','practice','fixed'] as const) it(`overlays prelude count-off in ${mode} mode without silence or duplicate downbeats`,async()=>{
 vi.stubGlobal('AudioContext',Context);vi.stubGlobal('window',{setInterval:()=>1});
 const prefs={restartMeasure:false,countOff:true};const p=new Player(()=>prefs);
 try {
  const {audioMeasures,followAudioTempo,setAudioBarOne,retimeAudio}=await import('../src/audio-practice');
  const {defaults,preludeCountBeats}=await import('../src/model');
  const {audioTimeMap}=await import('../src/audio-time-map');
  const times=[.2,.7,1.18,1.64,2.08,2.5,2.9,3.28,3.64,4.02,4.4,4.78,5.16];
  let song=setAudioBarOne(followAudioTempo({version:1,id:'intro',title:'Intro',bpm:120,firstBeat:.2,audioName:'a.mp3',pdfName:'',pageCount:0,regions:[],lyrics:[],markers:[],loops:[],settings:defaults(),audioPractice:{duration:7,beats:4,denominator:4,peaks:[],beatTimes:times},measures:audioMeasures(7,120,.2,4,4)}),3.64);
  if(mode==='fixed')song=retimeAudio(song,120,3.64,4,4);
  if(mode==='practice'){song.settings.tempoMode='practice';song.settings.rate=.75;}
  p.song=song;p.original={duration:7} as AudioBuffer;p.rendered=p.original;
  p.renderRate=song.settings.rate;p.renderedMap=audioTimeMap(song,7);
  const pulse=vi.spyOn(p,'pulse');const counts=preludeCountBeats(song);
  expect(counts).toHaveLength(4);counts.forEach((t,i)=>expect(t).toBeCloseTo(mode==='fixed'?1.64+i*.5:times[4+i]));
  await p.play();const c=p.cycles[0],ctx=p.ctx as unknown as Context;
  expect(c.musicAt).toBe(c.at);expect(c.count).toBe(0);
  expect(ctx.nodes[0].started[0]).toBe(c.at);expect(ctx.nodes[0].started[1]).toBe(0);
  const expected=counts.map(t=>c.musicAt+p.outputTime(t));
  expect(c.preludeClicks).toEqual(expected);
  if(mode==='practice')for(let i=1;i<expected.length;i++)expect(expected[i]-expected[i-1]).toBeCloseTo(60/90);
  for(const time of expected){ctx.currentTime=time;p.tick();}
  expect(pulse.mock.calls.filter(v=>v[2])).toEqual(expected.map(t=>[t,false,true]));
  const entrance=c.musicAt+p.outputTime(song.firstBeat);ctx.currentTime=entrance;p.tick();
  expect(pulse.mock.calls.filter(v=>Math.abs(v[0]-entrance)<1e-7)).toEqual([[entrance,true,false]]);
  p.pause();pulse.mockClear();p.position=counts[2]+.01;await p.play();
  expect(p.cycles[0].musicAt).toBe(p.cycles[0].at);expect(p.cycles[0].preludeClicks).toHaveLength(1);
  p.pause();prefs.countOff=false;p.position=0;await p.play();
  expect(p.cycles[0].preludeClicks).toBeUndefined();expect(p.cycles[0].musicAt).toBe(p.cycles[0].at);
  p.pause();prefs.countOff=true;p.position=0;await p.play(false,false);
  expect(p.cycles[0].preludeClicks).toHaveLength(4); // seeking/restarting the music preserves its embedded cue
 }finally{p.pause();vi.unstubAllGlobals();}
});
