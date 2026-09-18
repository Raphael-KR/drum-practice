import {it,expect} from 'vitest';
import {enableLyricGrid,nearestQuarterBeat,synchronizeLyricGrid,setLyricGrid} from '../src/lyric-grid';
import type {Song} from '../src/model';
const fixture=()=>({measures:[
 {id:'a',label:'1',start:0,end:4,beats:4,denominator:4},
 {id:'b',label:'2',start:4,end:9,beats:5,denominator:4},
],lyrics:[
 {id:'x',text:'가',time:1.14,end:1.8,confirmed:true},
 {id:'y',text:'나',time:1.18,end:2,confirmed:false},
 {id:'z',text:'다',time:3.94,end:4.5,confirmed:false},
]} as Song);
it('rounds to nearest quarter beat and carries to the following bar',()=>{
 const s=fixture();expect(nearestQuarterBeat(s,1.14).tick).toBe(5);
 expect(nearestQuarterBeat(s,1.124).tick).toBe(4);
 expect(nearestQuarterBeat(s,1.125).tick).toBe(5);
 expect(nearestQuarterBeat(s,3.94)).toMatchObject({measure:{id:'b'},tick:0,time:4});
 expect(nearestQuarterBeat(s,8.8)).toMatchObject({measure:{id:'b'},tick:19,time:8.75});
});
it('preserves source timing, co-located syllables and one archive across reloads',()=>{
 const s=fixture();enableLyricGrid(s);
 expect(s.lyrics.map(l=>l.time)).toEqual([1.25,1.25,4]);
 expect(s.lyrics[0].originalTime).toBe(1.14);
 expect(s.lyrics[0].confirmed).toBe(true);
 expect(s.lyricArchive![0].lyrics[0].time).toBe(1.14);
 const first=JSON.stringify(s);enableLyricGrid(s);expect(JSON.stringify(s)).toBe(first);
});
it('keeps musical coordinates after a tempo/grid change and respects free timing',()=>{
 const s=fixture();enableLyricGrid(s);s.lyrics[1].freeTiming=true;s.lyrics[1].time=1.18;
 s.measures[0].end=8;s.measures[1].start=8;s.measures[1].end=18;
 synchronizeLyricGrid(s);expect(s.lyrics.find(l=>l.id==='x')!.time).toBe(2.5);
 expect(s.lyrics.find(l=>l.id==='y')!.time).toBe(1.18);
 expect(s.lyrics.find(l=>l.id==='z')!.time).toBe(8);
});
it('rejects invalid grid selections',()=>{
 const s=fixture();expect(()=>setLyricGrid(s,s.lyrics[0],{measureId:'a',tick:1.2})).toThrow();
 expect(()=>setLyricGrid(s,s.lyrics[0],{measureId:'missing',tick:0})).toThrow();
});
