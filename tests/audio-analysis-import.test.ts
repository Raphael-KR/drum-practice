import {afterEach,beforeEach,expect,it,vi} from 'vitest';
vi.mock('../src/audio-beat-analysis',()=>({analyzeAudioBeats:vi.fn(async()=>undefined)}));
vi.mock('../src/audio-metadata',()=>({audioMetadata:vi.fn(async()=>({title:'Tag title',artist:'Tag artist'}))}));
vi.mock('../src/audio-analysis-cache',()=>({audioFileHash:vi.fn(async()=> 'a'.repeat(64)),loadAudioAnalysis:vi.fn(),storeAudioAnalysis:vi.fn(async()=>{})}));
vi.mock('../src/audio-tempo',()=>({estimatePracticeTempo:vi.fn(()=>({bpm:120,firstBeat:.2,confidence:.8}))}));
import {readAudioPractice,reanalyzeAudioPractice,ensureAudioBeatTracking} from '../src/audio-practice';
import {analyzeAudioBeats} from '../src/audio-beat-analysis';
import {audioMetadata} from '../src/audio-metadata';
import {loadAudioAnalysis,storeAudioAnalysis} from '../src/audio-analysis-cache';
import {estimatePracticeTempo} from '../src/audio-tempo';
beforeEach(()=>{vi.mocked(estimatePracticeTempo).mockReturnValue({bpm:120,firstBeat:.2,confidence:.8});vi.mocked(loadAudioAnalysis).mockResolvedValue(undefined);vi.mocked(analyzeAudioBeats).mockResolvedValue([.2,.7,1.2,1.7,2.2,2.7,3.2,3.7]);});
afterEach(()=>{vi.unstubAllGlobals();vi.clearAllMocks();});
function decoder(){
  vi.stubGlobal('AudioContext',class{
    async decodeAudioData(){return {numberOfChannels:1,duration:10,sampleRate:1000,getChannelData:()=>new Float32Array(10000)};}
    async close(){}
  });
}
it('reuses server timing and tags on the next import without reanalysis',async()=>{
  decoder();vi.mocked(loadAudioAnalysis).mockResolvedValueOnce(undefined);
  const file=new File(['audio bytes'],'private filename.mp3');
  const first=await readAudioPractice(file);
  const stored=vi.mocked(storeAudioAnalysis).mock.calls[0][0];
  expect(stored.title).toBe('Tag title');expect(JSON.stringify(stored)).not.toContain('private filename');
  expect(first.audio).toBe(file);
  vi.mocked(loadAudioAnalysis).mockResolvedValueOnce(stored);
  const second=await readAudioPractice(file);
  expect(second.song.bpm).toBe(first.song.bpm);expect(second.song.artist).toBe('Tag artist');
  expect(estimatePracticeTempo).toHaveBeenCalledTimes(1);expect(audioMetadata).toHaveBeenCalledTimes(1);expect(storeAudioAnalysis).toHaveBeenCalledTimes(1);
});
it('reanalyzes mismatched duration and never sends fallback filenames or uncertain tempo',async()=>{
  decoder();vi.mocked(loadAudioAnalysis).mockResolvedValue(undefined);
  vi.mocked(audioMetadata).mockResolvedValue({title:'',artist:''});
  const first=await readAudioPractice(new File(['bytes'],'private.mp3'));
  expect(first.song.title).toBe('private');
  expect(vi.mocked(storeAudioAnalysis).mock.calls[0][0].title).toBe('');
  vi.mocked(loadAudioAnalysis).mockResolvedValue({...vi.mocked(storeAudioAnalysis).mock.calls[0][0],duration:80});
  vi.mocked(estimatePracticeTempo).mockReturnValue({bpm:200,firstBeat:0,confidence:0});
  const second=await readAudioPractice(new File(['bytes'],'private.mp3'));
  expect(second.song.bpm).toBe(120);expect(estimatePracticeTempo).toHaveBeenCalledTimes(2);expect(storeAudioAnalysis).toHaveBeenCalledTimes(1);
});

