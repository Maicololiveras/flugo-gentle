import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
// Source-repository integration test; the staged package does not carry its exporter.
const script=fileURLToPath(new URL('../../integrations/gentle-ai/stage-plugin.mjs',import.meta.url));
let available=true;try{await readFile(script)}catch{available=false}
test('staging previews, copies, repeats safely and refuses differing files',{skip:!available},async()=>{
 const root=await mkdtemp(join(tmpdir(),'gentle-stage-'));
 try{
  await writeFile(join(root,'go.mod'),'module github.com/gentleman-programming/gentle-ai/v3\n');
  const run=(apply=false)=>spawnSync(process.execPath,[script,root,...apply?['--apply']:[]],{encoding:'utf8'});
  assert.equal(run().status,0);await assert.rejects(readFile(join(root,'plugins/gentle-live-observer/package.json')));
  assert.equal(run(true).status,0);assert.equal(run(true).status,0);
  const manifest=join(root,'plugins/gentle-live-observer/package.json');assert.equal(JSON.parse(await readFile(manifest)).pi.extensions[0],'./extensions/observer.ts');
  await writeFile(manifest,'local edit');assert.notEqual(run(true).status,0);assert.equal(await readFile(manifest,'utf8'),'local edit');
 }finally{await rm(root,{recursive:true,force:true})}
});
