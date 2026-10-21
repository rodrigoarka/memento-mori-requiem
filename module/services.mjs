import { clamp, resolveWill, resolveVoices, tossVoices, flipVoice, canRecover, allowInvoke, allowContain, allowSync, transformationsAvailable } from './rules.mjs';
export const SYS = 'memento-mori-requiem';
export const escapeHTML = (value = '') => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const chapter = () => Number(game.settings.get(SYS, 'chapter'));
export const scene = () => Number(game.settings.get(SYS, 'narrativeScene'));
export const activeAnchors = actor => actor.items.filter(i => i.type === 'ancora' && !i.system.broken);
export const availableAnchors = actor => activeAnchors(actor).filter(i => !i.system.reclaimed);
export const own = doc => Boolean(game.user?.isGM || doc?.isOwner);
export const actorLabel = actor => actor?.name || 'Retornado';
export const notification = (message) => ui.notifications?.warn(message);

export async function note(title, body, speaker = null, flags = {}) {
  const content = `<article class="mm-chat"><header><b>MEMENTO MORI · RÉQUIEM</b><h3>${escapeHTML(title)}</h3></header><div>${body}</div></article>`;
  return ChatMessage.create({ content, speaker: speaker ? ChatMessage.getSpeaker({ actor: speaker }) : { alias: 'Réquiem' }, flags: { [SYS]: flags } });
}
const summary = (actor, description) => `<p><b>${escapeHTML(actor.name)}</b> — ${escapeHTML(description)}</p>`;
export async function promptText(title, label, value = '') {
  return foundry.applications.api.DialogV2.prompt({ window: { title }, content: `<label class="mm-field">${escapeHTML(label)}<textarea name="entry" rows="4">${escapeHTML(value)}</textarea></label>`, ok: { label: 'Confirmar', callback: (_e,button) => button.form.elements.entry.value.trim() }, rejectClose: false });
}
export async function selectOne(title, label, choices, selected = '') {
  const opts = choices.map(c => `<option value="${escapeHTML(c.id)}" ${c.id===selected?'selected':''}>${escapeHTML(c.name)}</option>`).join('');
  if (!choices.length) return null;
  return foundry.applications.api.DialogV2.prompt({ window: {title}, content:`<label class="mm-field">${escapeHTML(label)}<select name="selected">${opts}</select></label>`, ok: {label:'Confirmar',callback:(_e,button)=>button.form.elements.selected.value}, rejectClose:false });
}
export async function updateDistance(actor, delta, explanation = '', { silent = false } = {}) {
  if (!own(actor) || actor.type !== 'retornado') { notification('Sem permissão para alterar Distância.'); return false; }
  if (actor.system.drift || actor.system.rupture.active) { notification('Resolva a Ruptura ou Deriva antes de alterar Distância.'); return false; }
  const old = actor.system.distance;
  const next = clamp(old + delta, 0, 6);
  if (next === old) return false;
  let omenId = actor.system.omenAnchorId || '';
  const anchors = activeAnchors(actor);
  if (old < 5 && next >= 5 && anchors.length) {
    const selection = await selectOne('Presságio', 'Escolha a Âncora ameaçada antes da Ruptura', anchors.map(i => ({id:i.id,name:i.name})), omenId);
    if (selection === null) return false;
    omenId = selection;
  }
  if (next === 6) {
    if (!anchors.length) {
      await actor.update({'system.distance':6,'system.drift':true});
      await note('DERIVA', summary(actor, 'alcançou Distância 6 sem Âncoras. O Limiar o conduz a regiões mais profundas.'),actor);
      return true;
    }
    const threatened = anchors.find(i=>i.id===omenId) ?? anchors[0];
    if (!threatened) return false;
    // A Ruptura substitui o simples aumento de Distância; fica aberta até o Último Retorno.
    await threatened.update({'system.reclaimed':true});
    await actor.update({'system.distance':6,'system.omenAnchorId':threatened.id,'system.rupture.active':true,'system.rupture.bell':0,'system.rupture.anchorId':threatened.id});
    await note('RUPTURA · O ÚLTIMO RETORNO', summary(actor,`alcançou Distância 6. A Âncora “${threatened.name}” foi Reclamada. Iniciam-se três Badaladas.`),actor);
    return true;
  }
  await actor.update({'system.distance':next,'system.omenAnchorId':omenId});
  if (!silent) await note('DISTÂNCIA',summary(actor,`${old} → ${next}. ${explanation}`),actor);
  return true;
}
export async function advanceBell(actor) {
  if (!own(actor) || !actor.system.rupture.active) return notification('Este Retornado não tem Ruptura ativa.');
  const next = Math.min(3,actor.system.rupture.bell+1);
  await actor.update({'system.rupture.bell':next});
  await note('BADALADA', summary(actor, `${next}ª de 3. ${next===3?'A Âncora será quebrada se continuar Reclamada.':'A pressão sobre a Âncora aumenta.'}`),actor);
  if (next===3) await finishRupture(actor,false);
}
export async function finishRupture(actor, saved) {
  if (!own(actor) || !actor.system.rupture.active) return notification('Ruptura inativa.');
  const anchor=actor.items.get(actor.system.rupture.anchorId);
  if (!anchor) return notification('Âncora da Ruptura não encontrada.');
  if (saved) {
    await anchor.update({'system.reclaimed':false});
    await actor.update({'system.distance':4,'system.rupture.active':false,'system.rupture.bell':0,'system.rupture.anchorId':'','system.omenAnchorId':''});
    await note('ÂNCORA PRESERVADA',summary(actor,`resgatou “${anchor.name}”. Distância volta a 4.`),actor);
    return;
  }
  await anchor.update({'system.broken':true,'system.reclaimed':false});
  const remain=activeAnchors(actor).length;
  const mourning=Math.min(3,actor.system.mourning+1);
  const drift = remain===0 || mourning===3;
  await actor.update({'system.distance':drift?6:0,'system.mourning':mourning,'system.drift':drift,'system.rupture.active':false,'system.rupture.bell':0,'system.rupture.anchorId':'','system.omenAnchorId':''});
  await note(drift?'DERIVA':'ÂNCORA QUEBRADA',summary(actor,`perdeu “${anchor.name}”. Luto ${mourning}/3; ${drift?'a Deriva começa.':'Distância volta a 0.'}`),actor);
}
export async function recoverDistance(actor, anchorId) {
  if (!own(actor) || actor.type!=='retornado') return;
  if (actor.system.rupture.active || actor.system.drift || actor.system.journey.active) return notification('Recuperação exige Vigília, sem Ruptura ou Deriva ativa.');
  const anchor=availableAnchors(actor).find(a=>a.id===anchorId);
  if(!anchor) return notification('Âncora indisponível.');
  const ch=chapter(), rec=actor.system.recovery;
  const anchorIds=rec.chapter===ch ? [...rec.anchorIds] : [];
  const count=rec.chapter===ch ? rec.count : 0;
  if (!canRecover({chapter:ch,recoveryChapter:rec.chapter,recoveryCount:count,usedAnchors:anchorIds,anchorId,distance:actor.system.distance})) return notification('Limite de recuperação: duas cenas com Âncoras distintas por capítulo.');
  const description=await promptText('Cultivar Âncora','O que ocorreu na cena significativa?',`Uma cena na Vigília com ${anchor.name}.`);
  if (description===null || !description.trim()) return;
  await actor.update({'system.distance':actor.system.distance-1,'system.recovery.chapter':ch,'system.recovery.count':count+1,'system.recovery.anchorIds':[...anchorIds,anchorId]});
  await note('VIGÍLIA · RECUPERAÇÃO', `<p><b>${escapeHTML(actor.name)}</b>: Distância −1 por meio de <b>${escapeHTML(anchor.name)}</b>.</p><p>${escapeHTML(description)}</p>`,actor);
}
export async function travel(actor, action) {
  if (!own(actor)||actor.type!=='retornado'||actor.system.drift) return;
  const j=actor.system.journey;
  if (actor.system.rupture.active) return notification('Resolva o Último Retorno antes de prosseguir.');
  if (action==='return') {
    if (!j.active) return;
    const confirmed=await foundry.applications.api.DialogV2.confirm({window:{title:'Marco de Regresso'},content:'<p>A Lei de regresso foi satisfeita e existe uma Correspondência acessível?</p>'});
    if (!confirmed) return;
    await actor.update({'system.journey.active':false,'system.journey.entered':false,'system.journey.deepest':0});
    await note('REGRESSO À VIGÍLIA',summary(actor,`atravessou fisicamente de volta. Distância permanece ${actor.system.distance}.`),actor);
    return;
  }
  if (action==='enter') {
    if (j.active) return notification('Este Retornado já está no Limiar.');
    const confirmed=await foundry.applications.api.DialogV2.confirm({window:{title:'Travessia Física'},content:'<p>O Sinal foi reconhecido, a Lei descoberta e o Gesto realizado?</p>'});
    if(!confirmed)return;
    const costApplied = await updateDistance(actor,1,'Primeira entrada física nesta expedição.');
    if (!costApplied) return;
    await actor.update({'system.journey.active':true,'system.journey.entered':true,'system.journey.deepest':0});
    await note('TRAVESSIA FÍSICA',summary(actor,'atravessou com corpo e pertences; está ausente da Vigília.'),actor);
    return;
  }
  if (action==='deepen') {
    if(!j.active)return notification('Primeiro atravesse para o Limiar.');
    const next=j.deepest+1;
    const ok=await foundry.applications.api.DialogV2.confirm({window:{title:`Aprofundar · Estrato ${next}`},content:'<p>A Confluência descobriu uma rota para um estrato ainda mais profundo?</p>'});
    if(!ok)return;
    const costApplied = await updateDistance(actor,1,`Novo estrato profundo ${next}.`);
    if (!costApplied) return;
    await actor.update({'system.journey.deepest':next});
  }
}
export async function changePressure(actor,delta) {
  if(!own(actor) || !['entidade','dominio'].includes(actor.type)) return;
  const from=actor.system.pressure, to=clamp(from+delta,0,4);
  if(from===to)return;
  await actor.update({'system.pressure':to});
  const milestone=actor.system[`pressure${to}`]||'';
  await note('PRESSÃO', `<p><b>${escapeHTML(actor.name)}</b>: ${from} → ${to}.</p>${milestone?`<p>${escapeHTML(milestone)}</p>`:''}`,actor);
}
export async function changeFissure(actor,delta) {
  if(!game.user.isGM || actor.type!=='fissura') return notification('A Fissura é conduzida pelo Narrador.');
  const from=actor.system.stage,to=clamp(from+delta,1,4);
  if(from===to)return;
  if(delta>0 && actor.system.lastAdvancedChapter===chapter()) return notification('Esta Fissura já avançou neste capítulo.');
  if(delta>0 && (actor.system.contained || !actor.system.active)) return notification('Fissura contida ou inativa.');
  const stageLabels={1:'Vestígio',2:'Manifestação',3:'Invasão',4:'Concretização'};
  await actor.update({'system.stage':to,...(delta>0?{'system.lastAdvancedChapter':chapter()}:{})});
  await note('FISSURA',`<p><b>${escapeHTML(actor.name)}</b> avança para <b>${to} — ${stageLabels[to]}</b>.</p><p>${escapeHTML(({1:actor.system.vestige,2:actor.system.manifestation,3:actor.system.invasion,4:actor.system.concretization})[to])}</p>`,actor);
}
export async function createChild(actor,type) {
  if(!own(actor)) return;
  const label={aptidao:'Aptidão',assinatura:'Assinatura',ancora:'Âncora',lei:'Lei',verso:'Verso',correspondencia:'Correspondência',condicao:'Condição',vestigio:'Vestígio',equipamento:'Equipamento'}[type];
  if(!label)return;
  if(actor.type==='retornado') {
    const max={aptidao:4,assinatura:2,ancora:3}[type];
    if(max && actor.items.filter(i=>i.type===type && (type!=='ancora'||!i.system.broken)).length>=max) return notification(`Limite atingido: ${max} ${label}(s).`);
  }
  const name=await promptText(`Nova ${label}`, 'Nome ou frase curta');
  if(!name)return;
  await actor.createEmbeddedDocuments('Item',[{name,type,system:type==='ancora'?{anchorType:'pessoa'}:{}}]);
}
export async function doInteriorization(actor,id) {
  if(!own(actor) || actor.type!=='retornado')return;
  const item=actor.items.get(id);
  if(!item || item.type!=='lei' || item.id!==actor.system.interiorLawId)return notification('Esta Lei não está Interiorizada.');
  if(item.system.usedChapter===chapter())return notification('Interiorização já utilizada neste capítulo.');
  const event=await promptText('Interiorização · Reconhecer Lei Análoga','Qual fenômeno apresenta semelhança com a Lei Interiorizada?');
  if(!event)return;
  await item.update({'system.usedChapter':chapter()});
  await note('INTERIORIZAÇÃO',`<p><b>${escapeHTML(actor.name)} · ${escapeHTML(item.name)}</b></p><p>${escapeHTML(event)}</p><p><em>Narrador: ofereça um Sinal verificável, sem resolver o fenômeno automaticamente.</em></p>`,actor);
}
export async function doSignature(actor,id) {
  if(!own(actor))return;
  const item=actor.items.get(id);
  if(!item || item.type!=='assinatura')return;
  if(item.system.usedChapter===chapter())return notification('Esta Assinatura já foi usada neste capítulo.');
  const observation=await promptText('Ativar Assinatura','Descreva a oportunidade e o Sinal ou informação relevante');
  if(!observation)return;
  await item.update({'system.usedChapter':chapter()});
  await note('ASSINATURA', `<p><b>${escapeHTML(actor.name)} · ${escapeHTML(item.name)}</b></p><p>${escapeHTML(item.system.effect)}</p><p>${escapeHTML(observation)}</p>`,actor);
}
export async function applyTransformation(actor) {
  if(!own(actor)||actor.type!=='retornado')return;
  if(transformationsAvailable(chapter(),actor.system.transformationsClaimed)===0)return notification('Nenhuma Transformação disponível. A cada dois capítulos, uma é liberada.');
  const kinds=[{id:'aptidao',name:'Aprendizado — nova Aptidão'},{id:'assinatura',name:'Despertar — nova Assinatura'},{id:'ancora',name:'Reconciliação — construir Âncora'},{id:'lei',name:'Interiorização — assimilar Lei'}];
  const kind=await selectOne('Transformação', 'Escolha o caminho',kinds);
  if(!kind)return;
  const name=await promptText('Transformação','Nome da Aptidão, Assinatura, Âncora ou Lei');
  if(!name)return;
  const limit={aptidao:4,assinatura:2,ancora:3};
  const count=actor.items.filter(i=>i.type===kind&&(kind!=='ancora'||!i.system.broken)).length;
  if(limit[kind] && count>=limit[kind])return notification('Limite deste tipo atingido.');
  if(kind==='ancora') {
    const anchorsBuilt=actor.items.filter(i=>i.type==='ancora' && i.system.usedChapter===chapter()).length;
    if(anchorsBuilt)return notification('Limite de uma reconstrução por capítulo.');
  }
  if(kind==='lei'){
    const laws=actor.items.filter(i=>i.type==='lei' && i.system.effect==='Interiorizada');
    for(const l of laws) await l.update({'system.effect':'Conhecida'});
  }
  const [created]=await actor.createEmbeddedDocuments('Item',[{name,type:kind,system:{...(kind==='ancora'?{usedChapter:chapter(),anchorType:'pessoa'}:{}),...(kind==='lei'?{effect:'Interiorizada'}:{})}}]);
  await actor.update({'system.transformationsClaimed':actor.system.transformationsClaimed+1,...(kind==='lei'?{'system.interiorLawId':created.id}:{})});
  await note('TRANSFORMAÇÃO',`<p><b>${escapeHTML(actor.name)}</b> escolheu ${escapeHTML(kinds.find(k=>k.id===kind).name)}: <b>${escapeHTML(name)}</b>.</p>`,actor);
}
export async function formStanza(actor) {
  if (!own(actor)) return;
  const verses=actor.items.filter(i=>i.type==='verso' && i.system.evidence?.trim());
  const byRegion=new Map();
  for (const v of verses) {
    const region=(v.system.region||'Região sem nome').trim()||'Região sem nome';
    if(!byRegion.has(region)) byRegion.set(region,[]);
    byRegion.get(region).push(v);
  }
  const regions=[...byRegion].filter(([,items])=>new Set(items.map(v=>v.system.evidence.trim().toLowerCase())).size>=3);
  if (!regions.length) return notification('São necessários três Versos com evidências independentes da mesma região.');
  const region=regions.length===1?regions[0][0]:await selectOne('Compor Estrofe','Região investigada',regions.map(([id])=>({id,name:id})));
  if(!region) return;
  const distinct=new Map();
  for(const v of byRegion.get(region)) distinct.set(v.system.evidence.trim().toLowerCase(),v);
  const selected=[...distinct.values()].slice(-3);
  const laws=[...new Set(selected.map(v=>(v.system.law||'').trim()).filter(Boolean))];
  if(laws.length>1) return notification('Estes Versos mencionam Leis diferentes. Reúna evidências de uma mesma Lei.');
  const hypothesis=await promptText('Estrofe · Hipótese','O que vocês acreditam que acontece, e em quais condições?');
  if(!hypothesis) return;
  const experiment=await promptText('Estrofe · Experimento','Como seus personagens vão testar essa hipótese?');
  if(!experiment) return;
  await note('ESTROFE · HIPÓTESE A TESTAR',
    `<p><b>${escapeHTML(actor.name)} · ${escapeHTML(region)}</b></p><ol>${selected.map(v=>`<li>${escapeHTML(v.name)} — ${escapeHTML(v.system.evidence)}</li>`).join('')}</ol><p><b>Hipótese:</b> ${escapeHTML(hypothesis)}</p><p><b>Experimento:</b> ${escapeHTML(experiment)}</p><p><em>O Narrador responde ao experimento conforme a Lei já estabelecida. A Estrofe não revela automaticamente uma exceção.</em></p>`,actor);
}
export async function shareLaw(actor,lawId) {
  if(!game.user.isGM)return notification('Somente o Narrador registra Leis coletivas.');
  const law=actor.items.get(lawId);if(!law||law.type!=='lei')return;
  const groups=game.actors.filter(a=>a.type==='confluencia');
  const groupId=await selectOne('Compartilhar Lei','Escolha a Confluência',groups.map(a=>({id:a.id,name:a.name})));
  const group=game.actors.get(groupId);if(!group)return;
  await group.createEmbeddedDocuments('Item',[{name:law.name,type:'lei',system:law.system.toObject()}]);
  await note('LEI APRENDIDA',`<p><b>${escapeHTML(group.name)}</b> registrou a Lei <b>${escapeHTML(law.name)}</b>.</p>`);
}
