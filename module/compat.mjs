/** Compatibilidade Foundry VTT 13.348 e v14. */
export const MINIMUM_FOUNDRY = '13.348';

export function supportedGeneration(release = game.release) {
  const generation = Number(release?.generation ?? String(game.version ?? '').split('.')[0]);
  if (Number.isFinite(generation) && generation > 0 && (generation < 13 || generation > 14)) {
    throw new Error("Memento Mori: Réquiem suporta Foundry VTT 13.348 a 14 (encontrada versão " + generation + ").");
  }
  if (!foundry?.abstract?.TypeDataModel || !foundry?.applications?.api?.ApplicationV2 ||
      !foundry?.applications?.apps?.DocumentSheetConfig) {
    throw new Error('API de fichas do Foundry VTT 13.348+ indisponível.');
  }
  return generation;
}

export async function loadSheetPartials(paths) {
  const loader = foundry.applications.handlebars?.loadTemplates ?? globalThis.loadTemplates;
  if (typeof loader !== 'function') throw new Error('Carregador de templates Handlebars não encontrado.');
  return loader(paths);
}
