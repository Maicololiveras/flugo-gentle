import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startObserver} from '../lib/server.mjs';
import {normalize} from '../lib/normalize.mjs';
const artifacts=new URL('../qa-artifacts/',import.meta.url);await mkdir(artifacts,{recursive:true});
const report={startedAt:new Date().toISOString(),mode:'synthetic browser QA; no model',checks:[],status:'running'};
let browser,server;
try{
 browser=await chromium.launch({headless:process.env.HEADED!=='1'});
 server=await startObserver({mode:'test'});
 const context=await browser.newContext({viewport:{width:1440,height:1080},recordVideo:{dir:fileURLToPath(artifacts)}});
 const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(server.url.split('#')[0]);
 for(let i=0;i<4;i++){
  await page.selectOption('#scenario',String(i));
  for(let n=0;n<20;n++){await page.click('#step');const choice=page.locator('.choices button').first();if(await choice.count())await choice.click()}
  assert.ok(await page.locator('#log .event').count()>4);
  await page.screenshot({path:fileURLToPath(new URL(`demo-${i+1}.png`,artifacts)),fullPage:true});
 }
 report.checks.push('four complete English examples');
 const transcriptCount=await page.locator('#log .event').count();
 await page.selectOption('#language','es');await page.getByText('Sigue el trabajo, no el razonamiento oculto.',{exact:true}).waitFor();assert.equal(await page.locator('html').getAttribute('lang'),'es');assert.equal(await page.locator('#log .event').count(),transcriptCount);await page.screenshot({path:fileURLToPath(new URL('spanish.png',artifacts)),fullPage:true});
 await page.selectOption('#language','en');await page.getByText('Follow the work, not hidden reasoning.',{exact:true}).waitFor();assert.equal(await page.locator('#log .event').count(),transcriptCount);report.checks.push('EN/ES switches locally without resetting the transcript');
 for(const scope of ['Filtered rows','All accessible rows']){
  await page.selectOption('#scenario','1');for(let n=0;n<7;n++)await page.click('#step');
  const count=await page.locator('#log .event').count();await page.click('#step');assert.equal(await page.locator('#log .event').count(),count,'Decision must block progression');
  await page.getByRole('button',{name:scope,exact:true}).click();await page.click('#step');assert.ok((await page.locator('#log').innerText()).includes(`Confirmed scope: ${scope}`));
 }
 report.checks.push('both decisions block and propagate through the parent');
 await page.selectOption('#scenario','0');await page.click('#play');await page.click('#play');const paused=await page.locator('#log .event').count();await page.waitForTimeout(2300);assert.equal(await page.locator('#log .event').count(),paused);
 report.checks.push('pause stops event progression');
 for(const [name,width,height] of [['ipad',1024,1366],['mobile',390,844],['narrow',320,800]]){await page.setViewportSize({width,height});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Horizontal overflow');await page.screenshot({path:fileURLToPath(new URL(`${name}.png`,artifacts)),fullPage:true})}
 report.checks.push('iPad, mobile and 320px layouts have no document-level horizontal overflow');
 await page.emulateMedia({reducedMotion:'reduce'});await page.selectOption('#scenario','0');await page.click('#step');assert.equal(await page.locator('#graph animateMotion').count(),0);await page.emulateMedia({reducedMotion:'no-preference'});report.checks.push('reduced motion removes animated route packets');
 await page.setViewportSize({width:1440,height:1080});await page.goto(server.url);await page.reload();await page.getByText('TEST FEED · SCRIPTED',{exact:true}).waitFor();
 assert.equal(await page.locator('#play').isDisabled(),true);
 server.publish({kind:'theme',from:'parent',to:'parent',title:'Pi theme',text:'wegcode-night',status:'observed',details:{theme:{name:'wegcode-night',colorMode:'truecolor',available:['Gentleman-Sexy','wegcode-night','dark'],colors:{page:'#0b1220',surface:'#111b2d',surfaceRaised:'#17243a',selected:'#20314b',border:'#405879',borderStrong:'#2aa8ff',text:'#edf5ff',muted:'#a9bad0',dim:'#71849d',accent:'#2aa8ff',success:'#48d597',warning:'#f5bd4f',error:'#ff6b73',user:'#2aa8ff',parent:'#2aa8ff',worker:'#2aa8ff',tool:'#2aa8ff',memory:'#2aa8ff',native:'#2aa8ff'}}}});
 for(const [name,event] of [
  ['input',{text:'Inspect CSV permissions'}],
  ['tool_call',{toolName:'subagent_run',toolCallId:'call-1',input:{agent:'gentle-ai-worker',task_id:'child-1',task:'Inspect CSV'}}],
  ['message_end',{message:{role:'custom',content:'Which rows should be exported?',details:{gentleAgents:{taskId:'child-1',agent:'gentle-ai-worker',kind:'query'}}}}],
  ['ui_prompt_start',{title:'Choose export scope'}],
  ['ui_prompt_end',{}],
  ['tool_call',{toolName:'read',toolCallId:'read-1',input:{path:'README.md'}}],
  ['tool_result',{toolName:'read',toolCallId:'read-1',content:[{type:'text',text:'README contents'}]}],
  ['tool_result',{toolName:'subagent_result',toolCallId:'call-1',content:[{type:'text',text:'CSV check passed'}],details:{gentleAgents:{taskId:'child-1',agent:'gentle-ai-worker',status:'completed'}}}],
  ['agent_end',{}],['agent_settled',{}]
 ])server.publish(normalize(name,event));
 for(const [index,toolName]of['bash','edit','find','grep','write','read','intercom','lens'].entries())server.publish(normalize('tool_call',{toolName,toolCallId:`crowded-${index+1}`,input:{task:`observable call ${index+1}`}}));
 await page.locator('#log .event h3').filter({hasText:/^Parent settled/}).waitFor();assert.equal(await page.locator('#themeName').innerText(),'wegcode-night');assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--pi-accent').trim()),'#2aa8ff');assert.equal(await page.evaluate(()=>{const style=getComputedStyle(document.documentElement),accent=style.getPropertyValue('--pi-accent').trim();return['user','parent','worker','tool','memory','native'].every(role=>style.getPropertyValue(`--pi-${role}`).trim()===accent)}),true);
 assert.equal(await page.locator('#graph .actor-worker').count(),1);assert.equal(await page.locator('#graph .actor-tool').count(),9);assert.ok((await page.locator('#graph').getAttribute('viewBox')).startsWith('0 0 1000 '));const crowdedNode=await page.locator('#graph .actor-tool').first().boundingBox();assert.ok(crowdedNode&&crowdedNode.width>=100);assert.ok((await page.locator('#graph .actor-id').allTextContents()).some(text=>text.includes('child-1')));assert.ok((await page.locator('#graph .actor-id').allTextContents()).some(text=>text.includes('read-1')));
 await page.locator('#graph .actor-tool').first().focus();await page.keyboard.press('Enter');assert.ok((await page.locator('#child').innerText()).includes('read-1'));await page.locator('#graph .actor-worker').click();assert.ok((await page.locator('#child').innerText()).includes('child-1'));assert.ok(await page.locator('#log .event details').count()>0);await page.waitForTimeout(300);
 await page.screenshot({path:fileURLToPath(new URL('live-test-feed.png',artifacts)),fullPage:true});
 await page.selectOption('#language','es');await page.screenshot({path:fileURLToPath(new URL('live-test-feed-es.png',artifacts)),fullPage:true});await page.selectOption('#language','en');
 await page.reload();await page.locator('#log .event h3').filter({hasText:/^Parent settled/}).waitFor();assert.equal(await page.locator('#log .event').count(),18);assert.equal(await page.locator('#themeName').innerText(),'wegcode-night');
 report.checks.push('SSE preserves Pi theme, task/call identities, prompts, states and replay without duplicate rows');
 await server.close();server=undefined;await page.getByText('DISCONNECTED · RETRYING',{exact:true}).waitFor();await page.waitForTimeout(300);await page.screenshot({path:fileURLToPath(new URL('disconnected.png',artifacts)),fullPage:true});
 report.checks.push('disconnect is visible');assert.deepEqual(errors,[]);report.checks.push('no browser JavaScript errors');
 await context.close();report.status='passed';
}catch(error){report.status='failed';report.error=error?.stack||String(error);process.exitCode=1}finally{await browser?.close();await server?.close();report.finishedAt=new Date().toISOString();await writeFile(new URL('report.json',artifacts),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2))}
