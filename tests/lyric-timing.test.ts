import { describe, it, expect } from 'vitest';
import { applyLyricTimingPatch, lyricFingerprint, type TimingPatch } from '../src/lyric-timing';
import type { Song } from '../src/model';
function fixture() {
  return {id:'sample',lyrics:[
    {id:'a',text:'가',time:1,end:2,confirmed:false},
    {id:'b',text:'나',time:2,end:3,confirmed:false},
    {id:'c',text:'다',time:3,end:4,confirmed:false},
    {id:'d',text:'라',time:4,end:5,confirmed:false},
  ]} as Song;
}
const patch:TimingPatch={songId:'sample',lyricCount:4,textFingerprint:lyricFingerprint('가나다라'),entries:[['a',1,2,1],['b',2,3,2.4],['c',3,4,3.2]]};
describe('estimated lyric correction',()=>{
  it('updates starts and connected ends once without marking verified',()=>{
    const s=fixture();expect(applyLyricTimingPatch(s,patch)).toBe(2);
    expect(s.lyrics.map(l=>[l.time,l.end])).toEqual([[1,2.4],[2.4,3.2],[3.2,4],[4,5]]);
    expect(s.lyrics.every(l=>!l.confirmed)).toBe(true);
    expect(applyLyricTimingPatch(s,patch)).toBe(0);
  });
  it('preserves manual changes and confirmed lyrics',()=>{
    const s=fixture();s.lyrics[1].time=2.1;s.lyrics[2].confirmed=true;
    applyLyricTimingPatch(s,patch);
    expect(s.lyrics[1]).toMatchObject({time:2.1,end:3});
    expect(s.lyrics[2]).toMatchObject({time:3,end:4,confirmed:true});
  });
  it('does not touch another song or changed lyric edition',()=>{
    const s=fixture();s.id='other';expect(applyLyricTimingPatch(s,patch)).toBe(0);
    s.id='sample';s.lyrics[0].text='수정';expect(applyLyricTimingPatch(s,patch)).toBe(0);
  });
  it('rejects a correction crossing a manually moved neighbor',()=>{
    const s=fixture();s.lyrics[2].time=2.2;s.lyrics[2].confirmed=true;
    applyLyricTimingPatch(s,patch);expect(s.lyrics[1].time).toBe(2);
    expect(s.lyrics[2].time).toBe(2.2);
  });
});
