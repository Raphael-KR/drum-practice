import 'fake-indexeddb/auto';
import {expect,it} from 'vitest';
import {estimateAudioBarOne} from '../src/audio-bar-one';
import {audioMeasures,followAudioTempo,setAudioBarOne,retimeAudio} from '../src/audio-practice';
import {beatEvents,preludeCountBeats,defaults,locate,validateSong,type Song} from '../src/model';
import {audioTimeMap,mapTime} from '../src/audio-time-map';
import {importPracticeRecord,loadPracticeRecord,removePracticeRecord} from '../src/practice-library';
const times=Array.from({length:45},(_,i)=>.2+i*.5+(i*i*.0001));
function song():Song{return followAudioTempo({version:1,id:'bar-one',title:'Live',bpm:120,firstBeat:.2,audioName:'live.mp3',pdfName:'',pageCount:0,regions:[],lyrics:[],markers:[{id:'m',name:'M',time:9}],loops:[{id:'l',name:'L',start:10,end:12}],settings:defaults(),audioPractice:{duration:24,beats:4,denominator:4,peaks:[1],beatTimes:times},measures:audioMeasures(24,120,.2,4,4)});}
it('rebases a mid-group beat to bar one without losing prelude/audio timestamps or practice state',()=>{
 const original=song(),s=setAudioBarOne(original,times[17]+.02);validateSong(s);
 expect(s.firstBeat).toBe(times[17]);expect(s.audioPractice!.barOne).toEqual({time:times[17],source:'manual'});
 expect(s.audioPractice!.beatTimes).toEqual(times);expect(original.audioPractice!.barOne).toBeUndefined();
 expect(s.measures[0]).toMatchObject({start:0,end:times[17],audioPrelude:true,label:'0'});
 expect(s.measures[1]).toMatchObject({start:times[17],end:times[21],label:'1'});
 expect(locate(s,times[17]).beat).toBe(0);expect(s.markers).toEqual(original.markers);expect(s.loops).toEqual(original.loops);
 const events=beatEvents(s,0,24);expect(events.map(b=>b.time)).toEqual(times.slice(17));
 expect(events.filter(b=>b.accent).map(b=>b.time)).toEqual(times.slice(17).filter((_,i)=>i%4===0));
 s.settings.tempoMode='practice';s.settings.rate=.75;
 const map=audioTimeMap(s,24)!;
 for(let i=1;i<events.length;i++)expect(mapTime(events[i].time,map.source,map.output)-mapTime(events[i-1].time,map.source,map.output)).toBeCloseTo(60/90);
});
it('keeps fixed-tempo prelude and supports round-trip switching and edge anchors',()=>{
 const s=setAudioBarOne(song(),times[17]);
 const fixed=retimeAudio(s,100,8.7,3,4);validateSong(fixed);
 expect(fixed.measures[0].audioPrelude).toBe(true);expect(fixed.measures[1].start).toBe(8.7);
 const restored=followAudioTempo(fixed);validateSong(restored);expect(restored.audioPractice!.barOne!.source).toBe('manual');
 validateSong(setAudioBarOne(s,0));validateSong(setAudioBarOne(s,23.99));
 for(const n of [NaN,-1,24,Infinity])expect(()=>setAudioBarOne(s,n)).toThrow();
 const bad=structuredClone(s);bad.audioPractice!.barOne!.time+=.01;expect(()=>validateSong(bad)).toThrow();
 const fake=structuredClone(s);fake.measures[1].audioPrelude=true;expect(()=>validateSong(fake)).toThrow();
});
it('persists local reference and original audio bytes',async()=>{
 const s=setAudioBarOne(song(),times[17]);
 await importPracticeRecord({song:s,audio:new Blob(['original bytes']),pdf:new Blob(),pages:[]});
 const saved=(await loadPracticeRecord(s.id))!;validateSong(saved.song);
 expect(saved.song.audioPractice!.barOne).toEqual(s.audioPractice!.barOne);
 expect(await saved.audio.text()).toBe('original bytes');await removePracticeRecord(s.id);
});
it('estimates sustained entrance after count-in and declines silent/ambiguous signals',()=>{
 const sr=1000,beats=Array.from({length:90},(_,i)=>i*.5),data=new Float32Array(46000);
 const buffer={duration:46,sampleRate:sr,numberOfChannels:1,getChannelData:()=>data} as unknown as AudioBuffer;
 expect(estimateAudioBarOne(buffer,beats)).toBeUndefined();
 data.fill(.15);expect(estimateAudioBarOne(buffer,beats)).toBeUndefined();
 data.fill(.01);for(let i=0;i<16;i++)data.fill(.4,i*500,i*500+15);
 data.fill(.3,8000);expect(estimateAudioBarOne(buffer,beats)).toEqual({time:8,source:'estimated'});
 // An isolated crowd shout cannot become an entrance.
 data.fill(.01);data.fill(.8,5000,5500);expect(estimateAudioBarOne(buffer,beats)).toBeUndefined();
});

it('uses only existing prelude beats and omits negative fixed count times',()=>{
 const s=song();expect(preludeCountBeats(s)).toEqual([]);
 expect(preludeCountBeats(setAudioBarOne(s,times[2]))).toEqual(times.slice(0,2));
 const fixed=retimeAudio(setAudioBarOne(s,times[2]),120,.7,4,4);
 expect(preludeCountBeats(fixed)).toHaveLength(1);expect(preludeCountBeats(fixed)[0]).toBeCloseTo(.2);
});
