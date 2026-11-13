// «Primeros pasos» (046): tutorial › Nivel Primeros pasos, Viñetas paso a paso, Saltar el tutorial, Final del tutorial.
import { describe, expect, it } from 'vitest';
import { es } from '../src/copy/es';
import { LEVEL_IDS, LEVELS, newRandomGame, rankedSeed, type GameState } from '../src/rules';
import { initialState, reduce, suggestedMember, type Action, type AppState } from '../src/store';
import { currentPart, TUTORIAL, type Expect } from '../src/tutorial';

const start = (): AppState => initialState(newRandomGame(0, 'tutorial'));
const idOf = (g: GameState, species: string) => g.members.find((m) => m.species === species)!.id;

/** La acción que cumple una parte del guion. */
function actionFor(e: Expect, s: AppState): Action {
  switch (e.type) {
    case 'next':
      return { type: 'tutorialNext' };
    case 'select':
      return { type: 'select', id: idOf(s.game, e.species) };
    case 'openCard':
      return { type: 'openSheet', sheet: { kind: 'member', id: s.ui.selected! } };
    case 'closeSheet':
      return { type: 'closeSheet' };
    case 'tapTile':
      return { type: 'tapTile', x: e.x, y: e.y };
    case 'openRecruit':
      return { type: 'openSheet', sheet: { kind: 'recruit' } };
    case 'recruit':
      return { type: 'recruit', species: e.species };
    case 'chooseSpell':
      return { type: 'chooseSpell', spell: e.spell };
    case 'endMonth':
      return { type: 'endMonth' };
    case 'closeStory':
      return { type: 'closeStory' };
  }
}

/** Juega el guion completo; devuelve cada estado intermedio. */
function playScript(): AppState[] {
  let s = start();
  const seen = [s];
  for (let guard = 0; s.ui.tutorial && guard < 500; guard++) {
    const part = currentPart(s.ui.tutorial)!;
    const next = reduce(s, actionFor(part.expect, s));
    expect(next.ui.tutorial, `paso ${s.ui.tutorial.step + 1} (${TUTORIAL[s.ui.tutorial.step]!.id}): ${next.ui.notice.text}`).not.toEqual(s.ui.tutorial);
    s = next;
    seen.push(s);
  }
  return seen;
}

describe('Requirement: Nivel Primeros pasos', () => {
  it('claro fijo, Árbol Ancestral de 2 árboles, sin escarcha, apagados, hambre ni plaga', () => {
    const L = LEVELS.tutorial;
    expect([L.motherTrees, L.frost, L.fading, L.upkeep, L.plague, L.rooted]).toEqual([2, [], [], [], [], false]);
    expect(newRandomGame(123, 'tutorial').tiles).toEqual(newRandomGame(0, 'tutorial').tiles);
    expect(newRandomGame(0, 'tutorial').mapId).toBe('tutorial');
  });

  it('Scenario: Se gana siguiendo el guion — despierta al Árbol Ancestral en el mes 6', () => {
    const end = playScript().at(-1)!;
    expect(end.game.status).toBe('won');
    expect(end.game.wonMonth).toBe(6);
    expect(end.ui.tutorial).toBeNull();
  });

  it('enseña todo lo pedido: reclutar a Chispa y Pompón, pasar la voz, el hechizo y abonar', () => {
    const end = playScript().at(-1)!;
    const species = end.game.members.map((m) => m.species);
    expect(species).toEqual(expect.arrayContaining(['gliophorus', 'lycoperdon', 'mago']));
    const spells = end.game.log.flatMap((a) => (a.type === 'act' && a.spell ? [a.spell] : []));
    expect(spells).toEqual(['sprout', 'nutrients']);
    const chispa = idOf(end.game, 'gliophorus');
    expect(end.game.log.some((a) => a.type === 'act' && a.memberId === chispa)).toBe(true);
  });

  it('Scenario: Sin puntaje — el tutorial no entra al ranking ni da multiplicador', () => {
    expect(LEVEL_IDS).not.toContain('tutorial');
    expect(rankedSeed('tutorial', 'tutorial')).toBeNull();
    expect(LEVELS.tutorial.multiplier).toBe(0);
  });
});

