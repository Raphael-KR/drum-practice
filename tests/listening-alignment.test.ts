import {it,expect} from 'vitest';
import {alignBetweenAnchors} from '../src/listening-alignment';
const lyrics=[0,1,2,4,5].map((time,i)=>({id:String(i),text:'가',time,end:time+.5,confirmed:false}));
it('keeps anchor boundaries and scales only the intervals between them',()=>{
 const next=alignBetweenAnchors(lyrics,[{id:'1',time:1.5,confirmed:true},{id:'3',time:4,confirmed:true}]);
 expect(next[0]).toEqual(lyrics[0]);expect(next[4]).toEqual(lyrics[4]);
 expect(next[1].time).toBe(1.5);expect(next[2].time).toBeCloseTo(1.5+2.5/3);
 expect(next[3].time).toBe(4);expect(next[1].confirmed).toBe(true);
 expect(lyrics[1].time).toBe(1);
});
it('rejects conflicting, crossing or missing anchors',()=>{
 expect(()=>alignBetweenAnchors(lyrics,[{id:'1',time:1,confirmed:true},{id:'1',time:2,confirmed:true}])).toThrow('Conflicting');
 expect(()=>alignBetweenAnchors(lyrics,[{id:'1',time:4,confirmed:true},{id:'3',time:2,confirmed:true}])).toThrow('cross');
 expect(()=>alignBetweenAnchors(lyrics,[{id:'missing',time:1,confirmed:true}])).toThrow();
});
it('does not silently move a confirmed internal lyric',()=>{
 const ls=structuredClone(lyrics);ls[2].confirmed=true;
 expect(()=>alignBetweenAnchors(ls,[{id:'1',time:1.5,confirmed:true},{id:'3',time:4,confirmed:true}])).toThrow('Confirmed');
});
