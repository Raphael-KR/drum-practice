import 'fake-indexeddb/auto';
import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createScorePackage, readScorePackage } from '../src/score-package';
import { importPracticeRecord, loadPracticeRecord, savePracticeState, listPracticeArchives, restorePracticeArchive } from '../src/practice-library';
import type { RecordData } from '../src/storage';
import type { Song } from '../src/model';

function sample(): RecordData {
 const song = JSON.parse(readFileSync('public/demo/song.json','utf8')) as Song;
 song.id = 'separation-e2e-' + crypto.randomUUID();
 song.scoreFormat = 'pdf';
 const blob = (path:string,type:string) => new Blob([readFileSync(path)],{type});
 return {song, pdf:blob('public/demo/score.pdf','application/pdf'),audio:blob('public/demo/audio.mp3','audio/mpeg'),pages:Array.from({length:song.pageCount},(_,i)=>blob(`public/demo/page-${i+1}.png`,'image/png'))};
}
it('producer package -> player -> revision preserves practice -> structure conflict -> archive restore', async()=>{
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
 expect((await importPracticeRecord(updated)).status).toBe('updated');
 const saved=(await loadPracticeRecord(s.id))!;
 expect(saved.song.markers).toEqual(s.markers);
 expect(saved.song.loops).toEqual(s.loops);
 expect(saved.song.settings).toEqual(s.settings);
 expect(await saved.audio.arrayBuffer()).toEqual(await original.audio.arrayBuffer());
 const changed=structuredClone(revised);changed.measures[0].id+='-changed';
 const structural=await readScorePackage(await createScorePackage({...original,song:changed}));
 expect((await importPracticeRecord(structural)).status).toBe('conflict');
 expect((await loadPracticeRecord(s.id))!.song.measures[0].id).toBe(revised.measures[0].id);
 await importPracticeRecord(structural,'replace');
 const archives=await listPracticeArchives(s.id);
 expect(archives).toHaveLength(1);
 const restored=await restorePracticeArchive(archives[0].id);
 expect(restored.song.markers).toEqual(s.markers);
 expect(restored.song.title).toBe('Revision');
},20000);
