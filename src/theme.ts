// Colores y tipografías del juego (docs/art-direction.md › Paleta base). Nada de colores sueltos
// en escenas ni en CSS: el CSS los lee como variables que `applyTheme()` define a partir de aquí.
export const color = {
  paper: '#F3E9D2', // paneles, fichas, HUD
  wood: '#8B5E3C', // botones, marcos, dock
  ink: '#3B2A1E', // contornos y texto (nunca negro)
  accent: '#E8A33D', // selección, foco, casillas válidas
  mycelium: '#B9F0D6', // red y líneas de micelio
  indigo: '#4B5FD6', // destello del micelio tejido por el Lactarius indigo
  soil: '#7A5C3E', // tierra base del tablero (de mes)
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
  frost: '#CFE8F5', // velo de escarcha: árbol marcado o apagado (019)
  blight: '#7E5A86', // plaga de Ancestral: velo violeta apagado sobre la casilla tejida marcada (032)
  arcane: '#80E6E5', // magia de Maestra Bruma: el brillo de la punta de su bastón (022)
  neutral: '#808080', // gris sin tono: solo para desaturar el escenario (003, modo "saturation")
} as const;

export type ColorToken = keyof typeof color;

export const font = {
  display: '"Fredoka", "Trebuchet MS", system-ui, sans-serif',
  body: '"Nunito", "Segoe UI", system-ui, sans-serif',
} as const;

/** URL de un asset publicado (`public/assets/<ruta>.webp`). */
export const assetUrl = (path: string) => `${import.meta.env.BASE_URL}assets/${path}.webp`;

/**
 * Arte pintado de los personajes (cambio 010): un retrato por personaje en
 * `public/assets/characters/<personaje>/portrait.webp`, en el tablero, el dock y las fichas.
 * La carpeta lleva el nombre del primer miembro de cada especie; los reclutas usan el mismo arte.
 * La pose ya no cambia de imagen: se marca con `data-pose` (CSS) o con escala en el tablero.
 * Chispa (Gliophorus) lleva en la interfaz su corona de la estación (`frame-<estación>.webp`).
 * Los sprites de Blender quedaron como fuente en `assets/characters/`.
 */
export type Pose = 'reposo' | 'trabajando' | 'feliz';
export const SEASON_SLUGS = ['spring', 'summer', 'autumn', 'winter'] as const;
/**
 * Luz propia de la red de micelio por estación (016): alfa de su capa aditiva, de apenas visible en
 * primavera a lo más brillante del tablero en invierno (docs/art-direction.md › Luz por estación).
 */
export const MYCELIUM_GLOW: readonly [number, number, number, number] = [0.2, 0.4, 0.65, 1];
/**
 * Movimiento (022): las cuatro duraciones y las cuatro curvas con nombre. Toda animación sale de aquí
 * (en CSS, de `--motion-<duración>` y `--ease-<curva>`). Los bucles de ambiente (halo, escarcha, motas) van aparte.
 */
export const MOTION = {
  ms: { instant: 90, fast: 180, standard: 280, narrative: 600 },
  ease: {
    /** Entradas: algo llega y se acomoda. */
    settle: { css: 'cubic-bezier(.2,.8,.2,1)', phaser: 'Cubic.easeOut' },
    /** Saltitos y firmas alegres: sobrepasa un poco (≤ 8 %) y vuelve. */
    springy: { css: 'cubic-bezier(.34,1.45,.64,1)', phaser: 'Back.easeOut' },
    /** Fundidos, estaciones, luz y Maestra Bruma. */
    soft: { css: 'cubic-bezier(.45,0,.55,1)', phaser: 'Sine.easeInOut' },
    /** Salidas: algo se va. */
    leave: { css: 'cubic-bezier(.4,0,1,1)', phaser: 'Quad.easeIn' },
  },
} as const;

/** Velo del árbol marcado (019): late entre estos alfas cada `FROST_PULSE_MS`; con movimiento reducido, fijo en `rest`. */
export const FROST_PULSE = { min: 0.35, max: 0.6, rest: 0.5 } as const;
export const FROST_PULSE_MS = 1600;
/** Alfa del velo fijo del árbol apagado. */
export const FROST_FADED = 0.5;
/** Duración del cambio de luz al pasar de estación (ms). Con movimiento reducido es inmediato. */
export const LIGHT_TRANSITION_MS = MOTION.ms.narrative;
export type SeasonSlug = (typeof SEASON_SLUGS)[number];
export const SPRITE_SPECIES = ['champi', 'lactarius', 'amanita', 'gliophorus', 'mago'] as const;
export const CHARACTER_DIR: Readonly<Record<string, string>> = {
  champi: 'bruno',
  lactarius: 'indi',
  amanita: 'rubi',
  gliophorus: 'chispa',
  mago: 'maestra-bruma',
};
/** Retrato pintado sin marco (tablero), o null si la especie no tiene arte. */
export function portraitKey(species: string): string | null {
  const dir = CHARACTER_DIR[species];
  return dir ? `characters/${dir}/portrait` : null;
}
/** Retrato para la interfaz: el de Chispa va con la corona de la estación. */
export function uiPortraitKey(species: string, seasonIndex = 0): string | null {
  if (species === 'gliophorus') return `characters/chispa/frame-${SEASON_SLUGS[seasonIndex] ?? 'spring'}`;
  return portraitKey(species);
}
export const spriteUrl = (key: string) => assetUrl(key);

