/** Regras puras e testáveis baseadas no manual Memento Mori: Réquiem v0.8. */
export const VOICES = ["corpo", "memoria", "veu"];
export const LABELS = ["Silêncio", "Sussurro", "Encontro", "Convergência"];
export const KEYS = ["lucidez", "pulso", "elo", "firmeza"];
export const MAX_DISTANCE = 6;
export const MAX_MOURNING = 3;
export const MAX_PRESSURE = 4;
export const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));

export function resolveWill({ ability = 0, preparation = 0, knowledge = 0, resistance = 0, conditionMet = true }) {
  const reach = clamp(ability, 0, 2) + (preparation ? 1 : 0) + (knowledge ? 1 : 0);
  const difficulty = clamp(resistance, 0, 4);
  if (!conditionMet) return { reach, resistance: difficulty, state: "condition", gap: null };
  const gap = difficulty - reach;
  return { reach, resistance: difficulty, gap, state: gap <= 0 ? "success" : gap === 1 ? "price" : "insufficient" };
}

export function resolveVoices(faces) {
  if (!Array.isArray(faces) || faces.length !== 3) throw new Error("São necessárias três moedas.");
  const awake = VOICES.filter((_, i) => Boolean(faces[i]));
  return { faces: faces.map(Boolean), awake, count: awake.length, label: LABELS[awake.length], probability: 0.125 };
}
export function tossVoices(random = Math.random) {
  return resolveVoices([random() < 0.5, random() < 0.5, random() < 0.5]);
}
export function flipVoice(faces, voice) {
  const index = VOICES.indexOf(voice);
  if (index < 0) throw new Error("Voz inválida.");
  const changed = [...faces]; changed[index] = !changed[index];
  return resolveVoices(changed);
}
export function allowInvoke(faces, distance, activeAnchors, usedThisScene) {
  return !faces[1] && distance < 6 && activeAnchors > 0 && !usedThisScene;
}
export function allowContain(faces, currentPressure) {
  return faces.some(Boolean) && Number.isInteger(currentPressure) && currentPressure >= 0 && currentPressure < 4;
}
export function allowSync(selectedVoice, currentUsedChapter, chapter, distanceA, distanceB) {
  return VOICES.includes(selectedVoice) && currentUsedChapter !== chapter && distanceA < 6 && distanceB < 6;
}
export function rupturedAfterChange(distance, delta) {
  const before = clamp(distance, 0, 6); const after = clamp(before + delta, 0, 6);
  return { before, after, omen: before < 5 && after >= 5, rupture: before < 6 && after === 6 };
}
export function fateAfterBreak({ mourning, activeAnchors }) {
  const totalMourning = clamp(mourning + 1, 0, 3);
  return { mourning: totalMourning, drift: totalMourning === 3 || activeAnchors <= 0, distance: totalMourning === 3 || activeAnchors <= 0 ? 6 : 0 };
}
export function chanceAtLeastOneConvergence(n) { return 1 - (7 / 8) ** n; }
export function transformationsAvailable(chapter, claimed) { return Math.max(0, Math.floor((Math.max(1, chapter) - 1) / 2) - Math.max(0, claimed)); }
export function canRecover({ chapter, recoveryChapter, recoveryCount, usedAnchors, anchorId, distance }) {
  if (distance <= 0) return false;
  if (recoveryChapter !== chapter) return true;
  return recoveryCount < 2 && !usedAnchors.includes(anchorId);
}
