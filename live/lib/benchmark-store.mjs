import {mkdir,readdir,readFile,writeFile,rename,unlink} from 'node:fs/promises';
import {join} from 'node:path';
import {homedir} from 'node:os';
import {createAccumulator} from './benchmarks.mjs';
export const defaultBenchmarkDirectory=()=>process.env.GENTLE_LIVE_BENCHMARK_DIR||join(homedir(),'.local','share','gentle-live','benchmarks');
export async function createBenchmarkStore({directory=defaultBenchmarkDirectory(),onChange=()=>{}}={}){
 const archive=new Map(),active=new Map();let dirty=new Set(),timer,chain=Promise.resolve(),error=null,closed=false,currentId=null,transportDropped=0;
 if(directory)try{
  await mkdir(directory,{recursive:true,mode:0o700});
  const files=(await readdir(directory)).filter(f=>/^[a-f0-9]{24}\.json$/.test(f));
  for(const file of files){try{const s=JSON.parse(await readFile(join(directory,file),'utf8'));if(s.schema===1&&file===s.id+'.json'&&Number.isFinite(s.updatedAt)&&s.cache&&s.children&&s.cost&&s.inputs&&s.models&&s.tools&&s.tokens?.totalTokens)archive.set(s.id,s)}catch{error='Some saved recordings could not be read'}}
 }catch{error='History directory is unavailable'}
 const snapshot=()=>({schema:1,currentId,transportDropped,storage:{enabled:!!directory,status:error?'error':dirty.size?'pending':'saved',error},sessions:[...archive.values()].sort((a,b)=>b.updatedAt-a.updatedAt).slice(0,200)});
 const flush=()=>{
  clearTimeout(timer);timer=undefined;
  const ids=[...dirty];dirty.clear();
  const jobs=ids.map(id=>[id,JSON.stringify(archive.get(id))]);
  chain=chain.then(async()=>{
   if(!directory)return;
   for(const [id,data] of jobs){const tmp=join(directory,`${id}.${process.pid}.tmp`);try{await writeFile(tmp,data,{mode:0o600});await rename(tmp,join(directory,id+'.json'));error=null}catch{error='Recording could not be saved';dirty.add(id);await unlink(tmp).catch(()=>{})}}
   onChange(snapshot());
  });return chain;
 };
 return {snapshot,flush,markTransportLoss(count){
  if(!Number.isSafeInteger(count)||count<=transportDropped)return;transportDropped=count;
  for(const [id,acc]of active){acc.summary.transportDropped=count;dirty.add(id)}onChange(snapshot());
 },consume(e){
  if(closed||!e||!['live','jsonl'].includes(e.source)||!/^[a-f0-9]{24}$/.test(e.recordingId)||!/^[a-f0-9]{24}$/.test(e.projectId))return false;
  let acc=active.get(e.recordingId);
  // An imported file may be seen again. Do not add it to an already persisted recording.
  if(!acc&&archive.has(e.recordingId))return false;
  if(!acc){acc=createAccumulator();active.set(e.recordingId,acc)}
  if(!acc.consume(e))return false;
  if(transportDropped)acc.summary.transportDropped=transportDropped;currentId=e.recordingId;archive.set(e.recordingId,acc.summary);dirty.add(e.recordingId);
  if(!timer){timer=setTimeout(()=>void flush(),1000);timer.unref?.()}
  return true;
 },async close(){closed=true;await flush()}};
}
