import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

function mockFoundry13() {
  const callbacks = new Map();
  const registeredSheets = [];
  const registrations = [];
  const templateLoads = [];
  const menu = [];
  class TypeDataModel {}
  class ApplicationV2 {
    async _prepareContext() { return {}; }
    render() { return this; }
  }
  class ActorSheetV2 extends ApplicationV2 {}
  class ItemSheetV2 extends ApplicationV2 {}
  class Field { constructor(options) { this.options = options; } }
  class SchemaField { constructor(fields) { this.fields = fields; } }
  class ArrayField { constructor(field) { this.field = field; } }
  const settings = new Map();
  globalThis.foundry = {
    abstract: { TypeDataModel },
    data: { fields: { StringField: Field, NumberField: Field, BooleanField: Field, SchemaField, ArrayField } },
    documents: { Actor: class Actor {}, Item: class Item {} },
    applications: {
      api: { ApplicationV2, DialogV2: { prompt: async () => null, confirm: async () => false }, HandlebarsApplicationMixin: Base => class extends Base {} },
      sheets: { ActorSheetV2, ItemSheetV2 },
      apps: { DocumentSheetConfig: { registerSheet: (...args) => registeredSheets.push(args) } },
      handlebars: { loadTemplates: async paths => templateLoads.push(...paths) }
    }
  };
  globalThis.Hooks = { once: (name, callback) => callbacks.set(name, callback) };
  globalThis.CONFIG = { Actor: { dataModels: {} }, Item: { dataModels: {} } };
  globalThis.Handlebars = { registerHelper() {} };
  globalThis.game = {
    release: { generation: 13, build: 348 },
    user: { isGM: true },
    settings: {
      register(scope, key, item) { registrations.push([scope, key, item]); settings.set(key, item.default); },
      registerMenu(...args) { menu.push(args); },
      get(scope, key) { return settings.get(key); },
      async set(scope, key, value) { settings.set(key, value); }
    }
  };
  globalThis.ui = { notifications: { warn() {}, info() {} } };
  return { callbacks, registeredSheets, registrations, templateLoads, menu };
}

test('Foundry 13.348: inicializa modelos, fichas, configurações e painel', async () => {
  const mock = mockFoundry13();
  await import('../module/main.mjs');
  await mock.callbacks.get('init')();
  assert.deepEqual(Object.keys(CONFIG.Actor.dataModels), ['retornado', 'confluencia', 'entidade', 'dominio', 'fissura']);
  assert.equal(Object.keys(CONFIG.Item.dataModels).length, 9);
  for (const model of Object.values(CONFIG.Actor.dataModels)) {
    assert.equal(Object.getPrototypeOf(model), foundry.abstract.TypeDataModel);
  }
  assert.equal(mock.registeredSheets.length, 2);
  assert.equal(mock.registeredSheets[0][0], foundry.documents.Actor);
  assert.equal(mock.registeredSheets[1][0], foundry.documents.Item);
  assert.equal(mock.registeredSheets[0][3].makeDefault, true);
  assert.equal(mock.registrations.length, 2);
  assert.equal(mock.menu.length, 1);
  assert.deepEqual(mock.templateLoads, ['systems/memento-mori-requiem/templates/pressure.hbs']);
  assert.equal(CONFIG.Actor.dataModels.retornado.defineSchema().distance.options.max, 6);
  assert.equal(CONFIG.Actor.dataModels.retornado.defineSchema().mourning.options.max, 3);
  mock.callbacks.get('ready')();
  assert.equal(typeof game.memento.openPanel, 'function');
  assert.equal(typeof game.memento.voices, 'function');
});

test('manifesto instala a versão 0.8.2 no Foundry 13.348 a 14', () => {
  const manifest = JSON.parse(fs.readFileSync(new URL('../system.json', import.meta.url), 'utf8'));
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(manifest.compatibility.minimum, '13.348');
  assert.equal(manifest.compatibility.maximum, '14');
  assert.equal(manifest.version, pkg.version);
  assert.equal(manifest.download.endsWith('/v' + manifest.version + '/memento-mori-requiem.zip'), true);
});
