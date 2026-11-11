import { describe, expect, it } from 'vitest';
import { es } from '../src/copy/es';
import { act, advise, canRecruit, missingMessenger, newGame, recruitPick, weaveGoal } from '../src/rules';
import { highlighted, idleHint, initialState, reduce, suggestedMember, suggestedTile } from '../src/store';
import { INDI, BRUNO, idOf, RUBI, setup } from './helpers';

const at = (t: { x: number; y: number } | null) => (t ? { x: t.x, y: t.y } : null);

describe('Requirement: Pista y camino sugerido', () => {
  it('Scenario: Primer paso — Bruno descompone el tronco junto a la red y lleva la ★', () => {
    const s = initialState(newGame());
    expect(s.ui.notice.text).toBe('Pista: Bruno puede descomponer un tronco junto a la red (+2 nutrientes).');
    expect(suggestedMember(s)).toBe(BRUNO);
  });

  it('Scenario: Camino hacia un árbol — la ★ de Indi es la tierra que acerca la red al árbol gris más cercano', () => {
    const afterLog = act(newGame(), BRUNO, 1, 7).state;
    expect(weaveGoal(afterLog)).toMatchObject({ toward: 'tree', goal: { x: 2, y: 5 } });
    const s = reduce(initialState(afterLog, ['lactarius']), { type: 'select', id: INDI });
    expect(at(suggestedTile(s))).toEqual({ x: 2, y: 6 });
    expect(s.ui.notice.text).toBe(es.advice.pickTile('Indi'));
  });

  it('con 3 árboles revividos, tejer apunta al Árbol Padre', () => {
    const s = setup({ alive: [{ x: 4, y: 6 }, { x: 2, y: 5 }, { x: 0, y: 3 }] });
    expect(weaveGoal(s)).toMatchObject({ toward: 'mother', goal: { x: 2, y: 0 } });
  });

  it('Scenario: Nadie más puede trabajar — invita a terminar el mes', () => {
    const s = setup({ used: [INDI, BRUNO, RUBI] });
    expect(advise(s)).toEqual({ kind: 'endMonth' });
    expect(idleHint(s).text).toBe(es.advice.endMonth);
    expect(es.advice.endMonth).toContain('cada árbol vivo dará 1 espora y 1 nutriente');
  });

  it('prioridad: despertar al Árbol Padre antes que revivir, y revivir antes que reclutar o descomponer', () => {
    const ready = setup({ net: [{ x: 2, y: 1 }], alive: [{ x: 4, y: 6 }, { x: 1, y: 0 }, { x: 0, y: 3 }], nutrients: 13, spores: 4 });
    expect(advise(ready)).toMatchObject({ kind: 'awaken', memberId: RUBI, target: { x: 2, y: 0 } });
    const revive = setup({ net: [{ x: 3, y: 6 }], nutrients: 3, spores: 4 });
    expect(advise(revive)).toMatchObject({ kind: 'revive', memberId: RUBI });
  });

  it('Scenario: Pasar la voz a la Sanadora — si Rubí podría revivir otro árbol, la ★ va donde trabajó', () => {
    // Rubí revive (4, 6); quedan nutrientes y otro árbol gris vecino a la red.
    const g = setup({ extraMembers: ['gliophorus'], net: [{ x: 3, y: 6 }, { x: 2, y: 6 }], nutrients: 6, spores: 1, used: [INDI, BRUNO] });
    const s = act(g, RUBI, 4, 6).state;
    const a = advise(s);
    expect(a).toMatchObject({ kind: 'call', memberId: idOf(s, 'gliophorus'), calledId: RUBI, target: { x: 4, y: 6 } });
    expect(idleHint(s).text).toBe(es.advice.call('extra-4', 'Rubí'));
  });

  it('la maga sugiere Brote arcano antes que Lluvia', () => {
    const mage = setup({ mage: true, net: [{ x: 3, y: 6 }], used: [INDI, BRUNO, RUBI] });
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
  it('Scenario: La hoja dice cuánto cuesta el próximo — los textos salen de RECRUIT_COSTS', () => {
    expect(es.sheet.recruitHelp(3, 6)).toBe('El próximo recluta cuesta 3 esporas; cada uno cuesta más (3, 5 y 7). Hasta 6 miembros; trabaja desde el mes siguiente.');
    expect(es.sheet.recruitHelp(null, 6)).toBe('El gremio está completo: 6 miembros.');
    expect(es.hud.sporesButton(2, 3)).toBe('Esporas: 2. El próximo recluta cuesta 3. Abrir reclutar.');
    expect(es.hud.sporesButton(4, null)).toBe('Esporas: 4. Gremio completo. Abrir reclutar.');
    const curve = 'Con esporas reclutas otro hongo: cuesta 3, luego 5 y luego 7.';
    expect(es.howto.steps[3]!.text).toContain(curve);
    expect(es.help.how[3]).toContain(curve);
    expect(JSON.stringify(es)).not.toContain('Con 2 esporas');
  });

  it('Scenario: Nadie tiene una acción útil — la pista sugiere reclutar y qué especie conviene', () => {
    const s = setup({ spores: 3, used: [INDI, BRUNO, RUBI] });
    expect(advise(s)).toEqual({ kind: 'recruit', species: 'gliophorus' });
    expect(idleHint(s).text).toBe('Pista: tienes 3 esporas. Recluta una Gliophorus en «+ Reclutar» o tocando las esporas.');
  });

  it('Scenario: No alcanza para el próximo — con 2 esporas, o con 4 tras el primer recluta, la pista no sugiere reclutar', () => {
    expect(advise(setup({ spores: 2, used: [INDI, BRUNO, RUBI] }))).toEqual({ kind: 'endMonth' });
    const extra = setup({ spores: 4, used: [INDI, BRUNO, RUBI], extraMembers: ['morchella'] });
    const one = { ...extra, members: extra.members.map((m) => ({ ...m, used: true })) };
    expect(canRecruit(one)).toBe(false);
    expect(advise(one).kind).not.toBe('recruit');
    expect(advise({ ...one, spores: 5 }).kind).toBe('recruit');
  });

  it('Scenario: Falta la Mensajera — Rubí revivió y podría revivir otro: la pista sugiere una Gliophorus', () => {
    // Red junto a dos árboles grises del mapa clásico: (4,1) y (2,5).
    const s0 = setup({ spores: 3, nutrients: 10, net: [{ x: 3, y: 1 }, { x: 2, y: 4 }] });
    const s = act(s0, RUBI, 4, 1).state;
    expect(missingMessenger(s)).toBe(true);
    expect(advise(s)).toEqual({ kind: 'recruit', species: 'gliophorus' });
  });

  it('Scenario: Hay trabajo útil — con esporas y cupo, la pista sugiere a Bruno y no reclutar', () => {
    const s = setup({ spores: 3 });
    expect(advise(s)).toMatchObject({ kind: 'decompose', memberId: BRUNO });
  });

  it('conviene la primera especie que falta: Gliophorus, Morchella, Ganoderma, Lycoperdon (039)', () => {
    expect(recruitPick(setup({ spores: 2 }))).toBe('gliophorus');
    expect(recruitPick(setup({ spores: 2, extraMembers: ['gliophorus'] }))).toBe('morchella');
    expect(recruitPick(setup({ spores: 2, extraMembers: ['gliophorus', 'morchella'] }))).toBe('ganoderma');
    expect(recruitPick(setup({ spores: 2, extraMembers: ['morchella', 'gliophorus', 'ganoderma'] }))).toBe('lycoperdon');
    // El orden del experto salta la especie que ya está.
    expect(recruitPick(setup({ spores: 2, extraMembers: ['ganoderma'] }), { recruitOrder: ['ganoderma', 'lycoperdon'] })).toBe('lycoperdon');
  });
});

describe('Requirement: Ficha al seleccionar un hongo', () => {
  it('Scenario: Primera vez con el Tejedor — queda seleccionado, sin ficha, y la bitácora invita a "Ficha" (022)', () => {
    const s = reduce(initialState(newGame()), { type: 'select', id: INDI });
    expect(s.ui.sheet).toBeNull();
    expect(s.ui.selected).toBe(INDI);
    expect(highlighted(s)).toHaveLength(2);
    expect(s.ui.seen).not.toContain('lactarius');
    expect(s.ui.notice.text).toBe('Toca Ficha para conocer a Indi.');
  });

  it('Scenario: Abrir la ficha — "Entendido" mantiene la selección y la especie queda vista', () => {
    const s = reduce(reduce(initialState(newGame()), { type: 'select', id: INDI }), { type: 'openSheet', sheet: { kind: 'member', id: INDI } });
    expect(s.ui.sheet).toEqual({ kind: 'member', id: INDI });
    expect(s.ui.seen).toContain('lactarius');
    expect(s.ui.notice.text).toBe(es.hints.pickTile('Indi')); // Indi no es la sugerida al empezar
    expect(es.quote(es.species.lactarius.quip)).toBe('«Si lo cortas, sangra tinta azul. Preferiría que no lo cortaras.»');
    const closed = reduce(s, { type: 'closeSheet' });
    expect(closed.ui.sheet).toBeNull();
    expect(closed.ui.selected).toBe(INDI);
    expect(highlighted(closed)).toHaveLength(2);
  });

  it('Scenario: Segunda vez — la pista de siempre', () => {
    const seen = reduce(initialState(newGame()), { type: 'openSheet', sheet: { kind: 'creature', species: 'lactarius' } });
    expect(seen.ui.seen).toContain('lactarius');
    const again = reduce(reduce(seen, { type: 'closeSheet' }), { type: 'select', id: INDI });
    expect(again.ui.sheet).toBeNull();
    expect(again.ui.notice.text).toBe(es.hints.pickTile('Indi'));
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

  it('Scenario: Poderes de Maestra Bruma — explica los dos hechizos y después pide elegir uno', () => {
    expect(es.guide.mago.powers).toContain('Brote arcano');
    expect(es.guide.mago.powers).toContain('Lluvia de esporas');
    const g = setup({ mage: true, alive: [{ x: 4, y: 6 }] });
    const spells = reduce(initialState(g), { type: 'select', id: idOf(g, 'mago') });
    expect(spells.ui.sheet).toEqual({ kind: 'spell' });
    // Su ficha se abre desde la hoja de hechizos; "Entendido" vuelve a pedir el hechizo.
    const card = reduce(spells, { type: 'openSheet', sheet: { kind: 'member', id: idOf(g, 'mago') } });
    expect(reduce(card, { type: 'closeSheet' }).ui.sheet).toEqual({ kind: 'spell' });
  });
});
