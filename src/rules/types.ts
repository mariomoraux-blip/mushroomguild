export type TileKind = 'home' | 'mother' | 'soil' | 'log' | 'tree' | 'rock';
export type SpeciesId = 'champi' | 'lactarius' | 'amanita' | 'gliophorus' | 'morchella' | 'ganoderma' | 'lycoperdon' | 'mago';
/** Especies del gremio que no son la maga: las tres del inicio y las que se reclutan. */
export type GuildSpecies = Exclude<SpeciesId, 'mago'>;
/** Especies del gremio al empezar la partida (039: no se reclutan). */
export type StartingSpecies = 'champi' | 'lactarius' | 'amanita';
/** Especies que se pueden reclutar con esporas, una vez cada una (039); la maga llega sola. */
export type RecruitableSpecies = Exclude<GuildSpecies, StartingSpecies>;
/** Hechizos de Maestra Bruma: Brote arcano y Lluvia de esporas. */
export type Spell = 'sprout' | 'rain';
export type GameStatus = 'playing' | 'won' | 'lost';
/** Nivel de dificultad (019): Brote es el juego de siempre; Bosque y Ancestral suman presión. */
export type Level = 'brote' | 'bosque' | 'ancestral';

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
  /** Árbol gris marcado: se apaga al terminar el mes si nadie lo revive (019). */
  readonly fading: boolean;
  /** Árbol apagado: revivirlo cuesta `FADED_REVIVE` (019). */
  readonly faded: boolean;
  /** Casilla tejida con plaga (032): sale de la red al terminar el mes si ningún hongo trabajó cerca. */
  readonly blighted?: boolean;
}

export interface Member {
  readonly id: number;
  readonly species: SpeciesId;
  readonly name: string;
  /** Ya actuó este mes. */
  readonly used: boolean;
  /** Casilla donde actuó este mes. */
  readonly at: Point | null;
  /** Se quedó sin comer al terminar un mes frío (028): descansa este mes. */
  readonly hungry?: boolean;
}

/** Acción registrada (015): permite rejugar una partida y verificar su puntaje. */
export type LoggedAction =
  | { readonly type: 'act'; readonly memberId: number; readonly x: number; readonly y: number; readonly spell?: Spell }
  | { readonly type: 'recruit'; readonly species: RecruitableSpecies }
  | { readonly type: 'endMonth' };

export interface GameState {
  /** Claro de la partida: `clasico`, `seed-<n>` (claro generado), `custom` (mapa de prueba) o `debug`. */
  readonly mapId: string;
  /** Nivel de dificultad (019). */
  readonly level: Level;
  /** Acciones aceptadas, en orden (015). */
  readonly log: readonly LoggedAction[];
  readonly tiles: readonly Tile[];
  readonly month: number;
  readonly nutrients: number;
  readonly spores: number;
  readonly status: GameStatus;
  readonly wonMonth: number | null;
  readonly members: readonly Member[];
  readonly nameIdx: Readonly<Record<GuildSpecies, number>>;
  readonly nextId: number;
  /** Se revivió el segundo árbol: Maestra Bruma llega al próximo cambio de mes. */
  readonly mageDue: boolean;
  /** Maestra Bruma ya se unió al gremio (solo una vez por partida). */
  readonly mageArrived: boolean;
  /** Índice de la estación (0–3) en la que Maestra Bruma lanzó su último hechizo. */
  readonly lastSpellSeason: number | null;
}

/** Recurso del HUD que puede faltar para una acción (022: el contador se tiñe al rechazarla). */
export type Resource = 'nutrients' | 'spores';

export type CheckResult = { readonly ok: true } | { readonly ok: false; readonly reason: string; readonly short?: Resource };

export interface ActionResult {
  readonly state: GameState;
  /** Texto para la bitácora. */
  readonly message: string;
}

export class RuleError extends Error {
  constructor(
    reason: string,
    /** Recurso que faltó, si fue eso. */
    readonly short?: Resource,
  ) {
    super(reason);
    this.name = 'RuleError';
  }
}

/** Versión mutable de un tipo, solo para uso interno de las reglas sobre una copia. */
export type Mutable<T> = { -readonly [K in keyof T]: T[K] extends object ? Mutable<T[K]> : T[K] };
