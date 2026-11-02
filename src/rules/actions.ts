import { es } from '../copy/es';
import { COST, DAYS, GAIN, LOG_USES, MAX_GUILD, TREES_FOR_MOTHER } from './config';
import { addMember, cloneState, member, revivedCount, season, tile, touchesNet } from './state';
import { RuleError, type ActionResult, type CheckResult, type GameState, type SpeciesId, type Tile } from './types';

const R = es.reasons;
const no = (reason: string): CheckResult => ({ ok: false, reason });
const yes: CheckResult = { ok: true };

/** ¿Puede el miembro `id` actuar sobre (x, y)? No cambia el estado. */
export function check(s: GameState, id: number, x: number, y: number): CheckResult {
  const m = member(s, id);
  const t = tile(s, x, y);
  if (s.status !== 'playing') return no(R.gameOver);
  if (!m || !t) return no(R.unknown);
  if (m.used) return no(R.tired(m.name));
  const near = touchesNet(s, x, y);
  switch (m.species) {
    case 'ostra':
      if (t.kind !== 'soil') return no(R.ostraNeedsSoil);
      if (t.net) return no(R.alreadyNet);
      if (!near) return no(R.farSoil);
      if (s.nutrients < COST.weave) return no(R.noNutrientWeave);
      return yes;
    case 'champi':
      if (t.kind !== 'log') return no(R.champiNeedsLog);
      if (!near) return no(R.farLog);
      return yes;
    case 'amanita':
      if (t.kind === 'mother') {
        if (!near) return no(R.motherFar);
        if (revivedCount(s) < TREES_FOR_MOTHER) return no(R.forestSilent(TREES_FOR_MOTHER));
        if (s.nutrients < COST.mother) return no(R.motherCost(COST.mother));
        return yes;
      }
      if (t.kind !== 'tree') return no(R.amanitaNeedsTree);
      if (t.alive) return no(R.treeAlive);
      if (!near) return no(R.farTree);
      if (s.nutrients < COST.revive) return no(R.reviveCost(COST.revive));
      return yes;
  }
}

/** Casillas donde el miembro `id` puede actuar ahora. */
export function validTargets(s: GameState, id: number): Tile[] {
  return s.tiles.filter((t) => check(s, id, t.x, t.y).ok);
}

/** Ejecuta la acción sobre una copia. Lanza `RuleError` si no es válida. */
export function act(s: GameState, id: number, x: number, y: number): ActionResult {
  const c = check(s, id, x, y);
  if (!c.ok) throw new RuleError(c.reason);
  const n = cloneState(s);
  const m = n.members.find((mm) => mm.id === id)!;
  const t = n.tiles.find((tt) => tt.x === x && tt.y === y)!;
  m.used = true;
  m.at = { x, y };

  if (m.species === 'ostra') {
    n.nutrients -= COST.weave;
    t.net = true;
    return { state: n, message: es.log.wove(m.name) };
  }
  if (m.species === 'champi') {
    n.nutrients += GAIN.log;
    t.uses++;
    if (t.uses >= LOG_USES) {
      t.kind = 'soil';
      t.uses = 0;
      return { state: n, message: es.log.logDone(m.name, GAIN.log) };
    }
    return { state: n, message: es.log.logUsed(m.name, GAIN.log) };
  }
  if (t.kind === 'mother') {
    n.nutrients -= COST.mother;
    t.alive = true;
    t.net = true;
    n.status = 'won';
    n.wonDay = n.day;
    return { state: n, message: es.log.motherAwake(m.name) };
  }
  n.nutrients -= COST.revive;
  t.alive = true;
  t.net = true;
  return { state: n, message: es.log.revived(m.name) };
}

/** Recluta un miembro de la especie dada. Llega cansado: trabaja desde mañana. Lanza `RuleError` si no se puede. */
export function recruit(s: GameState, species: SpeciesId): ActionResult {
  if (s.status !== 'playing') throw new RuleError(R.gameOver);
  if (s.members.length >= MAX_GUILD) throw new RuleError(R.guildFull);
  if (s.spores < COST.recruit) throw new RuleError(R.recruitCost(COST.recruit));
  const n = cloneState(s);
  n.spores -= COST.recruit;
  const m = addMember(n, species);
  m.used = true;
  return { state: n, message: es.log.recruited(m.name, es.species[species].name) };
}

/** Termina el día. Con la partida terminada no hace nada (mismo estado, mensaje vacío). */
export function endDay(s: GameState): ActionResult {
  if (s.status !== 'playing') return { state: s, message: '' };
  const n = cloneState(s);
  if (n.day >= DAYS) {
    n.status = 'lost';
    return { state: n, message: es.log.winterEnd };
  }
  const before = season(n.day);
  n.day++;
  const trees = revivedCount(n);
  n.spores += trees * GAIN.treeSpores;
  n.nutrients += trees * GAIN.treeNutrients; // hojarasca
  n.members.forEach((m) => {
    m.used = false;
    m.at = null;
  });
  const now = season(n.day);
  const parts: string[] = [es.log.dawn(n.day)];
  if (trees) parts.push(es.log.treesGave(trees));
  if (now !== before) parts.push(es.log.seasonStart(now));
  return { state: n, message: parts.join(' ') };
}
