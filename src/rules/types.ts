export type TileKind = 'home' | 'mother' | 'soil' | 'log' | 'tree' | 'rock';
export type SpeciesId = 'ostra' | 'champi' | 'amanita';
export type GameStatus = 'playing' | 'won' | 'lost';

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Tile extends Point {
  readonly kind: TileKind;
  /** Pertenece a la red de micelio. */
  readonly net: boolean;
  /** Usos de un tronco (se vuelve tierra al llegar a `LOG_USES`). */
  readonly uses: number;
  /** Árbol (o Árbol Madre) revivido. */
  readonly alive: boolean;
}

export interface Member {
  readonly id: number;
  readonly species: SpeciesId;
  readonly name: string;
  /** Ya actuó hoy. */
  readonly used: boolean;
  /** Casilla donde actuó hoy. */
  readonly at: Point | null;
}

export interface GameState {
  readonly tiles: readonly Tile[];
  readonly day: number;
  readonly nutrients: number;
  readonly spores: number;
  readonly status: GameStatus;
  readonly wonDay: number | null;
  readonly members: readonly Member[];
  readonly nameIdx: Readonly<Record<SpeciesId, number>>;
  readonly nextId: number;
}

export type CheckResult = { readonly ok: true } | { readonly ok: false; readonly reason: string };

export interface ActionResult {
  readonly state: GameState;
  /** Texto para la bitácora. */
  readonly message: string;
}

export class RuleError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'RuleError';
  }
}

/** Versión mutable de un tipo, solo para uso interno de las reglas sobre una copia. */
export type Mutable<T> = { -readonly [K in keyof T]: T[K] extends object ? Mutable<T[K]> : T[K] };
