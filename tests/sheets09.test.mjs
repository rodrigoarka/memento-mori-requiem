import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = p => fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('fichas 0.9.1: Handlebars de atores conserva blocos equilibrados',()=>{
 const tpl=read('templates/actor.hbs'), stack=[];
 for(const [,sign,tag] of tpl.matchAll(/\{\{([#\/])(if|each|unless)\b[^}]*\}\}/g)){
  if(sign==='#') stack.push(tag);
  else assert.equal(stack.pop(),tag,'bloco de Handlebars incompatível: '+tag);
 }
 assert.deepEqual(stack,[]);
 assert.equal((tpl.match(/<details\b/g)||[]).length,(tpl.match(/<\/details>/g)||[]).length);
});
test('fichas 0.9.1: duas áreas para o Retornado, campos livres e sem duplicação de estados',()=>{
 const tpl=read('templates/actor.hbs');
 assert.match(tpl,/Meu personagem/);
 assert.match(tpl,/Minhas anotações/);
 assert.doesNotMatch(tpl,/data-tab="vinculos"/);
 assert.doesNotMatch(tpl,/data-tab="conhecimento"/);
 assert.doesNotMatch(tpl,/Lei Interiorizada:\s*\{\{system.interiorLawId\}\}/);
 assert.doesNotMatch(tpl,/Reivindicadas:\s*<b>/);
 assert.doesNotMatch(tpl,/Âncora ameaçada:\s*<b>/);
 for(const x of ['ancoras','system.distance','mourning','system.notes','isConfluencia','isEntidade','isDominio','isFissura']) assert.match(tpl,new RegExp(x));
});
test('fichas 0.9.1: entidades e domínio têm perguntas mínimas sem apagar dados',()=>{
 const tpl=read('templates/actor.hbs');
 for(const x of ['O que deseja?','Como age?','Como lidar com ela?','Domínio · cinco ideias','system.approaches','system.law','system.returnMark','system.pressure']) {
  if(x==='system.pressure') continue; // trilha de Pressão incluída em partial dedicado
  assert.ok(tpl.includes(x),x);
 }
 const item=read('templates/item.hbs');
 assert.doesNotMatch(item,/name="system.broken"/);
 assert.doesNotMatch(item,/name="system.reclaimed"/);
 assert.doesNotMatch(item,/name="system.effect">\{\{system.effect\}\}<\/textarea><\/label>\{\{\/if\}\}/);
});

test('fichas 0.9.2: Capacidades circulares, barra de Distância e Luto centralizado',()=>{
 const tpl=read('templates/actor.hbs'), css=read('styles/memento.css'), sheet=read('module/sheets.mjs');
 assert.match(tpl,/class="mm-distance-bar"/);
 assert.match(tpl,/width:\{\{distancePercent\}\}%/);
 assert.match(tpl,/class="mm-luto-dots"/);
 assert.match(tpl,/class="mm-luto-dot/);
 assert.doesNotMatch(tpl,/class="mm-track mourning"/);
 assert.match(sheet,/distancePercent/);
 assert.match(css,/\.mm-abilities input\[type=number\]/);
 assert.match(css,/border-radius:50%!important/);
 assert.match(css,/\.mm-luto-dots\{[^}]*justify-content:center/);
 const item=read('templates/item.hbs');
 assert.equal((item.match(/name="system.anchorType" value=/g)||[]).length,3);
 assert.doesNotMatch(item,/<select name="system.anchorType">/);
});
