import { es } from '../copy/es';
import { COST, FADED_REVIVE, FROST_WEAVE, LEVELS, MONTHS, GAIN, LOG_USES, MAX_GUILD, RECRUITABLE, TREES_FOR_MAGE, TREES_FOR_MOTHER } from './config';
import {
  addMage,
  addMember,
  cloneState,
  farthestGreyTree,
  hasFrost,
  magicSpent,
  member,
  recruitableCount,
  recruitCost,
  reviveCost,
  revivedCount,
  season,
  seasonIndex,
  tile,
  touchesNet,
  weaveCost,
  workerAt,
} from './state';
import {
  RuleError,
  type ActionResult,
  type CheckResult,
  type GameState,
  type RecruitableSpecies,
  type Resource,
  type Spell,
  type Tile,
} from './types';

const R = es.reasons;
const no = (reason: string, short?: Resource): CheckResult => (short ? { ok: false, reason, short } : { ok: false, reason });
const yes: CheckResult = { ok: true };

const isLiveTree = (t: Tile) => t.kind === 'tree' && t.alive;

/** Hechizo que corresponde a una casilla: roca → Brote arcano; cualquier otra → Lluvia de esporas. */
export const spellFor = (t: Tile): Spell => (t.kind === 'rock' ? 'sprout' : 'rain');

/**
 * ¿Puede el miembro `id` actuar sobre (x, y)? No cambia el estado.
 * `spell` solo aplica a Maestra Bruma: restringe el hechizo (si se omite, se deduce de la casilla).
 */
export function check(s: GameState, id: number, x: number, y: number, spell?: Spell): CheckResult {
  const m = member(s, id);
  const t = tile(s, x, y);
  if (s.status !== 'playing') return no(R.gameOver);
  if (!m || !t) return no(R.unknown);
  if (m.used) return no(R.tired(m.name));
  const near = touchesNet(s, x, y);
  switch (m.species) {
    case 'lactarius':
      if (t.kind !== 'soil') return no(R.lactariusNeedsSoil);
      if (t.net) return no(R.alreadyNet);
      if (!near) return no(R.farSoil);
      if (s.nutrients < weaveCost(s)) return no(hasFrost(s) ? R.noNutrientWeaveFrost(weaveCost(s)) : R.noNutrientWeave(weaveCost(s)), 'nutrients');
      return yes;
    case 'champi':
      if (t.kind !== 'log') return no(R.champiNeedsLog);
      if (!near) return no(R.farLog);
      return yes;
    case 'amanita':
      if (t.kind === 'mother') {
        if (!near) return no(R.motherFar);
        if (revivedCount(s) < TREES_FOR_MOTHER) return no(R.forestSilent(TREES_FOR_MOTHER));
        if (s.nutrients < COST.mother) return no(R.motherCost(COST.mother), 'nutrients');
        return yes;
      }
      if (t.kind !== 'tree') return no(R.amanitaNeedsTree);
      if (t.alive) return no(R.treeAlive);
      if (!near) return no(R.farTree);
      if (s.nutrients < reviveCost(t)) return no(R.reviveCost(reviveCost(t)), 'nutrients');
      return yes;
    case 'gliophorus':
      if (!workerAt(s, x, y)) return no(R.gliophorusNeedsWorker);
      if (s.spores < COST.call) return no(R.callCost(COST.call), 'spores');
      return yes;
    case 'mago': {
      if (magicSpent(s)) return no(R.magicSpent);
      const sp = spell ?? spellFor(t);
      if (sp === 'sprout') return t.kind === 'rock' && near ? yes : no(R.sproutNeedsRock);
      return isLiveTree(t) ? yes : no(R.rainNeedsTree);
    }
  }
}

/** Casillas donde el miembro `id` puede actuar ahora (para la maga, opcionalmente con un hechizo). */
export function validTargets(s: GameState, id: number, spell?: Spell): Tile[] {
  return s.tiles.filter((t) => check(s, id, t.x, t.y, spell).ok);
}

