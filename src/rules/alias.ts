// Nombre del ranking (036, 038 · leaderboard › Nombre en el gremio): un alias «<nombre> del/de la <lugar>» con las
// listas de `es.ts`, o un nombre escrito que pasa el formato y la lista negra. El servidor solo acepta lo que valida aquí.
import { es } from '../copy/es';
import { BLOCKED_ANYWHERE, BLOCKED_WORDS } from './blocklist';
import { LEADERBOARD } from './config';
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

/** ¿Es uno de los alias que genera el juego? */
export const isGeneratedAlias = (alias: unknown): alias is string => typeof alias === 'string' && ALL.has(alias);

/** Letras latinas (con tildes, ñ y ü) y espacios; sin × ni ÷. */
const LETTERS = /^[A-Za-zÀ-ÖØ-öø-ÿ ]+$/;

/** Nombre escrito tal como se guarda: forma NFC, sin espacios en los extremos ni repetidos. */
export const cleanName = (raw: string): string => raw.normalize('NFC').replace(/\s+/g, ' ').trim();

/** Forma de comparar con la lista negra: sin tildes, minúsculas y sin letras repetidas («Púuuta» → «puta»). */
export const normalizeName = (name: string): string =>
  name.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/(.)\1+/g, '$1');

const NORMAL_ANYWHERE = BLOCKED_ANYWHERE.map(normalizeName);
const NORMAL_WORDS: ReadonlySet<string> = new Set(BLOCKED_WORDS.map(normalizeName));

export type NameProblem = 'length' | 'chars' | 'blocked';
export type NameCheck = { readonly ok: true; readonly name: string } | { readonly ok: false; readonly problem: NameProblem };

/** Valida un nombre escrito: formato y lista negra. Si es válido, devuelve su forma limpia. */
export function checkName(raw: string): NameCheck {
  const name = cleanName(raw);
  if (name.length < LEADERBOARD.name.min || name.length > LEADERBOARD.name.max) return { ok: false, problem: 'length' };
  if (!LETTERS.test(name)) return { ok: false, problem: 'chars' };
  const normal = normalizeName(name);
  const joined = normal.replace(/ /g, '').replace(/(.)\1+/g, '$1'); // «P u u t a» → «puta»
  const blocked =
    NORMAL_ANYWHERE.some((root) => joined.includes(root)) ||
    normal.split(' ').some((word) => NORMAL_WORDS.has(word)) ||
    NORMAL_WORDS.has(joined);
  return blocked ? { ok: false, problem: 'blocked' } : { ok: true, name };
}

/** ¿El nombre puede ir al ranking? Un alias generado, o un nombre escrito válido y ya limpio. */
export const isValidAlias = (alias: unknown): alias is string => {
  if (isGeneratedAlias(alias)) return true;
  if (typeof alias !== 'string') return false;
  const check = checkName(alias);
  return check.ok && check.name === alias;
};
