import {expect,it} from 'vitest';
import {audioMetadata,resolveAudioMetadata} from "../../src/modules/audio/audio-metadata";
// Real ID3v2.4 text frames followed by MPEG1 Layer3 frames; no parser mock.
function taggedMP3(title:string,artist:string,bpm?:string) {
  const sync=(n:number)=>[n>>>21&127,n>>>14&127,n>>>7&127,n&127];
  const frame=(id:string,text:string)=>{
    const payload=Buffer.concat([Buffer.from([3]),Buffer.from(text)]);
    return Buffer.concat([Buffer.from(id),Buffer.from(sync(payload.length)),Buffer.alloc(2),payload]);
  };
  const tags=Buffer.concat([frame('TIT2',title),frame('TPE1',artist),...(bpm === undefined ? [] : [frame('TBPM',bpm)])]);
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

it('resolves filenames without tags, Unicode separators, and album/video suffixes',()=>{
  expect(resolveAudioMetadata('데이브레이크 - 꽃길만 걷게 해줄게.mp3',{},false)).toEqual({title:'꽃길만 걷게 해줄게',artist:'데이브레이크'});
  expect(resolveAudioMetadata('씨엔블루(CNBLUE)–Intuition(직감).mp3',{})).toEqual({title:'Intuition(직감)',artist:'씨엔블루(CNBLUE)'});
  expect(resolveAudioMetadata('버즈2집 - 비망록.mp3',{})).toEqual({title:'비망록',artist:'버즈'});
  expect(resolveAudioMetadata('Real paradis-風と丘のバラード.mp3',{})).toEqual({title:'風と丘のバラード',artist:'Real paradis'});
});
it('preserves existing tags even when the filename suggests different metadata',()=>{
  expect(resolveAudioMetadata('File artist - File song.mp3',{title:'Tag artist - Tag song',artist:'Tagged artist'})).toEqual({title:'Tag artist - Tag song',artist:'Tagged artist'});
  expect(resolveAudioMetadata('File artist - File song.mp3',{title:'Tagged title'})).toEqual({title:'Tagged title',artist:'File artist'});
  expect(resolveAudioMetadata('File artist - File song.mp3',{artist:'Tagged artist'})).toEqual({title:'File song',artist:'Tagged artist'});
});
it('preserves ordinary tags and does not split ambiguous hyphenated titles',()=>{
  expect(resolveAudioMetadata('wrong - name.mp3',{title:'Tagged song',artist:'Tagged artist'})).toEqual({title:'Tagged song',artist:'Tagged artist'});
  expect(resolveAudioMetadata('my-private-file.mp3',{},false)).toEqual({title:'',artist:''});
  expect(resolveAudioMetadata('AC-DC - Thunderstruck.mp3',{})).toEqual({title:'Thunderstruck',artist:'AC-DC'});
});

it('reads the ID3 TBPM frame as reference BPM without accepting invalid values',async()=>{
  expect(await audioMetadata(taggedMP3('곡','가수','136'))).toEqual({title:'곡',artist:'가수',bpm:136});
  for(const value of ['0','999','invalid'])
    expect(await audioMetadata(taggedMP3('곡','가수',value))).toEqual({title:'곡',artist:'가수'});
});
it('fills missing BPM from explicit filename notation, never from a track number or year',()=>{
  for(const suffix of ['[136 BPM]','(BPM 136)','136bpm','BPM:136'])
    expect(resolveAudioMetadata(`가수 - 곡 ${suffix}.mp3`,{})).toEqual({title:'곡',artist:'가수',bpm:136});
  expect(resolveAudioMetadata('가수 - 곡 [136 BPM].mp3',{title:'태그 곡',artist:'태그 가수',bpm:120})).toEqual({title:'태그 곡',artist:'태그 가수',bpm:120});
  expect(resolveAudioMetadata('가수 - 곡 [136 BPM].mp3',{bpm:NaN})).toEqual({title:'곡',artist:'가수',bpm:136});
  expect(resolveAudioMetadata('가수 - 1999.mp3',{})).toEqual({title:'1999',artist:'가수'});
  expect(resolveAudioMetadata('가수 - 곡 [BPM 136.5].mp3',{}).bpm).toBe(136.5);
});
