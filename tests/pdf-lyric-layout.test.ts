// @vitest-environment jsdom
import {it,expect} from 'vitest';
import {layoutScoreLyrics} from '../src/playback-layout';
it('keeps reviewed PDF note centers when ordinary label packing would move them',()=>{
 document.body.innerHTML='<div id="stage"><div id="ribbon"><div class="browse-row"><div class="browse-strip"><div class="measure"><span class="syllable" data-pdf-lyric-anchor="true">가</span><span class="syllable" data-pdf-lyric-anchor="true">나</span></div></div></div></div></div>';
 const stage=document.querySelector<HTMLElement>('#stage')!,ribbon=document.querySelector<HTMLElement>('#ribbon')!;
 const labels=[...ribbon.querySelectorAll<HTMLElement>('.syllable')];
 labels.forEach((el,i)=>el.getBoundingClientRect=()=>({left:i*5,top:10,width:20,height:20,right:i*5+20,bottom:30,x:i*5,y:10,toJSON:()=>({})}));
 layoutScoreLyrics(stage,ribbon,'rows');
 labels.forEach(el=>expect(el.style.marginLeft).toBe('0px'));
 labels.forEach(el=>delete el.dataset.pdfLyricAnchor);
 layoutScoreLyrics(stage,ribbon,'rows');
 expect(labels.some(el=>el.style.marginLeft!=='0px')).toBe(true);
});
