import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {terminalController} from '../lib/terminal.mjs';
import {startObserver} from '../lib/server.mjs';
import {normalize} from '../lib/normalize.mjs';
import {createReporter} from '../lib/reporter.mjs';
class Socket extends EventEmitter{readyState=1;bufferedAmount=0;rows=[];send(data){this.rows.push(JSON.parse(data))}close(){this.readyState=3;this.emit('close')}input(message){this.emit('message',JSON.stringify(message))}}
test('terminal starts only on explicit request, preserves arguments, single controller and reconnect',()=>{
 const calls=[],child={pid:41,onData(fn){this.data=fn},onExit(fn){this.exit=fn},write(data){calls.push(['write',data])},resize(...size){calls.push(['resize',...size])},kill(){calls.push(['kill'])}};
 const controller=terminalController({spawn:(...args)=>{calls.push(args);return child},cwd:'/tmp/a project',args:['-e','/plugin/observer.ts'],env:{TEST:'1'}});
 const first=new Socket();controller.connect(first);assert.equal(calls.length,0);first.input({type:'start'});first.input({type:'start'});assert.equal(calls.length,1);assert.equal(calls[0][0],'pi');assert.equal(calls[0][2].cwd,'/tmp/a project');
 first.input({type:'input',data:'hello\r'});first.input({type:'resize',cols:120,rows:30});first.input({type:'resize',cols:-1,rows:300});assert.equal(calls.length,3);
 const second=new Socket();controller.connect(second);assert.equal(second.readyState,3);
 child.data('native output');first.close();const resumed=new Socket();controller.connect(resumed);assert.equal(resumed.rows[0].data,'native output');assert.equal(calls.length,3);controller.close();assert.deepEqual(calls.at(-1),['kill']);
});
test('workspace ingestion accepts only its root Pi process and key',async()=>{
 const feed=await startObserver({mode:'workspace',producerPid:()=>1234});const u=new URL(feed.url),endpoint=u.origin+'/ingest';
 const post=(pid,key=feed.ingestKey)=>fetch(endpoint,{method:'POST',headers:{authorization:`Bearer ${key}`},body:JSON.stringify({pid,event:normalize('input',{text:'real input'})})});
 try{assert.equal((await post(1234,'bad')).status,403);assert.equal((await post(9876)).status,403);assert.equal((await post(1234)).status,204);
  assert.equal(feed.authorized({headers:{host:u.host,origin:u.origin}},new URL('/terminal?key='+u.hash.slice(1),u)),true);
  assert.equal(feed.authorized({headers:{host:u.host,origin:'https://example.com'}},new URL('/terminal?key='+u.hash.slice(1),u)),false);
 }finally{await feed.close()}
});
test('reporter never calls a model and rejects remote endpoints',async()=>{
 assert.throws(()=>createReporter({url:'https://example.com/ingest',key:'x'}));const calls=[];
 const reporter=createReporter({url:'http://127.0.0.1:1234/ingest',key:'test',pid:55,send:async(...args)=>{calls.push(args)}});
 reporter.publish(normalize('agent_start'));await new Promise(resolve=>setImmediate(resolve));reporter.close();assert.equal(calls.length,1);assert.equal(JSON.parse(calls[0][1].body).pid,55);assert.equal(calls[0][0],'http://127.0.0.1:1234/ingest');
});
test('EN/ES uses a local dictionary and preserves unmatched native content',async()=>{
 const code=await readFile(new URL('../web/i18n.js',import.meta.url),'utf8');
 for(const language of ['en','es']){const context={window:{},localStorage:{getItem:()=>language},document:{readyState:'loading',addEventListener(){}}};vm.runInNewContext(code,context);const t=context.window.GentleI18n.t;assert.equal(t('Parent'),language==='es'?'Padre':'Parent');assert.equal(t('opaque actual tool output'),'opaque actual tool output');assert.equal(t('Start Pi'),language==='es'?'Iniciar Pi':'Start Pi')}
});
