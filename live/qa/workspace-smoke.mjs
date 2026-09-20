// Requires an installed Pi, PTY and ws. Launches an isolated profile; sends no model prompt.
import {spawn} from 'node:child_process';
import {mkdtemp,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import WebSocket from 'ws';
const temp=await mkdtemp(join(tmpdir(),'gentle-workspace-smoke-'));await mkdir(join(temp,'profile'));await mkdir(join(temp,'project'));
const child=spawn(process.execPath,[fileURLToPath(new URL('../workspace.mjs',import.meta.url)),'--cwd',join(temp,'project')],{env:{...process.env,PI_CODING_AGENT_DIR:join(temp,'profile')},stdio:['ignore','pipe','pipe']});
let socket,reader;const abort=new AbortController();const timeout=setTimeout(()=>abort.abort(),20000);
try{
 const url=await new Promise((resolve,reject)=>{let output='';child.stdout.on('data',data=>{output+=data;const match=output.match(/http:\/\/127\.0\.0\.1:\d+\/#[a-f0-9]+/);if(match)resolve(new URL(match[0]))});child.once('exit',code=>reject(Error(`Workspace exited ${code}`)));abort.signal.addEventListener('abort',()=>reject(Error('Workspace startup timeout')))});
 const response=await fetch(url.origin+'/events?key='+url.hash.slice(1),{signal:abort.signal});reader=response.body.getReader();
 socket=new WebSocket(`ws://${url.host}/terminal?key=${url.hash.slice(1)}`,{origin:url.origin});
 let nativeBytes=0;
 const terminalOutput=new Promise((resolve,reject)=>{socket.on('error',reject);socket.on('message',data=>{const m=JSON.parse(data);if(m.type==='state'&&m.state==='ready')socket.send(JSON.stringify({type:'start'}));if(m.type==='output'){nativeBytes+=m.data.length;if(nativeBytes>20)resolve()}if(m.type==='state'&&m.state==='error')reject(Error(m.message))});abort.signal.addEventListener('abort',()=>reject(Error('No native terminal output')))});
 const observed=new Promise(async(resolve,reject)=>{try{let text='';while(true){const {value,done}=await reader.read();if(done)throw Error('Feed ended');text+=new TextDecoder().decode(value);if(text.includes('Session connected')){resolve();return}}}catch(error){reject(error)}});
 await Promise.all([terminalOutput,observed]);assert.ok(nativeBytes>20);console.log('PASS: real isolated Pi process, native PTY output and session_start reached the workspace feed. No model prompt sent.');
}finally{clearTimeout(timeout);abort.abort();socket?.terminate();await reader?.cancel().catch(()=>{});child.kill('SIGTERM');await new Promise(resolve=>child.exitCode!==null?resolve():child.once('exit',resolve));await rm(temp,{recursive:true,force:true})}
