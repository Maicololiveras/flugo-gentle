import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,readdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createMetricAdapter,createAccumulator} from '../lib/benchmarks.mjs';
import {createBenchmarkStore} from '../lib/benchmark-store.mjs';
import {startObserver} from '../lib/server.mjs';
import {importRecording} from '../import-benchmarks.mjs';
import observer from '../extensions/observer.ts';
import '../web/benchmark-math.js';
const math=globalThis.GentleBenchmarkMath;
const context={cwd:'/private/project',sessionManager:{getSessionId:()=> 'private-session'},model:{provider:'test',id:'model'}};
const response=(extra={})=>({message:{role:'assistant',provider:'test',model:'model',responseId:'response-1',stopReason:'stop',content:[{type:'thinking',thinking:'PRIVATE'},{type:'toolCall',arguments:{secret:'PRIVATE'}}],usage:{input:1000,output:100,cacheRead:8000,cacheWrite:1000,reasoning:50,totalTokens:10100,cost:{input:.003,output:.0015,cacheRead:.0024,cacheWrite:.00375,total:.01065}},...extra}});
function setup(){let now=1000;const adapt=createMetricAdapter({clock:()=>now,instance:'test'}),acc=createAccumulator();return {acc,adapt,emit(type,event={}){now+=10;const e=adapt(type,event,context);if(e)acc.consume(e);return e}}}
test('records tool-only final messages and numeric cache use without content or credentials',()=>{
 const {acc,emit}=setup();emit('before_provider_request',{payload:{apiKey:'PRIVATE',messages:['PRIVATE']}});emit('message_start',{message:{role:'assistant'}});const e=emit('message_end',response());
 assert.doesNotMatch(JSON.stringify(e),/PRIVATE|private-session|private\/project|thinking|content|payload/);
 const s=acc.summary;assert.equal(s.requests,1);assert.equal(s.responses,1);assert.equal(s.tokens.totalTokens.sum,10100);assert.equal(s.tokens.reasoning.sum,50);assert.equal(s.responseDuration.sum,10);
 const c=math.cache(s);assert.equal(c.readShare,80);assert.equal(c.responseHitShare,100);assert.ok(Math.abs(c.readSavings-.0216)<1e-12);assert.ok(Math.abs(c.netSavings-.02085)<1e-12);
 assert.equal(s.cost.sum,.01065);assert.equal(s.observerModelCalls,0);assert.equal(s.observerTokens,0);
});
test('cold cache may cost more; missing and zero prices do not invent savings',()=>{
 const {acc,emit}=setup();emit('message_end',response({usage:{input:1000,output:20,cacheRead:0,cacheWrite:1000,totalTokens:2020,cost:{input:.003,output:.0003,cacheRead:0,cacheWrite:.00375,total:.00705}}}));
 assert.ok(math.cache(acc.summary).netSavings<0);
 const other=setup();other.emit('message_end',response({usage:{input:0,cacheRead:1000,totalTokens:1000,cost:{total:0}}}));assert.equal(math.cache(other.acc.summary).netSavings,null);assert.equal(other.acc.summary.cost.samples,0);assert.equal(other.acc.summary.zeroCostSamples,1);assert.equal(other.acc.summary.tokens.output.samples,0);
});
test('deduplicates responses and call phases; progress and custom worker messages never add usage',()=>{
 const {acc,emit}=setup();const e=emit('message_end',response());assert.equal(acc.consume(e),false);emit('message_end',response());
 for(const type of ['tool_call','tool_call','tool_execution_start','tool_execution_start','tool_execution_end','tool_execution_end','tool_result'])emit(type,{toolName:'bash',toolCallId:'call-1',isError:true});
 assert.equal(emit('tool_execution_update',{partialResult:{usage:{totalTokens:99999}}}),null);assert.equal(emit('message_end',{message:{role:'custom',usage:{totalTokens:99999}}}),null);
 assert.equal(acc.summary.responses,1);assert.equal(acc.summary.toolCalls,1);assert.equal(acc.summary.toolStarts,1);assert.equal(acc.summary.toolEnds,1);assert.equal(acc.summary.toolErrors,1);assert.equal(acc.summary.toolResults,1);assert.equal(acc.summary.tools.bash.duration.samples,1);
});
test('tracks human inputs separately from RPC, extension messages and closed prompts',()=>{
 const {acc,emit}=setup();for(const source of ['interactive','rpc','extension',undefined])emit('input',{source});emit('ui_prompt_start');emit('ui_prompt_end');emit('agent_end');
 assert.deepEqual(acc.summary.inputs,{interactive:1,rpc:1,extension:1,unknown:1});assert.equal(acc.summary.promptsOpened,1);assert.equal(acc.summary.promptsClosed,1);assert.equal(acc.summary.settlements,0);
 emit('tool_call',{toolName:'__proto__',toolCallId:'safe'});assert.equal(acc.summary.tools.__proto__.calls,1);assert.equal({}.calls,undefined);
});
test('child metrics require session match and stay separate from parent totals',()=>{
 const {acc,emit}=setup();const child={schema:'gentle:runtime-metrics:child/v1',parentSessionId:'private-session',taskId:'child-private-id',agentSettled:true,droppedResponses:2,responses:[{provider:'test',observedModelId:'small',tokens:{input:{state:'reported',value:20},totalTokens:{state:'reported',value:40}}}]};
 assert.equal(emit('child_metrics',{...child,parentSessionId:'other'}),null);emit('child_metrics',child);emit('child_metrics',{...child});
 assert.equal(acc.summary.children.completions,1);assert.equal(acc.summary.children.responses,1);assert.equal(acc.summary.responses,0);assert.equal(acc.summary.children.droppedResponses,2);assert.doesNotMatch(JSON.stringify(acc.summary),/child-private-id|private-session/);
});
test('invalid numbers are unavailable; sessions and models keep separate boundaries',()=>{
 const {acc,emit,adapt}=setup();emit('message_end',response({usage:{input:-1,output:NaN,cacheRead:Infinity,totalTokens:4,cost:{total:-3}}}));assert.equal(acc.summary.tokens.input.samples,0);assert.equal(acc.summary.cost.samples,0);
 const next=adapt('session_start',{}, {...context,sessionManager:{getSessionId:()=> 'next'}});assert.notEqual(next.recordingId,acc.summary.id);assert.equal(acc.consume(next),false);
 const b=structuredClone(acc.summary);b.id='other';assert.equal(math.comparable(acc.summary,b,false),false);assert.equal(math.comparable(acc.summary,b,true),true);b.transportDropped=1;assert.equal(math.comparable(acc.summary,b,true),false);assert.equal(math.reduction(100,80),20);assert.equal(math.reduction(100,120),-20);assert.equal(math.reduction(0,10),null);
});
test('persists private summaries, restarts history, detects delivery loss and rejects unsafe paths',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'gentle-metrics-'));const {emit}=setup();let store;
 try{store=await createBenchmarkStore({directory});const e=emit('message_end',response());assert.equal(store.consume({...e,recordingId:'../escape'}),false);assert.equal(store.consume(e),true);store.markTransportLoss(2);await store.close();
  const files=await readdir(directory);assert.equal(files.length,1);const data=await readFile(join(directory,files[0]),'utf8');assert.doesNotMatch(data,/PRIVATE|private-session|private\/project/);
  store=await createBenchmarkStore({directory});assert.equal(store.snapshot().sessions[0].responses,1);assert.equal(store.snapshot().sessions[0].transportDropped,2);assert.equal(store.consume(e),false);await store.close();
 }finally{await rm(directory,{recursive:true,force:true})}
});
test('JSONL import is idempotent and does not invent request counts or interactive provenance',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'gentle-import-'));try{
  const file=join(directory,'session.jsonl'),out=join(directory,'stats');const rows=[{type:'session',id:'s1',cwd:'/project',timestamp:'2026-09-24T10:00:00Z'},{type:'message',message:{role:'user',content:'PRIVATE'}},{type:'message',message:response().message},{type:'message',message:{role:'toolResult',toolCallId:'t1',toolName:'read',isError:false}}];await writeFile(file,rows.map(x=>JSON.stringify(x)).join('\n'));
  assert.equal((await importRecording(file,{directory:out})).count,3);assert.equal((await importRecording(file,{directory:out})).count,0);
  const store=await createBenchmarkStore({directory:out});const s=store.snapshot().sessions[0];assert.equal(s.source,'jsonl');assert.equal(s.inputs.unknown,1);assert.equal(s.requests,0);assert.equal(s.toolResults,1);assert.equal(s.responses,1);await store.close();
 }finally{await rm(directory,{recursive:true,force:true})}
});
test('authenticated snapshot and SSE reconnect do not recount observations',async()=>{
 const feed=await startObserver({benchmarkDirectory:false}),u=new URL(feed.url),{emit}=setup();try{
  const row={kind:'benchmark_observation',metrics:emit('message_end',response())};feed.publish(row);feed.publish(row);
  assert.equal((await fetch(u.origin+'/benchmarks')).status,403);const path=u.origin+'/benchmarks?key='+u.hash.slice(1);
  for(let i=0;i<2;i++){const data=await (await fetch(path)).json();assert.equal(data.sessions[0].responses,1)}
  const stream=await fetch(u.origin+'/events?key='+u.hash.slice(1)),reader=stream.body.getReader();const text=new TextDecoder().decode((await reader.read()).value);assert.match(text,/event: benchmarks/);assert.doesNotMatch(text,/benchmark_observation/);await reader.cancel();
 }finally{await feed.close()}
});
test('extension hooks remain passive even with provider payloads and errors',async()=>{
 const hooks=new Map();let command,url;observer({on:(n,h)=>hooks.set(n,h),registerCommand:(n,c)=>command=c,events:{on:()=>()=>{}}});
 const ctx={...context,ui:{notify:t=>url=t.match(/http:\/\/\S+/)?.[0]||url}};
 const old=process.env.GENTLE_LIVE_BENCHMARK_DIR,dir=await mkdtemp(join(tmpdir(),'gentle-passive-'));process.env.GENTLE_LIVE_BENCHMARK_DIR=dir;
 try{await command.handler('',ctx);const payload={secret:'PRIVATE'};assert.equal(hooks.get('before_provider_request')({payload},ctx),undefined);assert.deepEqual(payload,{secret:'PRIVATE'});assert.equal(hooks.get('message_end')(response(),ctx),undefined);
  const u=new URL(url);const snap=await(await fetch(u.origin+'/benchmarks?key='+u.hash.slice(1))).json();assert.equal(snap.sessions[0].requests,1);assert.equal(snap.sessions[0].responses,1);
 }finally{await command.handler('stop',ctx);if(old===undefined)delete process.env.GENTLE_LIVE_BENCHMARK_DIR;else process.env.GENTLE_LIVE_BENCHMARK_DIR=old;await rm(dir,{recursive:true,force:true})}
});
test('stopping and restarting an observer creates a writable recording segment',async()=>{
 const hooks=new Map();let command,url;observer({on:(n,h)=>hooks.set(n,h),registerCommand:(n,c)=>command=c});
 const directory=await mkdtemp(join(tmpdir(),'gentle-restart-')),old=process.env.GENTLE_LIVE_BENCHMARK_DIR;process.env.GENTLE_LIVE_BENCHMARK_DIR=directory;
 const ctx={...context,ui:{notify:t=>url=t.match(/http:\/\/\S+/)?.[0]||url}};
 try{await command.handler('',ctx);hooks.get('message_end')(response(),ctx);await command.handler('stop',ctx);await command.handler('',ctx);hooks.get('message_end')(response(),ctx);
  const u=new URL(url),snapshot=await(await fetch(u.origin+'/benchmarks?key='+u.hash.slice(1))).json();assert.equal(snapshot.sessions.length,2);assert.deepEqual(snapshot.sessions.map(s=>s.responses),[1,1]);
 }finally{await command.handler('stop',ctx);if(old===undefined)delete process.env.GENTLE_LIVE_BENCHMARK_DIR;else process.env.GENTLE_LIVE_BENCHMARK_DIR=old;await rm(directory,{recursive:true,force:true})}
});
