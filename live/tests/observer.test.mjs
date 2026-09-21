import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalize,clean} from '../lib/normalize.mjs';
import {startObserver} from '../lib/server.mjs';
import observer from '../extensions/observer.ts';
import {ansiToHex,createThemeSnapshot} from '../lib/theme.mjs';
async function readUntil(reader,pattern,limit=12){let text='';for(let index=0;index<limit&&!pattern.test(text);index++){const chunk=await reader.read();if(chunk.done)break;text+=new TextDecoder().decode(chunk.value)}return text;}
test('visible responses omit private thinking and image blocks',()=>{
 const e=normalize('message_end',{message:{role:'assistant',content:[{type:'thinking',thinking:'private'},{type:'text',text:'Done'},{type:'image',data:'base64'}]}});
 assert.equal(e.text,'Done');assert.equal(normalize('message_end',{message:{role:'user',content:'duplicate'}}),null);
 assert.deepEqual(clean({apiKey:'secret',nested:{password:'x',status:'ok'}}),{nested:{status:'ok'}});
});
test('subagent queries and results keep task identity and status',()=>{
 const q=normalize('message_end',{message:{role:'custom',content:'Which scope?',details:{gentleAgents:{agent:'worker',taskId:'t1',kind:'query'}}}});
 assert.equal(q.from,'worker');assert.equal(q.to,'parent');assert.equal(q.status,'interaction_required');assert.equal(q.taskId,'t1');assert.equal(q.agent,'worker');
 const r=normalize('tool_result',{toolName:'subagent_result',toolCallId:'c1',content:[{type:'text',text:'finished'}],details:{gentleAgents:{taskId:'t1',status:'completed'}}});
 assert.equal(r.callId,'c1');assert.equal(r.taskId,'t1');assert.equal(r.status,'completed');assert.equal(r.toolName,'subagent_result');
 assert.equal(normalize('agent_end').status,'awaiting settlement');assert.equal(normalize('agent_settled').status,'settled');
 const review=normalize('tool_call',{toolName:'gentle_review',toolCallId:'review-1',input:{operation:'status'}});
 assert.equal(review.to,'native');assert.equal(review.callId,'review-1');
});
test('active Pi themes resolve to safe browser colors without hardcoded theme names',()=>{
 assert.equal(ansiToHex('\u001b[38;2;12;34;56m'),'#0c2238');
 assert.equal(ansiToHex('\u001b[48;5;196m'),'#ff0000');
 const fg={accent:'\u001b[38;2;10;120;240m',border:'\u001b[38;5;244m',muted:'\u001b[38;5;250m',success:'\u001b[38;2;20;180;100m',warning:'\u001b[38;2;230;170;50m',error:'\u001b[38;2;230;70;70m'};
 const bg={toolPendingBg:'\u001b[48;2;12;18;28m',userMessageBg:'\u001b[48;2;20;30;44m',selectedBg:'\u001b[48;2;31;45;60m'};
 const ui={theme:{name:'Gentleman-Sexy',getColorMode:()=> 'truecolor',getFgAnsi:token=>fg[token]??'',getBgAnsi:token=>bg[token]??''},getAllThemes:()=>[{name:'Gentleman-Sexy'},{name:'wegcode-night'},{name:'dark'}]};
 const snapshot=createThemeSnapshot(ui);
 assert.equal(snapshot.name,'Gentleman-Sexy');assert.equal(snapshot.colors.accent,'#0a78f0');assert.equal(snapshot.colors.page,'#0c121c');
 assert.deepEqual(snapshot.available,['Gentleman-Sexy','wegcode-night','dark']);
 for(const role of ['user','parent','worker','tool','memory','native'])assert.equal(snapshot.colors[role],snapshot.colors.accent);
});
test('live SSE requires local origin and session key, replays ordered events',async()=>{
 const server=await startObserver();const u=new URL(server.url),key=u.hash.slice(1),base=u.origin;
 try{
  assert.equal((await fetch(base+'/events')).status,403);
  assert.equal((await fetch(base+'/events?key='+key,{headers:{Origin:'https://untrusted.example'}})).status,403);
  assert.equal((await fetch(base+'/',{method:'POST'})).status,405);
  assert.equal((await fetch(base+'/missing')).status,404);
  server.publish(normalize('input',{text:'hello'}));server.publish(normalize('agent_start'));
  const response=await fetch(base+'/events?key='+key,{headers:{'Last-Event-ID':'1'}}),reader=response.body.getReader();
  const text=new TextDecoder().decode((await reader.read()).value);assert.match(text,/id: 2/);assert.doesNotMatch(text,/id: 1\n/);assert.match(text,/"mode":"live"/);await reader.cancel();
 }finally{await server.close()}
});
test('shutdown rejects late requests and remains idempotent without losing authorization state',async()=>{
 const observer=await startObserver(),u=new URL(observer.url),request={headers:{host:u.host,origin:u.origin}};
 const first=observer.close(),second=observer.close();
 assert.equal(first,second);
 let status,headers,ended=false;
 observer.server.emit('request',{url:'/',headers:{}},{writeHead(code,value){status=code;headers=value;return this},end(){ended=true;return this}});
 assert.equal(status,503);assert.equal(headers.Connection,'close');assert.equal(ended,true);
 await Promise.all([first,second]);assert.equal(observer.close(),first);await observer.close();
 const events=new URL(`/events?key=${u.hash.slice(1)}`,u.origin);
 assert.equal(observer.authorized(request,events),true);
 assert.equal(observer.authorized({...request,headers:{...request.headers,host:'127.0.0.1:1'}},events),false);
 assert.equal(observer.authorized({...request,headers:{...request.headers,origin:'https://untrusted.example'}},events),false);
 assert.equal(observer.authorized(request,new URL('/events?key=wrong',u.origin)),false);
});
test('Pi extension stays passive, publishes real hook payloads and tracks active theme changes',async()=>{
 const hooks=new Map();let command,url;
 observer({on:(name,handler)=>hooks.set(name,handler),registerCommand:(_,value)=>command=value});
 const makeTheme=(name,red)=>({name,getColorMode:()=> 'truecolor',getFgAnsi:()=>`\u001b[38;2;${red};140;210m`,getBgAnsi:()=>`\u001b[48;2;${red};20;32m`});
 let activeTheme=makeTheme('Gentleman-Sexy',90);
 const ui={notify:text=>{if(text.includes('http:'))url=text.match(/http:\/\/\S+/)[0]},get theme(){return activeTheme},getAllThemes:()=>[{name:'Gentleman-Sexy'},{name:'wegcode-night'}]};
 const ctx={ui};hooks.get('input')({text:'before observer'},ctx);
 await command.handler('',ctx);assert.ok(url);activeTheme=makeTheme('wegcode-night',20);await new Promise(resolve=>setTimeout(resolve,320));
 try{
  assert.equal(hooks.get('input')({text:'actual event'}),undefined);
  assert.equal(hooks.get('tool_call')({toolName:'read',input:{path:'README.md'}}),undefined);
  const u=new URL(url),response=await fetch(u.origin+'/events?key='+u.hash.slice(1)),reader=response.body.getReader();
  const text=await readUntil(reader,/Call · read/);assert.match(text,/actual event/);assert.match(text,/Call · read/);assert.match(text,/Gentleman-Sexy/);assert.match(text,/wegcode-night/);await reader.cancel();
 }finally{await command.handler('stop',ctx)}
});
