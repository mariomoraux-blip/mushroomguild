import { describe, expect, it } from 'vitest';
import { COST, GAIN, RECRUITABLE } from '../src/rules';
import { RECIPES } from '../src/ui/recipe';

// player-guidance › Recetas visuales (026)
describe('Requirement: Recetas visuales', () => {
  const numbers = (sp: keyof typeof RECIPES) => RECIPES[sp].flatMap((r) => r.chips.map((c) => c.n));

  it('cada especie tiene receta; Maestra Bruma, una por hechizo; Pompón, una por cambio (040)', () => {
    for (const sp of RECRUITABLE) expect(RECIPES[sp]).toHaveLength(sp === 'lycoperdon' ? 2 : 1);
    expect(RECIPES.mago).toHaveLength(2);
    expect(RECIPES.lycoperdon.map((r) => r.title)).toEqual(['Soplar esporas', 'Abonar el árbol']);
    expect(numbers('lycoperdon')).toEqual([-COST.puff, GAIN.puff, -COST.compost, GAIN.compost]);
  });

  it('los números salen de las reglas: tejer, descomponer, revivir y pasar la voz', () => {
    expect(numbers('lactarius')).toEqual([-COST.weave]);
    expect(numbers('champi')).toEqual([GAIN.log]);
    expect(numbers('amanita')).toEqual([-COST.revive]);
    expect(numbers('gliophorus')).toEqual([-COST.call]);
  });

  it('la casilla donde trabaja va resaltada en el antes, y cada receta tiene su frase', () => {
    for (const recipes of Object.values(RECIPES))
      for (const r of recipes) {
        expect(r.label.startsWith('Antes:') || r.label.includes('. Antes:')).toBe(true);
        const tiles = r.before.filter((p) => 'ground' in p);
        if (tiles.length) expect(tiles.some((p) => 'valid' in p && p.valid)).toBe(true);
      }
  });
});
