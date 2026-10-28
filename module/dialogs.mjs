import { resolveWill, resolveVigilia, resolveOpposition, tossVoices, flipVoice, resolveVoices, allowInvoke, allowContain, allowSync, VOICES } from './rules.mjs';
import { SYS, escapeHTML as h, note, chapter, scene, own, activeAnchors, availableAnchors, selectOne, promptText, updateDistance, changePressure, notification } from './services.mjs';
const Dialog=()=>foundry.applications.api.DialogV2;
const options = (actors, selected = '', nullable = false) => `${nullable?'<option value="">— Nenhum —</option>':''}${actors.map(a=>`<option value="${h(a.id)}" ${a.id===selected?'selected':''}>${h(a.name)}</option>`).join('')}`;
const voiceLabel={corpo:'Corpo',memoria:'Memória',veu:'Véu'};
export const voiceNames = a => a.awake.length ? a.awake.map(v=>voiceLabel[v]).join(' + ') : 'Nenhuma';
export const voiceFace = (faces,i) => `<span class="mm-coin ${faces[i]?'awake':'silent'}">${faces[i]?'●':'○'}<small>${['Corpo','Memória','Véu'][i]}</small></span>`;
function resonanceHTML(result, intro = '', changed = '') {
  return `<p>${h(intro)}</p><div class="mm-coin-row">${[0,1,2].map(i=>voiceFace(result.faces,i)).join('')}</div><p><strong>${h(result.label)}</strong> · ${h(voiceNames(result))}</p><p>${h(changed||'A manifestação responde ao acontecimento. Ela não altera o resultado da Vontade.')}</p>`;
}
export async function dialogWill(defaultActor=null) {
  const chars=game.actors.filter(a=>a.type==='retornado' && (game.user.isGM||a.isOwner));
  if(!chars.length)return notification('Crie ou obtenha permissão de um Retornado primeiro.');
  const result=await Dialog().prompt({ window:{title:'A Vontade · Avaliar ação'},content:`
    <div class="mm-dialog-grid">
     <label>Retornado<select name="actorId">${options(chars,defaultActor?.id||'')}</select></label>
     <label>Capacidade<select name="ability"><option value="lucidez">Lucidez</option><option value="pulso">Pulso</option><option value="elo">Elo</option><option value="firmeza">Firmeza</option></select></label>
     <label>Resistência<select name="resistance">${[0,1,2,3,4].map(n=>`<option value="${n}" ${n===2?'selected':''}>${n}</option>`).join('')}</select></label>
     <label>Intenção e abordagem<input name="intent" placeholder="O que seu personagem faz e como?" required></label>
     <label><input name="preparation" type="checkbox"> Preparo justificado (+1)</label>
     <label><input name="knowledge" type="checkbox"> Conhecimento/Lei (+1)</label>
     <label><input name="condition" type="checkbox" checked> Condição necessária satisfeita</label>
     <label>Preço anunciado (se faltar 1)<input name="price" placeholder="Tempo, condição, pressão..."></label>
    </div>`,ok:{label:'Resolver Vontade',callback:(_e,b)=>{const f=b.form.elements;return {actorId:f.actorId.value,ability:f.ability.value,resistance:Number(f.resistance.value),intent:f.intent.value,preparation:f.preparation.checked,knowledge:f.knowledge.checked,conditionMet:f.condition.checked,price:f.price.value};}},rejectClose:false});
  if(!result || !result.intent.trim())return;
  const actor=game.actors.get(result.actorId); if(!actor || !own(actor))return;
  const value=actor.system.abilities[result.ability];
  const nature=game.settings.get(SYS,'sceneNature')||'vigilia';
  const material=nature==='vigilia'||nature==='interferencia';
  const die=material&&result.conditionMet?Math.floor(Math.random()*6)+1:null;
  const props={ability:value,preparation:result.preparation,knowledge:result.knowledge,resistance:result.resistance,conditionMet:result.conditionMet};
  const outcome=material?resolveVigilia({...props,die}):resolveWill(props);
  const state={success:'A intenção é alcançada.',price:'Pode aceitar o Preço anunciado ou mudar de abordagem.',insufficient:'A abordagem exige recurso, rota ou Lei adicional.',condition:'A Condição deve ser satisfeita primeiro.'}[outcome.state];
  const price=outcome.state==='price'?`<p><b>Preço declarado:</b> ${h(result.price||'O Narrador precisa anunciar um Preço concreto antes da escolha.')}</p>`:'';
  const diceHTML=material&&die!==null?'<p><b>Vigília/Interferência material:</b> d6 '+die+' + Alcance '+outcome.reach+' = '+outcome.total+' contra alvo '+outcome.target+'.</p>'
    :'<p><b>Limiar · Vontade:</b> Alcance '+outcome.reach+' contra Resistência '+outcome.resistance+'.</p>';
  await note('A VONTADE','<p><b>'+h(actor.name)+'</b> · '+h(result.intent)+'</p>'
    +'<p>'+h(result.ability)+' '+value+' + Preparo '+(result.preparation?1:0)+' + Conhecimento '+(result.knowledge?1:0)
    +' = <strong>'+outcome.reach+'</strong> de Alcance.</p>'+diceHTML+'<p>'+h(state)+'</p>'+price,
    actor,{type:'will',nature,outcome});
}

