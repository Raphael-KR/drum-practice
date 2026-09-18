import { expect, it } from 'vitest';
import { applyLyricRevision, type LyricRevision } from '../src/lyric-revision';
import { lyricFingerprint } from '../src/lyric-timing';
import type { Song } from '../src/model';
const original = [{id:'a',text:'가',time:1,end:2,confirmed:true}];
const revised = [{id:'v2-a',text:'나',time:1.2,end:2,confirmed:false}];
const patch:LyricRevision={id:'v2',songId:'song',previousCount:1,previousFingerprint:lyricFingerprint('가'),lyrics:revised};
const fixture=()=>({id:'song',lyrics:structuredClone(original)} as Song);
it('replaces the edition and archives prior manual timing without sharing objects',()=>{
  const song=fixture();song.lyrics[0].time=1.1;
  expect(applyLyricRevision(song,patch)).toBe(true);
  expect(song.lyrics).toEqual(revised);
  expect(song.lyricArchive![0].lyrics[0].time).toBe(1.1);
  song.lyrics[0].time=1.3;
  expect(applyLyricRevision(song,patch)).toBe(false);
  expect(song.lyrics[0].time).toBe(1.3);
  expect(patch.lyrics[0].time).toBe(1.2);
  expect(song.lyricArchive).toHaveLength(1);
});
it('preserves another song or manually replaced text',()=>{
  const song=fixture();song.id='other';expect(applyLyricRevision(song,patch)).toBe(false);
  song.id='song';song.lyrics[0].text='다';expect(applyLyricRevision(song,patch)).toBe(false);
});
it('rejects invalid new timing before mutating',()=>{
  const song=fixture();expect(()=>applyLyricRevision(song,{...patch,lyrics:[{...revised[0],time:NaN}]})).toThrow();
  expect(song.lyrics).toEqual(original);expect(song.lyricArchive).toBeUndefined();
});
