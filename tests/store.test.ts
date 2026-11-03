import { describe, expect, it } from 'vitest';
import { es } from '../src/copy/es';
import { idleReason, newGame, tile } from '../src/rules';
import { createStore, highlighted, initialState, reduce, suggestedMember, suggestedTile, type AppState } from '../src/store';
import type { GameState, SpeciesId } from '../src/rules';

// Fichas ya vistas: estos escenarios (002) no prueban la ficha al seleccionar (005).
const ALL: SpeciesId[] = ['champi', 'lactarius', 'amanita', 'gliophorus', 'mago'];
const init = (g?: GameState) => initialState(g, ALL);
import { INDI, BRUNO, idOf, RUBI, setup } from './helpers';

const pts = (s: AppState) => highlighted(s).map(({ x, y }) => ({ x, y }));
const run = (s: AppState, ...actions: Parameters<typeof reduce>[1][]) => actions.reduce(reduce, s);

describe('Requirement: Selección de miembro', () => {
  it('Scenario: Tejedor al inicio — se resaltan las tierras adyacentes al Hogar y ninguna otra', () => {
    const s = run(init(), { type: 'select', id: INDI });
    expect(pts(s)).toEqual([
      { x: 2, y: 6 },
      { x: 3, y: 7 },
    ]);
    expect(s.ui.notice).toEqual({ text: es.hints.pickTile('Indi'), tone: 'info' });
  });

  it('Scenario: Deseleccionar — tocar de nuevo o Esc no deja selección ni resaltado', () => {
    const selected = run(init(), { type: 'select', id: INDI });
    for (const again of [run(selected, { type: 'select', id: INDI }), run(selected, { type: 'cancel' })]) {
      expect(again.ui.selected).toBeNull();
      expect(pts(again)).toEqual([]);
    }
  });

  it('tocar una casilla resaltada ejecuta la acción y limpia la selección', () => {
    const s = run(init(), { type: 'select', id: INDI }, { type: 'tapTile', x: 3, y: 7 });
    expect(tile(s.game, 3, 7)?.net).toBe(true);
    expect(s.game.nutrients).toBe(1);
    expect(s.ui.selected).toBeNull();
    expect(s.ui.notice.text).toBe(es.log.wove('Indi'));
  });
});

describe('Requirement: Hechizos dla maga', () => {
  const withMage = () => init(setup({ mage: true, net: [{ x: 3, y: 6 }], alive: [{ x: 4, y: 6 }] }));

  it('al seleccionar a Maestra Bruma se pide primero el hechizo y no se resalta nada', () => {
    const s0 = withMage();
    const s = run(s0, { type: 'select', id: idOf(s0.game, 'mago') });
    expect(s.ui.sheet).toEqual({ kind: 'spell' });
    expect(pts(s)).toEqual([]);
  });

  it('Scenario: Elegir Brote arcano — se resaltan solo las rocas adyacentes a la red', () => {
    const s0 = withMage();
    const s = run(s0, { type: 'select', id: idOf(s0.game, 'mago') }, { type: 'chooseSpell', spell: 'sprout' });
    expect(s.ui.sheet).toBeNull();
    expect(highlighted(s).every((t) => t.kind === 'rock')).toBe(true);
    expect(pts(s)).toEqual([{ x: 3, y: 5 }]);
  });

  it('Lluvia de esporas resalta solo árboles vivos', () => {
    const s0 = withMage();
    const s = run(s0, { type: 'select', id: idOf(s0.game, 'mago') }, { type: 'chooseSpell', spell: 'rain' });
    expect(pts(s)).toEqual([{ x: 4, y: 6 }]);
  });

  it('Scenario: Magia agotada — no pide hechizo y avisa que su magia vuelve con la próxima estación', () => {
    const s0 = init(setup({ mage: true, alive: [{ x: 4, y: 6 }], lastSpellSeason: 0 }));
    const s = run(s0, { type: 'select', id: idOf(s0.game, 'mago') });
    expect(s.ui.sheet).toBeNull();
    expect(s.ui.notice.text).toBe('Maestra Bruma: su magia vuelve con la próxima estación.');
  });
});

