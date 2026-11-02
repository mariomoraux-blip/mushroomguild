import { describe, expect, it } from 'vitest';
import { es } from '../src/copy/es';
import { act, advise, newGame, weaveGoal } from '../src/rules';
import { idleHint, initialState, reduce, suggestedMember, suggestedTile } from '../src/store';
import { ANIL, BRUNO, idOf, RUBI, setup } from './helpers';

const at = (t: { x: number; y: number } | null) => (t ? { x: t.x, y: t.y } : null);

describe('Requirement: Pista y camino sugerido', () => {
  it('Scenario: Primer paso — Bruno descompone el tronco junto a la red y lleva la ★', () => {
    const s = initialState(newGame());
    expect(s.ui.notice.text).toBe('Pista: Bruno puede descomponer un tronco junto a la red (+3 nutrientes).');
    expect(suggestedMember(s)).toBe(BRUNO);
  });

  it('Scenario: Camino hacia un árbol — la ★ de Añil es la tierra que acerca la red al árbol gris más cercano', () => {
    const afterLog = act(newGame(), BRUNO, 1, 7).state;
    expect(weaveGoal(afterLog)).toMatchObject({ toward: 'tree', goal: { x: 2, y: 5 } });
    const s = reduce(initialState(afterLog), { type: 'select', id: ANIL });
    expect(at(suggestedTile(s))).toEqual({ x: 2, y: 6 });
    expect(s.ui.notice.text).toBe(es.advice.pickTile('Añil'));
  });

  it('con 2 árboles revividos, tejer apunta al Árbol Madre', () => {
    const s = setup({ alive: [{ x: 4, y: 6 }, { x: 2, y: 5 }] });
    expect(weaveGoal(s)).toMatchObject({ toward: 'mother', goal: { x: 2, y: 0 } });
  });

  it('Scenario: Nadie más puede trabajar — invita a terminar el día', () => {
    const s = setup({ used: [ANIL, BRUNO, RUBI] });
    expect(advise(s)).toEqual({ kind: 'endDay' });
    expect(idleHint(s).text).toBe(es.advice.endDay);
    expect(es.advice.endDay).toContain('cada árbol vivo dará 1 espora y 1 nutriente');
  });

  it('prioridad: despertar al Árbol Madre antes que revivir, y revivir antes que reclutar o descomponer', () => {
    const ready = setup({ net: [{ x: 2, y: 1 }], alive: [{ x: 4, y: 6 }, { x: 1, y: 0 }], nutrients: 9, spores: 4 });
    expect(advise(ready)).toMatchObject({ kind: 'awaken', memberId: RUBI, target: { x: 2, y: 0 } });
    const revive = setup({ net: [{ x: 3, y: 6 }], nutrients: 3, spores: 4 });
    expect(advise(revive)).toMatchObject({ kind: 'revive', memberId: RUBI });
  });

  it('pasar la voz solo con pocos nutrientes, y el mago sugiere Brote arcano antes que Lluvia', () => {
    // Gremio lleno (sin cupo para reclutar), solo la Gliophorus disponible y 1 nutriente: pasa la voz.
    const full = setup({ extraMembers: ['gliophorus', 'champi', 'champi'], alive: [{ x: 4, y: 6 }], used: [ANIL, BRUNO, RUBI, 5, 6], nutrients: 1, spores: 2 });
    expect(advise(full)).toMatchObject({ kind: 'message', memberId: idOf(full, 'gliophorus') });
    const mage = setup({ mage: true, net: [{ x: 3, y: 6 }], used: [ANIL, BRUNO, RUBI] });
    expect(advise(mage)).toMatchObject({ kind: 'spell', spell: 'sprout', target: { x: 3, y: 5 } });
  });
});

describe('Requirement: Para qué sirve cada hongo', () => {
  it('Scenario: Tarjeta del Tejedor — rol y acción con costo', () => {
    expect(es.species.lactarius.role).toBe('Tejedor');
    expect(es.species.lactarius.action).toBe('Teje · −1 nutriente');
  });

  it('Scenario: Tocar un tronco — sin selección, la bitácora explica la casilla', () => {
    const s = reduce(initialState(), { type: 'tapTile', x: 1, y: 7 });
    expect(s.ui.notice.text).toBe('Tronco caído: el Champiñón lo descompone (+3 nutrientes, 2 veces).');
    expect(s.ui.selected).toBeNull();
  });
});

describe('Requirement: Cómo reclutar', () => {
  it('Scenario: Primeras esporas — la pista sugiere reclutar y qué especie conviene', () => {
    const s = setup({ spores: 2, used: [BRUNO] });
    expect(advise(s)).toEqual({ kind: 'recruit', species: 'lactarius' });
    expect(idleHint(s).text).toBe('Pista: tienes 2 esporas. Recluta un Lactarius en «+ Reclutar» o tocando las esporas.');
  });

  it('sin troncos junto a la red y con pocos nutrientes conviene la Gliophorus', () => {
    const g = setup({ spores: 2, nutrients: 1 });
    const noLogs = { ...g, tiles: g.tiles.map((t) => (t.kind === 'log' ? { ...t, kind: 'soil' as const } : t)) };
    expect(advise(noLogs)).toEqual({ kind: 'recruit', species: 'gliophorus' });
  });
});
