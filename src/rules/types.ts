export type TileKind = 'home' | 'mother' | 'soil' | 'log' | 'tree' | 'rock';
export type SpeciesId = 'champi' | 'lactarius' | 'amanita' | 'gliophorus' | 'mago';
/** Especies que se pueden reclutar con esporas (la maga llega sola). */
export type RecruitableSpecies = Exclude<SpeciesId, 'mago'>;
/** Hechizos de Maestra Bruma: Brote arcano y Lluvia de esporas. */
export type Spell = 'sprout' | 'rain';
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
  /** Árbol (o Árbol Padre) revivido. */
  readonly alive: boolean;
}

export interface Member {
  readonly id: number;
  readonly species: SpeciesId;
  readonly name: string;
  /** Ya actuó este mes. */
  readonly used: boolean;
  /** Casilla donde actuó este mes. */
  readonly at: Point | null;
}

export interface GameState {
  readonly tiles: readonly Tile[];
  readonly month: number;
  readonly nutrients: number;
  readonly spores: number;
  readonly status: GameStatus;
  readonly wonMonth: number | null;
  readonly members: readonly Member[];
  readonly nameIdx: Readonly<Record<RecruitableSpecies, number>>;
  readonly nextId: number;
  /** Se revivió el segundo árbol: Maestra Bruma llega al próximo cambio de mes. */
  readonly mageDue: boolean;
  /** Maestra Bruma ya se unió al gremio (solo una vez por partida). */
  readonly mageArrived: boolean;
  /** Índice de la estación (0–3) en la que Maestra Bruma lanzó su último hechizo. */
  readonly lastSpellSeason: number | null;
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
