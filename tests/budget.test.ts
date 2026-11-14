/// <reference types="node" />
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { SOUNDS } from '../src/audio-cues';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets');
const files = (dir: string): string[] => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : [join(dir, f)]));

describe('Requirement: Peso de la página', () => {
  it('Scenario: Build de producción — public/assets no supera 4 MB', () => {
    const total = files(ROOT).reduce((sum, f) => sum + statSync(f).size, 0);
    expect(total).toBeLessThanOrEqual(4 * 1024 * 1024);
  });

  it('todo lo publicado es WebP con nombre en minúscula y guiones (salvo los README y el audio)', () => {
    for (const f of files(ROOT).filter((x) => !x.endsWith('README.md'))) expect(f.slice(ROOT.length + 1)).toMatch(/^(?:audio\/[a-z0-9/-]+\.(?:m4a|json)|[a-z0-9/-]+\.webp)$/);
  });

  it('Scenario: Audio diferido (049) — el sprite y las cortinas existen (sin ambiente desde el 050) y el mapa apunta dentro del sprite', () => {
    for (const f of ['sfx.m4a', 'stingers/stg-victory.m4a', 'stingers/stg-defeat.m4a']) expect(statSync(join(ROOT, 'audio', f)).size).toBeGreaterThan(0);
    const map = JSON.parse(readFileSync(join(ROOT, 'audio', 'sfx.json'), 'utf8')) as { length: number; sounds: Record<string, [number, number][]> };
    const sprite = SOUNDS.filter((id) => !id.startsWith('stg-'));
    expect(Object.keys(map.sounds).sort()).toEqual([...sprite].sort());
    for (const spans of Object.values(map.sounds)) for (const [start, length] of spans) expect(start + length).toBeLessThanOrEqual(map.length);
  });
});
