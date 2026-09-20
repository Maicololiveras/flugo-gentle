import http from 'node:http';
import {randomBytes} from 'node:crypto';
import {readFile} from 'node:fs/promises';
export async function startObserver({port=0, mode='live'}={}) {
  const key=randomBytes(24).toString('hex'), clients=new Set(), history=[];
  let sequence=0;
  const server=http.createServer(async (req,res)=>{
    const url=new URL(req.url,'http://127.0.0.1');
    const host=`127.0.0.1:${server.address().port}`;
    if(req.headers.host!==host || (req.headers.origin && req.headers.origin!==`http://${host}`)) {res.writeHead(403).end();return;}
    if(req.method!=='GET'){res.writeHead(405).end();return;}
    const headers={'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'"};
    if(url.pathname==='/events'){
      if(url.searchParams.get('key')!==key){res.writeHead(403).end();return;}
      res.writeHead(200,{...headers,'Content-Type':'text/event-stream','Connection':'keep-alive'});
      res.write(`event: mode\ndata: ${JSON.stringify({mode})}\n\n`);
      const after=Number(req.headers['last-event-id']??0);
      if(after && history.length && after<history[0].id-1)res.write('event: gap\ndata: {}\n\n');
      for(const row of history)if(row.id>after)res.write(packet(row));
      clients.add(res);req.on('close',()=>clients.delete(res));return;
    }
    const files={'/':'index.html','/app.js':'app.js','/style.css':'style.css'};
    const file=files[url.pathname];if(!file){res.writeHead(404).end();return;}
    try {const body=await readFile(new URL(`../web/${file}`,import.meta.url));res.writeHead(200,{...headers,'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.css')?'text/css':'text/javascript'}).end(body);}catch{res.writeHead(500).end('Observer asset unavailable');}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve)});
  server.unref();
  const heartbeat=setInterval(()=>{for(const res of clients)if(!res.write(': keepalive\n\n')){res.destroy();clients.delete(res)}},15000);heartbeat.unref();
  const packet=row=>`id: ${row.id}\ndata: ${JSON.stringify(row)}\n\n`;
  return {
    url:`http://127.0.0.1:${server.address().port}/#${key}`,
    publish(event){if(!event)return;const row={...event,id:++sequence,time:new Date().toISOString(),mode};history.push(row);if(history.length>500)history.shift();for(const res of clients)if(!res.write(packet(row))){res.destroy();clients.delete(res)}},
    async close(){clearInterval(heartbeat);for(const res of clients)res.end();clients.clear();await new Promise(resolve=>server.close(resolve))}
  };
}
