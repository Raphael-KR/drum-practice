import 'fake-indexeddb/auto';
import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createScorePackage, readScorePackage } from '../src/score-package';
import { importPracticeRecord, loadPracticeRecord, savePracticeState } from '../src/practice-library';
import type { RecordData } from '../src/storage';
import type { Song } from '../src/model';

function sample(): RecordData {
 const song = JSON.parse(readFileSync('public/demo/song.json','utf8')) as Song;
 song.id = 'separation-e2e-' + crypto.randomUUID();
 song.scoreFormat = 'pdf';
 const blob = (path:string,type:string) => new Blob([readFileSync(path)],{type});
 return {song, pdf:blob('public/demo/score.pdf','application/pdf'),audio:blob('public/demo/audio.mp3','audio/mpeg'),pages:Array.from({length:song.pageCount},(_,i)=>blob(`public/demo/page-${i+1}.png`,'image/png'))};
}
it('producer package -> player -> direct replacement without recovery', async()=>{
 const original = sample();
 const first = await readScorePackage(await createScorePackage(original));
 expect((await importPracticeRecord(first)).status).toBe('added');
 const s=structuredClone(first.song), m=s.measures[8];
 s.markers=[{id:'local-marker',name:'Local',time:m.start}];
 s.loops=[{id:'local-loop',name:'Practice',start:m.start,end:m.end}];
 s.settings.position=m.start;
 s.settings.rate=.8;
 await savePracticeState(s.id,s);
 const revised=structuredClone(original.song); revised.title='Revision';
 const updated=await readScorePackage(await createScorePackage({...original,song:revised}));
 expect((await importPracticeRecord(updated)).status).toBe('replaced');
 const saved=(await loadPracticeRecord(s.id))!;
 expect(saved.song.markers).toEqual(updated.song.markers);
 expect(saved.song.loops).toEqual(updated.song.loops);
 expect(saved.song.settings).toEqual({...updated.song.settings, musicVolume:.5, clickVolume:1, click:true});
 expect(await saved.audio.arrayBuffer()).toEqual(await original.audio.arrayBuffer());
 const changed=structuredClone(revised);changed.measures[0].id+='-changed';
 const structural=await readScorePackage(await createScorePackage({...original,song:changed}));
 expect((await importPracticeRecord(structural)).status).toBe('replaced');
 expect((await loadPracticeRecord(s.id))!.song.measures[0].id).toBe(changed.measures[0].id);
},20000);
