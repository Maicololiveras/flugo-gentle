import {readFile,writeFile} from 'node:fs/promises';
const base=new URL('./web/',import.meta.url);
let html=await readFile(new URL('index.html',base),'utf8');
const css=await readFile(new URL('style.css',base),'utf8');
// Callback replacements preserve JavaScript currency strings such as '$' and '$&'.
html=html.replace('<link rel="stylesheet" href="/style.css">',()=>`<style>${css}</style>`);
for(const file of ['i18n.js','terminal.js','benchmark-math.js','benchmarks.js','app.js']){
 const code=await readFile(new URL(file,base),'utf8');
 html=html.replace(`<script src="/${file}"></script>`,()=>`<script>${code}</script>`);
}
await writeFile(new URL('../Gentle_Live_Demo.html',import.meta.url),html);
console.log('Built Gentle_Live_Demo.html');
