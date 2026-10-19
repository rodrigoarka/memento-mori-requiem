import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveWill,tossVoices,resolveVoices,flipVoice,rupturedAfterChange,fateAfterBreak,transformationsAvailable,allowInvoke,allowContain,allowSync,canRecover,chanceAtLeastOneConvergence } from '../module/rules.mjs';
test('A Vontade: sucesso, preço, abordagem insuficiente e condição',()=>{
 assert.equal(resolveWill({ability:2,preparation:1,knowledge:1,resistance:4}).state,'success');
 assert.equal(resolveWill({ability:1,preparation:0,knowledge:0,resistance:2}).state,'price');
 assert.equal(resolveWill({ability:0,resistance:3}).state,'insufficient');
 assert.equal(resolveWill({ability:2,preparation:1,knowledge:1,resistance:1,conditionMet:false}).state,'condition');
});
test('As Três Vozes: oito combinações e intensidade',()=>{
 const combinations=new Set();for(let i=0;i<8;i++){const faces=[Boolean(i&1),Boolean(i&2),Boolean(i&4)];const r=resolveVoices(faces);combinations.add(r.faces.join(''));assert.equal(r.count,faces.filter(Boolean).length);assert.equal(r.probability,.125);}
 assert.equal(combinations.size,8);assert.equal(tossVoices(()=>.1).label,'Convergência');assert.equal(tossVoices(()=>.9).label,'Silêncio');
});
test('Voz inversível e pré-declaração consistente',()=>{const a=flipVoice([true,true,false],'veu');assert.equal(a.label,'Convergência');assert.deepEqual(a.faces,[true,true,true]);});
test('Evocar, Conter e Sincronia respeitam limites',()=>{
 assert.equal(allowInvoke([true,false,true],5,1,false),true);assert.equal(allowInvoke([true,false,true],6,1,false),false);
 assert.equal(allowContain([false,false,true],3),true);assert.equal(allowContain([false,false,true],4),false);
 assert.equal(allowSync('veu',1,2,5,0),true);assert.equal(allowSync('veu',2,2,5,0),false);assert.equal(allowSync('veu',1,2,6,0),false);
});
test('Presságio e Ruptura no limiar da escala',()=>{assert.deepEqual(rupturedAfterChange(4,2),{before:4,after:6,omen:true,rupture:true});assert.equal(rupturedAfterChange(5,1).rupture,true);});
test('Terceiro Luto ou última Âncora causa Deriva antes de zerar Distância',()=>{assert.deepEqual(fateAfterBreak({mourning:2,activeAnchors:2}),{mourning:3,drift:true,distance:6});assert.deepEqual(fateAfterBreak({mourning:1,activeAnchors:1}),{mourning:2,drift:false,distance:0});assert.equal(fateAfterBreak({mourning:0,activeAnchors:0}).drift,true);});
test('Progressão: uma transformação por dois capítulos',()=>{assert.equal(transformationsAvailable(1,0),0);assert.equal(transformationsAvailable(3,0),1);assert.equal(transformationsAvailable(5,1),1);});
test('Recuperação: até duas Âncoras distintas por capítulo',()=>{assert.equal(canRecover({chapter:2,recoveryChapter:2,recoveryCount:1,usedAnchors:['x'],anchorId:'x',distance:3}),false);assert.equal(canRecover({chapter:2,recoveryChapter:2,recoveryCount:1,usedAnchors:['x'],anchorId:'y',distance:3}),true);assert.equal(canRecover({chapter:2,recoveryChapter:2,recoveryCount:2,usedAnchors:[],anchorId:'z',distance:3}),false);});
test('Distribuição: quatro Ressonâncias têm 41,4% de chance de alguma Convergência',()=>assert.ok(Math.abs(chanceAtLeastOneConvergence(4)-.413818359375)<1e-10));
