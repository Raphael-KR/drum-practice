/* Current localhost common renderer/package APIs. No IndexedDB writes. */
import { renderMusicXML } from '/src/musicxml.ts';
import { writeCanonical, readCanonical } from '/src/canonical-xml.ts';
import { createScorePackage, readScorePackage } from '/src/score-package.ts';
import { defaults, validateSong, makeCycle } from '/src/model.ts';
import { displayPage } from '/src/score-pages.ts';

const BASE='/@fs/Users/raphael/Playground/drum-practice/';
const ROOT=BASE+'docs/experiments/preplay-warmup-20261006/composition-03/';
const sha=async b=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await b.arrayBuffer())),v=>v.toString(16).padStart(2,'0')).join('');
const b64=async b=>{const bytes=new Uint8Array(await b.arrayBuffer());let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);};
const save=async (endpoint,data)=>{const r=await fetch('http://127.0.0.1:5191/'+endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});if(!r.ok)throw Error('Evidence receiver '+r.status);};

export async function build(){
  const source=new Blob([await(await fetch(ROOT+'preplay-warmup-source.musicxml')).arrayBuffer()],{type:'application/vnd.recordare.musicxml+xml'});
  const audio=new Blob([await(await fetch(BASE+'docs/experiments/preplay-warmup-20261006/socal-final-01/preplay-warmup-socal.mp3')).arrayBuffer()],{type:'audio/mpeg'});
  const fixture=await(await fetch(BASE+'scripts/musicxml/fixtures/preplay_warmup.json')).json();
  const metadata={id:fixture.id,title:fixture.title,artist:''};
  const generation=await(await fetch(ROOT+'generation-audit.json')).json();
  const audioAudit=await(await fetch(BASE+'docs/experiments/preplay-warmup-20261006/socal-final-01/render-audit.json')).json();
  if(generation.status!=='PASS'||await sha(audio)!==audioAudit.mp3SHA256)throw Error('Input validation/hash mismatch');
  const render=await renderMusicXML(source,s=>window.warmupProgress=s,'P1');
  if(render.regions.length!==96)throw Error('Expected 96 regions');
  const song={version:1,id:metadata.id,title:metadata.title,originalTitle:metadata.title,artist:metadata.artist,composer:'Drum Practice',bpm:80,firstBeat:.25,
    measures:render.regions.map((r,i)=>({id:'preplay-v1-m'+(i+1),regionId:r.id,label:String(i+1),beats:4,denominator:4,start:.25+i*3,end:.25+(i+1)*3})),
    regions:render.regions,lyrics:[],markers:fixture.sections.map((section,i)=>({id:'preplay-section-'+i,name:section.label,time:.25+i*48})),
    loops:[],settings:defaults(),audioName:'preplay-warmup-socal.mp3',pdfName:'preplay-warmup-final.musicxml',scoreFormat:'musicxml',scorePartId:'P1',pageCount:render.pages.length};
  validateSong(song);
  const doc=new DOMParser().parseFromString(writeCanonical(song,await source.text(),await sha(audio)),'application/xml');
  if(doc.querySelector('movement-title')?.textContent===doc.querySelector('work > work-title')?.textContent)doc.querySelector('movement-title').remove();
  const canonicalXML=new XMLSerializer().serializeToString(doc);
  const restored=structuredClone(song);readCanonical(canonicalXML,restored);
  if(JSON.stringify(restored.measures)!==JSON.stringify(song.measures))throw Error('Canonical timeline changed');
  const canonical=new Blob([canonicalXML],{type:source.type});
  const finalRender=await renderMusicXML(canonical,s=>window.warmupProgress=s,'P1');
  if(finalRender.regions.length!==96)throw Error('Final canonical region mismatch');
  // Metadata and empty lyric part may change layout; persist final regions/pages.
  song.regions=finalRender.regions;song.pageCount=finalRender.pages.length;song.measures.forEach((m,i)=>m.regionId=finalRender.regions[i].id);
  if(JSON.stringify(finalRender.regions)!==JSON.stringify(render.regions))throw Error('Canonical render geometry changed: rebuild timeline');
  const record={song,canonicalXML,pdf:canonical,audio,pages:finalRender.pages};
  const packaged=await createScorePackage(record),loaded=await readScorePackage(packaged);
  if(JSON.stringify(loaded.song)!==JSON.stringify(song)||loaded.canonicalXML!==canonicalXML||await loaded.pdf.text()!==canonicalXML||await sha(loaded.audio)!==await sha(audio))throw Error('Package roundtrip mismatch');
  const cycles=[];
  for(const rate of [.75,1,1.25])for(const enabled of [false,true]){
    const c=makeCycle(10,0,290.25,rate,0,song.measures[0],enabled);
    const first=c.musicAt+.25/rate,expected=10+(enabled?3:.25)/rate;
    if(Math.abs(first-expected)>1e-9)throw Error('First beat/countoff mismatch');
    cycles.push({rate,countOff:enabled,firstBeatAt:first,expected,count:c.count});
  }
  const context=new AudioContext();const decoded=await context.decodeAudioData(await audio.arrayBuffer());
  if(Math.abs(decoded.duration-290.25)>1/decoded.sampleRate)throw Error('Decoded duration mismatch');
  await context.close();
  const svgs=await Promise.all(finalRender.pages.map(async p=>(await displayPage(p)).text()));
  const texts=svgs.flatMap(s=>[...new DOMParser().parseFromString(s,'image/svg+xml').querySelectorAll('text')].map(t=>t.textContent?.trim()));
  const hands={R:texts.filter(t=>t==='R').length,L:texts.filter(t=>t==='L').length};
  if(hands.R!==440||hands.L!==440)throw Error('Rendered sticking incomplete '+JSON.stringify(hands));
  const status={status:'PASS',scope:'mechanical roundtrip, counts, decoding and numeric timing',visualStatus:'pending actual SVG visual review',measures:96,notes:880,renderedHands:hands,svgPages:finalRender.pages.length,decodedAudioDuration:decoded.duration,cycles,canonicalSHA256:await sha(canonical),audioSHA256:await sha(audio),packageSHA256:await sha(packaged),packageBytes:packaged.size,roundtrip:'full Song/XML/audio hashes equal',browser:navigator.userAgent,notVerified:['subjective audio quality/listening','actual iPad playback','actual device listening']};
  await save('package',{package:await b64(packaged),canonicalXML,...status});
  await save('render',{pages:await Promise.all(finalRender.pages.map(b64)),regions:finalRender.regions,measures:finalRender.parsed.measures,warnings:finalRender.parsed.warnings,browser:navigator.userAgent});
  const review=document.createElement('div');review.id='preplay-review';review.style.cssText='position:fixed;inset:0;background:white;z-index:100000;overflow:auto;padding:16px;';
  for(const svg of svgs){const img=document.createElement('img');img.src=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));img.style.cssText='width:100%;max-width:1500px;display:block;';review.append(img);}
  document.body.append(review);window.warmupRecord=record;
  return status;
}
