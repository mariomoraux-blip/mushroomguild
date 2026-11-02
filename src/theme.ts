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

/** Color de la paleta como número para Phaser (0xRRGGBB). */
export const hex = (token: ColorToken): number => parseInt(color[token].slice(1), 16);

/** Densidad de píxeles usada para renderizar, limitada a 2× (presupuesto de rendimiento en móvil). */
export const MAX_RESOLUTION = 2;
export const renderResolution = (): number => Math.min(globalThis.devicePixelRatio || 1, MAX_RESOLUTION);

/** Publica la paleta y las tipografías como variables CSS en :root. */
export function applyTheme(root: HTMLElement = document.documentElement): void {
  for (const [k, v] of Object.entries(color)) root.style.setProperty(`--${k}`, v);
  root.style.setProperty('--font-display', font.display);
  root.style.setProperty('--font-body', font.body);
}
