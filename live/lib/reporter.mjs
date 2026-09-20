/** Bounded asynchronous reporting; no prompts, model calls, or backpressure on Pi. */
export function createReporter({url,key,pid=process.pid,send=fetch}){
 const endpoint=new URL(url);if(endpoint.protocol!=='http:'||endpoint.hostname!=='127.0.0.1'||endpoint.pathname!=='/ingest')throw Error('Invalid local observer endpoint');
 const queue=[];let running=false,closed=false;
 async function drain(){if(running||closed)return;running=true;try{while(queue.length&&!closed){const event=queue.shift();try{await send(url,{method:'POST',headers:{authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({pid,event}),signal:AbortSignal.timeout(1500)})}catch{/* Missing telemetry must not stop the user's task. */}}}finally{running=false}}
 return {publish(event){if(closed||!event)return;if(queue.length>=100)queue.shift();queue.push(event);void drain()},close(){closed=true;queue.length=0}};
}
