/** Passive numeric accounting. Never reads prompts, tool arguments or response content. */
import {createHash,randomUUID} from 'node:crypto';
export const METRIC_SCHEMA=1;
export const tokenFields=['input','output','cacheRead','cacheWrite','cacheWrite1h','reasoning','totalTokens'];
const hash=value=>createHash('sha256').update(String(value)).digest('hex').slice(0,24);
const identifier=value=>typeof value==='string'&&/^[\w.:/@+-]{1,160}$/.test(value)?value:'unknown';
const number=value=>typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=1e12?value:null;
export function createMetricAdapter({clock=Date.now,source='live',project=process.cwd(),instance=randomUUID()}={}){
 const sessions=new Map(),objects=new WeakMap();
 return (type,event={},ctx={})=>{
  let session;try{session=ctx.sessionManager?.getSessionId?.()}catch{}
  const sessionKey=String(session||'unavailable');
  if(!sessions.has(sessionKey))sessions.set(sessionKey,source==='jsonl'?sessionKey:randomUUID());
  const base={schema:METRIC_SCHEMA,recordingId:hash(instance+sessions.get(sessionKey)),sessionId:session?hash(session):null,projectId:hash(ctx.cwd||project),source,at:clock(),eventId:randomUUID(),type};
  // Repeated callbacks with the same event object are not additional observations.
  if(event&&typeof event==='object'){if(objects.has(event))base.eventId=objects.get(event);else objects.set(event,base.eventId)}
  switch(type){
   case 'child_metrics':{
    if(event.schema!=='gentle:runtime-metrics:child/v1'||!session||event.parentSessionId!==session||typeof event.taskId!=='string'||!Array.isArray(event.responses)||event.responses.length>128)return null;
    return {...base,childId:hash(event.taskId),settled:event.agentSettled===true,droppedResponses:number(event.droppedResponses)||0,responses:event.responses.map(r=>({provider:identifier(r.provider),model:identifier(r.observedModelId),usage:Object.fromEntries(tokenFields.filter(k=>r.tokens?.[k]?.state==='reported'&&number(r.tokens[k].value)!==null).map(k=>[k,r.tokens[k].value])),cost:null}))};
   }
   case 'before_provider_request':return {...base,provider:identifier(ctx.model?.provider),model:identifier(ctx.model?.id)};
   case 'message_start':return event.message?.role==='assistant'?{...base}:null;
   case 'message_end':{
    const m=event.message;if(m?.role!=='assistant')return null;
    const usage={};for(const field of tokenFields){const n=number(m.usage?.[field]);if(n!==null&&Number.isSafeInteger(n))usage[field]=n}
    const cost=number(m.usage?.cost?.total);
    const costParts=Object.fromEntries(['input','output','cacheRead','cacheWrite'].map(k=>[k,number(m.usage?.cost?.[k])]));
    return {...base,provider:identifier(m.provider),model:identifier(m.model),responseId:m.responseId?hash(m.provider+':'+m.responseId):null,usage,cost,costParts,stopReason:['stop','toolUse','length','error','aborted','deferred'].includes(m.stopReason)?m.stopReason:'unknown'};
   }
   case 'tool_call':case 'tool_execution_start':case 'tool_execution_end':case 'tool_result':return {...base,callId:typeof event.toolCallId==='string'?hash(event.toolCallId):null,tool:identifier(event.toolName),error:event.isError===true};
   case 'input':return {...base,inputSource:['interactive','rpc','extension'].includes(event.source)?event.source:'unknown'};
   case 'ui_prompt_start':case 'ui_prompt_end':case 'agent_start':case 'agent_end':case 'agent_settled':case 'session_start':case 'session_switch':case 'session_shutdown':return base;
   default:return null;
  }
 };
}
const measured=()=>({sum:0,samples:0});
const cacheBucket=()=>({input:0,read:0,write:0,samples:0,readResponses:0,readSavings:{sum:0,samples:0},netSavings:{sum:0,samples:0}});
const modelBucket=()=>({requests:0,responses:0,errors:0,aborted:0,tokens:Object.fromEntries(tokenFields.map(k=>[k,measured()])),cost:measured(),cache:cacheBucket(),zeroCostSamples:0});
export function createSummary(e){return {schema:METRIC_SCHEMA,id:e.recordingId,sessionId:e.sessionId,projectId:e.projectId,source:e.source,startedAt:e.at,updatedAt:e.at,observedEvents:0,requests:0,responses:0,errors:0,aborted:0,inputs:{interactive:0,rpc:0,extension:0,unknown:0},promptsOpened:0,promptsClosed:0,agentRuns:0,agentEnds:0,settlements:0,toolCalls:0,toolStarts:0,toolEnds:0,toolErrors:0,toolResults:0,tools:Object.create(null),models:Object.create(null),tokens:Object.fromEntries(tokenFields.map(k=>[k,measured()])),cost:measured(),cache:cacheBucket(),zeroCostSamples:0,responseDuration:measured(),children:{completions:0,responses:0,droppedResponses:0,settled:0,models:Object.create(null)},coverage:'parent-visible events since activation; child-internal requests and transport retries unavailable',observerModelCalls:0,observerTokens:0};}
function addUsage(bucket,e){
 const u=e.usage||{},c=e.costParts||{};
 if(['input','cacheRead','cacheWrite'].every(k=>number(u[k])!==null)){
  bucket.cache.input+=u.input;bucket.cache.read+=u.cacheRead;bucket.cache.write+=u.cacheWrite;bucket.cache.samples++;if(u.cacheRead>0)bucket.cache.readResponses++;
  // Reconstruct the observed uncached input rate from the same response. No price lookup.
  if(u.input>0&&number(c.input)>0&&number(c.cacheRead)!==null){
   const rate=c.input/u.input;bucket.cache.readSavings.sum+=u.cacheRead*rate-c.cacheRead;bucket.cache.readSavings.samples++;
   if(number(c.cacheWrite)!==null){bucket.cache.netSavings.sum+=(u.cacheRead+u.cacheWrite)*rate-c.cacheRead-c.cacheWrite;bucket.cache.netSavings.samples++}
  }
 }
 for(const field of tokenFields){const n=number(e.usage?.[field]);if(n!==null&&Number.isSafeInteger(n)){bucket.tokens[field].sum+=n;bucket.tokens[field].samples++}}
 // SDK zero may mean an unpriced/subscription model. Never present it as a free invoice.
 if(number(e.cost)>0){bucket.cost.sum+=e.cost;bucket.cost.samples++}else if(e.cost===0)bucket.zeroCostSamples++;
}
export function createAccumulator(initial){
 let summary=initial;const childSeen=new Set();const seen=new Set(),calls=new Map(),responses=new Set();let responseStart;
 return {get summary(){return summary},consume(e){
  if(!e||e.schema!==METRIC_SCHEMA||!Number.isFinite(e.at)||!e.eventId||seen.has(e.eventId))return false;
  if(summary&&summary.id!==e.recordingId)return false;
  if(seen.size>=100000){if(summary&&!summary.truncated){summary.truncated=true;summary.updatedAt=e.at;return true;}return false;}
  seen.add(e.eventId);summary??=createSummary(e);const s=summary;s.updatedAt=Math.max(s.updatedAt,e.at);s.observedEvents++;
  if(e.type==='child_metrics'&&!childSeen.has(e.childId)){
   childSeen.add(e.childId);s.children.completions++;s.children.settled+=e.settled?1:0;s.children.droppedResponses+=e.droppedResponses||0;
   for(const response of e.responses||[]){s.children.responses++;const k=JSON.stringify([response.provider,response.model]);const b=s.children.models[k]??=modelBucket();b.responses++;addUsage(b,response)}
  }
  if(e.type==='before_provider_request'){s.requests++;const key=JSON.stringify([identifier(e.provider),identifier(e.model)]);s.models[key]??=modelBucket();s.models[key].requests++}
  if(e.type==='message_start')responseStart=e.at;
  if(e.type==='message_end'){
   if(e.responseId&&responses.has(e.responseId))return true;if(e.responseId)responses.add(e.responseId);
   s.responses++;const key=JSON.stringify([identifier(e.provider),identifier(e.model)]);const b=s.models[key]??=modelBucket();b.responses++;addUsage(s,e);addUsage(b,e);
   if(e.stopReason==='error'){s.errors++;b.errors++}if(e.stopReason==='aborted'){s.aborted++;b.aborted++}
   if(responseStart!==undefined&&e.at>=responseStart){s.responseDuration.sum+=e.at-responseStart;s.responseDuration.samples++}responseStart=undefined;
  }
  if(e.type==='input')s.inputs[Object.hasOwn(s.inputs,e.inputSource)?e.inputSource:'unknown']++;
  for(const [type,field]of Object.entries({ui_prompt_start:'promptsOpened',ui_prompt_end:'promptsClosed',agent_start:'agentRuns',agent_end:'agentEnds',agent_settled:'settlements'}))if(e.type===type)s[field]++;
  if(['tool_call','tool_execution_start','tool_execution_end','tool_result'].includes(e.type)){
   const name=identifier(e.tool),b=s.tools[name]??={calls:0,starts:0,ends:0,errors:0,results:0,duration:measured()};
   const key=e.callId||e.eventId,state=calls.get(key)||{};
   if(!state[e.type]){
    state[e.type]=true;
    const [sf,bf]={tool_call:['toolCalls','calls'],tool_execution_start:['toolStarts','starts'],tool_execution_end:['toolEnds','ends'],tool_result:['toolResults','results']}[e.type];s[sf]++;b[bf]++;
    if(e.type==='tool_execution_start')state.startedAt=e.at;
    if(e.type==='tool_execution_end'){
     if(e.error){s.toolErrors++;b.errors++}
     if(state.startedAt!==undefined&&e.at>=state.startedAt){b.duration.sum+=e.at-state.startedAt;b.duration.samples++}
    }
   }
   calls.set(key,state);
  }
  return true;
 }};
}
