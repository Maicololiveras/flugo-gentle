#!/usr/bin/env node
/** Explicit local Pi JSONL import. No model/provider/network calls or directory scanning. */
import {readFile,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {createMetricAdapter} from './lib/benchmarks.mjs';
import {createBenchmarkStore} from './lib/benchmark-store.mjs';
export async function importRecording(file,{directory}={}){
 const path=resolve(file);if((await stat(path)).size>64*1024*1024)throw Error('Maximum JSONL size is 64 MiB');
 const data=await readFile(path,'utf8'),lines=data.split('\n').filter(x=>x.trim());
 const rows=lines.map(line=>JSON.parse(line));const header=rows.find(x=>x.type==='session');
 if(!header?.id||!header?.cwd)throw Error('Expected a Pi session header with id and cwd');
 const instance=createHash('sha256').update(data).digest('hex');let now=Date.parse(header.timestamp)||Date.now();
 const metric=createMetricAdapter({source:'jsonl',project:header.cwd,instance,clock:()=>now});
 const ctx={cwd:header.cwd,sessionManager:{getSessionId:()=>header.id}};
 const store=await createBenchmarkStore({directory});let count=0;
 try{
  for(const row of rows){
   now=Date.parse(row.timestamp)||now;
   const m=row.message;if(row.type!=='message'||!m)continue;
   let e;if(m.role==='assistant')e=metric('message_end',{message:m},ctx);
   else if(m.role==='user')e=metric('input',{source:'unknown'},ctx);
   else if(m.role==='toolResult')e=metric('tool_result',{toolCallId:m.toolCallId,toolName:m.toolName,isError:m.isError},ctx);
   if(e&&store.consume(e))count++;
  }
  await store.flush();return {count,storage:store.snapshot().storage};
 }finally{await store.close()}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const args=process.argv.slice(2);if(args.length!==1){console.error('Usage: node live/import-benchmarks.mjs /path/to/pi-session.jsonl');process.exitCode=1}
 else try{console.log(JSON.stringify(await importRecording(args[0]),null,2))}catch(error){console.error(error.message);process.exitCode=1}
}
