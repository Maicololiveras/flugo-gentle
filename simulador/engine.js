(function(root){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function create(scenario){
 const state={scenario,answers:{...scenario.defaults},confirmed:{},index:0,elapsed:0,playing:false,manual:false,waiting:false};
 const events=()=>scenario.events.filter(e=>!e.when||Object.entries(e.when).every(([k,v])=>state.answers[k]===v));
 const current=()=>events()[state.index];
 const interpolate=t=>String(t??'').replace(/\{\{(\w+)\}\}/g,(_,k)=>({scopeLabel:state.answers.scope==='todos'?'todos los reportes accesibles':'solo los registros filtrados',reviewLabel:state.answers.review==='no'?'Ahora no':'Revisar ahora',reviewOutcome:state.answers.review==='no'?'La revisión nativa no se ejecutó; conservé los checks aplicables.':'La revisión cerró y su autoridad fue consumida.'}[k]??state.answers[k]??''));
 const resolve=o=>typeof o==='string'?interpolate(o):Array.isArray(o)?o.map(resolve):o&&typeof o==='object'?Object.fromEntries(Object.entries(o).map(([k,v])=>[k,resolve(v)])):o;
 function reset(){state.index=0;state.elapsed=0;state.waiting=false;state.playing=false;state.confirmed={};state.answers={...scenario.defaults}}
 function advance(){if(state.index<events().length-1){state.index++;state.elapsed=0;state.waiting=false}else{state.playing=false;state.elapsed=current().duration}}
 function tick(dt){if(!state.playing||state.waiting)return;state.elapsed+=dt;const e=current();if(state.elapsed>=e.duration){if(e.type==='question'&&state.manual&&!state.confirmed[e.key]){state.elapsed=e.duration;state.waiting=true;state.playing=false}else{if(e.type==='question')state.confirmed[e.key]=true;advance()}}}
 function answer(value){const e=current();if(e.type!=='question'||!e.options.some(x=>x.value===value))throw Error('Respuesta inválida');state.answers[e.key]=value;state.confirmed[e.key]=true;state.waiting=false;state.playing=true;advance()}
 function seek(i){state.index=Math.max(0,Math.min(events().length-1,i));state.elapsed=0;state.waiting=false;state.playing=false}
 function view(){const ev=events(),e=resolve(current()),history=ev.slice(0,state.index).map(resolve),progress=Math.min(1,state.elapsed/e.duration);let rows=[],children=[];let composer='';
  const past=[...history];if(e.type==='user'){composer=e.text.slice(0,Math.floor(Math.min(1,progress/.72)*e.text.length));if(progress>.78){past.push(e);composer=''}}else past.push(e);
  for(const x of past){if(x.type==='child'){children.push(x);continue}if(x.type==='wait'){children.push(x);continue}if(x.type==='result'){const prior=rows.findLast(r=>r.task===x.task&&r.type==='delegate');if(prior){prior.result=x;prior.status=x.status||'completed'}else rows.push({...x});continue}rows.push({...x});}
  const activeTask=e.task||past.findLast(x=>x.task)?.task;let childRows=children.filter(x=>x.task===activeTask);if(!childRows.length)childRows=children.slice(-3);
  return {e,rows,childRows,composer,progress,index:state.index,count:ev.length,elapsed:ev.slice(0,state.index).reduce((a,x)=>a+x.duration,0)+state.elapsed,total:ev.reduce((a,x)=>a+x.duration,0),waiting:state.waiting,done:state.index===ev.length-1&&state.elapsed>=e.duration};
 }
 return {state,events,current,resolve,reset,advance,tick,answer,seek,view};
}
const api={create,esc};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.GentleEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
