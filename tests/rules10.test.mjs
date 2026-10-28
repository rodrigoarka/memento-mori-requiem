import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {resolveVigilia,resolveOpposition,resolveWill,resolveVoices} from '../module/rules.mjs';
const read = path => fs.readFileSync(new URL('../'+path, import.meta.url),'utf8');
test('1.0: Vigília usa um d6 e diferença 1 permite Preço',()=>{
 assert.equal(resolveVigilia({ability:2,resistance:2,die:4}).state,'success');
 assert.equal(resolveVigilia({ability:2,resistance:2,die:3}).state,'price');
 assert.equal(resolveVigilia({ability:2,resistance:2,die:2}).state,'insufficient');
 assert.equal(resolveVigilia({ability:2,resistance:2,conditionMet:false}).state,'condition');
 assert.throws(()=>resolveVigilia({ability:1,resistance:2,die:7}),/d6/);
});
test('1.0: cada participante joga seu d6 e empate mantém situação',()=>{
 const p=resolveOpposition({reachA:2,reachB:1,dieA:2,dieB:4});
 assert.equal(p.state,'B');
 assert.equal(p.totalA,4);assert.equal(p.totalB,5);
 assert.equal(p.pricePossibleForA,true);
 assert.equal(resolveOpposition({reachA:2,reachB:0,dieA:1,dieB:3}).state,'tie');
 assert.throws(()=>resolveOpposition({reachA:1,reachB:1,dieA:0,dieB:2}),/d6/);
});
test('1.0: probabilidades exatas via enumeração de 36 confrontos',()=>{
 const results=[];
 for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)results.push(resolveOpposition({reachA:2,reachB:0,dieA:a,dieB:b}).state);
 assert.equal(results.filter(x=>x==='A').length,26);
 assert.equal(results.filter(x=>x==='tie').length,4);
 assert.equal(results.filter(x=>x==='B').length,6);
});
test('1.0: Limiar continua determinístico, moedas não redefinem sucesso',()=>{
 const before=resolveWill({ability:1,resistance:2});
 assert.equal(before.state,'price');
 for(let i=0;i<8;i++){
  assert.ok(resolveVoices([!!(i&1),!!(i&2),!!(i&4)]).label);
  assert.equal(resolveWill({ability:1,resistance:2}).state,before.state);
 }
});
test('1.0: natureza declarada pelo Narrador e guia alinhado',()=>{
 const main=read('module/main.mjs'),dialogs=read('module/dialogs.mjs'),panel=read('templates/dashboard.hbs');
 assert.match(main,/sceneNature/);
 assert.match(panel,/setNature/);
 assert.match(dialogs,/dialogOpposition/);
 assert.match(dialogs,/resolveVigilia/);
 assert.match(main,/guia-rapido-v1\.html/);
 assert.match(read('docs/guia-rapido-v1.html'),/O Reencontro/);
});
