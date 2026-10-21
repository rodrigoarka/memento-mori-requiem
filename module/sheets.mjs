import { SYS, own, escapeHTML, activeAnchors, availableAnchors, chapter, scene, updateDistance, advanceBell, finishRupture, recoverDistance, travel, changePressure, changeFissure, createChild, doSignature, doInteriorization, applyTransformation, formStanza, shareLaw, notification } from './services.mjs';
import { transformationsAvailable } from './rules.mjs';
import { dialogWill, dialogResonance, sharedTrail } from './dialogs.mjs';
const BaseActor=foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2);
const BaseItem=foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2);

export class MMActorSheet extends BaseActor {
  static DEFAULT_OPTIONS={classes:['memento-mori','mm-sheet'],tag:'form',position:{width:930,height:770},window:{resizable:true},form:{submitOnChange:true,closeOnSubmit:false},actions:{
    switchTab:MMActorSheet.tab, alterDistance:MMActorSheet.alterDistance, returnHome:MMActorSheet.returnHome,
    bell:MMActorSheet.bell, saveAnchor:MMActorSheet.saveAnchor, breakAnchor:MMActorSheet.breakAnchor,
    recover:MMActorSheet.recover, createChild:MMActorSheet.createChild, editChild:MMActorSheet.editChild,
    deleteChild:MMActorSheet.deleteChild, journey:MMActorSheet.journey, rollWill:MMActorSheet.rollWill,
    rollVoices:MMActorSheet.rollVoices, increasePressure:MMActorSheet.increasePressure,
    fissureChange:MMActorSheet.fissureChange, signature:MMActorSheet.signature, interiorize:MMActorSheet.interiorize,
    transformation:MMActorSheet.transformation, stanza:MMActorSheet.stanza,
    rastro:MMActorSheet.rastro, shareLaw:MMActorSheet.shareLaw
  }};
  static PARTS={ main:{template:`systems/${SYS}/templates/actor.hbs`} };
  constructor(options={}){super(options);this._mmTab='essencial';}
  async _prepareContext(options){
    const c=await super._prepareContext(options);const a=this.actor;
    Object.assign(c,{
      actor:a,system:a.system,editable:this.isEditable,tab:this._mmTab,chapter:chapter(),scene:scene(),
      distancePercent:a.type==='retornado'?Math.max(0,Math.min(100,Math.round(Number(a.system.distance||0)*100/6))):0,
      isRetornado:a.type==='retornado',isConfluencia:a.type==='confluencia',isEntidade:a.type==='entidade',isDominio:a.type==='dominio',isFissura:a.type==='fissura',
      aptidoes:a.items.filter(i=>i.type==='aptidao'),assinaturas:a.items.filter(i=>i.type==='assinatura'),ancoras:a.items.filter(i=>i.type==='ancora'),
      leis:a.items.filter(i=>i.type==='lei'),versos:a.items.filter(i=>i.type==='verso'),correspondencias:a.items.filter(i=>i.type==='correspondencia'),
      condicoes:a.items.filter(i=>i.type==='condicao'),vestigios:a.items.filter(i=>i.type==='vestigio'),equipamentos:a.items.filter(i=>i.type==='equipamento'),
      usableAnchors:availableAnchors(a),ruptureAnchor:a.items.get(a.system.rupture?.anchorId),
      unusedOpportunity:a.system.usedChapter!==chapter(),canTransform:a.type==='retornado'&&transformationsAvailable(chapter(),a.system.transformationsClaimed)>0,
      transformationsAvailable:a.type==='retornado'?transformationsAvailable(chapter(),a.system.transformationsClaimed):0,
      isGM:game.user.isGM
    });return c;
  }
  static tab(_e,target){this._mmTab=target.dataset.tab;this.render();}
  static async alterDistance(_e,target){await updateDistance(this.actor,Number(target.dataset.delta),target.dataset.reason||'Mudança declarada.');}
  static async returnHome(_e,target){await travel(this.actor,'return');}
  static async journey(_e,target){await travel(this.actor,target.dataset.type);}
  static async bell(){await advanceBell(this.actor);}
  static async saveAnchor(){await finishRupture(this.actor,true);}
  static async breakAnchor(){if(!game.user.isGM)return notification('A quebra de Âncora é confirmada pelo Narrador.');const yes=await foundry.applications.api.DialogV2.confirm({window:{title:'Quebrar Âncora'},content:'<p>A Âncora foi definitivamente perdida após o Último Retorno?</p>'});if(yes)await finishRupture(this.actor,false);}
  static async recover(_e,target){await recoverDistance(this.actor,target.dataset.id);}
  static async createChild(_e,target){await createChild(this.actor,target.dataset.type);}
  static editChild(_e,target){this.actor.items.get(target.dataset.id)?.sheet.render(true);}
  static async deleteChild(_e,target){const item=this.actor.items.get(target.dataset.id);if(!item||!own(item))return;const ok=await foundry.applications.api.DialogV2.confirm({window:{title:'Apagar registro'},content:`<p>Excluir “${escapeHTML(item.name)}” da ficha?</p>`});if(ok)await item.delete();}
  static async rollWill(){await dialogWill(this.actor.type==='retornado'?this.actor:null);}
  static async rollVoices(){await dialogResonance(this.actor.type==='retornado'?this.actor:null);}
  static async increasePressure(_e,target){await changePressure(this.actor,Number(target.dataset.delta));}
  static async fissureChange(_e,target){await changeFissure(this.actor,Number(target.dataset.delta));}
  static async signature(_e,target){await doSignature(this.actor,target.dataset.id);}
  static async interiorize(_e,target){await doInteriorization(this.actor,target.dataset.id);}
  static async transformation(){await applyTransformation(this.actor);}
  static async stanza(){await formStanza(this.actor);}
  static async rastro(){await sharedTrail(this.actor);}
  static async shareLaw(_e,target){await shareLaw(this.actor,target.dataset.id);}
}

export class MMItemSheet extends BaseItem {
  static DEFAULT_OPTIONS={classes:['memento-mori','mm-sheet','mm-item-sheet'],tag:'form',position:{width:620,height:610},window:{resizable:true},form:{submitOnChange:true,closeOnSubmit:false}};
  static PARTS={main:{template:`systems/${SYS}/templates/item.hbs`}};
  async _prepareContext(options){const c=await super._prepareContext(options);return {...c,item:this.item,system:this.item.system,isAnchor:this.item.type==='ancora',isVerse:this.item.type==='verso',isLaw:this.item.type==='lei',isCorrespondence:this.item.type==='correspondencia',isSignature:this.item.type==='assinatura'};}
}