describe('Requirement: Feedback de acción inválida', () => {
  it('Scenario: Toque en una casilla no válida — motivo exacto de check() y el miembro sigue seleccionado', () => {
    const s = run(init(), { type: 'select', id: INDI }, { type: 'tapTile', x: 0, y: 0 });
    expect(s.ui.notice).toEqual({ text: 'Muy lejos: la tierra debe tocar la red.', tone: 'warn' });
    expect(s.ui.selected).toBe(INDI);
  });

  // Mapa vertical: el único tronco junto al Hogar es (1, 7); si ya es tierra, no hay troncos junto a la red.
  const noLogs = () => {
    const g = setup();
    return { ...g, tiles: g.tiles.map((t) => (t.x === 1 && t.y === 7 ? { ...t, kind: 'soil' as const } : t)) };
  };

  it('Scenario: Sin trabajo disponible (Champiñón)', () => {
    const s = run(init(noLogs()), { type: 'select', id: BRUNO });
    expect(s.ui.notice.text).toBe('Bruno: no hay troncos junto a la red. Teje hacia uno.');
  });

  it('Scenario: Sin trabajo disponible (Lactarius indigo)', () => {
    const s = run(init(setup({ nutrients: 0 })), { type: 'select', id: INDI });
    expect(s.ui.notice.text).toBe('Indi: faltan nutrientes.');
  });

  it('Scenario: Sin trabajo disponible (Amanita muscaria)', () => {
    const s = run(init(setup({ nutrients: 9 })), { type: 'select', id: RUBI });
    expect(s.ui.notice.text).toBe('Rubí: no hay árboles grises junto a la red.');
  });

  it('Scenario: Sin trabajo disponible (Gliophorus psittacinus)', () => {
    // Chispa recién reclutada; al mes siguiente Bruno trabaja y no quedan esporas para pasarle la voz.
    const withChispa = reduce(init(setup({ spores: 2 })), { type: 'recruit', species: 'gliophorus' }).game;
    const nextMonth = run(init(withChispa), { type: 'endMonth' }, { type: 'select', id: BRUNO }, { type: 'tapTile', x: 1, y: 7 }).game;
    const s = run(init(nextMonth), { type: 'select', id: idOf(nextMonth, 'gliophorus') });
    expect(s.ui.notice.text).toBe('Chispa: falta 1 espora: pasar la voz cuesta 1.');
  });

  it('Scenario: Sin trabajo disponible (Maestra Bruma)', () => {
    const g = setup({ mage: true, alive: [{ x: 4, y: 6 }], lastSpellSeason: 0 });
    const s = run(init(g), { type: 'select', id: idOf(g, 'mago') });
    expect(s.ui.notice.text).toBe('Maestra Bruma: su magia vuelve con la próxima estación.');
  });

  it('idleReason cubre las claves restantes de la tabla y devuelve null si hay trabajo', () => {
    // Toda la tierra convertida en roca: el Lactarius no tiene dónde tejer.
    const noSoil = { ...newGame(), tiles: newGame().tiles.map((t) => (t.kind === 'soil' ? { ...t, kind: 'rock' as const } : t)) };
    expect(idleReason(noSoil, INDI)).toBe('noSoil');
    expect(idleReason(setup({ nutrients: 1 }), RUBI)).toBe('noNutrients');
    const glio = setup({ extraMembers: ['gliophorus'] });
    expect(idleReason(glio, idOf(glio, 'gliophorus'))).toBe('noWorkers');
    expect(idleReason(newGame(), INDI)).toBeNull();
  });
});

describe('Requirement: Estado visible', () => {
  it('Scenario: Tras una acción — los nutrientes se actualizan y los suscriptores se enteran', () => {
    const store = createStore();
    const seen: number[] = [];
    store.subscribe((s) => seen.push(s.game.nutrients));
    store.dispatch({ type: 'select', id: BRUNO });
    store.dispatch({ type: 'tapTile', x: 1, y: 7 });
    expect(store.getState().game.nutrients).toBe(4);
    expect(seen.at(-1)).toBe(4);
  });
});

describe('store: reclutar, terminar el mes y fin de partida', () => {
  it('reclutar con esporas usa las reglas; sin esporas avisa el motivo', () => {
    const ok = reduce(init(setup({ spores: 2 })), { type: 'recruit', species: 'gliophorus' });
    expect(ok.game.members.at(-1)?.name).toBe('Chispa');
    const no = reduce(init(), { type: 'recruit', species: 'gliophorus' });
    expect(no.ui.notice).toEqual({ text: es.reasons.recruitCost(2), tone: 'warn', short: 'spores' });
  });

  it('terminar el mes avanza el mes y muestra el cambio de mes', () => {
    const s = reduce(init(), { type: 'endMonth' });
    expect(s.game.month).toBe(2);
    expect(s.ui.notice.text).toContain('Empieza el mes 2.');
  });

  it('con la partida terminada no se puede seleccionar ni actuar', () => {
    const lost = reduce(init(setup({ month: 12 })), { type: 'endMonth' });
    expect(lost.game.status).toBe('lost');
    expect(reduce(lost, { type: 'select', id: INDI })).toBe(lost);
    expect(reduce(lost, { type: 'endMonth' })).toBe(lost);
  });

  it('un miembro cansado no queda seleccionado y se avisa', () => {
    const s = run(init(setup({ used: [INDI] })), { type: 'select', id: INDI });
    expect(s.ui.selected).toBeNull();
    expect(s.ui.notice).toEqual({ text: es.reasons.tired('Indi'), tone: 'warn' });
  });
});

