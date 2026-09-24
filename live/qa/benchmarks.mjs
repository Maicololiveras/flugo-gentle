import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {startObserver} from '../lib/server.mjs';
import {createMetricAdapter} from '../lib/benchmarks.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const artifacts=new URL('../qa-artifacts/benchmarks/',import.meta.url);await mkdir(artifacts,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const server=await startObserver({mode:'test',benchmarkDirectory:false});
const report={mode:'synthetic browser QA; no real model calls',checks:[],errors:[]};
try{
 const adapter=createMetricAdapter(),ctx={cwd:'/synthetic-benchmark',sessionManager:{getSessionId:()=> 'synthetic'},model:{provider:'fixture',id:'fixture-model'}};
 function emit(type,event={}){server.publish({kind:'benchmark_observation',metrics:adapter(type,event,ctx)})}
 for(const [session,scale]of [['baseline',1],['optimized',.8]]){
  ctx.sessionManager.getSessionId=()=>session;
  emit('before_provider_request');emit('message_start',{message:{role:'assistant'}});emit('input',{source:'interactive'});
  emit('message_end',{message:{role:'assistant',provider:'fixture',model:'fixture-model',responseId:session,stopReason:'stop',usage:{input:1000*scale,output:100*scale,cacheRead:8000*scale,cacheWrite:1000*scale,totalTokens:10100*scale,cost:{input:.003*scale,output:.0015*scale,cacheRead:.0024*scale,cacheWrite:.00375*scale,total:.01065*scale}}}});
  for(const type of ['tool_call','tool_execution_start','tool_execution_end','tool_result'])emit(type,{toolName:'read',toolCallId:'c1'});
 }
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>report.errors.push(e.message));
 const requests=[];page.on('request',r=>requests.push(r.url()));
 await page.goto(server.url);await page.getByRole('tab',{name:'Benchmarks',exact:true}).click();
 await page.locator('#benchmarkBody strong').getByText('8,080',{exact:true}).waitFor();
 assert.equal(await page.locator('#main').isVisible(),false);assert.equal(await page.locator('#benchmarksPanel').isVisible(),true);
 report.checks.push('Live snapshot arrives through SSE; activity and benchmark panels switch');
 const sessions=server.benchmarks.snapshot().sessions;await page.locator('#benchmarkBaseline').selectOption(sessions.find(s=>s.id!==server.benchmarks.snapshot().currentId).id);await page.locator('#benchmarkComparable').check();
 await page.locator('#benchmarkBody').getByText('20%',{exact:true}).first().waitFor();report.checks.push('Equivalent synthetic baseline yields 20% reduction with explicit acknowledgement');
 await page.screenshot({path:fileURLToPath(new URL('desktop-en.png',artifacts)),fullPage:true});
 const download=page.waitForEvent('download');await page.locator('#benchmarkJSON').click();const exported=JSON.parse(await readFile(await(await download).path(),'utf8'));assert.equal(exported.recording.tokens.totalTokens.sum,8080);report.checks.push('Exported JSON matches the live snapshot');
 await page.locator('#language').selectOption('es');await page.getByText('Caché y reutilización',{exact:true}).waitFor();await page.screenshot({path:fileURLToPath(new URL('desktop-es.png',artifacts)),fullPage:true});
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:fileURLToPath(new URL('mobile-es.png',artifacts)),fullPage:true});report.checks.push('Spanish UI and 390px layout without page overflow');
 await page.locator('#benchmarksTab').focus();await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('#main').isVisible(),true);await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#benchmarksPanel').isVisible(),true);report.checks.push('Keyboard tab navigation');
 await page.reload();await page.locator('#benchmarksTab').click();await page.locator('#benchmarkBody strong').getByText('8080',{exact:true}).waitFor();assert.equal(server.benchmarks.snapshot().sessions[0].responses,1);report.checks.push('Reconnect does not duplicate usage');
 assert.equal(requests.every(url=>url.startsWith(new URL(server.url).origin)),true);assert.deepEqual(report.errors,[]);report.checks.push('No external requests; no page errors');
 await page.goto(new URL('../../Gentle_Live_Demo.html',import.meta.url).href);await page.locator('#benchmarksTab').click();await page.getByText('No real usage in this demo. Connect a Pi session to record measurements.',{exact:true}).waitFor();assert.deepEqual(report.errors,[]);report.checks.push('Standalone HTML opens offline with an honest empty benchmark state');report.status='passed';
}finally{await writeFile(new URL('report.json',artifacts),JSON.stringify(report,null,2));await browser.close();await server.close()}
console.log(JSON.stringify(report,null,2));
