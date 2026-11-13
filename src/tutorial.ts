// el tutorial «Cómo jugar» (046): el guion de la partida guiada. Cada paso es «Ver» (pasa con «Siguiente») o «Hacer» (una o
// más acciones del store, en orden). El store solo deja pasar la acción que toca; las viñetas (`ui/coach.ts`) resaltan
// su objetivo. Los números del texto salen de `COST` y `GAIN` (en `es.tutorial`), nunca escritos aquí.
import { es } from './copy/es';
import type { Choice, RecruitableSpecies, SpeciesId } from './rules';

/** Lo que completa una parte de un paso. */
export type Expect =
  /** Paso «Ver»: «Siguiente» o Enter. */
  | { readonly type: 'next' }
  | { readonly type: 'select'; readonly species: SpeciesId }
  /** «Ficha» del miembro elegido. */
  | { readonly type: 'openCard' }
  /** «Entendido» (o la ×, o Esc) de la hoja abierta. */
  | { readonly type: 'closeSheet' }
  | { readonly type: 'tapTile'; readonly x: number; readonly y: number }
  | { readonly type: 'openRecruit' }
  | { readonly type: 'recruit'; readonly species: RecruitableSpecies }
  | { readonly type: 'chooseSpell'; readonly spell: Choice }
  | { readonly type: 'endMonth' }
  /** Cerrar la carta de historia que se abrió (las viñetas se esconden mientras está). */
  | { readonly type: 'closeStory' };

/** Qué resaltar en un paso «Ver» (los pasos «Hacer» resaltan el objetivo de su acción). */
export type Spot =
  | { readonly kind: 'tile'; readonly x: number; readonly y: number }
  | { readonly kind: 'hud' }
  | { readonly kind: 'notice' }
  | { readonly kind: 'help' }
  | { readonly kind: 'member'; readonly species: SpeciesId };

export interface Part {
  readonly expect: Expect;
  readonly text: string;
  /** Solo en los pasos «Ver». */
  readonly spot?: Spot;
}
export interface TutorialStep {
  readonly id: string;
  readonly parts: readonly Part[];
  /** Desde este paso la ★ marca a quién elegir y dónde tocar. */
  readonly star?: boolean;
}

const T = es.tutorial;
const see = (id: string, text: string, spot: Spot, star = false): TutorialStep => ({ id, parts: [{ expect: { type: 'next' }, text, spot }], ...(star ? { star } : {}) });
const doIt = (id: string, ...parts: [Expect, string][]): TutorialStep => ({ id, parts: parts.map(([expect, text]) => ({ expect, text })) });
const pick = (species: SpeciesId): Expect => ({ type: 'select', species });
const tap = (x: number, y: number): Expect => ({ type: 'tapTile', x, y });
const end: Expect = { type: 'endMonth' };
const recruit = (species: RecruitableSpecies): Expect => ({ type: 'recruit', species });
const openRecruit: Expect = { type: 'openRecruit' };

/** Casillas del guion sobre `TUTORIAL_MAP`. */
export const SPOTS = {
  mother: { x: 3, y: 0 },
  homeLog: { x: 1, y: 7 },
  tree1: { x: 2, y: 5 },
  tree2: { x: 3, y: 3 },
  leftLog: { x: 1, y: 4 },
  rightLog: { x: 4, y: 4 },
  rock: { x: 3, y: 2 },
} as const;
const S = SPOTS;

