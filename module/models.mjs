/** Foundry v13.348/v14 TypeDataModels: nenhum template.json legado. */
const F = foundry.data.fields;
const s = (initial = "") => new F.StringField({ required: true, blank: true, initial });
const n = (initial = 0, max = 9999) => new F.NumberField({ required: true, integer: true, min: 0, max, initial });
const b = (initial = false) => new F.BooleanField({ required: true, initial });

export class RetornadoData extends foundry.abstract.TypeDataModel {
  static defineSchema() { return {
    profession: s(), biography: s(), firstMemory: s(), incompleteness: s(), impression: s(), emptyPlace: s(),
    abilities: new F.SchemaField({ lucidez:n(2,2), pulso:n(1,2), elo:n(1,2), firmeza:n(0,2) }),
    distance:n(0,6), mourning:n(0,3), omenAnchorId:s(), drift:b(),
    rupture:new F.SchemaField({ active:b(), bell:n(0,3), anchorId:s(), notes:s() }),
    journey:new F.SchemaField({ active:b(), deepest:n(0,99), entered:b() }),
    recovery:new F.SchemaField({ chapter:n(0), count:n(0,2), anchorIds:new F.ArrayField(s()) }),
    transformationsClaimed:n(0), interiorLawId:s(), notes:s()
  }; }
}
export class ConfluenciaData extends foundry.abstract.TypeDataModel {
  static defineSchema() { return { commonVerse:s(), members:s(), notes:s(), usedChapter:n(0), lastTrail:s(), lawsKnown:s(), routes:s() }; }
}
export class EntidadeData extends foundry.abstract.TypeDataModel {
  static defineSchema() { return { nature:s(), intention:s(), law:s(), limitation:s(), signs:s(), consequence:s(), pressure:n(0,4), pressure1:s(), pressure2:s(), pressure3:s(), pressure4:s(), notes:s() }; }
}
export class DominioData extends foundry.abstract.TypeDataModel {
  static defineSchema() { return { appearance:s(), objective:s(), signals:s(), law:s(), exception:s(), cost:s(), opposition:s(), routes:s(), returnMark:s(), matrixBody:s(), matrixMemory:s(), matrixVeil:s(), pressure:n(0,4), pressure1:s(), pressure2:s(), pressure3:s(), pressure4:s(), notes:s() }; }
}
export class FissuraData extends foundry.abstract.TypeDataModel {
  static defineSchema() { return { origin:s(), status:s(), signs:s(), stage:n(1,4), active:b(true), contained:b(), vestige:s(), manifestation:s(), invasion:s(), concretization:s(), lastAdvancedChapter:n(0), notes:s() }; }
}
export class MementoItemData extends foundry.abstract.TypeDataModel {
  static defineSchema() { return {
    description:s(), effect:s(), trigger:s(), condition:s(), law:s(), exception:s(), evidence:s(), gesture:s(), returnMark:s(),
    anchorType:s(), broken:b(), reclaimed:b(), lastEvokedScene:n(0), usedChapter:n(0),
    links:s(), region:s(), notes:s()
  }; }
}
