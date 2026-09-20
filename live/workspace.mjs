#!/usr/bin/env node
import {realpath,stat} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {dirname,join} from 'node:path';
import {startObserver} from './lib/server.mjs';
import {terminalController} from './lib/terminal.mjs';
const cli=process.argv.slice(2);
if(cli.includes('--help')){console.log('Usage: node live/workspace.mjs [--cwd /project] [-- <Pi arguments>]\nStarts a local web workspace. Click Start Pi to create an interactive terminal. Linux/macOS.');process.exit(0)}
if(!['linux','darwin'].includes(process.platform))throw Error('Workspace mode targets Linux and macOS. Use the observer for other platforms pending validation.');
let cwd=process.cwd(),piArgs=[];
for(let i=0;i<cli.length;i++){if(cli[i]==='--cwd'&&cli[i+1])cwd=cli[++i];else if(cli[i]==='--'){piArgs=cli.slice(i+1);break}else throw Error(`Unknown argument: ${cli[i]}`)}
cwd=await realpath(cwd);if(!(await stat(cwd)).isDirectory())throw Error('Project path must be a directory');
const require=createRequire(import.meta.url);
let pty,WebSocketServer;
try{pty=await import('node-pty');({WebSocketServer}=await import('ws'))}catch{throw Error('Install workspace dependencies: npm --prefix live install (or npm install inside the staged plugin).')}
const packageRoot=name=>dirname(require.resolve(`${name}/package.json`));
const xtermRoot=packageRoot('@xterm/xterm'),fitRoot=packageRoot('@xterm/addon-fit');
let terminal;
const observer=await startObserver({mode:'workspace',producerPid:()=>terminal?.pid,assets:{
 '/vendor/xterm.js':pathToFileURL(join(xtermRoot,'lib/xterm.js')),
 '/vendor/xterm.css':pathToFileURL(join(xtermRoot,'css/xterm.css')),
 '/vendor/fit.js':pathToFileURL(join(fitRoot,'lib/addon-fit.js'))
}});
const env={...process.env,GENTLE_LIVE_INGEST_URL:new URL('/ingest',observer.url).href,GENTLE_LIVE_INGEST_KEY:observer.ingestKey};
terminal=terminalController({spawn:pty.spawn,cwd,args:['-e',fileURLToPath(new URL('./extensions/observer.ts',import.meta.url)),...piArgs],env,
 onExit:()=>observer.publish({kind:'workspace_exit',from:'parent',to:'user',title:'Pi process exited',text:'Start a new workspace to launch another session.',status:'exited'})});
const sockets=new WebSocketServer({noServer:true,maxPayload:65536});
observer.server.on('upgrade',(req,socket,head)=>{
 const url=new URL(req.url,'http://127.0.0.1');
 if(url.pathname!=='/terminal'||!observer.authorized(req,url)){socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');socket.destroy();return;}
 sockets.handleUpgrade(req,socket,head,ws=>terminal.connect(ws));
});
observer.server.ref();
console.log(`Gentle Workspace: ${observer.url}\nProject: ${cwd}\nClick Start Pi in the browser. Ctrl+C here closes the workspace and its Pi process.`);
let closing=false;
async function close(){if(closing)return;closing=true;terminal.close();for(const ws of sockets.clients)ws.terminate();sockets.close();await observer.close()}
process.on('SIGINT',close);process.on('SIGTERM',close);