/** El guion completo: se gana en el mes 6 (lo comprueba `tests/tutorial.test.ts`). */
export const TUTORIAL: readonly TutorialStep[] = [
  // Mes 1: elegir, la ficha, descomponer, tejer y terminar el mes.
  see('mother', T.mother, { kind: 'tile', ...S.mother }),
  see('hud', T.hud, { kind: 'hud' }),
  doIt('bruno', [pick('champi'), T.pickBruno], [{ type: 'openCard' }, T.openCard], [{ type: 'closeSheet' }, T.readCard], [tap(S.homeLog.x, S.homeLog.y), T.log]),
  doIt('indi', [pick('lactarius'), T.pickIndi], [tap(2, 6), T.weave]),
  doIt('end1', [end, T.end]),
  // Mes 2: «Ver el mes», revivir y los árboles que dan.
  see('month', T.month2, { kind: 'notice' }),
  doIt('rubi', [pick('amanita'), T.revive], [tap(S.tree1.x, S.tree1.y), T.revive]),
  doIt('bruno2', [pick('champi'), T.logAgain], [tap(S.homeLog.x, S.homeLog.y), T.logAgain]),
  doIt('indi2', [pick('lactarius'), T.weaveOn], [tap(2, 4), T.weaveOn]),
  doIt('end2', [end, T.endGives]),
  // Mes 3: reclutar con esporas.
  doIt('chispa', [openRecruit, T.recruit], [recruit('gliophorus'), T.recruitChispa]),
  doIt('indi3', [pick('lactarius'), T.weaveTree2], [tap(3, 4), T.weaveTree2]),
  doIt('bruno3', [pick('champi'), T.log3], [tap(S.leftLog.x, S.leftLog.y), T.log3]),
  doIt('end3', [end, T.end3]),
  // Mes 4: Chispa pasa la voz y el segundo árbol trae a Maestra Bruma.
  doIt('bruno4', [pick('champi'), T.logGone], [tap(S.leftLog.x, S.leftLog.y), T.logGone]),
  doIt('call', [pick('gliophorus'), T.call], [tap(S.leftLog.x, S.leftLog.y), T.call]),
  doIt('bruno5', [pick('champi'), T.again], [tap(S.rightLog.x, S.rightLog.y), T.again]),
  doIt('rubi2', [pick('amanita'), T.revive2], [tap(S.tree2.x, S.tree2.y), T.revive2]),
  doIt('end4', [end, T.end4]),
  // Mes 5: la carta de Maestra Bruma, su hechizo, Pompón y la Libreta.
  doIt('mage', [{ type: 'closeStory' }, T.mage]),
  doIt('bruma', [pick('mago'), T.pickBruma], [{ type: 'chooseSpell', spell: 'sprout' }, T.sprout], [tap(S.rock.x, S.rock.y), T.sproutRock]),
  doIt('pompon', [openRecruit, T.recruitMore], [recruit('lycoperdon'), T.recruitPompon]),
  doIt('indi4', [pick('lactarius'), T.weaveMother], [tap(3, 1), T.weaveMother]),
  see('help', T.help, { kind: 'help' }),
  doIt('end5', [end, T.end5]),
  // Mes 6: las ★, abonar y despertar al Árbol Ancestral.
  see('star', T.star, { kind: 'member', species: 'lycoperdon' }, true),
  doIt('compost', [pick('lycoperdon'), T.pickPompon], [{ type: 'chooseSpell', spell: 'nutrients' }, T.compost], [tap(S.tree2.x, S.tree2.y), T.compostTree]),
  doIt('wake', [pick('amanita'), T.wake], [tap(S.mother.x, S.mother.y), T.wake]),
];

/** Dónde va el tutorial: paso y parte del paso. */
export interface TutorialState {
  readonly step: number;
  readonly part: number;
}
export const TUTORIAL_START: TutorialState = { step: 0, part: 0 };

export const currentPart = (t: TutorialState): Part | undefined => TUTORIAL[t.step]?.parts[t.part];

/** Siguiente parte; `null` al terminar el guion. */
export function nextPart(t: TutorialState): TutorialState | null {
  const step = TUTORIAL[t.step];
  if (step && t.part + 1 < step.parts.length) return { step: t.step, part: t.part + 1 };
  return t.step + 1 < TUTORIAL.length ? { step: t.step + 1, part: 0 } : null;
}

/** ¿Ya se enseñó la ★? Desde ese paso, la ★ marca lo que pide el guion. */
export const starsOn = (t: TutorialState): boolean => TUTORIAL.findIndex((s) => s.star) <= t.step;

/** Especie que el guion pide elegir en el paso actual (para la ★), si hay. */
export function scriptedSpecies(t: TutorialState): SpeciesId | null {
  const step = TUTORIAL[t.step];
  const sel = step?.parts.find((p) => p.expect.type === 'select');
  return sel?.expect.type === 'select' ? sel.expect.species : step?.parts[0]?.spot?.kind === 'member' ? step.parts[0].spot.species : null;
}

/** Casilla que el guion pide tocar en el paso actual (para la ★), si hay. */
export function scriptedTile(t: TutorialState): { x: number; y: number } | null {
  const tapPart = TUTORIAL[t.step]?.parts.find((p) => p.expect.type === 'tapTile');
  return tapPart?.expect.type === 'tapTile' ? { x: tapPart.expect.x, y: tapPart.expect.y } : null;
}
