import http from 'node:http';
import {randomBytes} from 'node:crypto';
import {readFile} from 'node:fs/promises';
export async function startObserver({port=0, mode='live', assets={}, producerPid}={}) {
  const key=randomBytes(24).toString('hex'), clients=new Set(), history=[];
  let sequence=0;
  const ingestKey=randomBytes(24).toString('hex');
  let publish,boundPort,closing=false,closePromise;
  const server=http.createServer(async (req,res)=>{
    if(closing){res.writeHead(503,{'Connection':'close'}).end('Observer closing');return;}
    const url=new URL(req.url,'http://127.0.0.1');
    const host=`127.0.0.1:${boundPort}`;
    if(req.headers.host!==host || (req.headers.origin && req.headers.origin!==`http://${host}`)) {res.writeHead(403).end();return;}
    if(url.pathname==='/ingest' && mode==='workspace') {
      if(req.method!=='POST'||req.headers.authorization!==`Bearer ${ingestKey}`){res.writeHead(403).end();return;}
      let chunks=[],size=0;
      try {
        for await(const chunk of req){size+=chunk.length;if(size>65536){res.writeHead(413).end();req.destroy();return;}chunks.push(chunk)}
        const body=JSON.parse(Buffer.concat(chunks).toString());
        if(!producerPid?.()||body.pid!==producerPid()){res.writeHead(403).end();return;}
        const e=body.event, nodes=['user','parent','worker','tools','memory','native'];
        if(!e||!nodes.includes(e.from)||!nodes.includes(e.to)||typeof e.title!=='string'||typeof e.text!=='string'){res.writeHead(400).end();return;}
        publish(e);res.writeHead(204).end();
      }catch{if(!res.headersSent)res.writeHead(400).end();}return;
    }
    if(req.method!=='GET'){res.writeHead(405).end();return;}
    const headers={'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Content-Security-Policy':`default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws://${host}; frame-ancestors 'none'; base-uri 'none'`};
    if(url.pathname==='/events'){
      if(url.searchParams.get('key')!==key){res.writeHead(403).end();return;}
      res.writeHead(200,{...headers,'Content-Type':'text/event-stream','Connection':'keep-alive'});
      res.write(`event: mode\ndata: ${JSON.stringify({mode})}\n\n`);
      const after=Number(req.headers['last-event-id']??0);
      if(after && history.length && after<history[0].id-1)res.write('event: gap\ndata: {}\n\n');
      for(const row of history)if(row.id>after)res.write(packet(row));
      clients.add(res);req.on('close',()=>clients.delete(res));return;
    }
    const files={'/':'index.html','/app.js':'app.js','/style.css':'style.css','/i18n.js':'i18n.js','/terminal.js':'terminal.js'};
    const file=assets[url.pathname] ?? files[url.pathname];if(!file){res.writeHead(404).end();return;}
    try {const body=await readFile(file instanceof URL?file:new URL(`../web/${file}`,import.meta.url));res.writeHead(200,{...headers,'Content-Type':String(file).endsWith('.html')?'text/html; charset=utf-8':String(file).endsWith('.css')?'text/css':'text/javascript'}).end(body);}catch{res.writeHead(500).end('Observer asset unavailable');}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',()=>{boundPort=server.address().port;resolve()})});
  server.unref();
  const heartbeat=setInterval(()=>{for(const res of clients)if(!res.write(': keepalive\n\n')){res.destroy();clients.delete(res)}},15000);heartbeat.unref();
  const packet=row=>`id: ${row.id}\ndata: ${JSON.stringify(row)}\n\n`;
  publish=event=>{if(!event)return;const row={...event,id:++sequence,time:new Date().toISOString(),mode};history.push(row);if(history.length>500)history.shift();for(const res of clients)if(!res.write(packet(row))){res.destroy();clients.delete(res)}};
  return {
    server,
    authorized(req,url){return req.headers.host===`127.0.0.1:${boundPort}` && req.headers.origin===`http://127.0.0.1:${boundPort}` && url.searchParams.get('key')===key},
    ingestKey,
    url:`http://127.0.0.1:${boundPort}/#${key}`,
    publish,
    close(){
      if(closePromise)return closePromise;
      closing=true;clearInterval(heartbeat);for(const res of clients)res.end();clients.clear();
      closePromise=new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
      return closePromise;
    }
  };
}
