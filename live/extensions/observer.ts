import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';
import {startObserver} from '../lib/server.mjs';
import {createReporter} from '../lib/reporter.mjs';
import {normalize} from '../lib/normalize.mjs';

/** Opt-in, passive observer: no tools, prompts, policy changes or autonomous polling. */
export default function observer(pi: ExtensionAPI) {
  let feed: Awaited<ReturnType<typeof startObserver>> | undefined;
  let remote: ReturnType<typeof createReporter> | undefined;
  try {if(process.env.GENTLE_LIVE_INGEST_URL && process.env.GENTLE_LIVE_INGEST_KEY)remote=createReporter({url:process.env.GENTLE_LIVE_INGEST_URL,key:process.env.GENTLE_LIVE_INGEST_KEY});} catch {}
  let opening: Promise<void> | undefined;
  pi.registerCommand('gentle-live', {
    description: 'Start the local live visualizer; use /gentle-live stop to close it',
    handler: async (args,ctx) => {
      if(args.trim()==='stop') {remote?.close();remote=undefined;await opening;await feed?.close();feed=undefined;ctx.ui.notify('Live observer stopped.','info');return;}
      if(remote){ctx.ui.notify('The current session is attached to the local Workspace.','info');return;}
      if(!feed) {
        opening ??= (async()=>{feed=await startObserver();feed.publish(normalize('session_start'));})();
        try {await opening;} catch(error) {ctx.ui.notify(`Observer could not start: ${String(error)}`,'error');return;} finally {opening=undefined;}
      }
      ctx.ui.notify(`Open the live observer in your browser: ${feed!.url}`,'info');
    }
  });
  for(const name of ['input','agent_start','agent_end','agent_settled','tool_call','tool_result','message_end','session_start','ui_prompt_start','ui_prompt_end','tool_execution_update'] as const) {
    // A passive listener must never return an input transform or a tool policy result.
    pi.on(name, (event) => {try {const row=normalize(name,event);feed?.publish(row);remote?.publish(row);} catch {/* Observation must not interrupt work. */}});
  }
  pi.on('session_shutdown',async()=>{remote?.close();remote=undefined;await opening;await feed?.close();feed=undefined;});
}
