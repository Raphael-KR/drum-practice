import {audioAnalysisAPI} from './audio-analysis-api';
import {d1AnalysisStore,type AnalysisDatabase} from './audio-analysis-store';
import {ANALYSIS_PATH} from '../src/audio-analysis-contract';
// Sites provisions DB from the manifest and serves the canonical player through ASSETS.
export default {
  async fetch(request:Request, env:{DB:AnalysisDatabase;ASSETS:{fetch(request:Request):Promise<Response>}}) {
    if(new URL(request.url).pathname.startsWith(ANALYSIS_PATH))
      return audioAnalysisAPI(request,d1AnalysisStore(env.DB));
    const url=new URL(request.url);
    if(url.pathname==='/') {url.pathname='/index.html';return env.ASSETS.fetch(new Request(url,request));}
    return env.ASSETS.fetch(request);
  },
};