describe('Requirement: Pista y camino sugerido · Ancestral sin pistas (019)', () => {
  const ancestral = (): AppState => initialState({ ...newGame(), level: 'ancestral' });

  it('Scenario: Ancestral sin pistas — sin ★ en el dock ni en el tablero, y la bitácora no dice «Pista:»', () => {
    const s = ancestral();
    expect(suggestedMember(s)).toBeNull();
    expect(s.ui.notice.text).not.toMatch(/Pista/);
    const picked = reduce(s, { type: 'select', id: BRUNO });
    expect(suggestedTile(picked)).toBeNull();
    expect(picked.ui.notice.text).not.toMatch(/★/);
    expect(highlighted(picked).length).toBeGreaterThan(0);
  });

  it('en Bosque las pistas siguen', () => {
    const s = initialState({ ...newGame(), level: 'bosque' });
    expect(suggestedMember(s)).toBe(BRUNO);
    expect(s.ui.notice.text).toMatch(/^Pista:/);
  });

  it('Scenario: Aviso del árbol marcado — al empezar el mes 6 en Bosque la bitácora lo dice, y tocarlo explica su estado', () => {
    let s = initialState({ ...setup({ month: 5 }), level: 'bosque' });
    s = reduce(s, { type: 'endMonth' });
    expect(s.ui.notice.text).toContain(es.log.treeFading);
    const marked = s.game.tiles.find((t) => t.fading)!;
    expect(reduce(s, { type: 'tapTile', x: marked.x, y: marked.y }).ui.notice.text).toBe(es.tileHelp.treeFading);
  });

  it('Scenario: Aviso de escarcha — al empezar el mes 7 en Ancestral (sin pistas) la bitácora avisa', () => {
    const s = reduce(initialState({ ...setup({ month: 6 }), level: 'ancestral' }), { type: 'endMonth' });
    expect(s.ui.notice.text).toContain('Llegó la escarcha: tejer cuesta 2 nutrientes.');
  });
});

describe('Requirement: Cerrar capas (022)', () => {
  it('Scenario: Tocar una casilla con la ficha abierta — se cierra y la jugada cuenta', () => {
    const open = run(init(), { type: 'select', id: BRUNO }, { type: 'openSheet', sheet: { kind: 'member', id: BRUNO } });
    const s = run(open, { type: 'tapTile', x: 1, y: 7 });
    expect(s.ui.sheet).toBeNull();
    expect(s.game.members.find((m) => m.id === BRUNO)?.used).toBe(true);
  });

  it('Scenario: Maestra Bruma con Esc — su ficha se cierra, queda sin seleccionar y no se piden hechizos', () => {
    const g = setup({ mage: true, alive: [{ x: 4, y: 6 }] });
    const mage = idOf(g, 'mago');
    const card = run(init(g), { type: 'select', id: mage }, { type: 'openSheet', sheet: { kind: 'member', id: mage } });
    const esc = run(card, { type: 'cancel' });
    expect(esc.ui.sheet).toBeNull();
    expect(esc.ui.selected).toBeNull();
    // "Entendido" (cerrar la hoja) sí pide el hechizo.
    expect(run(card, { type: 'closeSheet' }).ui.sheet).toEqual({ kind: 'spell' });
  });

  it('Esc en la ficha de un miembro la cierra y lo deja seleccionado', () => {
    const s = run(init(), { type: 'select', id: BRUNO }, { type: 'openSheet', sheet: { kind: 'member', id: BRUNO } }, { type: 'cancel' });
    expect(s.ui.sheet).toBeNull();
    expect(s.ui.selected).toBe(BRUNO);
  });
});

describe('Requirement: Rechazo en el lugar del toque (022)', () => {
  it('Scenario: Sin nutrientes — la bitácora dice qué recurso falta', () => {
    const s = run(init(setup({ nutrients: 0 })), { type: 'select', id: INDI });
    expect(s.ui.notice).toMatchObject({ tone: 'warn', short: 'nutrients' });
  });

  it('un toque inválido por distancia no culpa a ningún recurso', () => {
    const s = run(init(), { type: 'select', id: INDI }, { type: 'tapTile', x: 0, y: 0 });
    expect(s.ui.notice.tone).toBe('warn');
    expect(s.ui.notice.short).toBeUndefined();
  });

  it('revivir sin nutrientes suficientes culpa a los nutrientes', () => {
    const g = setup({ nutrients: 2, net: [{ x: 2, y: 6 }, { x: 2, y: 5 }] });
    const tree = g.tiles.find((t) => t.kind === 'tree' && !t.alive && Math.abs(t.x - 2) + Math.abs(t.y - 5) === 1);
    if (!tree) return;
    const s = run(init(g), { type: 'select', id: RUBI }, { type: 'tapTile', x: tree.x, y: tree.y });
    expect(s.ui.notice).toMatchObject({ tone: 'warn', short: 'nutrients' });
  });
});
