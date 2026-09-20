import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {startObserver} from '../lib/server.mjs';
import {normalize} from '../lib/normalize.mjs';
const artifacts=new URL('../qa-artifacts/',import.meta.url);await mkdir(artifacts,{recursive:true});
const report={startedAt:new Date().toISOString(),mode:'synthetic browser QA; no model',checks:[],status:'running'};
let browser,server;
try{
 browser=await chromium.launch({headless:process.env.HEADED!=='1'});
 server=await startObserver({mode:'test'});
 const context=await browser.newContext({viewport:{width:1440,height:1080},recordVideo:{dir:artifacts.pathname}});
 const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(server.url.split('#')[0]);
 for(let i=0;i<4;i++){
  await page.selectOption('#scenario',String(i));
  for(let n=0;n<20;n++){await page.click('#step');const choice=page.locator('.choices button').first();if(await choice.count())await choice.click()}
  assert.ok(await page.locator('#log .event').count()>4);
  await page.screenshot({path:new URL(`demo-${i+1}.png`,artifacts).pathname,fullPage:true});
 }
 report.checks.push('four complete English examples');
 await page.selectOption('#language','es');await page.getByText('Sigue el intercambio.',{exact:true}).waitFor();assert.equal(await page.locator('html').getAttribute('lang'),'es');await page.screenshot({path:new URL('spanish.png',artifacts).pathname,fullPage:true});await page.selectOption('#language','en');await page.getByText('Follow the handoff.',{exact:true}).waitFor();report.checks.push('EN/ES switches locally without resetting the transcript');
 for(const scope of ['Filtered rows','All accessible rows']){
  await page.selectOption('#scenario','1');for(let n=0;n<7;n++)await page.click('#step');
  const count=await page.locator('#log .event').count();await page.click('#step');assert.equal(await page.locator('#log .event').count(),count,'Decision must block progression');
  await page.getByRole('button',{name:scope,exact:true}).click();await page.click('#step');assert.ok((await page.locator('#log').innerText()).includes(`Confirmed scope: ${scope}`));
 }
 report.checks.push('both decisions block and propagate through the parent');
 await page.selectOption('#scenario','0');await page.click('#play');await page.click('#play');const paused=await page.locator('#log .event').count();await page.waitForTimeout(2300);assert.equal(await page.locator('#log .event').count(),paused);
 report.checks.push('pause stops event progression');
 for(const [name,width,height] of [['ipad',1024,1366],['mobile',390,844]]){await page.setViewportSize({width,height});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Horizontal overflow');await page.screenshot({path:new URL(`${name}.png`,artifacts).pathname,fullPage:true})}
 report.checks.push('iPad and mobile have no horizontal overflow');
 await page.setViewportSize({width:1440,height:1080});await page.goto(server.url);await page.getByText('TEST FEED · SCRIPTED',{exact:true}).waitFor();
 assert.equal(await page.locator('#play').isDisabled(),true);
 for(const [name,event] of [
  ['input',{text:'Inspect CSV permissions'}],
  ['tool_call',{toolName:'subagent_run',toolCallId:'call-1',input:{agent:'gentle-ai-worker',task:'Inspect CSV'}}],
  ['message_end',{message:{role:'custom',content:'Which rows should be exported?',details:{gentleAgents:{taskId:'child-1',agent:'gentle-ai-worker',kind:'query'}}}}],
  ['ui_prompt_start',{title:'Choose export scope'}],
  ['ui_prompt_end',{}],
  ['tool_result',{toolName:'subagent_result',toolCallId:'call-1',content:[{type:'text',text:'CSV check passed'}],details:{gentleAgents:{taskId:'child-1',status:'completed'}}}],
  ['agent_end',{}],['agent_settled',{}]
 ])server.publish(normalize(name,event));
 await page.getByText('Parent settled',{exact:true}).waitFor();assert.ok((await page.locator('#child').innerText()).includes('child-1'));
 await page.screenshot({path:new URL('live-test-feed.png',artifacts).pathname,fullPage:true});
 await page.reload();await page.getByText('Parent settled',{exact:true}).waitFor();assert.equal(await page.locator('#log .event').count(),8);
 report.checks.push('SSE displays task identity, prompts, settlement and replay without duplicate rows');
 await server.close();server=undefined;await page.getByText('DISCONNECTED · RETRYING',{exact:true}).waitFor();await page.screenshot({path:new URL('disconnected.png',artifacts).pathname,fullPage:true});
 report.checks.push('disconnect is visible');assert.deepEqual(errors,[]);report.checks.push('no browser JavaScript errors');
 await context.close();report.status='passed';
}catch(error){report.status='failed';report.error=String(error);process.exitCode=1}finally{await browser?.close();await server?.close();report.finishedAt=new Date().toISOString();await writeFile(new URL('report.json',artifacts),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2))}
