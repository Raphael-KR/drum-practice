import {defineConfig} from 'vite';
import {sites} from './build/sites-vite-plugin';
import hosting from './.openai/hosting.json';
export default defineConfig(async()=>{
  const {cloudflare}=await import('@cloudflare/vite-plugin');
  return {
    publicDir:false,
    plugins:[sites({mockAuth:false}),cloudflare({
      viteEnvironment:{name:'server'},inspectorPort:false,
      config:{
        name:'drum-practice',main:'./server/player-worker.ts',
        compatibility_date:'2026-05-15',compatibility_flags:['nodejs_compat'],
        assets:{binding:'ASSETS',run_worker_first:true,html_handling:'none'},
        d1_databases:[{binding:hosting.d1,database_name:'site-creator-d1',database_id:'00000000-0000-4000-8000-000000000000'}],
      },
    })],
  };
});
