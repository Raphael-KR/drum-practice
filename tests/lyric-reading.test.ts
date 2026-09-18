import {expect,it} from 'vitest';
import {applyJapaneseReadings,type ReadingPatch} from '../src/lyric-reading';
import {lyricFingerprint} from '../src/lyric-timing';
import type {Song} from '../src/model';
const fixture=()=>({id:'s',lyricRevision:'v2',lyrics:[
 {id:'a',text:'테',time:1,end:2,confirmed:true},
 {id:'b',text:'쿠',time:2,end:3,confirmed:false},
 {id:'c',text:'와',time:3,end:4,confirmed:true},
]} as Song);
const patch:ReadingPatch={id:'v3',songId:'s',previousCount:3,previousFingerprint:lyricFingerprint('테쿠와'),edits:[{id:'a',before:'테',after:'세'}],insertion:{id:'new',text:'와',time:2.5,afterId:'b',beforeId:'c'}};
it('corrects text, inserts missing wa, keeps anchors and archives prior edition',()=>{
 const s=fixture();expect(applyJapaneseReadings(s,patch)).toBe(true);
 expect(s.lyrics.map(l=>l.text)).toEqual(['세','쿠','와','와']);
 expect(s.lyrics[0]).toMatchObject({time:1,end:2,confirmed:true});
 expect(s.lyrics[3]).toMatchObject({time:3,end:4,confirmed:true});
 expect(s.lyrics[2].confirmed).toBe(false);
 expect(s.lyricArchive![0].lyrics).toEqual(fixture().lyrics);
 expect(applyJapaneseReadings(s,patch)).toBe(false);
});
it('preserves conflicting custom timing by joining the added sound to its predecessor',()=>{
 const s=fixture();s.lyrics[1].time=2.7;applyJapaneseReadings(s,patch);
 expect(s.lyrics[1]).toMatchObject({text:'쿠와',time:2.7,end:3});
 expect(s.lyrics).toHaveLength(3);
});
it('preserves custom text or unrelated scores',()=>{
 const s=fixture();s.lyrics[0].text='다';expect(applyJapaneseReadings(s,patch)).toBe(false);
 const t=fixture();t.id='other';expect(applyJapaneseReadings(t,patch)).toBe(false);
});
