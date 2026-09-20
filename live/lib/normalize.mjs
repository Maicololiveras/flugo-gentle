// Only visible text is extracted. Thinking blocks and image data never enter the feed.
const clip = value => String(value ?? '').slice(0, 8000);
export function visible(content) {
  return clip(typeof content === 'string' ? content : (content ?? []).filter(p => p.type === 'text').map(p => p.text).join('\n'));
}
export function clean(value, depth = 0) {
  if (depth > 5) return '[depth limit]';
  if (typeof value === 'string') return clip(value);
  if (Array.isArray(value)) return value.slice(0, 40).filter(v => !['thinking','image'].includes(v?.type)).map(v => clean(v, depth + 1));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).slice(0, 60).filter(([k]) => !/thinking|reasoning|signature|api.?key|token|password|secret|authorization|systemPrompt/i.test(k)).map(([k,v]) => [k, clean(v, depth + 1)]));
  return value;
}
export function normalize(type, event = {}) {
  const base = {kind:type, from:'parent', to:'parent', title:type.replaceAll('_',' '), text:'', status:'observed'};
  if (type === 'input') return {...base, from:'user', to:'parent', title:'User → parent', text:clip(event.text)};
  if (type === 'ui_prompt_start') return {...base, to:'user', title:'Waiting for the user', text:clip(event.title ?? 'Respond in the Gentle terminal.'), status:'interaction_required'};
  if (type === 'ui_prompt_end') return {...base, from:'user', title:'User prompt closed', text:'The runtime continues according to the selected response.', status:'observed'};
  if (type === 'tool_execution_update') {
    const partial=event.partialResult ?? {};
    const row=normalize('tool_result',{...event,...partial});
    return {...row,kind:type,title:`Progress · ${event.toolName}`,status:partial.details?.gentleAgents?.status ?? 'running'};
  }
  if (type === 'agent_start') return {...base, title:'Parent started', status:'running'};
  if (type === 'agent_end') return {...base, title:'Agent ended — settlement not confirmed', status:'awaiting settlement'};
  if (type === 'agent_settled') return {...base, title:'Parent settled', status:'settled'};
  if (type === 'session_start' || type === 'session_switch') return {...base, title:'Session connected', text:'Waiting for observable session events.'};
  if (type === 'message_end') {
    const m = event.message;
    if (!m || !['assistant','custom'].includes(m.role)) return null;
    const g = m.details?.gentleAgents;
    const text = visible(m.content);
    if (!text) return null;
    return {...base, from:g?'worker':'parent', to:g?'parent':'user', title:g ? `${g.agent ?? 'Subagent'} → parent` : 'Parent response', text, taskId:g?.taskId, status:g?.kind === 'query'?'interaction_required':g?.status ?? 'observed', details:g?clean(g):undefined};
  }
  if (type === 'tool_call' || type === 'tool_result') {
    const name = event.toolName ?? 'tool';
    const target = name.startsWith('subagent_')?'worker': /(^|_)mem_/.test(name)?'memory': /gentle_ai/.test(name)?'native':'tools';
    const result = type === 'tool_result', g = event.details?.gentleAgents;
    return {...base, from:result?target:'parent', to:result?'parent':target, title:`${result?'Result':'Call'} · ${name}`, text:result?visible(event.content):clip(JSON.stringify(clean(event.input ?? {}),null,2)), callId:event.toolCallId, taskId:g?.taskId ?? event.input?.task_id, status:event.isError?'error':g?.status ?? (result?'returned':'requested'), details:clean(event.details)};
  }
  return null;
}
