import {readFile,writeFile} from 'node:fs/promises';
const base=new URL('./web/',import.meta.url);
let html=await readFile(new URL('index.html',base),'utf8');
html=html.replace('<link rel="stylesheet" href="/style.css">',`<style>${await readFile(new URL('style.css',base),'utf8')}</style>`).replace('<script src="/app.js"></script>',`<script>${await readFile(new URL('app.js',base),'utf8')}</script>`);
for(const file of ['i18n.js','terminal.js'])html=html.replace(`<script src="/${file}"></script>`,`<script>${await readFile(new URL(file,base),'utf8')}</script>`);
await writeFile(new URL('../Gentle_Live_Demo.html',import.meta.url),html);
console.log('Built Gentle_Live_Demo.html');
