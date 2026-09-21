import {startObserver} from './lib/server.mjs';
const server=await startObserver({mode:'demo'});
console.log(`Open the English demo (no agent): ${server.url.split('#')[0]}`);
const keepAlive=setInterval(()=>{},60000);
process.on('SIGINT',async()=>{clearInterval(keepAlive);await server.close()});
