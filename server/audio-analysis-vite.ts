import type {Plugin} from 'vite';
import {Readable} from 'node:stream';
import {resolve} from 'node:path';
import {audioAnalysisAPI} from './audio-analysis-api';
import {localAnalysisStore} from './audio-analysis-local';
import {ANALYSIS_PATH} from '../src/audio-analysis-contract';
export function audioAnalysisPlugin(): Plugin {
  return {name:'local-audio-analysis-api',configureServer(server) {
    const store=localAnalysisStore(resolve(server.config.root,'data/runtime/audio-analysis.sqlite'));
    server.httpServer?.once('close',()=>store.close());
    server.middlewares.use(async (req,res,next)=>{
      if(!req.url?.startsWith(ANALYSIS_PATH)) return next();
      try {
        const headers=new Headers();
        for(const [name,value] of Object.entries(req.headers)) if(value) headers.set(name,Array.isArray(value)?value.join(','):value);
        const request=new Request(`http://${req.headers.host || '127.0.0.1:5173'}${req.url}`,{
          method:req.method,headers,
          ...(!['GET','HEAD'].includes(req.method || 'GET') ? {body:Readable.toWeb(req) as ReadableStream,duplex:'half'} : {}),
        });
        const response=await audioAnalysisAPI(request,store);
        res.statusCode=response.status;
        response.headers.forEach((value,key)=>res.setHeader(key,value));
        res.end(Buffer.from(await response.arrayBuffer()));
      } catch {res.statusCode=503;res.end();}
    });
  }};
}
