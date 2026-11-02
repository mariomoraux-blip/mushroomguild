import { describe, expect, it } from 'vitest';
import { es } from '../src/copy/es';
import { act, advise, newGame, recruitPick, weaveGoal } from '../src/rules';
import { highlighted, idleHint, initialState, reduce, suggestedMember, suggestedTile } from '../src/store';
import { ANIL, BRUNO, idOf, RUBI, setup } from './helpers';

const at = (t: { x: number; y: number } | null) => (t ? { x: t.x, y: t.y } : null);

describe('Requirement: Pista y camino sugerido', () => {
  it('Scenario: Primer paso — Bruno descompone el tronco junto a la red y lleva la ★', () => {
    const s = initialState(newGame());
    expect(s.ui.notice.text).toBe('Pista: Bruno puede descomponer un tronco junto a la red (+2 nutrientes).');
    expect(suggestedMember(s)).toBe(BRUNO);
  });

  it('Scenario: Camino hacia un árbol — la ★ de Añil es la tierra que acerca la red al árbol gris más cercano', () => {
    const afterLog = act(newGame(), BRUNO, 1, 7).state;
    expect(weaveGoal(afterLog)).toMatchObject({ toward: 'tree', goal: { x: 2, y: 5 } });
    const s = reduce(initialState(afterLog), { type: 'select', id: ANIL });
    expect(at(suggestedTile(s))).toEqual({ x: 2, y: 6 });
    expect(s.ui.notice.text).toBe(es.advice.pickTile('Añil'));
  });

  it('con 3 árboles revividos, tejer apunta al Árbol Padre', () => {
    const s = setup({ alive: [{ x: 4, y: 6 }, { x: 2, y: 5 }, { x: 0, y: 3 }] });
    expect(weaveGoal(s)).toMatchObject({ toward: 'mother', goal: { x: 2, y: 0 } });
  });

  it('Scenario: Nadie más puede trabajar — invita a terminar el día', () => {
    const s = setup({ used: [ANIL, BRUNO, RUBI] });
    expect(advise(s)).toEqual({ kind: 'endDay' });
    expect(idleHint(s).text).toBe(es.advice.endDay);
    expect(es.advice.endDay).toContain('cada árbol vivo dará 1 espora y 1 nutriente');
  });

  it('prioridad: despertar al Árbol Padre antes que revivir, y revivir antes que reclutar o descomponer', () => {
    const ready = setup({ net: [{ x: 2, y: 1 }], alive: [{ x: 4, y: 6 }, { x: 1, y: 0 }, { x: 0, y: 3 }], nutrients: 13, spores: 4 });
    expect(advise(ready)).toMatchObject({ kind: 'awaken', memberId: RUBI, target: { x: 2, y: 0 } });
    const revive = setup({ net: [{ x: 3, y: 6 }], nutrients: 3, spores: 4 });
    expect(advise(revive)).toMatchObject({ kind: 'revive', memberId: RUBI });
  });

  it('Scenario: Pasar la voz a la Sanadora — si Rubí podría revivir otro árbol, la ★ va donde trabajó', () => {
    // Rubí revive (4, 6); quedan nutrientes y otro árbol gris vecino a la red.
    const g = setup({ extraMembers: ['gliophorus'], net: [{ x: 3, y: 6 }, { x: 2, y: 6 }], nutrients: 6, spores: 1, used: [ANIL, BRUNO] });
    const s = act(g, RUBI, 4, 6).state;
    const a = advise(s);
    expect(a).toMatchObject({ kind: 'call', memberId: idOf(s, 'gliophorus'), calledId: RUBI, target: { x: 4, y: 6 } });
    expect(idleHint(s).text).toBe(es.advice.call('extra-4', 'Rubí'));
  });

  it('la maga sugiere Brote arcano antes que Lluvia', () => {
    const mage = setup({ mage: true, net: [{ x: 3, y: 6 }], used: [ANIL, BRUNO, RUBI] });
    expect(advise(mage)).toMatchObject({ kind: 'spell', spell: 'sprout', target: { x: 3, y: 5 } });
  });
});

