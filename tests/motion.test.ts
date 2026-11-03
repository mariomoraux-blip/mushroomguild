import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MOTION } from '../src/theme';

// Bucles de ambiente (halo, escarcha, motas): fuera de la escala de MOTION (022 › Tokens de movimiento).
const AMBIENT = ['FROST_PULSE_MS', 'HALO_MS', 'MOTE_RISE_MS', 'MOTE_FADE_MS'];
const files = (dir: string) => readdirSync(dir).filter((f) => f.endsWith('.ts')).map((f) => `${dir}/${f}`);

describe('Requirement: Tokens de movimiento', () => {
  it('cuatro duraciones de la escala y cuatro curvas con nombre', () => {
    expect(MOTION.ms).toEqual({ instant: 90, fast: 180, standard: 280, narrative: 600 });
    expect(Object.keys(MOTION.ease)).toEqual(['settle', 'springy', 'soft', 'leave']);
  });

  it('Scenario: Sin duraciones sueltas — escenas e interfaz usan MOTION (o un bucle de ambiente con nombre)', () => {
    for (const f of [...files('src/scenes'), ...files('src/ui')]) {
      const src = readFileSync(f, 'utf8');
      expect(src, f).not.toMatch(/duration:\s*[\d.]/);
      expect(src, f).not.toMatch(/ease:\s*'/);
      for (const [, name] of src.matchAll(/\b(\w+_MS)\s*=\s*\d/g)) expect(AMBIENT, `${f}: ${name}`).toContain(name);
    }
  });

  it('en CSS, animaciones y transiciones usan --motion-* y --ease-*', () => {
    const css = readFileSync('src/styles.css', 'utf8');
    for (const [decl] of css.matchAll(/(?:animation|transition)(?:-duration)?:[^;}]*/g)) {
      expect(decl).not.toMatch(/(?<![\w-])\d*\.?\d+m?s\b/);
      expect(decl).not.toMatch(/(?<![\w-])ease(-in|-out|-in-out)?\b|cubic-bezier/);
    }
  });
});
