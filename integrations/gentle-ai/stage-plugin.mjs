import {readFile,writeFile,mkdir,readdir,lstat,realpath} from 'node:fs/promises';
import {resolve,join,relative,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const args=process.argv.slice(2),target=args.find(x=>!x.startsWith('--'));
if(!target||args.some(x=>x.startsWith('--')&&x!=='--apply'))throw Error('Usage: node integrations/gentle-ai/stage-plugin.mjs <gentle-ai-checkout> [--apply]');
const root=await realpath(resolve(target));
const mod=await readFile(join(root,'go.mod'),'utf8');
if(!/^module github\.com\/gentleman-programming\/gentle-ai(?:\/v\d+)?\s*$/m.test(mod))throw Error('Target is not a Gentle AI checkout');
const here=dirname(fileURLToPath(import.meta.url)),source=resolve(here,'../../live');
const destination=join(root,'plugins','gentle-live-observer'),entries=[];
async function walk(dir){for(const item of await readdir(dir,{withFileTypes:true})){if(['node_modules','qa-artifacts','package-lock.json'].includes(item.name))continue;const path=join(dir,item.name);if(item.isSymbolicLink())throw Error(`Source symlink refused: ${path}`);if(item.isDirectory())await walk(path);else entries.push({path:join(destination,relative(source,path)),data:await readFile(path)})}}
await walk(source);
for(const doc of ['LOCAL_AGENT_HANDOFF.md','TWO_MODES.md'])entries.push({path:join(destination,doc),data:await readFile(join(here,doc))});
// Validate every destination before writing any file. Existing identical files are idempotent.
for(const entry of entries){const rel=relative(root,entry.path).split(/[\\/]/);let cursor=root;for(const part of rel){cursor=join(cursor,part);try{const stat=await lstat(cursor);if(stat.isSymbolicLink())throw Error(`Destination symlink refused: ${cursor}`)}catch(error){if(error.code!=='ENOENT')throw error}}try{if(!(await readFile(entry.path)).equals(entry.data))throw Error(`Existing file differs; review it before staging: ${entry.path}`);entry.existing=true}catch(error){if(error.code!=='ENOENT')throw error}}
for(const entry of entries){console.log(`${entry.existing?'UNCHANGED':args.includes('--apply')?'WRITE':'PLAN'} ${relative(root,entry.path)}`);if(args.includes('--apply')&&!entry.existing){await mkdir(dirname(entry.path),{recursive:true});await writeFile(entry.path,entry.data,{flag:'wx'})}}
console.log(args.includes('--apply')?'Plugin staged. No Pi settings were changed. Read plugins/gentle-live-observer/LOCAL_AGENT_HANDOFF.md.':'Dry run only. Add --apply to stage these files.');
