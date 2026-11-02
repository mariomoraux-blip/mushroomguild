// Colores y tipografías del juego (docs/art-direction.md › Paleta base). Nada de colores sueltos
// en escenas ni en CSS: el CSS los lee como variables que `applyTheme()` define a partir de aquí.
export const color = {
  paper: '#F3E9D2', // paneles, fichas, HUD
  wood: '#8B5E3C', // botones, marcos, dock
  ink: '#3B2A1E', // contornos y texto (nunca negro)
  accent: '#E8A33D', // selección, foco, casillas válidas
  mycelium: '#B9F0D6', // red y líneas de micelio
  indigo: '#4B5FD6', // destello del micelio tejido por el Lactarius indigo
  soil: '#7A5C3E', // tierra base del tablero (de día)
  cream: '#FBF5E6', // fondo de página: papel claro
  moss: '#6E8B3D', // cintas de título y HUD
  mossDark: '#55702C', // borde de las cintas
  sun: '#F4C64E', // botón principal
  leaf: '#8DB255', // follaje vivo
  meadow: '#B5C285', // pradera del tablero
  stone: '#9A9183', // rocas y árboles dormidos
  bark: '#5E3B22', // madera oscura: vetas, cuerdas, sombras de tronco
  leafDark: '#5F8A3A', // sombra del follaje y del pasto
  meadowDark: '#97A86A', // juntas y sombras de la pradera
  berry: '#C9503C', // sello de cera, sombrero de la casa-hongo
  peach: '#F6D7B0', // luz cálida del fondo
  glow: '#FFF4C2', // brillos, aura del Árbol Padre, luciérnagas
  stoneDark: '#6F675B', // sombra de rocas y copas dormidas
  // Luz por estación (003): tintes del escenario, follaje vivo y cielo del fondo vivo.
  tintSpring: '#F2FAE8',
  tintSummer: '#FFF1CF',
  tintAutumn: '#F7C58E',
  tintWinter: '#8FA3D6',
  leafSummer: '#A9B848',
  leafSummerDark: '#83923A',
  leafAutumn: '#D98A3A',
  leafAutumnDark: '#B0662A',
  leafWinter: '#7C93B8',
  leafWinterDark: '#5C7196',
  skySpring: '#EAF4D6',
  skyAutumn: '#F0A46A',
  skySummerLow: '#FFF4DA',
  skyWinter: '#2E3A66',
  skyWinterLow: '#4B5784',
} as const;

export type ColorToken = keyof typeof color;

export const font = {
  display: '"Fredoka", "Trebuchet MS", system-ui, sans-serif',
  body: '"Nunito", "Segoe UI", system-ui, sans-serif',
} as const;

/** Sprites de Blender (public/assets/characters). La Gliophorus tiene una variante por estación. */
export type Pose = 'reposo' | 'trabajando' | 'feliz';
export const SEASON_SLUGS = ['primavera', 'verano', 'otono', 'invierno'] as const;
export const SPRITE_SPECIES = ['champi', 'lactarius', 'amanita', 'gliophorus', 'mago'] as const;
export function spriteKey(species: string, pose: Pose, seasonIndex = 0): string | null {
  if (!(SPRITE_SPECIES as readonly string[]).includes(species)) return null;
  return species === 'gliophorus' ? `${species}-${pose}-${SEASON_SLUGS[seasonIndex] ?? 'primavera'}` : `${species}-${pose}`;
}
/** Todos miden 176 px de ancho a la misma escala (100 px/m); el alto es 128 px, o 160 px para Maestra Bruna, la más alta. */
export const spriteUrl = (key: string) => `${import.meta.env.BASE_URL}assets/characters/${key}.png`;
/** Árbol Padre de Blender (public/assets/board): 176 × 192; ocupa su casilla y sobresale hacia arriba. */
export const fatherKey = (awake: boolean) => (awake ? 'arbol-padre-despierto' : 'arbol-padre-dormido');
/** Ancho del sprite del Árbol Padre en casillas (los personajes usan 1,05). */
export const FATHER_SCALE = 1.2;
/** Margen del canvas sobre el claro, en casillas: deja que la copa despierta sobresalga del marco. */
export const BOARD_HEADROOM = 0.2;
export const boardArtUrl = (key: string) => `${import.meta.env.BASE_URL}assets/board/${key}.png`;
/** Piezas de la hoja de UI (public/assets/ui), en WebP. */
export const uiArtUrl = (key: string) => `${import.meta.env.BASE_URL}assets/ui/${key}.webp`;

/**
 * Luz del escenario por estación (docs/art-direction.md › Luz por estación). Se aplica al claro, al
 * Árbol Padre y al fondo vivo; nunca a personajes ni a la interfaz.
 * `tint` multiplica el color, `brightness` lo escala, `foliage` pinta las copas vivas, `sky` es el
 * degradado del fondo vivo (arriba, abajo) y `mycelium` es el alfa de la capa de brillo del micelio.
 */
export interface SeasonLight {
  readonly hour: 'mañana' | 'mediodía' | 'atardecer' | 'anochecer';
  readonly tint: ColorToken;
  readonly brightness: number;
  readonly foliage: readonly [ColorToken, ColorToken];
  readonly sky: readonly [ColorToken, ColorToken];
  readonly mycelium: number;
}

export const SEASON_LIGHT: readonly [SeasonLight, SeasonLight, SeasonLight, SeasonLight] = [
  { hour: 'mañana', tint: 'tintSpring', brightness: 1.05, foliage: ['leaf', 'leafDark'], sky: ['skySpring', 'cream'], mycelium: 0.2 },
  { hour: 'mediodía', tint: 'tintSummer', brightness: 1.08, foliage: ['leafSummer', 'leafSummerDark'], sky: ['peach', 'skySummerLow'], mycelium: 0.4 },
  { hour: 'atardecer', tint: 'tintAutumn', brightness: 0.92, foliage: ['leafAutumn', 'leafAutumnDark'], sky: ['skyAutumn', 'peach'], mycelium: 0.65 },
  { hour: 'anochecer', tint: 'tintWinter', brightness: 0.62, foliage: ['leafWinter', 'leafWinterDark'], sky: ['skyWinter', 'skyWinterLow'], mycelium: 1 },
];

/** Saturación del escenario: casi gris al empezar, color pleno con el Árbol Padre despierto. */
export const SATURATION = { min: 0.15, max: 1 } as const;
/** Duración del cambio de luz entre estaciones (ms). Con movimiento reducido es inmediato. */
export const LIGHT_TRANSITION_MS = 600;

/** Color de la paleta como número para Phaser (0xRRGGBB). */
export const hex = (token: ColorToken): number => parseInt(color[token].slice(1), 16);

/** Color de la paleta como rgba() para Canvas2D, con transparencia opcional. */
export function rgba(token: ColorToken, alpha = 1): string {
  const n = hex(token);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Color de la paleta como vec3 (0–1) para shaders. */
export function vec3(token: ColorToken): [number, number, number] {
  const n = hex(token);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** Densidad de píxeles usada para renderizar, limitada a 2× (presupuesto de rendimiento en móvil). */
export const MAX_RESOLUTION = 2;
export const renderResolution = (): number => Math.min(globalThis.devicePixelRatio || 1, MAX_RESOLUTION);

/** Publica la paleta y las tipografías como variables CSS en :root. */
export function applyTheme(root: HTMLElement = document.documentElement): void {
  for (const [k, v] of Object.entries(color)) root.style.setProperty(`--${k}`, v);
  root.style.setProperty('--font-display', font.display);
  root.style.setProperty('--font-body', font.body);
}
