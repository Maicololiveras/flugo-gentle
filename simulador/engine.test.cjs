const assert=require('node:assert/strict'),fs=require('node:fs');const {create}=require('./engine.js'),S=JSON.parse(fs.readFileSync(__dirname+'/scenarios.json'));
const csv=create(S.find(s=>s.id==='csv'));csv.state.manual=true;csv.state.playing=true;
for(let i=0;i<1000&&!csv.state.waiting;i++)csv.tick(1);
assert.equal(csv.current().key,'scope');const waitIndex=csv.state.index;csv.tick(100);assert.equal(csv.state.index,waitIndex,'No avanza sin decisión');csv.answer('todos');assert.ok(csv.view().e.text.includes('todos los reportes accesibles'),'Respuesta devuelta al padre');
for(let i=0;i<1000&&!csv.state.waiting;i++)csv.tick(1);
assert.equal(csv.current().key,'review');csv.answer('no');assert.ok(!csv.events().some(e=>e.when?.review==='yes'));assert.ok(csv.events().some(e=>e.when?.review==='no'));
while(csv.state.playing)csv.tick(1);assert.ok(csv.view().done);assert.ok(csv.view().rows.some(r=>r.type==='parent'&&r.text.includes('no se ejecutó')));
for(const s of S){const en=create(s);en.state.playing=true;for(let i=0;i<3000&&!en.view().done;i++)en.tick(.5);assert.ok(en.view().done,s.id);assert.ok(en.view().rows.every(r=>r.type!=='child'),'El detalle del hijo no invade el chat padre');assert.ok(en.events().every(e=>e.route.length===2));}
const en=create(S[1]);en.seek(en.events().findIndex(e=>e.type==='wait'));let card=en.view().rows.find(r=>r.task==='csv-write-2');assert.ok(!card.result,'agent_end no se trata como resultado final');en.seek(en.state.index+1);card=en.view().rows.find(r=>r.task==='csv-write-2');assert.equal(card.result.status||'completed','completed');
console.log('PASS: decisiones bloqueantes, alternativas, padre/hijo, agent_settled y cierre de los cuatro casos.');
