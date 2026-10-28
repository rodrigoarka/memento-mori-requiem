import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { resolveWill, resolveVoices } from '../module/rules.mjs';
const read = path => fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('0.9: intenção e Alcance permanecem determinísticos',()=>{
  assert.equal(resolveWill({ability:2,resistance:2}).state,'success');
  assert.equal(resolveWill({ability:1,resistance:2}).state,'price');
  assert.equal(resolveWill({ability:0,resistance:3}).state,'insufficient');
  assert.equal(resolveWill({ability:2,resistance:1,conditionMet:false}).state,'condition');
});
test('0.9: as Vozes são manifestações sem alterar o resultado da Vontade',()=>{
  const before=resolveWill({ability:1,resistance:2});
  for(let i=0;i<8;i++){
    const voices=resolveVoices([Boolean(i&1),Boolean(i&2),Boolean(i&4)]);
    assert.ok(['Silêncio','Sussurro','Encontro','Convergência'].includes(voices.label));
    assert.equal(resolveWill({ability:1,resistance:2}).state,before.state);
  }
});
test('0.9: Estrofe registra hipótese e experimento em vez de revelação automática',()=>{
  const s=read('module/services.mjs');
  assert.match(s,/Estrofe · Experimento/);
  assert.match(s,/não revela automaticamente uma exceção/);
  assert.match(s,/new Set\(items\.map\(v=>v\.system\.evidence/);
});
test('0.9: criador rápido e identidade sem logo obrigatória',()=>{
  const source=read('module/models.mjs');
  const sheet=read('templates/actor.hbs');
  assert.match(source,/approaches:s\(\)/);
  assert.match(sheet,/system\.approaches/);
  assert.match(sheet,/Entidade · três perguntas/);
  assert.doesNotMatch(sheet,/assets\/logo\.svg/);
});
test('0.9: painel encaminha ao guia atual e a catarse não é obrigatória',()=>{
  const main=read('module/main.mjs'), html=read('docs/guia-rapido-v1.html');
  assert.match(main,/guia-rapido-v1\.html/);
  assert.match(html,/O Reencontro/);
  assert.match(html,/não é obrigatório/);
  assert.match(html,/não exige voltar à Vigília/);
});
