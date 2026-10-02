import {OpenSheetMusicDisplay} from 'opensheetmusicdisplay';
import {parseMusicXML} from '../src/musicxml';
const mode=new URLSearchParams(location.search).get('run')||'desktop';
const status=document.getElementById('status')!,host=document.getElementById('host')!,stage=document.getElementById('stage')!;
const report:any={run:mode,userAgent:navigator.userAgent,dpr:devicePixelRatio,viewport:[innerWidth,innerHeight],osmd:'2.1.2',samples:[],errors:[]};
const post=async()=>{await fetch('/result',{method:'POST',body:JSON.stringify(report),headers:{'Content-Type':'application/json'}});};
const frame=()=>new Promise<number>(r=>requestAnimationFrame(r));
const paint=async()=>{await frame();await frame();};
function quantile(a:number[],q:number){const b=[...a].sort((a,b)=>a-b);return b[Math.floor((b.length-1)*q)]??0;}
async function gzip(blobs:Blob[]){const a=await Promise.all(blobs.map(async b=>new Response(b.stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer()));return a.reduce((n,b)=>n+b.byteLength,0);}
async function stored(blobs:Blob[]){const req=indexedDB.open('drum-renderer-benchmark',1);req.onupgradeneeded=()=>req.result.createObjectStore('pages');const db=await new Promise<IDBDatabase>((r,j)=>{req.onsuccess=()=>r(req.result);req.onerror=()=>j(req.error);});try{
 let t=performance.now();const bytes=await Promise.all(blobs.map(async b=>({data:await b.arrayBuffer(),type:b.type})));await new Promise<void>((r,j)=>{const tx=db.transaction('pages','readwrite');tx.objectStore('pages').put(bytes,'score');tx.oncomplete=()=>r();tx.onerror=()=>j(tx.error);});const save=performance.now()-t;t=performance.now();const got=await new Promise<any[]>((r,j)=>{const q=db.transaction('pages').objectStore('pages').get('score');q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error);});const pages=got.map(b=>new Blob([b.data],{type:b.type}));return {saveMs:save,readMs:performance.now()-t,pages};}finally{db.close();}}