describe('Requirement: Para qué sirve cada hongo', () => {
  it('Scenario: Tarjeta de el Tejedor — rol y acción con costo', () => {
    expect(es.species.lactarius.role).toBe('Tejedor');
    expect(es.species.lactarius.action).toBe('Teje · −1 nutriente');
  });

  it('Scenario: Tocar un tronco — sin selección, la bitácora explica la casilla', () => {
    const s = reduce(initialState(), { type: 'tapTile', x: 1, y: 7 });
    expect(s.ui.notice.text).toBe('Tronco caído: el Champiñón lo descompone (+2 nutrientes, 2 veces).');
    expect(s.ui.selected).toBeNull();
  });
});

describe('Requirement: Cómo reclutar', () => {
  it('Scenario: Primeras esporas — la pista sugiere reclutar y qué especie conviene', () => {
    const s = setup({ spores: 2, used: [BRUNO] });
    expect(advise(s)).toEqual({ kind: 'recruit', species: 'lactarius' });
    expect(idleHint(s).text).toBe('Pista: tienes 2 esporas. Recluta un Lactarius en «+ Reclutar» o tocando las esporas.');
  });

  it('con dos Lactarius (o la red junto al Árbol Padre) conviene una Gliophorus, y después otra Amanita', () => {
    const two = setup({ spores: 2, used: [BRUNO], extraMembers: ['lactarius'] });
    expect(recruitPick(two)).toBe('gliophorus');
    const both = setup({ spores: 2, extraMembers: ['lactarius', 'gliophorus'] });
    expect(recruitPick(both)).toBe('amanita');
  });
});

describe('Requirement: Ficha al seleccionar un hongo', () => {
  it('Scenario: Primera vez con el Tejedor — se abre su ficha y al cerrarla sigue seleccionado', () => {
    const s = reduce(initialState(newGame()), { type: 'select', id: ANIL });
    expect(s.ui.sheet).toEqual({ kind: 'member', id: ANIL });
    expect(s.ui.seen).toContain('lactarius');
    expect(es.quote(es.species.lactarius.quip)).toBe('«Si lo cortas, sangra tinta azul. Preferiría que no lo cortaras.»');
    const closed = reduce(s, { type: 'closeSheet' });
    expect(closed.ui.sheet).toBeNull();
    expect(closed.ui.selected).toBe(ANIL);
    expect(highlighted(closed)).toHaveLength(2);
  });

  it('Scenario: Segunda vez — la ficha no se abre sola', () => {
    const first = reduce(reduce(initialState(newGame()), { type: 'select', id: ANIL }), { type: 'closeSheet' });
    const again = reduce(reduce(first, { type: 'select', id: ANIL }), { type: 'select', id: ANIL });
    expect(again.ui.selected).toBe(ANIL);
    expect(again.ui.sheet).toBeNull();
    // El botón "Ficha" la vuelve a abrir.
    expect(reduce(again, { type: 'openSheet', sheet: { kind: 'member', id: ANIL } }).ui.sheet).toEqual({ kind: 'member', id: ANIL });
  });

  it('cada especie tiene habilidad, cómo usarlo, movimiento y nutrientes', () => {
    for (const g of Object.values(es.guide)) {
      for (const k of ['context', 'ability', 'howTo', 'movement', 'nutrients'] as const) expect(g[k].length).toBeGreaterThan(10);
    }
  });

  it('Scenario: La Sanadora explica qué árboles cura, con sus costos', () => {
    const heals = es.guide.amanita.heals;
    expect(heals).toContain('árboles grises');
    expect(heals).toContain('3 nutrientes');
    expect(heals).toContain('Árbol Padre');
    expect(heals).toContain('10 nutrientes');
  });

  it('Scenario: La Mensajera — una segunda jugada que convierte esporas en trabajo extra', () => {
    expect(es.guide.gliophorus.messenger).toContain('Es una segunda jugada: convierte esporas en trabajo extra');
    expect(es.guide.gliophorus.ability).toContain('Cuesta 1 espora');
    expect(es.memberNames.gliophorus[0]).toBe('Chispa');
  });

  it('Scenario: Poderes de Maestra Bruna — explica los dos hechizos y después pide elegir uno', () => {
    expect(es.guide.mago.powers).toContain('Brote arcano');
    expect(es.guide.mago.powers).toContain('Lluvia de esporas');
    const g = setup({ mage: true, alive: [{ x: 4, y: 6 }] });
    const card = reduce(initialState(g), { type: 'select', id: idOf(g, 'mago') });
    expect(card.ui.sheet).toEqual({ kind: 'member', id: idOf(g, 'mago') });
    expect(reduce(card, { type: 'closeSheet' }).ui.sheet).toEqual({ kind: 'spell' });
  });
});