describe('Requirement: Viñetas paso a paso', () => {
  it('Scenario: Paso Ver — el tablero no responde y «Siguiente» avanza', () => {
    const s = start();
    expect(TUTORIAL[0]!.parts[0]!.expect).toEqual({ type: 'next' });
    expect(reduce(s, { type: 'tapTile', x: 3, y: 0 })).toBe(s);
    expect(reduce(s, { type: 'select', id: idOf(s.game, 'champi') })).toBe(s);
    expect(reduce(s, { type: 'tutorialNext' }).ui.tutorial).toEqual({ step: 1, part: 0 });
  });

  it('Scenario: Paso Hacer — solo Bruno responde y al elegirlo pasa al paso siguiente', () => {
    let s = start();
    s = reduce(reduce(s, { type: 'tutorialNext' }), { type: 'tutorialNext' });
    expect(currentPart(s.ui.tutorial!)!.text).toBe(es.tutorial.pickBruno);
    for (const sp of ['lactarius', 'amanita']) expect(reduce(s, { type: 'select', id: idOf(s.game, sp) })).toBe(s);
    expect(reduce(s, { type: 'endMonth' })).toBe(s);
    expect(reduce(s, { type: 'openSheet', sheet: { kind: 'recruit' } })).toBe(s);
    expect(reduce(s, { type: 'cancel' })).toBe(s);
    const picked = reduce(s, { type: 'select', id: idOf(s.game, 'champi') });
    expect(picked.ui.selected).toBe(idOf(s.game, 'champi'));
    expect(picked.ui.tutorial).toEqual({ step: 2, part: 1 });
  });

  it('una casilla distinta de la del guion no juega', () => {
    const states = playScript();
    const at = states.find((s) => s.ui.tutorial && currentPart(s.ui.tutorial)?.expect.type === 'tapTile' && s.ui.selected !== null)!;
    expect(reduce(at, { type: 'tapTile', x: 0, y: 0 })).toBe(at);
  });

  it('la intro se pasa como siempre antes del primer paso', () => {
    const s = initialState(newRandomGame(0, 'tutorial'), [], { intro: true });
    expect(s.ui.story).toEqual({ kind: 'intro', step: 0 });
    const next = reduce(s, { type: 'storyNext' });
    expect(next.ui.story).toEqual({ kind: 'intro', step: 1 });
    expect(reduce(next, { type: 'closeStory' }).ui.story).toBeNull();
    expect(reduce(next, { type: 'tutorialNext' })).toBe(next);
  });

  it('la ★ aparece recién en su paso y marca lo que pide el guion', () => {
    const states = playScript();
    const starAt = TUTORIAL.findIndex((st) => st.star);
    for (const s of states) {
      if (!s.ui.tutorial) continue;
      const m = suggestedMember(s);
      if (s.ui.tutorial.step < starAt) expect(m).toBeNull();
      else expect(m).not.toBeNull();
    }
  });
});

describe('Requirement: Saltar el tutorial', () => {
  it('Scenario: Saltar — vuelve a «Elige tu dificultad»', () => {
    const s = reduce(start(), { type: 'tutorialSkip' });
    expect(s.ui.screen).toEqual({ kind: 'level' });
    expect(s.ui.tutorial).toBeNull();
  });
});

describe('Requirement: Final del tutorial', () => {
  it('Scenario: Terminar — aparece «¡Ya sabes jugar!» y no la carta de victoria', () => {
    const end = playScript().at(-1)!;
    expect(end.ui.story).toEqual({ kind: 'tutorial' });
    const closed = reduce(end, { type: 'closeStory' });
    expect(reduce(closed, { type: 'showEnd' }).ui.story).toEqual({ kind: 'tutorial' });
  });

  it('«Jugar Brote» empieza una partida sin tutorial', () => {
    const end = playScript().at(-1)!;
    const s = reduce(end, { type: 'start', game: newRandomGame(5, 'brote'), intro: false });
    expect(s.ui.tutorial).toBeNull();
    expect(s.ui.story).toBeNull();
  });
});
