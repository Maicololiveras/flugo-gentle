import type {ExtensionAPI} from '@earendil-works/pi-coding-agent';
import {startObserver} from '../lib/server.mjs';
import {createReporter} from '../lib/reporter.mjs';
import {normalize} from '../lib/normalize.mjs';
import {themeEvent} from '../lib/theme.mjs';

/** Opt-in observer: no tools, prompts, policy changes, or model/runtime polling. */
export default function observer(pi: ExtensionAPI) {
  let feed: Awaited<ReturnType<typeof startObserver>> | undefined;
  let remote: ReturnType<typeof createReporter> | undefined;
  let activeUi: Parameters<typeof themeEvent>[0] | undefined;
  let themeTimer: ReturnType<typeof setInterval> | undefined;
  let themeSignature='';
  try {if(process.env.GENTLE_LIVE_INGEST_URL && process.env.GENTLE_LIVE_INGEST_KEY)remote=createReporter({url:process.env.GENTLE_LIVE_INGEST_URL,key:process.env.GENTLE_LIVE_INGEST_KEY});} catch {}
  let opening: Promise<void> | undefined;
  const publish=(row:ReturnType<typeof normalize>|ReturnType<typeof themeEvent>)=>{if(!row)return;feed?.publish(row);remote?.publish(row)};
  const publishTheme=(ui:Parameters<typeof themeEvent>[0])=>{
    if(!feed&&!remote)return;
    const row=themeEvent(ui),signature=JSON.stringify(row.details?.theme);
    if(signature===themeSignature)return;
    themeSignature=signature;publish(row);
  };
  const startThemeSync=(ui:Parameters<typeof themeEvent>[0])=>{
    activeUi=ui;publishTheme(ui);
    if(themeTimer)return;
    themeTimer=setInterval(()=>{try{if(activeUi)publishTheme(activeUi);}catch{/* Theme sync must not interrupt work. */}},250);
    themeTimer.unref?.();
  };
  const stopThemeSync=()=>{if(themeTimer)clearInterval(themeTimer);themeTimer=undefined;activeUi=undefined;themeSignature='';};
  pi.registerCommand('gentle-live', {
    description: 'Start the local live visualizer; use /gentle-live stop to close it',
    handler: async (args,ctx) => {
      if(args.trim()==='stop') {stopThemeSync();remote?.close();remote=undefined;await opening;await feed?.close();feed=undefined;ctx.ui.notify('Live observer stopped.','info');return;}
      if(remote){startThemeSync(ctx.ui);ctx.ui.notify('The current session is attached to the local Workspace.','info');return;}
      if(!feed) {
        opening ??= (async()=>{feed=await startObserver();startThemeSync(ctx.ui);publish(normalize('session_start'));})();
        try {await opening;} catch(error) {ctx.ui.notify(`Observer could not start: ${String(error)}`,'error');return;} finally {opening=undefined;}
      } else startThemeSync(ctx.ui);
      const url=feed?.url;if(!url){ctx.ui.notify('Observer did not return a browser URL.','error');return;}
      ctx.ui.notify(`Open the live observer in your browser: ${url}`,'info');
    }
  });
  for(const name of ['input','agent_start','agent_end','agent_settled','tool_call','tool_result','message_end','session_start','ui_prompt_start','ui_prompt_end','tool_execution_update'] as const) {
    // A passive listener must never return an input transform or a tool policy result.
    pi.on(name, (event,ctx) => {try {if(ctx?.ui&&(feed||remote))startThemeSync(ctx.ui);publish(normalize(name,event));} catch {/* Observation must not interrupt work. */}});
  }
  pi.on('session_shutdown',async()=>{stopThemeSync();remote?.close();remote=undefined;await opening;await feed?.close();feed=undefined;});
}