/** Ejecuta la acción sobre una copia. Lanza `RuleError` si no es válida. */
export function act(s: GameState, id: number, x: number, y: number): ActionResult {
  const c = check(s, id, x, y);
  if (!c.ok) throw new RuleError(c.reason, c.short);
  const n = cloneState(s);
  const m = n.members.find((mm) => mm.id === id)!;
  const t = n.tiles.find((tt) => tt.x === x && tt.y === y)!;
  m.used = true;
  m.at = { x, y };
  n.log.push(m.species === 'mago' ? { type: 'act', memberId: id, x, y, spell: spellFor(t) } : { type: 'act', memberId: id, x, y });

  switch (m.species) {
    case 'lactarius':
      n.nutrients -= weaveCost(s);
      t.net = true;
      return { state: n, message: es.log.wove(m.name) };
    case 'champi':
      n.nutrients += GAIN.log;
      t.uses++;
      if (t.uses >= LOG_USES) {
        t.kind = 'soil';
        t.uses = 0;
        return { state: n, message: es.log.logDone(m.name, GAIN.log) };
      }
      return { state: n, message: es.log.logUsed(m.name, GAIN.log) };
    case 'gliophorus': {
      // Pasa la voz: el compañero que trabajó en esa casilla vuelve a estar listo.
      const called = n.members.find((mm) => mm.id === workerAt(s, x, y)!.id)!;
      n.spores -= COST.call;
      called.used = false;
      called.at = null;
      return { state: n, message: es.log.called(m.name, called.name) };
    }
    case 'mago': {
      n.lastSpellSeason = seasonIndex(n.month);
      if (spellFor(t) === 'sprout') {
        t.kind = 'soil';
        t.net = true;
        return { state: n, message: es.log.sprouted(m.name) };
      }
      const trees = revivedCount(n);
      n.spores += trees * GAIN.treeSpores;
      n.nutrients += trees * GAIN.treeNutrients;
      return { state: n, message: es.log.rained(m.name, trees * GAIN.treeSpores, trees * GAIN.treeNutrients) };
    }
    case 'amanita':
      if (t.kind === 'mother') {
        n.nutrients -= COST.mother;
        t.alive = true;
        t.net = true;
        n.status = 'won';
        n.wonMonth = n.month;
        return { state: n, message: es.log.motherAwake(m.name) };
      }
      n.nutrients -= reviveCost(t);
      t.alive = true;
      t.net = true;
      t.fading = false; // revivirlo el mes en que está marcado lo salva (019)
      t.faded = false;
      // Maestra Bruma llega al empezar el mes siguiente al segundo árbol (no hay cambio de mes después del mes 12).
      if (!n.mageArrived && !n.mageDue && revivedCount(n) >= TREES_FOR_MAGE && n.month < MONTHS) n.mageDue = true;
      return { state: n, message: es.log.revived(m.name) };
  }
}

/** Recluta un miembro de una especie reclutable. Llega cansado: trabaja desde el mes siguiente. Lanza `RuleError` si no se puede. */
export function recruit(s: GameState, species: RecruitableSpecies): ActionResult {
  if (!RECRUITABLE.includes(species)) throw new RuleError(R.unknown);
  if (s.status !== 'playing') throw new RuleError(R.gameOver);
  if (recruitableCount(s) >= MAX_GUILD) throw new RuleError(R.guildFull);
  const cost = recruitCost(s)!;
  if (s.spores < cost) throw new RuleError(R.recruitCost(cost), 'spores');
  const n = cloneState(s);
  n.spores -= cost;
  n.log.push({ type: 'recruit', species });
  const m = addMember(n, species);
  m.used = true;
  return { state: n, message: es.log.recruited(m.name, es.species[species].name) };
}

/** Termina el mes. Con la partida terminada no hace nada (mismo estado, mensaje vacío). */
export function endMonth(s: GameState): ActionResult {
  if (s.status !== 'playing') return { state: s, message: '' };
  const n = cloneState(s);
  n.log.push({ type: 'endMonth' });
  if (n.month >= MONTHS) {
    n.status = 'lost';
    return { state: n, message: es.log.winterEnd };
  }
  const before = season(n.month);
  const parts: string[] = [];
  // Árbol marcado que sigue gris: se apaga al terminar su mes (019). Nunca toca la red ni árboles vivos.
  const marked = n.tiles.find((t) => t.fading);
  if (marked) {
    marked.fading = false;
    if (!marked.alive) {
      marked.faded = true;
      parts.push(es.log.treeFaded(FADED_REVIVE));
    }
  }
  n.month++;
  const trees = revivedCount(n);
  n.spores += trees * GAIN.treeSpores;
  n.nutrients += trees * GAIN.treeNutrients; // hojarasca
  n.members.forEach((m) => {
    m.used = false;
    m.at = null;
  });
  const now = season(n.month);
  parts.unshift(es.log.newMonth(n.month));
  if (trees) parts.push(es.log.treesGave(trees * GAIN.treeSpores, trees * GAIN.treeNutrients));
  if (now !== before) parts.push(es.log.seasonStart(now));
  if (hasFrost(n) && !hasFrost(s)) parts.push(es.log.frostStart(FROST_WEAVE));
  if (LEVELS[n.level].fading.includes(n.month)) {
    const next = farthestGreyTree(n);
    if (next) {
      n.tiles.find((t) => t === next)!.fading = true;
      parts.push(es.log.treeFading);
    }
  }
  if (n.mageDue) {
    addMage(n);
    parts.push(es.log.mageArrives);
  }
  return { state: n, message: parts.join(' ') };
}
