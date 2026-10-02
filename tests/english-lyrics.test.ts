import {expect,it} from 'vitest';
import {applyEnglishLyrics,englishGroups,correctBrightSpelling} from '../src/english-lyrics';
import source from '../src/lyric-reading-data';
import type {Song} from '../src/model';
const fixture=()=>({id:source.songId,lyricRevision:source.id,lyrics:englishGroups.flatMap(g=>g.ids.map((id,i)=>({id:`v2-l${id}`,text:[...g.before][i],time:id,end:id+1,confirmed:id===0}))).sort((a,b)=>a.time-b.time)} as Song);
it('keeps English spelling, group boundaries and Ah listening anchor',()=>{
 const s=fixture(),old=structuredClone(s.lyrics);
 expect(applyEnglishLyrics(s)).toBe(true);
 expect(s.lyrics).toHaveLength(12);
 for(const group of englishGroups){
  const l=s.lyrics.find(l=>l.id===`v2-l${group.ids[0]}`)!;
  expect(l.text).toBe(group.text);expect(l.time).toBe(group.ids[0]);expect(l.end).toBe(group.ids.at(-1)!+1);
 }
 expect(s.lyrics[0].confirmed).toBe(true);
 expect(s.lyricArchive![0].lyrics).toEqual(old);
 expect(applyEnglishLyrics(s)).toBe(false);
});
it('does not replace manually edited words or another song',()=>{
 const s=fixture();s.lyrics[0].text='edited';expect(applyEnglishLyrics(s)).toBe(false);
 const t=fixture();t.id='other';expect(applyEnglishLyrics(t)).toBe(false);
});

it('corrects both bright spellings without changing timing or user edits',()=>{
 const s=fixture();applyEnglishLyrics(s);
 const before=structuredClone(s.lyrics);
 expect(correctBrightSpelling(s)).toBe(true);
 expect(s.lyrics).toEqual(before.map(l=>l.text==='blight'?{...l,text:'bright'}:l));
 expect(s.lyricArchive!.at(-1)!.lyrics).toEqual(before);
 expect(correctBrightSpelling(s)).toBe(false);
 const other=fixture();applyEnglishLyrics(other);other.id='other';
 expect(correctBrightSpelling(other)).toBe(false);
 const edited=fixture();applyEnglishLyrics(edited);
 edited.lyrics.filter(l=>l.text==='blight').forEach(l=>l.text='custom');
 expect(correctBrightSpelling(edited)).toBe(false);
});
