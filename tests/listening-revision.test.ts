import {it,expect} from 'vitest';
import original from '../src/lyric-revision-data';
import {applyJapaneseReadings} from '../src/lyric-reading';
import {applyEnglishLyrics} from '../src/english-lyrics';
import {applyListeningRevision} from '../src/listening-revision';
import type {Song} from '../src/model';
const fixture=()=>{
 const s={id:original.songId,lyricRevision:original.id,lyrics:structuredClone(original.lyrics)} as Song;
 applyJapaneseReadings(s);applyEnglishLyrics(s);return s;
};
it('applies three listener anchors, preserves later lyrics and cannot reapply',()=>{
 const s=fixture(),old=structuredClone(s.lyrics);
 expect(applyListeningRevision(s)).toBe(true);
 for(const [id,time] of [['v2-l1',22.103],['v2-l5',23.367],['v2-l9',25.339]] as const)
  expect(s.lyrics.find(l=>l.id===id)).toMatchObject({time,confirmed:true});
 const at=old.findIndex(l=>l.id==='v2-l12');expect(s.lyrics.slice(at)).toEqual(old.slice(at));
 expect(s.lyricArchive!.at(-1)!.lyrics).toEqual(old);
 expect(s.lyrics.every((l,i)=>!i||l.time>s.lyrics[i-1].time)).toBe(true);
 const encoded=JSON.stringify(s);expect(applyListeningRevision(s)).toBe(false);expect(JSON.stringify(s)).toBe(encoded);
});
it('retains an independently confirmed position inside the adjusted interval',()=>{
 const s=fixture(),l=s.lyrics.find(l=>l.id==='v2-l3')!;l.time=22.6;l.confirmed=true;
 applyListeningRevision(s);expect(s.lyrics.find(l=>l.id==='v2-l3')).toMatchObject({time:22.6,confirmed:true});
});
it('leaves manually changed lyric text untouched',()=>{
 const s=fixture();s.lyrics[0].text='edited';expect(applyListeningRevision(s)).toBe(false);
});
