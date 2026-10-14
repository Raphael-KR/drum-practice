/* Run in the local Vite browser. Returns artifacts; never writes the song library. */
import {readScorePackage, createScorePackage} from '/src/score-package.ts';
import {readCanonical, writeCanonical, verifyCanonicalAudio} from '/src/canonical-xml.ts';
import {renderMusicXML} from '/src/musicxml.ts';
import {validateSong} from '/src/model.ts';
import {displayPage} from '/src/score-pages.ts';
import {audioTimeMap, mapTime, currentAudioBpm} from '/src/audio-time-map.ts';

const ROOT='/@fs/Users/raphael/Playground/drum-practice/data/production/red-sunset/';
const sha=async b=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',await b.arrayBuffer()))].map(x=>x.toString(16).padStart(2,'0')).join('');
export async function build() {
  const response=await fetch(ROOT+'final/build-03/red-sunset.drumscore');
  if(!response.ok)throw Error('Missing production package');
  const input=await response.blob();
  if(await sha(input)!=='f6449191051e5269e143ebf3ff13334c8dd1702de041f3a73cdcbd6dbf791e08')throw Error('Production package changed');
  const record=await readScorePackage(input);
  await verifyCanonicalAudio(record);
  const doc=new DOMParser().parseFromString(record.canonicalXML,'application/xml');
  const field=[...doc.querySelectorAll('miscellaneous-field')].find(e=>e.getAttribute('name')==='drum-practice:recording-grid:v1');
  const grid=JSON.parse(field.textContent);
  if(grid.version!==1 || grid.audioSHA256!==await sha(record.audio) || grid.measures.length!==record.song.measures.length)throw Error('Recording grid identity mismatch');
  record.song.measures.forEach((m,i)=>{
    const g=grid.measures[i];
    if(g.label!==m.label || g.start!==m.start || g.end!==m.end || g.beats!==m.beats || g.denominator!==m.denominator)throw Error('Recording grid structure mismatch');
    m.beatTimes=[...g.beatTimes];
  });
  validateSong(record.song);
  const xml=writeCanonical(record.song,record.canonicalXML,grid.audioSHA256);
  record.canonicalXML=xml;
  const restored=structuredClone(record.song);
  restored.measures.forEach(m=>delete m.beatTimes);
  readCanonical(xml,restored);
  if(JSON.stringify(restored.measures)!==JSON.stringify(record.song.measures))throw Error('Lost recording grid in canonical XML');
  const source=new Blob([xml],{type:'application/vnd.recordare.musicxml+xml'});
  const rendered=await renderMusicXML(source,s=>window.redSunsetAppProgress=s,'P1');
  if(rendered.regions.length!==137 || rendered.pages.length!==4 || rendered.parsed.warnings.length)throw Error('Unexpected render structure');
  record.pdf=source;
  record.pages=rendered.pages;
  record.song.regions=rendered.regions;
  record.song.pageCount=rendered.pages.length;
  record.song.measures.forEach((m,i)=>m.regionId=rendered.regions[i].id);
  validateSong(record.song);
  const pack=await createScorePackage(record);
  const loaded=await readScorePackage(pack);
  if(JSON.stringify(loaded.song)!==JSON.stringify(record.song) || loaded.canonicalXML!==xml || await sha(loaded.audio)!==grid.audioSHA256)throw Error('Package roundtrip mismatch');
  await verifyCanonicalAudio(loaded);
  const map=audioTimeMap({...record.song,settings:{...record.song.settings,tempoMode:'practice',rate:1}},grid.durationSeconds);
  const endpoint=record.song.measures.at(-1).end;
  if(Math.abs(mapTime(endpoint,map.source,map.output)-(11.27+550*60/134))>1e-8)throw Error('Practice timing mismatch');
  const svg=await Promise.all(record.pages.map(async p=>(await displayPage(p)).text()));
  const audit={inputSHA256:await sha(input),packageSHA256:await sha(pack),canonicalSHA256:await sha(source),audioSHA256:await sha(record.audio),packageBytes:pack.size,
    measures:137,quarters:550,pages:svg.length,scoreBpm:134,pdf42:record.song.measures[41].start,
    m135:record.song.measures[134].beatTimes,practiceEnd:mapTime(endpoint,map.source,map.output),
    originalMap:audioTimeMap(record.song,grid.durationSeconds)??null,
    endingBpm:record.song.measures[134].beatTimes.map(t=>currentAudioBpm(record.song,t)),
    limits:['Free-ending times remain provisional source estimates.','No physical iPad listening confirmation.'],
    browser:navigator.userAgent};
  return {record,pack,xml,svg,audit};
}
