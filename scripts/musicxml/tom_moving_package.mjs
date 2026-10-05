/* Current localhost common renderer/package APIs. No IndexedDB writes. */
import { renderMusicXML } from '/src/musicxml.ts';
import { writeCanonical, readCanonical } from '/src/canonical-xml.ts';
import { createScorePackage, readScorePackage } from '/src/score-package.ts';
import { defaults, validateSong, makeCycle } from '/src/model.ts';
import { displayPage } from '/src/score-pages.ts';

const ROOT='/@fs/Users/raphael/Playground/drum-practice/docs/experiments/tom-moving-20261006/source-02/';
const sha=async b=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await b.arrayBuffer())),v=>v.toString(16).padStart(2,'0')).join('');
const b64=async b=>{const bytes=new Uint8Array(await b.arrayBuffer());let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);};
const save=async (endpoint,data)=>{const r=await fetch('http://127.0.0.1:5188/'+endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});if(!r.ok)throw Error('Evidence receiver '+r.status);};

export async function build(){
  const source=new Blob([await(await fetch(ROOT+'tom-moving-source.musicxml')).arrayBuffer()],{type:'application/vnd.recordare.musicxml+xml'});
  const audio=new Blob([await(await fetch(ROOT+'tom-moving.wav')).arrayBuffer()],{type:'audio/wav'});
  const provenance=await(await fetch(ROOT+'provenance.json')).json();
  if(await sha(source)!==provenance.files['tom-moving-source.musicxml']||await sha(audio)!==provenance.files['tom-moving.wav'])throw Error('Source hash mismatch');
  const render=await renderMusicXML(source,s=>window.tomMovingProgress=s,'P1');
  if(render.regions.length!==16)throw Error('Expected 16 regions');
  const song={version:1,id:'tom-moving-original-v1',title:'탐탐 무빙 연습',originalTitle:'탐탐 무빙 연습',artist:'Drum Practice',composer:'Drum Practice',bpm:80,firstBeat:.25,
    measures:render.regions.map((r,i)=>({id:'tom-moving-m'+(i+1),regionId:r.id,label:String(i+1),beats:4,denominator:4,start:.25+i*3,end:.25+(i+1)*3})),
    regions:render.regions,lyrics:[],markers:['A · 한 손 8분','B · 양손 16분','C · 8분+16분 둘','D · 16분 둘+8분'].map((name,i)=>({id:'tom-section-'+i,name,time:.25+i*12})),
    loops:[],settings:defaults(),audioName:'tom-moving.wav',pdfName:'tom-moving-final.musicxml',scoreFormat:'musicxml',scorePartId:'P1',pageCount:render.pages.length};
  validateSong(song);
  const canonicalXML=writeCanonical(song,await source.text(),await sha(audio));
  const restored=structuredClone(song);readCanonical(canonicalXML,restored);
  if(JSON.stringify(restored.measures)!==JSON.stringify(song.measures))throw Error('Canonical timeline changed');
  const canonical=new Blob([canonicalXML],{type:source.type});
  const record={song,canonicalXML,pdf:canonical,audio,pages:render.pages};
  const packaged=await createScorePackage(record),loaded=await readScorePackage(packaged);
  if(JSON.stringify(loaded.song)!==JSON.stringify(song)||loaded.canonicalXML!==canonicalXML||await loaded.pdf.text()!==canonicalXML||await sha(loaded.audio)!==await sha(audio))throw Error('Package roundtrip mismatch');
  const cycles=[];
  for(const rate of [.75,1,1.25])for(const enabled of [false,true]){
    const c=makeCycle(10,0,49.05,rate,0,song.measures[0],enabled);
    const first=c.musicAt+.25/rate,expected=10+(enabled?3:.25)/rate;
    if(Math.abs(first-expected)>1e-9)throw Error('First beat/countoff mismatch');
    cycles.push({rate,countOff:enabled,firstBeatAt:first,expected,count:c.count});
  }
  const context=new AudioContext();const decoded=await context.decodeAudioData(await audio.arrayBuffer());
  if(Math.abs(decoded.duration-49.05)>1/decoded.sampleRate)throw Error('Decoded duration mismatch');
  await context.close();
  const svgs=await Promise.all(render.pages.map(async p=>(await displayPage(p)).text()));
  const texts=svgs.flatMap(s=>[...new DOMParser().parseFromString(s,'image/svg+xml').querySelectorAll('text')].map(t=>t.textContent?.trim()));
  const hands={R:texts.filter(t=>t==='R').length,L:texts.filter(t=>t==='L').length};
  if(hands.R!==112||hands.L!==80)throw Error('Rendered sticking incomplete '+JSON.stringify(hands));
  const status={status:'PASS',scope:'mechanical roundtrip, counts, decoding and numeric timing',visualStatus:'R/L stem placement needs developer review (see TOM-MOVING-PRODUCTION.md)',measures:16,notes:192,renderedHands:hands,svgPages:render.pages.length,decodedAudioDuration:decoded.duration,cycles,canonicalSHA256:await sha(canonical),audioSHA256:await sha(audio),packageSHA256:await sha(packaged),packageBytes:packaged.size,roundtrip:'full Song/XML/audio hashes equal',browser:navigator.userAgent,notVerified:['subjective audio quality/listening','actual iPad playback','developer app library inclusion']};
  await save('package',{package:await b64(packaged),canonicalXML,...status});
  await save('render',{pages:await Promise.all(render.pages.map(b64)),regions:render.regions,measures:render.parsed.measures,warnings:render.parsed.warnings,browser:navigator.userAgent});
  const review=document.createElement('div');review.id='tom-moving-review';review.style.cssText='position:fixed;inset:0;background:white;z-index:100000;overflow:auto;padding:16px;';
  for(const svg of svgs){const img=document.createElement('img');img.src=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));img.style.cssText='width:100%;max-width:1500px;display:block;';review.append(img);}
  document.body.append(review);window.tomMovingRecord=record;
  return status;
}
