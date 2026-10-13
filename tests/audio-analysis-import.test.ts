import {afterEach,beforeEach,expect,it,vi} from 'vitest';
vi.mock('../src/audio-beat-analysis',()=>({analyzeAudioBeats:vi.fn(async()=>undefined)}));
vi.mock('../src/audio-metadata',()=>({audioMetadata:vi.fn(async()=>({title:'Tag title',artist:'Tag artist'}))}));
vi.mock('../src/audio-analysis-cache',()=>({audioFileHash:vi.fn(async()=> 'a'.repeat(64)),loadAudioAnalysis:vi.fn(),storeAudioAnalysis:vi.fn(async()=>{})}));
vi.mock('../src/audio-tempo',()=>({estimatePracticeTempo:vi.fn(()=>({bpm:120,firstBeat:.2,confidence:.8}))}));
import {readAudioPractice,reanalyzeAudioPractice} from '../src/audio-practice';
import {analyzeAudioBeats} from '../src/audio-beat-analysis';
import {audioMetadata} from '../src/audio-metadata';
import {loadAudioAnalysis,storeAudioAnalysis} from '../src/audio-analysis-cache';
import {estimatePracticeTempo} from '../src/audio-tempo';
beforeEach(()=>{vi.mocked(estimatePracticeTempo).mockReturnValue({bpm:120,firstBeat:.2,confidence:.8});vi.mocked(loadAudioAnalysis).mockResolvedValue(undefined);vi.mocked(analyzeAudioBeats).mockResolvedValue(undefined);});
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
