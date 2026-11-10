// Alias del ranking (036 · leaderboard › Alias generado): «<nombre> del/de la <lugar>», con las listas de `es.ts`.
// Sin texto libre: el servidor solo acepta alias que salgan de aquí.
import { es } from '../copy/es';
import { hashString, mulberry32 } from './rng';

const { names, places } = es.leaderboard.alias;
const compose = (name: string, [article, place]: readonly [string, string]) => `${name} ${article} ${place}`;
const ALL: ReadonlySet<string> = new Set(names.flatMap((n) => places.map((p) => compose(n, p))));

/** Alias al azar con el generador dado. */
export function rollAlias(rng: () => number): string {
  const name = names[Math.floor(rng() * names.length)]!;
  const place = places[Math.floor(rng() * places.length)]!;
  return compose(name, place);
}

/** Alias número `n` de un dispositivo: determinista por clave y contador. */
export const aliasFor = (token: string, n: number): string => rollAlias(mulberry32(hashString(token) + n));

/** ¿El alias sale de las listas del juego? */
export const isValidAlias = (alias: unknown): alias is string => typeof alias === 'string' && ALL.has(alias);
