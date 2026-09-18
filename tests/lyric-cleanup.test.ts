import {it,expect} from 'vitest';
import {removeReportedDuplicateRu} from '../src/lyric-cleanup';
import type {Song} from '../src/model';
const fixture=()=>({id:'real-paradis',measures:[
 {id:'m10',label:'10',start:20,end:24,beats:4,denominator:4},
 {id:'m11',label:'11',start:24,end:28,beats:4,denominator:4}],lyrics:[
 {id:'before',text:'다',time:23.5,end:23.75,confirmed:false},
 {id:'wrong',text:'루',time:23.75,end:24,confirmed:false},
 {id:'right',text:'루',time:24,end:25,confirmed:true},
 {id:'later',text:'루',time:25,end:26,confirmed:false},
]} as Song);
it('removes only the reported duplicate, preserves the following ru and archives',()=>{
 const s=fixture(),old=structuredClone(s.lyrics);
 expect(removeReportedDuplicateRu(s)).toBe(1);
 expect(s.lyrics.map(l=>l.id)).toEqual(['before','right','later']);
 expect(s.lyrics[1]).toEqual(old[2]);expect(s.lyricArchive![0].lyrics).toEqual(old);
 expect(removeReportedDuplicateRu(s)).toBe(0);
});
it('keeps a lone ru and other songs',()=>{
 const s=fixture();s.lyrics=s.lyrics.filter(l=>l.id!=='right');expect(removeReportedDuplicateRu(s)).toBe(0);expect(s.lyrics.some(l=>l.id==='wrong')).toBe(true);
 const other=fixture();other.id='other';expect(removeReportedDuplicateRu(other)).toBe(0);
});
it('does not delete a later intentional edit after an already-correct score was checked',()=>{
 const s=fixture(),duplicate=s.lyrics[1];s.lyrics=s.lyrics.filter(l=>l.id!=='wrong');
 expect(removeReportedDuplicateRu(s)).toBe(0);s.lyrics.push(duplicate);
 expect(removeReportedDuplicateRu(s)).toBe(0);expect(s.lyrics).toContain(duplicate);
});
