import { it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { reviewPair, copyReviewImage } from '../src/score-review';
import { activeScore } from '../src/song-scores';
import type { RecordData } from '../src/storage';
function fixture():RecordData{
 const song=JSON.parse(readFileSync('public/demo/song.json','utf8'));
 const r={song,pdf:new Blob(),audio:new Blob(),pages:Array.from({length:song.pageCount},()=>new Blob())};
 return {...r,otherScores:[{...activeScore(r),format:'musicxml'}]};
}
it('matches PDF above XML by measure IDs, rejecting missing/incompatible scores',()=>{
 const r=fixture();expect(reviewPair(r).map(s=>s.format)).toEqual(['pdf','musicxml']);
 const before=JSON.stringify(r.song);reviewPair(r);expect(JSON.stringify(r.song)).toBe(before);
 expect(()=>reviewPair({...r,otherScores:[]})).toThrow('모두');
 r.otherScores![0].measures[40].id='wrong';expect(()=>reviewPair(r)).toThrow('마디');
});
it('starts clipboard write synchronously with the pending PNG for Safari user activation',async()=>{
 const write=vi.fn().mockResolvedValue(undefined);vi.stubGlobal('navigator',{clipboard:{write}});
 vi.stubGlobal('ClipboardItem',class {constructor(public data:unknown){}});
 const png=Promise.resolve(new Blob(['png'],{type:'image/png'}));
 const result=copyReviewImage(png);expect(write).toHaveBeenCalledOnce();expect(write.mock.calls[0][0][0].data['image/png']).toBe(png);await result;
 vi.unstubAllGlobals();
});
it('reports unavailable image clipboard without silently claiming success',async()=>{
 vi.stubGlobal('navigator',{});await expect(copyReviewImage(Promise.resolve(new Blob()))).rejects.toThrow('지원하지');vi.unstubAllGlobals();
});
