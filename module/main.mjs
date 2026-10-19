import { SYS, chapter, scene, note, escapeHTML } from './services.mjs';
import { supportedGeneration, loadSheetPartials } from './compat.mjs';
import { MMActorSheet, MMItemSheet } from './sheets.mjs';
import { RetornadoData, ConfluenciaData, EntidadeData, DominioData, FissuraData, MementoItemData } from './models.mjs';
import { dialogWill, dialogResonance } from './dialogs.mjs';
import { installStarterContent } from './starter.mjs';

const BaseDashboard=foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2);
export class MementoDashboard extends BaseDashboard {
  static DEFAULT_OPTIONS={id:'memento-mori-dashboard',classes:['memento-mori','mm-dashboard'],position:{width:660,height:570},window:{title:'Memento Mori · Painel do Narrador',resizable:true},actions:{will:MementoDashboard.will,voices:MementoDashboard.voices,nextChapter:MementoDashboard.nextChapter,nextScene:MementoDashboard.nextScene,starter:MementoDashboard.starter,manual:MementoDashboard.manual}};
  static PARTS={main:{template:`systems/${SYS}/templates/dashboard.hbs`}};
  async _prepareContext(options){return {...await super._prepareContext(options),chapter:chapter(),scene:scene()};}
  static async will(){await dialogWill();}
  static async voices(){await dialogResonance();}
  static async nextScene(){if(!game.user.isGM)return;await game.settings.set(SYS,'narrativeScene',scene()+1);await note('NOVA CENA',`<p>A cena narrativa <b>${scene()}</b> começou. Evocar pode ser usado novamente com uma Âncora elegível.</p>`);this.render();}
  static async nextChapter(){if(!game.user.isGM)return;const confirmed=await foundry.applications.api.DialogV2.confirm({window:{title:'Encerrar capítulo'},content:'<p>Um objetivo significativo de campanha foi concluído? O novo capítulo renova Assinaturas, recuperação de Distância e a oportunidade coletiva da Confluência. Fissuras só avançam por decisão do Narrador.</p>'});if(!confirmed)return;await game.settings.set(SYS,'chapter',chapter()+1);await game.settings.set(SYS,'narrativeScene',scene()+1);await note('NOVO CAPÍTULO',`<p>Começa o capítulo <b>${chapter()}</b>.</p>`);this.render();}
  static async starter(){const confirmed=await foundry.applications.api.DialogV2.confirm({window:{title:'Conteúdo inicial'},content:'<p>Criar a aventura <b>A Segunda Lembrança</b> nos Diários, exemplos de domínio, entidade e Fissura em Atores, uma Confluência-modelo e quatro Assinaturas em Itens?</p>'});if(confirmed)await installStarterContent();}
  static manual(){window.open(`systems/${SYS}/docs/manual-v0.8.pdf`,'_blank','noopener');}
}

Hooks.once('init',async()=>{
  supportedGeneration();
  CONFIG.Actor.dataModels.retornado=RetornadoData;
  CONFIG.Actor.dataModels.confluencia=ConfluenciaData;
  CONFIG.Actor.dataModels.entidade=EntidadeData;
  CONFIG.Actor.dataModels.dominio=DominioData;
  CONFIG.Actor.dataModels.fissura=FissuraData;
  for(const type of ['aptidao','assinatura','ancora','lei','verso','correspondencia','condicao','vestigio','equipamento']) CONFIG.Item.dataModels[type]=MementoItemData;
  const dc=foundry.applications.apps.DocumentSheetConfig;
  dc.registerSheet(foundry.documents.Actor,SYS,MMActorSheet,{types:['retornado','confluencia','entidade','dominio','fissura'],makeDefault:true,label:'Ficha Memento Mori'});
  dc.registerSheet(foundry.documents.Item,SYS,MMItemSheet,{types:['aptidao','assinatura','ancora','lei','verso','correspondencia','condicao','vestigio','equipamento'],makeDefault:true,label:'Registro Memento Mori'});
  game.settings.register(SYS,'chapter',{name:'Capítulo da Campanha',scope:'world',config:false,type:Number,default:1});
  game.settings.register(SYS,'narrativeScene',{name:'Cena narrativa (marcador global)',scope:'world',config:false,type:Number,default:1});
  game.settings.registerMenu(SYS,'narrador',{name:'Painel Memento Mori',label:'Abrir painel',hint:'Vontade, moedas, capítulos e conteúdo inicial.',icon:'fa-solid fa-moon',type:MementoDashboard,restricted:true});
  Handlebars.registerHelper('eq',(a,b)=>a===b);
  Handlebars.registerHelper('track',(size,current)=>Array.from({length:Number(size)||0},(_,i)=>i<Number(current)));
  await loadSheetPartials([`systems/${SYS}/templates/pressure.hbs`]);
});
Hooks.once('ready',()=>{
  game.memento={openPanel:()=>new MementoDashboard().render(true),will:()=>dialogWill(),voices:()=>dialogResonance(),chapter,scene,installStarterContent};
  if(game.user.isGM && !game.settings.get(SYS,'chapter')) ui.notifications.info('Memento Mori pronto. Abra Configurações → Painel Memento Mori.');
});
