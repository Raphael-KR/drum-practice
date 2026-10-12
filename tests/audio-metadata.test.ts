import {expect,it} from 'vitest';
import {audioMetadata} from '../src/audio-metadata';
// Real ID3v2.4 text frames followed by MPEG1 Layer3 frames; no parser mock.
function taggedMP3(title:string,artist:string) {
  const sync=(n:number)=>[n>>>21&127,n>>>14&127,n>>>7&127,n&127];
  const frame=(id:string,text:string)=>{
    const payload=Buffer.concat([Buffer.from([3]),Buffer.from(text)]);
    return Buffer.concat([Buffer.from(id),Buffer.from(sync(payload.length)),Buffer.alloc(2),payload]);
  };
  const tags=Buffer.concat([frame('TIT2',title),frame('TPE1',artist)]);
  const audio=Buffer.alloc(417*3);
  for(let i=0;i<3;i++) audio.set([255,251,144,100],i*417);
  return new File([Buffer.concat([Buffer.from([73,68,51,4,0,0,...sync(tags.length)]),tags,audio])],'unrelated.mp3',{type:'audio/mpeg'});
}
it('uses embedded Unicode title and performer, not the filename',async()=>{
  expect(await audioMetadata(taggedMP3('바람과 언덕의 발라드','Real Paradis'))).toEqual({title:'바람과 언덕의 발라드',artist:'Real Paradis'});
});
it('falls back without inventing an artist when tags are absent or damaged',async()=>{
  expect(await audioMetadata(new File(['bad'],'연습 음원.MP3'))).toEqual({title:'연습 음원',artist:''});
  expect(await audioMetadata(new File(['bad'],'private filename.mp3'),false)).toEqual({title:'',artist:''});
  expect(await audioMetadata(taggedMP3('','가수'))).toEqual({title:'unrelated',artist:'가수'});
});
