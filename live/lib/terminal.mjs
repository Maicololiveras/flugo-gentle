/** One explicit Pi process, one controlling browser, bounded terminal replay. */
export function terminalController({spawn,cwd,args,env,onExit=()=>{}}) {
  let child,client,exited=false,output='',closing=false;
  const send=message=>{if(client?.readyState===1){if(client.bufferedAmount>1024*1024){client.close(1013,'Slow terminal client');return;}client.send(JSON.stringify(message));}};
  return {
    get pid(){return child?.pid},
    connect(socket){
      if(client?.readyState===1){socket.close(1008,'A controller is already connected');return;}
      client=socket;
      send({type:'output',data:output});send({type:'state',state:exited?'exited':child?'running':'ready'});
      socket.on('message',raw=>{
        let message;try{message=JSON.parse(String(raw))}catch{return;}
        if(closing)return;
        if(message.type==='start'&&!child&&!exited){
          try{
            child=spawn('pi',args,{name:'xterm-256color',cols:100,rows:32,cwd,env});
            child.onData(data=>{output=(output+data).slice(-262144);send({type:'output',data});});
            child.onExit(event=>{exited=true;send({type:'state',state:'exited',exitCode:event.exitCode});onExit(event)});
            send({type:'state',state:'running'});
          }catch(error){exited=true;send({type:'state',state:'error',message:String(error)})}
        }else if(message.type==='input'&&child&&!exited&&typeof message.data==='string'&&message.data.length<=65536){child.write(message.data)}
        else if(message.type==='resize'&&child&&!exited&&Number.isInteger(message.cols)&&Number.isInteger(message.rows)&&message.cols>=20&&message.cols<=400&&message.rows>=5&&message.rows<=150){child.resize(message.cols,message.rows)}
        else if(message.type==='stop'&&child&&!exited){child.kill()}
      });
      socket.on('error',()=>{if(client===socket)client=undefined});
      socket.on('close',()=>{if(client===socket)client=undefined});
    },
    close(){closing=true;if(child&&!exited)child.kill();client?.close(1001,'Workspace closed');client=undefined;output=''}
  };
}
