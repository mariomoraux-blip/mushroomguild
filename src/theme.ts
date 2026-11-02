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
} as const;

export type ColorToken = keyof typeof color;

export const font = {
  display: '"Fredoka", "Trebuchet MS", system-ui, sans-serif',
  body: '"Nunito", "Segoe UI", system-ui, sans-serif',
} as const;

/** URL de un asset publicado (`public/assets/<ruta>.webp`). */
export const assetUrl = (path: string) => `${import.meta.env.BASE_URL}assets/${path}.webp`;

/**
 * Sprites de Blender en `public/assets/characters/<personaje>/<pose>.webp`. La carpeta lleva el nombre
 * del primer miembro de cada especie; los reclutas de la misma especie usan el mismo arte.
 * La Gliophorus tiene una variante por estación (`<pose>-<estación>.webp`).
 */
export type Pose = 'reposo' | 'trabajando' | 'feliz';
export const SEASON_SLUGS = ['spring', 'summer', 'autumn', 'winter'] as const;
export const SPRITE_SPECIES = ['champi', 'lactarius', 'amanita', 'gliophorus', 'mago'] as const;
export const CHARACTER_DIR: Readonly<Record<string, string>> = {
  champi: 'bruno',
  lactarius: 'anil',
  amanita: 'rubi',
  gliophorus: 'chispa',
  mago: 'maestra-bruna',
};
const POSE_FILE: Readonly<Record<Pose, string>> = { reposo: 'rest', trabajando: 'work', feliz: 'happy' };
/** Clave del sprite (es también su ruta bajo `public/assets/`), o null si la especie no tiene arte. */
export function spriteKey(species: string, pose: Pose, seasonIndex = 0): string | null {
  const dir = CHARACTER_DIR[species];
  if (!dir) return null;
  const season = species === 'gliophorus' ? `-${SEASON_SLUGS[seasonIndex] ?? 'spring'}` : '';
  return `characters/${dir}/${POSE_FILE[pose]}${season}`;
}
/** Todos miden 176 px de ancho a la misma escala (100 px/m); el alto es 128 px, o 160 px para Maestra Bruna, la más alta. */
export const spriteUrl = (key: string) => assetUrl(key);
/** Árbol Padre de Blender (`public/assets/board/father-tree/`): 176 × 192; ocupa su casilla y sobresale hacia arriba. */
export const fatherKey = (awake: boolean) => `board/father-tree/${awake ? 'awake' : 'asleep'}`;
/** Ancho del sprite del Árbol Padre en casillas (los personajes usan 1,05). */
export const FATHER_SCALE = 1.2;
/** Margen del canvas sobre el claro, en casillas: deja que la copa despierta sobresalga del marco. */
export const BOARD_HEADROOM = 0.2;
export const boardArtUrl = (key: string) => assetUrl(key);

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
