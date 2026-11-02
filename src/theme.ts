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
} as const;

export type ColorToken = keyof typeof color;

export const font = {
  display: '"Grandstander", "Trebuchet MS", system-ui, sans-serif',
  body: '"Atkinson Hyperlegible", "Segoe UI", system-ui, sans-serif',
} as const;

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