it('imports and reuses the whole beat map; explicit reanalysis preserves personal state',async()=>{
 decoder();
 const times=[.2,.7,1.18,1.64,2.08,2.5,2.9,3.28,3.64];
 vi.mocked(analyzeAudioBeats).mockResolvedValue(times);
 const first=await readAudioPractice(new File(['bytes'],'test.mp3'));
 expect(first.song.audioPractice?.followTempo).toBe(true);
 const cached=vi.mocked(storeAudioAnalysis).mock.calls[0][0];
 vi.mocked(loadAudioAnalysis).mockResolvedValue(cached);
 const next=await readAudioPractice(first.audio as File);
 expect(next.song.audioPractice?.beatTimes).toEqual(times);
 expect(analyzeAudioBeats).toHaveBeenCalledTimes(1);
 first.song.markers=[{id:'m',name:'m',time:1}];first.song.loops=[{id:'l',name:'l',start:1,end:3}];
 const refreshed=await reanalyzeAudioPractice(first);
 expect(analyzeAudioBeats).toHaveBeenCalledTimes(2);
 expect(refreshed.song.id).toBe(first.song.id);expect(refreshed.audio).toBe(first.audio);
 expect(refreshed.song.markers).toEqual(first.song.markers);expect(refreshed.song.loops).toEqual(first.song.loops);
});

it('upgrades an old fixed-tempo record once, preserving identity, user tags and target tempo',async()=>{
 decoder();const first=await readAudioPractice(new File(['bytes'],'test.mp3'));
 delete first.song.audioPractice!.beatTimes;delete first.song.audioPractice!.followTempo;
 // Reconstruct the pre-tracking shape, as held by pre-0.8 imports.
 first.song.measures=(await import('../src/audio-practice')).audioMeasures(10,111,.2,4,4);
 first.song.bpm=111;first.song.title='User title';first.song.artist='User artist';
 first.song.markers=[{id:'m',name:'M',time:2}];first.song.loops=[{id:'l',name:'L',start:1,end:3}];
 first.song.settings.tempoMode='practice';first.song.settings.rate=.8;
 const next=await ensureAudioBeatTracking(first);
 expect(next.song.audioPractice!.followTempo).toBe(true);
 expect(next.song.title).toBe('User title');expect(next.song.artist).toBe('User artist');
 expect(next.song.id).toBe(first.song.id);expect(next.audio).toBe(first.audio);
 expect(next.song.markers).toEqual(first.song.markers);expect(next.song.loops).toEqual(first.song.loops);
 expect(next.song.bpm*next.song.settings.rate).toBeCloseTo(111*.8);
 expect(await ensureAudioBeatTracking(next)).toBe(next);
 next.song.audioPractice!.followTempo=false;
 expect(await ensureAudioBeatTracking(next)).toBe(next);
});
it('repairs an incomplete cache and surfaces worker failure instead of saving a drifting fixed grid',async()=>{
 decoder();const first=await readAudioPractice(new File(['bytes'],'test.mp3'));
 const cache={...vi.mocked(storeAudioAnalysis).mock.calls[0][0]};delete cache.beatTimes;
 vi.mocked(loadAudioAnalysis).mockResolvedValue(cache);
 const next=await readAudioPractice(first.audio as File);
 expect(next.song.audioPractice!.beatTimes).toBeDefined();expect(analyzeAudioBeats).toHaveBeenCalledTimes(2);
 vi.mocked(analyzeAudioBeats).mockRejectedValueOnce(Error('Worker load failed'));
 await expect(readAudioPractice(first.audio as File)).rejects.toThrow('Worker load failed');
 expect(storeAudioAnalysis).toHaveBeenCalledTimes(2);
 vi.mocked(analyzeAudioBeats).mockResolvedValueOnce(undefined);
 await expect(readAudioPractice(first.audio as File)).rejects.toThrow();
});

it('keeps restored practice speed within the supported range after a large tempo correction',async()=>{
 decoder();const first=await readAudioPractice(new File(['bytes'],'test.mp3'));
 delete first.song.audioPractice!.beatTimes;delete first.song.audioPractice!.followTempo;
 first.song.settings.tempoMode='practice';first.song.settings.rate=.5;first.song.bpm=80;
 const next=await ensureAudioBeatTracking(first);
 expect(next.song.settings.rate).toBe(.5);
 expect(next.song.audioPractice!.followTempo).toBe(true);
});