export async function dialogResonance(defaultActor=null) {
  if((game.settings.get(SYS,'sceneNature')||'vigilia')==='vigilia')return notification('O Narrador precisa anunciar Limiar ou Interferência antes de uma Ressonância.');
  const chars=game.actors.filter(a=>a.type==='retornado'&&(game.user.isGM||a.isOwner));
  const threats=game.actors.filter(a=>['entidade','dominio'].includes(a.type) && (game.user.isGM||a.isOwner));
  const groups=game.actors.filter(a=>a.type==='confluencia' && (game.user.isGM||a.isOwner));
  const settings=await Dialog().prompt({window:{title:'As Três Vozes · Ressonância'},content:`
    <p>Declare o gatilho antes de lançar. A Vontade já decidiu o resultado da ação.</p>
    <div class="mm-dialog-grid">
      <label>Retornado<select name="actorId">${options(chars,defaultActor?.id||'',true)}</select></label>
      <label>Fonte de Pressão (opcional)<select name="pressureId">${options(threats,'',true)}</select></label>
      <label>Confluência (opcional)<select name="groupId">${options(groups,'',true)}</select></label>
      <label>Sincronia: Voz pré-escolhida<select name="syncedVoice"><option value="">Sem pré-declaração</option>${VOICES.map(v=>`<option value="${v}">${voiceLabel[v]}</option>`).join('')}</select></label>
      <label class="mm-wide">Gatilho sobrenatural<input name="trigger" placeholder="Travessia, Lei alterada, entidade provocada..."></label>
    </div>`,ok:{label:'Lançar três moedas',callback:(_e,b)=>{const f=b.form.elements;return {actorId:f.actorId.value,pressureId:f.pressureId.value,groupId:f.groupId.value,syncedVoice:f.syncedVoice.value,trigger:f.trigger.value};}},rejectClose:false});
  if (!settings)return;
  let res=tossVoices(),actor=game.actors.get(settings.actorId),group=game.actors.get(settings.groupId),pressure=game.actors.get(settings.pressureId);
  const original=res;
  const message=await note('RESSONÂNCIA',resonanceHTML(res,settings.trigger),actor,{type:'resonance',original:original.faces});
  const choices=[{id:'none',name:'Preservar as moedas'}];
  const anchors=actor?availableAnchors(actor):[];
  const evocables=anchors.filter(a=>a.system.lastEvokedScene!==scene());
  if(actor && allowInvoke(res.faces,actor.system.distance,evocables.length,false))choices.push({id:'evocar',name:'Evocar · Memória coroa → cara (+1 Distância)'});
  if(pressure && allowContain(res.faces,pressure.system.pressure) && own(pressure))choices.push({id:'conter',name:'Conter · uma cara → coroa (+1 Pressão)'});
  const participants=game.actors.filter(a=>a.type==='retornado' && (game.user.isGM||a.isOwner) && a.system.distance<6 && !a.system.drift);
  if(group && settings.syncedVoice && participants.length>=2 && group.system.usedChapter!==chapter())choices.push({id:'sincronia',name:`Sincronia · Inverter ${voiceLabel[settings.syncedVoice]} (+1 Distância para dois)`});
  const action=await selectOne('Interferência após o lançamento','Uma intervenção por Ressonância',choices);
  let explanation='';
  if(action==='evocar'){
    const anchorId=await selectOne('Evocar Memória','Âncora disponível nesta cena',evocables.map(a=>({id:a.id,name:a.name})));
    const anchor=evocables.find(a=>a.id===anchorId);
    if(anchor && own(actor)){
      const applied=await updateDistance(actor,1,`Evocou a Âncora ${anchor.name}.`);
      if(applied){
        await anchor.update({'system.lastEvokedScene':scene()});
        res=flipVoice(res.faces,'memoria');
        explanation=`Evocar: ${anchor.name} entrou na manifestação. +1 Distância.`;
      }
    }
  }
  if(action==='conter'){
    const active=VOICES.filter((v,i)=>res.faces[i]);
    const v=await selectOne('Conter','Qual Voz silenciar?',active.map(id=>({id,name:voiceLabel[id]})));
    if(v && own(pressure) && pressure.system.pressure<4){
      await changePressure(pressure,1);
      res=flipVoice(res.faces,v);
      explanation=`Conter: ${voiceLabel[v]} silenciado. Pressão +1 em ${pressure.name}.`;
    }
  }
  if(action==='sincronia' && group && own(group)) {
    const first=await selectOne('Sincronia','Primeiro participante',participants.map(a=>({id:a.id,name:a.name})));
    const second=await selectOne('Sincronia','Segundo participante',participants.filter(a=>a.id!==first).map(a=>({id:a.id,name:a.name})));
    const a=game.actors.get(first),b=game.actors.get(second);
    if(a && b && own(a) && own(b) && allowSync(settings.syncedVoice,group.system.usedChapter,chapter(),a.system.distance,b.system.distance)){
      await updateDistance(a,1,'Custo da Sincronia coletiva.');
      await updateDistance(b,1,'Custo da Sincronia coletiva.');
      res=flipVoice(res.faces,settings.syncedVoice);
      await group.update({'system.usedChapter':chapter()});
      explanation=`Sincronia de ${a.name} e ${b.name}: ${voiceLabel[settings.syncedVoice]} foi invertida. +1 Distância para cada um. Verso Comum: ${group.system.commonVerse}`;
    } else notification('Sincronia exige dois Retornados autorizados abaixo de Distância 6. O Narrador pode executar a ação para personagens com donos diferentes.');
  }
  const final=resonanceHTML(res,settings.trigger,explanation);
  await message.update({content:`<article class="mm-chat"><header><b>MEMENTO MORI · RÉQUIEM</b><h3>RESSONÂNCIA</h3></header><div>${final}</div></article>`,[`flags.${SYS}.final`]:res.faces});
  return res;
}
export async function sharedTrail(group) {
  if(!own(group)||group.type!=='confluencia')return;
  if(group.system.usedChapter===chapter())return notification('A Confluência já utilizou sua oportunidade coletiva neste capítulo.');
  const choices=game.actors.filter(a=>a.type==='retornado');
  if(choices.length<2)return notification('São necessários pelo menos dois Retornados.');
  const first=await selectOne('Rastro Compartilhado','Primeiro observador',choices.map(a=>({id:a.id,name:a.name})));
  const second=await selectOne('Rastro Compartilhado','Segundo observador',choices.filter(a=>a.id!==first).map(a=>({id:a.id,name:a.name})));
  if(!first||!second)return;
  const details=await promptText('Rastro Compartilhado','Quais duas observações diferentes, ligadas à Impressão, foram feitas?');
  if(!details)return;
  const clue=game.user.isGM?await promptText('Narrador · Vestígio','Pista concreta e acionável que aponta uma investigação'):'O Narrador revelará um vestígio concreto e acionável.';
  if(clue===null)return;
  await group.update({'system.usedChapter':chapter(),'system.lastTrail':details});
  await note('RASTRO COMPARTILHADO',`<p><b>${h(group.name)} · ${h(group.system.commonVerse)}</b></p><p><b>Observações:</b> ${h(details)}</p><p><b>Vestígio:</b> ${h(clue)}</p>`,group);
}


