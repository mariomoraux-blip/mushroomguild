import { writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { certify, firstCertified, levelAttempt, levelMap, newGame, reachable } from '../src/rules';
import { LEVEL_SEEDS } from '../src/rules/level-seeds';

// Tabla de semillas certificadas de Bosque y Ancestral (019). `npm run certify` la regenera; aquí se comprueba.
const SEEDS = 1000;
const LEVELS = ['bosque', 'ancestral'] as const;
const certified = (level: (typeof LEVELS)[number]) => (map: readonly string[]) => reachable(map) && certify(newGame(map, 'custom', level)) !== null;

describe('tabla de semillas por nivel', () => {
  it.skipIf(!process.env.CERTIFY)('regenera src/rules/level-seeds.ts', () => {
    const table = Object.fromEntries(
      LEVELS.map((level) => [level, Array.from({ length: SEEDS + 1 }, (_, seed) => levelAttempt(seed, level, certified(level))?.index.toString(36) ?? '-').join('')]),
    );
    const body = LEVELS.map((l) => `  ${l}:\n    '${table[l]}',`).join('\n');
    writeFileSync(
      new URL('../src/rules/level-seeds.ts', import.meta.url),
      `// Generado por \`npm run certify\` (019); no se edita a mano.\n// Por nivel, el carácter \`n\` (base 36) es el intento de rocas que \`certify\` acepta para la semilla \`n\`; \`-\` = ninguno.\nexport const LEVEL_SEEDS: Readonly<Record<'bosque' | 'ancestral', string>> = {\n${body}\n};\n`,
    );
  }, 3_600_000);

  it.skipIf(Boolean(process.env.CERTIFY))(`cubre las semillas 0 a ${SEEDS}; si un intento no sirve, se juega el primer claro certificado`, () => {
    for (const level of LEVELS) {
      expect(LEVEL_SEEDS[level]).toHaveLength(SEEDS + 1);
      // 031: en Ancestral el clásico ya no se gana; la semilla 0 solo sirve para `?map=clasico`.
      const first = firstCertified(level);
      expect(first).toBeGreaterThan(0);
      expect(certify(newGame(levelMap(first, level), 'custom', level))?.status).toBe('won');
      // Una semilla sin intento certificado juega ese claro.
      const none = [...LEVEL_SEEDS[level]].findIndex((c, i) => i > 0 && c === '-');
      if (none > 0) expect(levelMap(none, level)).toEqual(levelMap(first, level));
    }
  });

  it.skipIf(Boolean(process.env.CERTIFY))('los claros de la tabla se ganan con el certificador (muestra de 20 semillas)', () => {
    for (const level of LEVELS)
      for (let seed = 1; seed <= 20; seed++) {
        if (LEVEL_SEEDS[level][seed] === '-') continue;
        expect(certify(newGame(levelMap(seed, level), 'custom', level))).not.toBeNull();
      }
  }, 120_000);
});