async function run(backend:'canvas'|'svg',round:number,xml:string){
 status.textContent=`${mode}: ${backend==='canvas'?'PNG':'SVG'} ${round+1}/3`;await paint();host.innerHTML='';stage.innerHTML='';
 const start=performance.now(),parsed=parseMusicXML(xml),parseMs=performance.now()-start;
 const osmd=new OpenSheetMusicDisplay(host,{backend,autoResize:false,pageFormat:'A4_P',drawTitle:true,drawMeasureNumbers:false,drawLyrics:false,drawPartNames:false,drawPartAbbreviations:false});
 osmd.EngravingRules.RenderXMeasuresPerLineAkaSystem=4;osmd.EngravingRules.RenderMultipleRestMeasures=false;osmd.EngravingRules.AutoGenerateMultipleRestMeasuresFromRestMeasures=false;
 let t=performance.now();await osmd.load(parsed.document);const loadMs=performance.now()-t;t=performance.now();osmd.render();const renderMs=performance.now()-t;t=performance.now();
 const nodes=Array.from(host.querySelectorAll(backend==='canvas'?'canvas':'svg')) as (HTMLCanvasElement|SVGSVGElement)[];
 const pages:Blob[]=await Promise.all(nodes.map(async n=>{if(backend==='canvas')return new Promise<Blob>((r,j)=>(n as HTMLCanvasElement).toBlob(b=>b?r(b):j(Error('PNG encode failed')),'image/png'));const svg=n.cloneNode(true) as SVGSVGElement;svg.setAttribute('xmlns','http://www.w3.org/2000/svg');return new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'});}));
 const encodeMs=performance.now()-t;
 const dimensions=nodes.map(n=>backend==='canvas'?[(n as HTMLCanvasElement).width,(n as HTMLCanvasElement).height]:[(n as SVGSVGElement).viewBox.baseVal.width||parseFloat(n.getAttribute('width')!), (n as SVGSVGElement).viewBox.baseVal.height||parseFloat(n.getAttribute('height')!)]);
 const regions=parsed.measures.map((_,i)=>{const g=osmd.GraphicSheet.MeasureList[i][0],p=g.ParentMusicSystem.Parent,box=g.PositionAndShape,pi=p.PageNumber-1,absolute=box.AbsolutePosition,pp=p.PositionAndShape.AbsolutePosition;
 const node=nodes[pi],width=backend==='canvas'?(parseFloat((node as HTMLCanvasElement).style.width)||(node as HTMLCanvasElement).width):dimensions[pi][0];
 const height=width*dimensions[pi][1]/dimensions[pi][0];
 const top=Math.min(box.BorderTop,g.ParentStaffLine.PositionAndShape.BorderTop,...g.ParentStaffLine.SkyLine,-4)-1;
 return {page:pi,x:Math.max(0,(absolute.x-pp.x+box.BorderLeft)*10/width),y:Math.max(0,(absolute.y-pp.y+top)*10/height),w:(box.BorderRight-box.BorderLeft)*10/width,h:(Math.max(box.BorderBottom,9)+.5-top)*10/height};});
 const elementCount=backend==='svg'?host.querySelectorAll('svg *').length:0;
 host.innerHTML='';
 const saved=await stored(pages);const urls=saved.pages.map(b=>URL.createObjectURL(b));t=performance.now();const images=await Promise.all(urls.map(async url=>{const i=new Image();i.src=url;await i.decode();return i;}));const decodeMs=performance.now()-t;
 t=performance.now();for(const r of regions.slice(40,48)){const b=document.createElement('div');b.className='bar';const ratio=images[r.page].naturalHeight/images[r.page].naturalWidth;const width=stage.clientWidth/4;const h=width/r.w*r.h*ratio;b.style.height=h+'px';b.style.backgroundImage=`url("${urls[r.page]}")`;b.style.backgroundSize=`${width/r.w}px ${width/r.w*ratio}px`;b.style.backgroundPosition=`${-r.x*width/r.w}px ${-r.y*width/r.w*ratio}px`;stage.append(b);}await paint();const displayMs=performance.now()-t;
 const shade=document.createElement('div');shade.id='shade';stage.append(shade);const cursor=document.createElement('div');cursor.id='cursor';stage.append(cursor);
 const intervals:number[]=[];let last=await frame(),begin=last;while(last-begin<6000){const now=await frame();intervals.push(now-last);last=now;const progress=((now-begin)%3000)/3000;cursor.style.transform=`translateX(${progress*stage.clientWidth}px)`;shade.style.width=`${progress*100}%`;}
 const sample={backend:backend==='canvas'?'PNG':'SVG',round,parseMs,loadMs,renderMs,encodeMs,generateMs:parseMs+loadMs+renderMs+encodeMs,bytes:pages.reduce((s,b)=>s+b.size,0),gzipBytes:await gzip(pages),saveMs:saved.saveMs,readMs:saved.readMs,decodeMs,displayMs,reopenMs:saved.readMs+decodeMs+displayMs,pages:pages.length,dimensions,measures:regions.length,regions,svgElements:elementCount,frames:{count:intervals.length,medianMs:quantile(intervals,.5),p95Ms:quantile(intervals,.95),maxMs:Math.max(...intervals),over25ms:intervals.filter(n=>n>25).length,hidden:document.hidden}};
 stage.innerHTML='';urls.forEach(u=>URL.revokeObjectURL(u));report.samples.push(sample);await post();
}
(async()=>{try {await document.fonts.ready;const xml=await(await fetch('/score.musicxml')).text();report.xmlBytes=new Blob([xml]).size;report.xmlSHA256=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(xml))),v=>v.toString(16).padStart(2,'0')).join('');
 for(let i=0;i<3;i++)for(const b of (i%2?['svg','canvas']:['canvas','svg']) as ('svg'|'canvas')[])await run(b,i,xml);
 report.complete=true;status.textContent='비교 완료 — 결과를 저장했습니다.';document.getElementById('result')!.textContent=JSON.stringify(report.samples.map(({regions,...s}:any)=>s),null,2);await post();
}catch(e){report.errors.push(String(e));status.textContent='오류: '+e;await post();}

})();
