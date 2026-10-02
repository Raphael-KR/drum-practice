// @vitest-environment jsdom
import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { writeCanonical, readCanonical } from '../src/canonical-xml';
import { validateSong, type Song } from '../src/model';
import { projectLyrics } from '../src/lyric-score';
import { renderMeasure } from '../src/playback-measure';
const song = (): Song => {
  const s = JSON.parse(readFileSync('public/demo/song.json', 'utf8'));
  s.lyrics = [];
  s.measureLyrics = [{id:'printed-1', measureId:s.measures[0].id, text:'가사 <원문>', placement:'measure-center'}];
  return s;
};
it('restores measure-only lyrics from XML without creating timed lyric notes', () => {
  const s = song();
  const xml = writeCanonical(s);
  expect(new DOMParser().parseFromString(xml, 'application/xml').querySelectorAll('note > lyric')).toHaveLength(0);
  const copy = structuredClone(s);
  copy.measureLyrics = [];
  readCanonical(xml, copy);
  expect(copy.measureLyrics).toEqual(s.measureLyrics);
  expect(copy.lyrics).toEqual([]);
  copy.measures.forEach(m => {m.start += 5; m.end += 5;});
  projectLyrics(copy);
  expect(copy.measureLyrics).toEqual(s.measureLyrics);
  readCanonical(writeCanonical(copy, xml), copy);
  expect(copy.measureLyrics).toEqual(s.measureLyrics);
});
it('rejects invalid measure references and duplicate measure assignments', () => {
  const s = song();
  expect(() => validateSong(s)).not.toThrow();
  s.measureLyrics![0].measureId = 'missing';
  expect(() => validateSong(s)).toThrow();
  expect(() => writeCanonical(s)).toThrow();
  const duplicate = song();
  duplicate.measureLyrics!.push({...duplicate.measureLyrics![0], id:'different'});
  expect(() => validateSong(duplicate)).toThrow();
});
it.each(['ribbon','rows'] as const)('renders escaped text inside its measure for %s', view => {
  const s = song(); s.settings.view = view;
  const render = (i:number) => renderMeasure({s,m:s.measures[i],i,width:200,r:s.regions.find(r => r.id === s.measures[i].regionId)!,ly:[],pageURL:'page.svg',pageRatio:1,isSVG:true,positionInMeasure:()=>0});
  const div = document.createElement('div'); div.innerHTML = render(0);
  expect(div.querySelector('.measure-lyric')?.textContent).toBe('가사 <원문>');
  expect(div.querySelectorAll('.syllable')).toHaveLength(0);
  expect(render(1)).not.toContain('measure-lyric');
});
