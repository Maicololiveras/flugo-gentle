(function(){
'use strict';
let launched=false;
window.startWorkspaceTerminal=async function(key){
 if(launched)return;launched=true;
 const host=document.getElementById('terminalPanel');host.hidden=false;
 const status=document.getElementById('terminalStatus');
 function script(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.append(s)})}
 try{const css=document.createElement('link');css.rel='stylesheet';css.href='/vendor/xterm.css';document.head.append(css);await script('/vendor/xterm.js');await script('/vendor/fit.js')}catch{status.textContent='Terminal dependency failed to load. Install workspace dependencies.';return;}
 const term=new Terminal({cursorBlink:true,convertEol:false,fontSize:13,scrollback:3000,theme:{background:'#111815',foreground:'#dce5e5'}}),fit=new FitAddon.FitAddon();term.loadAddon(fit);term.open(document.getElementById('terminalHost'));fit.fit();
 let socket;
 const start=document.getElementById('startPi'),stop=document.getElementById('stopPi');
 const send=message=>{if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify(message))};
 function connect(){if(socket&&socket.readyState<2)return;status.textContent='Starting terminal…';term.reset();socket=new WebSocket(`ws://${location.host}/terminal?key=${encodeURIComponent(key)}`);
 socket.onmessage=e=>{const m=JSON.parse(e.data);if(m.type==='output')term.write(m.data);if(m.type==='state'){start.disabled=m.state!=='ready';stop.disabled=m.state!=='running';status.textContent=({ready:'Terminal ready. Click Start Pi.',running:'Pi is running',exited:'Pi process exited',error:m.message})[m.state]??m.state;fit.fit();send({type:'resize',cols:term.cols,rows:term.rows});}};
 socket.onclose=()=>{start.disabled=true;stop.disabled=true;status.textContent='Terminal disconnected. The process may still be running.'};
 socket.onerror=()=>{status.textContent='Terminal disconnected. The process may still be running.'};}
 start.onclick=()=>{send({type:'start'});term.focus()};stop.onclick=()=>send({type:'stop'});document.getElementById('reconnectTerminal').onclick=connect;
 term.onData(data=>send({type:'input',data}));new ResizeObserver(()=>{fit.fit();send({type:'resize',cols:term.cols,rows:term.rows})}).observe(document.getElementById('terminalHost'));
 connect();window.addEventListener('beforeunload',()=>socket?.close());
};
})();
