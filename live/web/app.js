'use strict';
const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const attr=value=>esc(value).replace(/`/g,'&#96;');
const roleNames={user:'User',parent:'Parent agent',worker:'Subagent',tools:'Tool',native:'Native review',memory:'Engram'};
const roleColors={user:'user',parent:'parent',worker:'worker',tools:'tool',native:'native',memory:'memory'};
const stateLabels={idle:'Observed',active:'Observed',running:'Running',waiting:'Waiting',error:'Error',ended:'Ended',settled:'Settled'};
const graphState={nodes:new Map(),links:new Map(),selected:'parent',activeLink:'',sequence:0};
let total=0,timer,steps=[],cursor=0,waiting=false,seen=new Set();
const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

function shortId(value){const text=String(value??'');return text.length>20?`${text.slice(0,9)}…${text.slice(-7)}`:text;}
function identityFor(role,event={}){
  if(role==='worker')return String(event.taskId||event.agent||event.details?.taskId||'observed');
  if(role==='tools')return String(event.callId||event.toolName||event.title?.split(' · ')[1]||'observed');
  return role;
}
function actorKey(role,event={}){return role==='worker'||role==='tools'?`${role}:${identityFor(role,event)}`:role;}
function actorLabel(role,event={}){
  if(role==='worker')return event.agent||event.details?.agent||'Subagent';
  if(role==='tools')return event.toolName||event.title?.split(' · ')[1]||'Tool';
  return roleNames[role]||role;
}
function ensureNode(role,event={}){
  const key=actorKey(role,event);
  if(!graphState.nodes.has(key))graphState.nodes.set(key,{key,role,label:actorLabel(role,event),identity:identityFor(role,event),state:'idle',lastTitle:'',lastText:'',events:0,order:graphState.sequence++});
  const node=graphState.nodes.get(key);
  if(role==='worker'&&event.agent)node.label=event.agent;
  if(role==='tools'&&event.toolName)node.label=event.toolName;
  return node;
}
function resetGraph(){
  graphState.nodes.clear();graphState.links.clear();graphState.activeLink='';graphState.sequence=0;graphState.selected='parent';
  for(const role of ['user','parent','memory','native'])ensureNode(role);
  renderGraph();
}
function relationKey(a,b){return [a,b].sort().join('|');}
function visualState(status){
  if(status==='error')return'error';
  if(status==='interaction_required')return'waiting';
  if(status==='awaiting settlement')return'ended';
  if(['settled','completed','returned'].includes(status))return'settled';
  if(['running','requested'].includes(status))return'running';
  return'active';
}
function updateGraph(event){
  const source=ensureNode(event.from||'parent',event),target=ensureNode(event.to||'parent',event);
  const state=visualState(event.status);
  const owner=event.status==='requested'?target:source;
  owner.state=state;owner.lastTitle=event.title||'';owner.lastText=event.text||'';owner.events++;
  if(source.key!==target.key){
    const key=relationKey(source.key,target.key);
    graphState.links.set(key,{key,source:source.key,target:target.key,status:event.status||'observed',title:event.title||''});
    graphState.activeLink=key;
  }else graphState.activeLink='';
  renderGraph();
}
function graphLayout(){
  const workers=[...graphState.nodes.values()].filter(node=>node.role==='worker').sort((a,b)=>a.order-b.order);
  const tools=[...graphState.nodes.values()].filter(node=>node.role==='tools').sort((a,b)=>a.order-b.order);
  const positions=new Map(),mobile=matchMedia('(max-width:680px)').matches;
  if(mobile){
    const ordered=[graphState.nodes.get('user'),graphState.nodes.get('parent'),...workers,...tools,graphState.nodes.get('memory'),graphState.nodes.get('native')].filter(Boolean);
    const nodeWidth=280,nodeHeight=66,top=28,gap=86;
    ordered.forEach((node,index)=>positions.set(node.key,{x:25,y:top+index*gap,w:nodeWidth,h:nodeHeight}));
    return{positions,height:top+ordered.length*gap+8,width:330,mobile,nodeWidth,nodeHeight};
  }
  const toolColumns=tools.length>5?2:1,toolRows=Math.max(Math.ceil(tools.length/toolColumns),1);
  const rows=Math.max(workers.length,toolRows,1),top=64,gap=94,nodeWidth=154,nodeHeight=66,width=toolColumns===2?1000:810;
  const serviceY=top+rows*gap+34,height=serviceY+112,centerY=top+(rows-1)*gap/2;
  positions.set('user',{x:18,y:centerY,w:nodeWidth,h:nodeHeight});
  positions.set('parent',{x:218,y:centerY,w:nodeWidth,h:nodeHeight});
  workers.forEach((node,index)=>positions.set(node.key,{x:420,y:top+index*gap,w:nodeWidth,h:nodeHeight}));
  tools.forEach((node,index)=>{const column=Math.floor(index/toolRows),row=index%toolRows;positions.set(node.key,{x:628+column*190,y:top+row*gap,w:nodeWidth,h:nodeHeight})});
  positions.set('memory',{x:toolColumns===2?628:420,y:serviceY,w:nodeWidth,h:nodeHeight});
  positions.set('native',{x:toolColumns===2?818:628,y:serviceY,w:nodeWidth,h:nodeHeight});
  return{positions,height,width,mobile,nodeWidth,nodeHeight};
}
function routePath(source,target,index){
  if(Math.abs(target.x-source.x)<5){
    const downward=target.y>=source.y,distance=Math.abs(target.y-source.y);
    if(distance>source.h+30){
      const right=index%2===0,startX=right?source.x+source.w:source.x,endX=right?target.x+target.w:target.x;
      const channel=right?318:12,startY=source.y+source.h/2,endY=target.y+target.h/2;
      return`M${startX} ${startY} H${channel} V${endY} H${endX}`;
    }
    const startX=source.x+source.w/2,endX=target.x+target.w/2;
    const startY=downward?source.y+source.h:source.y,endY=downward?target.y:target.y+target.h;
    return`M${startX} ${startY} V${endY}`;
  }
  const forward=target.x>=source.x;
  const startX=forward?source.x+source.w:source.x,startY=source.y+source.h/2;
  const endX=forward?target.x:target.x+target.w,endY=target.y+target.h/2;
  const jump=Math.abs(endX-startX);
  if(Math.abs(endY-startY)<2)return`M${startX} ${startY} H${endX}`;
  if(jump>330){const channel=24+(index%3)*11;return`M${startX} ${startY} V${channel} H${endX} V${endY}`;}
  const middle=startX+(endX-startX)*.5;
  return`M${startX} ${startY} H${middle} V${endY} H${endX}`;
}
function actorSubtitle(node){
  switch(node.role){
    case'worker':return`task · ${shortId(node.identity)}`;
    case'tools':return`call · ${shortId(node.identity)}`;
    case'parent':return'current session';
    case'user':return'human control';
    case'memory':return'observable calls only';
    default:return'provider-owned events';
  }
}
function renderGraph(){
  const svg=$('graph');if(!svg)return;
  const {positions,height,width,mobile}=graphLayout();svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.setAttribute('width',String(width));svg.setAttribute('height',String(height));
  const lanes=mobile?'':`<g class="lane-labels" aria-hidden="true"><text x="18" y="28">HUMAN</text><text x="218" y="28">ORCHESTRATION</text><text x="420" y="28">SUBAGENTS</text><text x="628" y="28">TOOLS</text></g>`;
  const edges=[...graphState.links.values()].map((link,index)=>{
    const source=positions.get(link.source),target=positions.get(link.target);if(!source||!target)return'';
    const path=routePath(source,target,index),active=link.key===graphState.activeLink;
    return`<g class="relationship ${active?'is-active':''}"><path class="edge-halo" d="${path}"/><path class="edge" d="${path}" marker-end="url(#${active?'arrowActive':'arrow'})"/>${active&&!reducedMotion()?`<circle class="signal-packet" r="4"><animateMotion dur="1.25s" repeatCount="indefinite" path="${path}"/></circle>`:''}</g>`;
  }).join('');
  const nodes=[...graphState.nodes.values()].map(node=>{
    const box=positions.get(node.key);if(!box)return'';
    const selected=node.key===graphState.selected,active=[...graphState.links.values()].some(link=>link.key===graphState.activeLink&&(link.source===node.key||link.target===node.key));
    const sub=actorSubtitle(node);
    const label=shortId(node.label),state=stateLabels[node.state]||node.state;
    return`<g class="actor actor-${roleColors[node.role]||'parent'} state-${node.state} ${selected?'is-selected':''} ${active?'is-active':''}" data-node="${attr(node.key)}" tabindex="0" role="button" aria-label="${attr(`${node.label}, ${sub}, ${state}`)}" transform="translate(${box.x} ${box.y})"><rect width="${box.w}" height="${box.h}" rx="10"/><circle class="state-dot" cx="14" cy="15" r="4"/><text class="state-text" x="24" y="18">${esc(state.toUpperCase())}</text><text class="actor-label" x="14" y="40">${esc(label)}</text><text class="actor-id" x="14" y="56">${esc(sub)}</text></g>`;
  }).join('');
  const markup=`<svg xmlns="http://www.w3.org/2000/svg"><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z"/></marker><marker id="arrowActive" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z"/></marker></defs>${lanes}${edges}${nodes}</svg>`;
  const parsed=new DOMParser().parseFromString(markup,'image/svg+xml'),fragment=document.createDocumentFragment();
  for(const child of [...parsed.documentElement.childNodes])fragment.append(document.importNode(child,true));
  svg.replaceChildren(fragment);
  svg.querySelectorAll('.actor').forEach(element=>{
    const select=()=>selectActor(element.dataset.node);
    element.addEventListener('click',select);element.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select();}});
  });
}
function selectActor(key){
  const node=graphState.nodes.get(key);if(!node)return;
  graphState.selected=key;renderGraph();
  let identity='';if(node.role==='worker')identity=`Task: ${node.identity}`;else if(node.role==='tools')identity=`Call: ${node.identity}`;
  $('child').textContent=[node.label,identity,`State: ${stateLabels[node.state]||node.state}`,node.lastTitle,node.lastText].filter(Boolean).join('\n');
  $('contextDetails').open=true;
}

function applyTheme(theme){
  if(!theme?.colors)return;
  const root=document.documentElement,allowed=/^#[0-9a-f]{6}$/i;
  for(const [name,value]of Object.entries(theme.colors))if(allowed.test(value))root.style.setProperty(`--pi-${name.replace(/[A-Z]/g,letter=>`-${letter.toLowerCase()}`)}`,value);
  root.dataset.piTheme=theme.name||'Pi theme';
  $('themeName').textContent=theme.name||'Pi theme';
  const page=theme.colors.page;
  if(allowed.test(page)){const [r,g,b]=[1,3,5].map(index=>parseInt(page.slice(index,index+2),16));root.style.colorScheme=(r*299+g*587+b*114)/1000>145?'light':'dark';}
}
function append(event){
  if(event.kind==='theme'){applyTheme(event.details?.theme);return;}
  if(event.kind==='session_start'){$('child').textContent='Subagent context will appear after delegation.';}
  if(event.id&&seen.has(event.id))return;if(event.id)seen.add(event.id);
  if(seen.size>1000)seen.delete(seen.values().next().value);
  if(!total)$('log').textContent='';total++;
  updateGraph(event);
  const row=document.createElement('article'),state=visualState(event.status);
  row.className=`event event-${state} ${event.from==='user'?'event-user':''} ${event.from==='worker'||event.to==='worker'?'event-worker':''}`;
  const ids=[event.taskId?`task · ${event.taskId}`:'',event.callId?`call · ${event.callId}`:''].filter(Boolean);
  const header=document.createElement('header'),heading=document.createElement('h3'),status=document.createElement('span');
  heading.textContent=event.title??'';status.className='event-status';status.textContent=event.status??'observed';header.append(heading,status);row.append(header);
  if(ids.length){const identity=document.createElement('div');identity.className='identity-row';for(const id of ids){const code=document.createElement('code');code.textContent=id;identity.append(code)}row.append(identity)}
  const text=document.createElement('p');text.textContent=event.text??'';if(event.mode&&event.mode!=='demo')text.dataset.raw='';row.append(text);
  if(event.details){const details=document.createElement('details'),summary=document.createElement('summary'),pre=document.createElement('pre');summary.textContent='Observable details';pre.dataset.raw='';pre.textContent=JSON.stringify(event.details,null,2);details.append(summary,pre);row.append(details)}
  $('log').append(row);while($('log').children.length>200)$('log').firstChild.remove();$('log').scrollTop=$('log').scrollHeight;
  const source=ensureNode(event.from||'parent',event),target=ensureNode(event.to||'parent',event);
  $('handoff').textContent=`${source.label} → ${target.label}`;$('phase').textContent=event.phase??event.status??'OBSERVED';$('time').textContent=event.time?new Date(event.time).toLocaleTimeString():'SCRIPTED EXAMPLE';$('count').textContent=`${total} events`;
  if(event.from==='user'){$('prompt').toggleAttribute('data-raw',Boolean(event.mode&&event.mode!=='demo'));$('prompt').textContent=event.text;}
  if(event.from==='worker'||event.to==='worker'){graphState.selected=actorKey('worker',event);selectActor(graphState.selected);}
  if(event.status==='interaction_required')$('prompt').textContent='Waiting for a human decision. Reply in the Gentle terminal.';
  return row;
}

const ev=(from,to,title,text,phase='ODD',extra={})=>({from,to,title,text,phase,status:'illustrative',mode:'demo',...extra});
const demos=[
 [ev('user','parent','User request','Fix “Export flie” in the report help.'),ev('parent','tools','Inspect the existing text','Read the help file and inspect its diff.', 'ODD',{toolName:'read',callId:'demo-read'}),ev('tools','parent','Bounded change','One documentation typo. No executable behavior changes.','ODD',{toolName:'read',callId:'demo-read'}),ev('parent','tools','Edit the word','Export flie → Export file','ODD',{toolName:'edit',callId:'demo-edit'}),ev('native','parent','Review assessment','Passive change; inspect the content. No review perspectives needed.','RDD'),ev('parent','user','Result','Corrected the typo and checked the diff. No artificial delegation or questions.')],
 [ev('user','parent','User request','Add CSV export using the current report workflow.'),ev('parent','worker','Delegate exploration','Map filters, permissions and export integration points. Read only.','ODD',{agent:'gentle-ai-explore',taskId:'csv-explore'}),ev('worker','parent','Exploration result','Two valid export scopes exist. Product intent must choose one.','ODD',{agent:'gentle-ai-explore',taskId:'csv-explore'}),ev('parent','memory','Record intent','Save the ODD task document and its Engram mirror.'),ev('parent','worker','Delegate implementation','Keep existing permissions. Use configured TDD and the targeted runner.','ODD',{agent:'gentle-ai-worker',taskId:'csv-apply'}),ev('worker','parent','Worker asks the parent','Should export contain filtered rows or all accessible rows?','ODD',{status:'interaction_required',agent:'gentle-ai-worker',taskId:'csv-apply'}),ev('parent','user','Choose the export scope','The parent relays the product decision to the user.','ODD',{question:true}),ev('parent','worker','Resume with confirmed scope','Read the updated ODD contract before implementing.','ODD',{agent:'gentle-ai-worker',taskId:'csv-apply'}),ev('worker','tools','RED','Write and run a failing CSV test. Confirm failure is caused by missing behavior.','TDD',{agent:'gentle-ai-worker',taskId:'csv-apply',toolName:'bash',callId:'csv-test'}),ev('tools','worker','GREEN','Implement the minimum behavior. Run the same targeted test.','TDD',{agent:'gentle-ai-worker',taskId:'csv-apply',toolName:'bash',callId:'csv-test'}),ev('worker','tools','TRIANGULATE / REFACTOR','Check quoting, empty rows and permissions; refactor with green tests.','TDD',{agent:'gentle-ai-worker',taskId:'csv-apply',toolName:'bash',callId:'csv-test'}),ev('worker','parent','agent_end','Response received; settlement is still pending.','TDD',{status:'awaiting settlement',agent:'gentle-ai-worker',taskId:'csv-apply'}),ev('worker','parent','agent_settled','Deliver structured result and focused validation evidence.','TDD',{status:'settled',agent:'gentle-ai-worker',taskId:'csv-apply'}),ev('native','parent','Review checkpoint','Follow the native candidate identity and applicable consent.','RDD'),ev('parent','user','Result','Export is implemented and the observed checks are reported. Publishing requires its own authorization.')],
 [ev('user','parent','User request','Users from tenant A can access reports from tenant B. Fix isolation.'),ev('parent','worker','Bound the fix','Document isolation criteria; delegate only the authorized surfaces.','ODD',{agent:'gentle-ai-worker',taskId:'tenant-fix'}),ev('worker','tools','Reproduce and fix','RED reproduces cross-tenant access. GREEN checks the tenant. Add alternate cases.','TDD',{agent:'gentle-ai-worker',taskId:'tenant-fix',toolName:'bash',callId:'tenant-tests'}),ev('worker','parent','Return evidence','Return the scoped patch and test results.','ODD',{agent:'gentle-ai-worker',taskId:'tenant-fix'}),ev('native','worker','Four review perspectives','Risk, Resilience, Readability and Reliability inspect the same frozen candidate.','RDD',{agent:'reviewers',taskId:'review-batch'}),ev('worker','native','Finding','The cache key omits the tenant. Reproduction evidence supports the claim.','RDD',{agent:'review-risk',taskId:'review-batch'}),ev('native','worker','Refute the claim','Check the allegation against the actual candidate and evidence.','RDD',{agent:'refuter',taskId:'review-batch'}),ev('parent','worker','Bounded remediation','Add tenant identity to the cache key and a regression test.','RDD',{agent:'jd-fix-agent',taskId:'tenant-remediation'}),ev('worker','tools','Regression check','Reproduce two tenants with the same report ID; fix and rerun.','TDD',{agent:'jd-fix-agent',taskId:'tenant-remediation',toolName:'bash',callId:'tenant-regression'}),ev('native','parent','Directed validation and ACK','Validate the original criterion and repair regressions. Consume native authority.','RDD'),ev('parent','user','Result','Isolation and the cache key are corrected. Review approval does not authorize publication.')],
 [ev('user','parent','User request','Continue yesterday’s export. Keep TDD disabled and use configured checks.'),ev('parent','memory','Recover task context','Read the ODD document and attempt memory retrieval.'),ev('memory','parent','Memory unavailable','Do not claim that the Engram mirror is synchronized.','ODD',{status:'error'}),ev('parent','tools','Inspect actual state','Read the repository, task document and existing evidence.','ODD',{toolName:'read',callId:'resume-read'}),ev('parent','worker','Relaunch bounded work','Pass recovered intent and current constraints. Do not invent an active child session.','ODD',{agent:'gentle-ai-worker',taskId:'resume-export'}),ev('worker','tools','Configured verification','Run the configured build and focused checks; do not label this as RED/GREEN TDD.','ODD',{agent:'gentle-ai-worker',taskId:'resume-export',toolName:'bash',callId:'resume-check'}),ev('worker','parent','Return result','Return validation evidence and mark the memory mirror as pending.','ODD',{agent:'gentle-ai-worker',taskId:'resume-export'}),ev('parent','user','Result','Task resumed from the document. Memory recovery remains pending.')]
];
function pause(){$('graph').querySelectorAll('animateMotion').forEach(element=>element.remove());clearTimeout(timer);timer=undefined;$('play').textContent='Play demo';}
function next(){if(waiting||cursor>=steps.length){pause();return;}const event=steps[cursor++],row=append(event);if(event.question){pause();waiting=true;$('prompt').textContent='Choose below to return a decision through the parent.';const choices=document.createElement('div');choices.className='choices';for(const label of ['Filtered rows','All accessible rows']){const button=document.createElement('button');button.textContent=label;button.onclick=()=>{choices.remove();waiting=false;append(ev('user','parent','User decision',label));steps[cursor]={...steps[cursor],text:`Confirmed scope: ${label}. Update the ODD task, retain permissions, then continue.`};$('prompt').textContent=label;};choices.append(button)}row.append(choices)}if(cursor===steps.length)pause();}
function reset(){pause();steps=demos[+$('scenario').value].map(event=>({...event}));cursor=0;total=0;waiting=false;seen.clear();$('log').innerHTML='<div class="empty"><strong>Watch the conversation here.</strong><span>The map follows each observable handoff.</span></div>';$('count').textContent='0 events';$('prompt').textContent='Choose an example and press Play demo.';$('child').textContent='Delegations, questions and returned results appear here. Child-internal steps remain hidden unless the runtime exposes them.';resetGraph();}
function play(){if(timer){pause();return;}if(cursor>=steps.length)reset();function tick(){next();if(!waiting&&cursor<steps.length){$('play').textContent='Pause';timer=setTimeout(tick,+$('speed').value)}}tick()}
$('play').onclick=play;$('step').onclick=()=>{pause();next()};$('reset').onclick=reset;$('scenario').onchange=reset;reset();
let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(renderGraph,80)});

function parseFeedData(data){try{const value=JSON.parse(data);return value&&typeof value==='object'?value:null}catch{return null}}
const key=location.hash.slice(1);
if(key&&location.protocol!=='file:'){
 for(const id of ['scenario','play','step','reset','speed'])$(id).disabled=true;
 $('connection').textContent='CONNECTING';$('notice').textContent='Live observable events · reply and approve actions in the Gentle terminal';$('prompt').textContent='Send a message in the Gentle terminal.';
 const feed=new EventSource(`/events?key=${encodeURIComponent(key)}`);
 feed.onopen=()=>{$('connection').textContent='LIVE · CONNECTED';$('connection').className='live';document.body.classList.remove('is-disconnected')};
 feed.addEventListener('mode',event=>{const payload=parseFeedData(event.data);if(!payload){$('notice').textContent='Ignored malformed observer mode data.';return}const mode=payload.mode;if(mode==='workspace'){$('connection').textContent='WORKSPACE · CONNECTED';document.body.classList.add('workspace-mode');window.startWorkspaceTerminal(key);}else if(mode!=='live'){$('connection').textContent='TEST FEED · SCRIPTED';$('notice').textContent='Synthetic integration test feed — not a real agent session'}});
 feed.addEventListener('gap',()=>{$('notice').textContent='Reconnected; older events exceeded the 500-event buffer.'});
 feed.onmessage=event=>{const payload=parseFeedData(event.data);if(payload)append(payload);else $('notice').textContent='Ignored a malformed observer event.'};
 feed.onerror=()=>{$('connection').textContent='DISCONNECTED · RETRYING';$('connection').className='';$('phase').textContent='NO LIVE SIGNAL';document.body.classList.add('is-disconnected');$('graph').querySelectorAll('animateMotion').forEach(element=>element.remove())};
}