/** 1.0 · Um d6 por participante. Oposição sem bônus automático de defesa. */
export async function dialogOpposition(defaultActor=null) {
  const nature=game.settings.get(SYS,'sceneNature')||'vigilia';
  if(nature==='limiar')return notification('No Limiar puro, compare Alcances. Para disputa material com dados, o Narrador precisa anunciar Interferência.');
  const actors=game.actors.filter(a=>a.type==='retornado'&&(game.user.isGM||a.isOwner));
  const defenders=game.actors.filter(a=>a.type==='retornado');
  if(!actors.length)return notification('Crie ou obtenha permissão de um Retornado.');
  const ability='<option value="pulso">Pulso</option><option value="lucidez">Lucidez</option><option value="elo">Elo</option><option value="firmeza">Firmeza</option>';
  const content='<p>Disputa material: um d6 para cada lado. Empate preserva a situação. Entre protagonistas, confirme acordo dos envolvidos.</p>'
    +'<div class="mm-dialog-grid">'
    +'<label>Quem tenta agir<select name="actorId">'+options(actors,defaultActor?.id||'')+'</select></label>'
    +'<label>Capacidade de quem age<select name="ability">'+ability+'</select></label>'
    +'<label>Quem resiste (opcional para NPC)<select name="defenderId">'+options(defenders,'',true)+'</select></label>'
    +'<label>Capacidade de quem resiste<select name="defenseAbility">'+ability+'</select></label>'
    +'<label>Alcance de NPC sem ficha (0 a 4)<input type="number" name="npcReach" min="0" max="4" value="1"></label>'
    +'<label>Intenções incompatíveis<input name="intent" required placeholder="Segurar, escapar, proteger..."></label>'
    +'<label><input type="checkbox" name="prepA">Preparo de quem age +1</label>'
    +'<label><input type="checkbox" name="knowledgeA">Conhecimento de quem age +1</label>'
    +'<label><input type="checkbox" name="prepB">Preparo de quem resiste +1</label>'
    +'<label><input type="checkbox" name="knowledgeB">Conhecimento de quem resiste +1</label>'
    +'<label><input type="checkbox" name="agreed">Os envolvidos concordam com a resolução</label></div>';
  const data=await Dialog().prompt({window:{title:'Oposição Direta · 2d6'},content,
    ok:{label:'Lançar 1d6 para cada lado',callback:(_e,b)=>{
      const f=b.form.elements;return {
        actorId:f.actorId.value,ability:f.ability.value,defenderId:f.defenderId.value,
        defenseAbility:f.defenseAbility.value,npcReach:Number(f.npcReach.value),
        intent:f.intent.value,prepA:f.prepA.checked,knowledgeA:f.knowledgeA.checked,
        prepB:f.prepB.checked,knowledgeB:f.knowledgeB.checked,agreed:f.agreed.checked};
    }},rejectClose:false});
  if(!data||!data.intent.trim())return;
  if(!data.agreed)return notification('O Narrador precisa confirmar a concordância dos envolvidos.');
  const actor=game.actors.get(data.actorId),defender=game.actors.get(data.defenderId);
  if(!actor||!own(actor))return;
  if(defender?.id===actor.id)return notification('Escolha dois personagens diferentes.');
  const reachA=resolveWill({ability:actor.system.abilities[data.ability],preparation:data.prepA,knowledge:data.knowledgeA}).reach;
  const reachB=defender?resolveWill({ability:defender.system.abilities[data.defenseAbility],preparation:data.prepB,knowledge:data.knowledgeB}).reach:Math.max(0,Math.min(4,data.npcReach));
  const dieA=Math.floor(Math.random()*6)+1,dieB=Math.floor(Math.random()*6)+1;
  const outcome=resolveOpposition({reachA,reachB,dieA,dieB});
  const nameB=defender?.name||'Oposição do Narrador';
  const verdict=outcome.state==='A'?actor.name+' prevalece nesta ação.'
    :outcome.state==='B'?nameB+' prevalece nesta ação.'
    :'Empate. A situação permanece como estava.';
  const noteBody='<p><strong>'+h(data.intent)+'</strong></p>'
    +'<p><b>'+h(actor.name)+'</b>: Alcance '+reachA+' + d6 '+dieA+' = '+outcome.totalA+'</p>'
    +'<p><b>'+h(nameB)+'</b>: Alcance '+reachB+' + d6 '+dieB+' = '+outcome.totalB+'</p>'
    +'<p><strong>'+h(verdict)+'</strong></p>'
    +(Math.abs(outcome.difference)===1?'<p>Margem de 1: um Preço pode ser proposto. Entre jogadores, somente com acordo.</p>':'');
  await note('OPOSIÇÃO DIRETA',noteBody,actor,{type:'opposition',nature,outcome});
  return outcome;
}
