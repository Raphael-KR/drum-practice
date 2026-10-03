/* Real saved package + common playback functions, without IndexedDB writes. */
import { readScorePackage } from "/src/score-package.ts";
import { readCanonical, writeCanonical } from "/src/canonical-xml.ts";
import { projectLyrics } from "/src/lyric-score.ts";
import { preparePlaybackAssets, releasePlaybackAssets } from "/src/playback-assets.ts";
import { renderMeasure } from "/src/playback-measure.ts";
import { scoreLayout, layoutScoreLyrics, measureWidth } from "/src/playback-layout.ts";
import { displayRegion } from "/src/score-view.ts";
import { xAtBeat } from "/src/model.ts";

const path = "/@fs/Users/raphael/Playground/drum-practice/docs/experiments/loveholic-20261002/standard-lyrics-package-20261003/Loveholic.drumscore";
const positions = s => s.lyrics.map(l => ({ id:l.id, text:l.text, ...l.scorePosition }));

export async function review(format = "svg", packagePath = path) {
  const record = await readScorePackage(new Blob([await (await fetch(packagePath)).arrayBuffer()]));
  const restored = structuredClone(record.song); restored.lyrics=[]; restored.measureLyrics=[];
  readCanonical(record.canonicalXML,restored);
  if (JSON.stringify(positions(restored)) !== JSON.stringify(positions(record.song))) throw Error("Position restoration failed");
  const shifted = structuredClone(restored), before=shifted.lyrics.map(l=>l.time);
  shifted.measures.forEach(m=>{m.start+=5;m.end+=5;});projectLyrics(shifted);
  if (JSON.stringify(positions(shifted))!==JSON.stringify(positions(restored)) || shifted.lyrics.some((l,i)=>Math.abs(l.time-before[i]-5)>1e-8)) throw Error("Audio shift changed score positions");
  const twice=structuredClone(shifted);twice.lyrics=[];
  readCanonical(writeCanonical(shifted,record.canonicalXML),twice);
  if (JSON.stringify(positions(twice))!==JSON.stringify(positions(restored))) throw Error("Second XML save changed score positions");
  if(window.loveholicQAAssets) releasePlaybackAssets(window.loveholicQAAssets);
  const isRibbon = format === 'ribbon';
  const s=structuredClone(restored);s.settings.view=isRibbon?'ribbon':'rows';let pages=record.pages;
  if(format==='pdf') {
    const variant=record.otherScores[0];s.scoreFormat='pdf';s.regions=variant.regions;
    s.measures.forEach((m,i)=>{m.regionId=variant.measures[i].regionId;});pages=variant.pages;
  }
  const assets=await preparePlaybackAssets(pages,s,{},isRibbon);window.loveholicQAAssets=assets;
  if(isRibbon && assets.ribbon?.size!==123) throw Error('Missing ribbon measures');
  document.getElementById('loveholic-qa')?.remove();
  const panel=document.createElement('section');panel.id='loveholic-qa';panel.className='two-rows score-review';
  panel.style.cssText='position:absolute;left:0;top:0;width:1240px;padding:28px 10px;background:white;color:black;z-index:100000;overflow-x:auto';
  panel.innerHTML='<h1>Loveholic 표준 가사 269단위 · '+format.toUpperCase()+'</h1>';
  const step=isRibbon?s.measures.length:4;
  const quarterWidths=[],gaps=[];
  for(let start=0;start<s.measures.length;start+=step) {
    const row=document.createElement('div');row.className='browse-row';
    row.style.cssText='position:relative;margin-top:28px';
    const strip=document.createElement('div');strip.className='browse-strip';strip.style.cssText='position:relative;display:flex';row.append(strip);
    let rowHeight=0;
    for(let i=start;i<Math.min(start+step,s.measures.length);i++) {
      const m=s.measures[i],entry=isRibbon?assets.ribbon.get(i):undefined;
      const r=entry?.region??displayRegion(s,s.regions.find(r=>r.id===m.regionId));
      const staff=entry?.staff??assets.practiceStaffs.get(m.regionId);
      const width=isRibbon?measureWidth(s,r,1220,entry.ratio,staff):305;
      const layout=scoreLayout(s,r,width,1220,staff);
      if(isRibbon) { quarterWidths.push(width/(m.beats*4/m.denominator));gaps.push(staff.gap*parseFloat(layout.size.split(' ')[1])); }
      const ly=s.lyrics.filter(l=>l.scorePosition.measureId===m.id);
      strip.insertAdjacentHTML('beforeend',renderMeasure({s,m,i,width,r,ly,layout,
        pageURL:entry?.url??assets.urls[r.page],pageRatio:entry?.ratio??assets.pageRatios[r.page],isSVG:format!=='pdf',
        positionInMeasure:(index,b,w)=>entry?w*(b/m.beats+entry.phase):w*xAtBeat(r,m,b)}));
      const el=strip.lastElementChild,h=parseFloat(el.querySelector('.crop').style.height);
      el.style.cssText+=';position:relative;height:'+(h+50)+'px';rowHeight=Math.max(rowHeight,h+50);
    }
    row.style.height=rowHeight+'px';panel.append(row);
  }
  document.body.append(panel);layoutScoreLyrics(panel,panel,isRibbon?'ribbon':'rows');
  const labels=[...panel.querySelectorAll('.syllable')];
  if(labels.length!==269 || panel.querySelector('.measure-lyric')) throw Error('Wrong lyric representation');
  const collisions=[];
  for(const row of panel.querySelectorAll('.browse-row')) {
    const ns=[...row.querySelectorAll('.syllable')];
    for(let i=1;i<ns.length;i++) if(ns[i-1].getBoundingClientRect().right>ns[i].getBoundingClientRect().left+.1) collisions.push(ns[i].textContent);
  }
  if(collisions.length) throw Error('Visible lyric collision');
  window.loveholicStandardReview={status:'PASS',format,labels:labels.length,centralLabels:0,collisionCount:0,
    rows:panel.querySelectorAll('.browse-row').length,ribbonMeasures:assets.ribbon?.size??0,
    quarterWidthSpread:quarterWidths.length?Math.max(...quarterWidths)-Math.min(...quarterWidths):null,
    staffGapSpread:gaps.length?Math.max(...gaps)-Math.min(...gaps):null,
    canonicalRestoration:'269 positions identical after clearing cache',
    audioShift:'All times +5s, musical positions unchanged; second XML save/read identical',
    inferredMeasures:[48,99,107,109],vocalTimingVerified:false,storageWrites:0,
    scope:'Saved package read, common preparePlaybackAssets/renderMeasure/layoutScoreLyrics; QA DOM, not persisted import',
    fixtures:[7,8,9,10,39,40,48,79,99,107,109,113,116,117,118].map(number=>({measure:number,
      lyrics:positions(s).filter(l=>l.measureId==='loveholic-m'+number)}))};
  return window.loveholicStandardReview;
}
