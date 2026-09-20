// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { preferPDF, savePreferPDF, scorePreference } from '../src/score-preference';
import { activeScore, useScore } from '../src/song-scores';
import type { RecordData } from '../src/storage';
function fixture(): RecordData {
  const song = JSON.parse(readFileSync('public/demo/song.json', 'utf8'));
  return { song, pdf:new Blob(), audio:new Blob(), pages:Array.from({length:song.pageCount},()=>new Blob()) };
}
afterEach(()=>localStorage.clear());
it('defaults to XML; forced single-format states never overwrite the global choice',()=>{
  const pdf=fixture(); const xml=activeScore(pdf); xml.format='musicxml';
  const both=useScore(pdf,xml);
  expect(preferPDF()).toBe(false);
  expect(scorePreference(pdf)).toMatchObject({checked:true,disabled:true});
  expect(preferPDF()).toBe(false);
  expect(scorePreference(both)).toMatchObject({format:'musicxml',disabled:false});
  savePreferPDF(true);
  const onlyXML={...both,otherScores:[]};
  expect(scorePreference(onlyXML)).toMatchObject({checked:false,disabled:true,message:'PDF 악보 없음'});
  expect(preferPDF()).toBe(true);
  expect(scorePreference(both).format).toBe('pdf');
});
