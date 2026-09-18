import {readFile,writeFile} from 'node:fs/promises';
import {createCanvas,DOMMatrix,ImageData,Path2D} from '@napi-rs/canvas';
import {transform} from 'esbuild';
Object.assign(globalThis,{DOMMatrix,ImageData,Path2D});
const {getDocument}=await import('pdfjs-dist/legacy/build/pdf.mjs');
let source=await readFile('src/pdf.ts','utf8');source=source.slice(source.indexOf('export function detectRegions'));source='const uid=()=>crypto.randomUUID();\n'+source;
const js=await transform(source,{loader:'ts',format:'esm'});const {detectRegions}=await import('data:text/javascript;base64,'+Buffer.from(js.code).toString('base64'));
const bytes=await readFile('public/demo/score.pdf');const task=getDocument({data:new Uint8Array(bytes)});const pdf=await task.promise;const result=[];
for(let n=1;n<=pdf.numPages;n++){const p=await pdf.getPage(n),v=p.getViewport({scale:1.8}),c=createCanvas(Math.ceil(v.width),Math.ceil(v.height)),ctx=c.getContext('2d');await p.render({canvas:c,canvasContext:ctx,viewport:v}).promise;const regions=detectRegions(ctx.getImageData(0,0,c.width,c.height),n-1);result.push({page:n,candidates:regions.length,rows:Object.fromEntries([...new Set(regions.map(r=>r.y))].map(y=>[y.toFixed(3),regions.filter(r=>r.y===y).length])),valid:regions.every(r=>r.x>=0&&r.y>=0&&r.x+r.w<=1&&r.y+r.h<=1)});p.cleanup();}
await task.destroy();await writeFile('docs/experiments/actual-pdf.json',JSON.stringify(result,null,2));console.log(result);