/** Árbol Padre pintado: dormido (gris) o despierto (dorado). Ocupa su casilla y sobresale hacia arriba. */
export const fatherKey = (awake: boolean) => `board/father-tree/${awake ? 'awake' : 'asleep'}-painted`;
/** Ancho del Árbol Padre en casillas (los personajes usan 0,92). */
export const FATHER_SCALE = 1.35;
/** Margen del canvas sobre el claro, en casillas: deja que la copa sobresalga del marco. */
export const BOARD_HEADROOM = 0.2;
export const boardArtUrl = (key: string) => assetUrl(key);

/**
 * Piezas pintadas del tablero (`public/assets/board/`), por estación donde hay variante
 * (docs/art-direction.md › Tablero). `paint.ts` las dibuja si están cargadas; si no, usa su dibujo vectorial.
 */
export const BOARD_ART = {
  grass: { spring: ['board/terrain/grass', 'board/terrain/grass-b', 'board/terrain/grass-c'], summer: ['board/terrain/grass', 'board/terrain/grass-b', 'board/terrain/grass-c'], autumn: ['board/terrain/grass-autumn'], winter: ['board/terrain/grass-winter'] },
  net: ['board/mycelium/net', 'board/mycelium/net-b'],
  home: 'board/terrain/home',
  log: ['board/logs/log', 'board/logs/log-used'],
  rock: { spring: 'board/rocks/rock', summer: 'board/rocks/rock', autumn: 'board/rocks/rock', winter: 'board/rocks/rock-winter' },
  tree: { grey: 'board/trees/grey', waking: 'board/trees/waking', spring: 'board/trees/alive', summer: 'board/trees/alive', autumn: 'board/trees/autumn', winter: 'board/trees/winter' },
  star: 'ui/icons/star',
} as const;

/** Arte de las pantallas fuera de la partida (012). Se usa como <img>, así se descarga solo al mostrarse. */
export const SCREEN_ART = {
  logo: 'ui/hud/logo',
} as const;

/** Todas las claves de arte del tablero (para precargar). */
export function boardArtKeys(): string[] {
  const keys = new Set<string>();
  const walk = (v: unknown) => {
    if (typeof v === 'string') keys.add(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(BOARD_ART);
  return [...keys];
}

/** Piezas de interfaz que el CSS usa como fondo (`--art-<nombre>`). */
const UI_ART: Record<string, string> = {
  frame: 'ui/frames/roots',
  'pill-nutrients': 'ui/hud/pill-nutrients',
  'pill-spores': 'ui/hud/pill-spores',
  'pill-trees': 'ui/hud/pill-trees',
  'btn-primary': 'ui/buttons/primary',
  'btn-secondary': 'ui/buttons/secondary',
  'btn-help': 'ui/buttons/help',
  'btn-close': 'ui/buttons/close',
  calendar: 'ui/icons/calendar',
  play: 'ui/icons/play',
  star: 'ui/icons/star',
  'btn-prev': 'ui/buttons/prev',
  'btn-next': 'ui/buttons/next',
  nutrients: 'ui/icons/nutrients',
  spores: 'ui/icons/spores',
  trees: 'ui/icons/trees',
  book: 'ui/icons/book',
  // Fondo de la partida (011): el del menú hasta que haya uno propio.
  'bg-game': 'backgrounds/menu',
  'bg-game-wide': 'backgrounds/menu-landscape',
  // Cartas de historia (003): solo se descargan cuando se muestra la carta.
  'bg-intro': 'backgrounds/intro',
  'bg-victory': 'backgrounds/victory',
  'bg-intro-wide': 'backgrounds/intro-landscape',
  'bg-victory-wide': 'backgrounds/victory-landscape',
  moon: 'ui/icons/moon',
  recruit: 'ui/icons/recruit',
  sign: 'ui/panels/sign',
  ribbon: 'ui/panels/ribbon',
  ...Object.fromEntries(SEASON_SLUGS.map((s) => [`season-${s}`, `ui/icons/season-${s}`])),
};

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

/** Publica la paleta, las tipografías y el movimiento como variables CSS en :root. */
export function applyTheme(root: HTMLElement = document.documentElement): void {
  for (const [k, v] of Object.entries(color)) root.style.setProperty(`--${k}`, v);
  for (const [k, v] of Object.entries(MOTION.ms)) root.style.setProperty(`--motion-${k}`, `${v}ms`);
  for (const [k, v] of Object.entries(MOTION.ease)) root.style.setProperty(`--ease-${k}`, v.css);
  root.style.setProperty('--font-display', font.display);
  root.style.setProperty('--font-body', font.body);
  // URL absoluta: una url() relativa dentro de una variable CSS se resuelve contra la hoja de estilos
  // que la usa (en producción, `assets/index-*.css`), no contra la página, y la pieza no carga.
  for (const [k, v] of Object.entries(UI_ART)) root.style.setProperty(`--art-${k}`, `url("${new URL(assetUrl(v), document.baseURI).href}")`);
}
