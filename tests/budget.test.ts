/// <reference types="node" />
import { readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets');
const files = (dir: string): string[] => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : [join(dir, f)]));

describe('Requirement: Peso de la página', () => {
  it('Scenario: Build de producción — public/assets no supera 4 MB', () => {
    const total = files(ROOT).reduce((sum, f) => sum + statSync(f).size, 0);
    expect(total).toBeLessThanOrEqual(4 * 1024 * 1024);
  });

  it('todo lo publicado es WebP con nombre en minúscula y guiones (salvo los README)', () => {
    for (const f of files(ROOT).filter((x) => !x.endsWith('README.md'))) expect(f.slice(ROOT.length + 1)).toMatch(/^[a-z0-9/-]+\.webp$/);
  });
});
