// Colores y tipografías del juego. Nada de colores sueltos en escenas.
// Paleta tomada del PoC (poc/game.html); se ampliará con las gradaciones por estación.
export const color = {
  dusk: '#17150f', // fondo: tierra de noche
  bark: '#24211a', // paneles
  barkLine: '#3a352a',
  spore: '#ece4cb', // texto principal
  lichen: '#a7a088', // texto secundario
  glow: '#b9f0d6', // micelio
  amber: '#f0aa4c', // acento: luz de linterna
  capRed: '#cf4d3c',
  capBrown: '#b98a5e',
  capBlue: '#9cb4c3',
  canopy: '#7cc36a',
} as const;

export const font = {
  display: '"Grandstander", "Comic Sans MS", "Trebuchet MS", system-ui, sans-serif',
  body: '"Atkinson Hyperlegible", "Segoe UI", system-ui, sans-serif',
} as const;

/** Densidad de píxeles usada para renderizar, limitada a 2× (presupuesto de rendimiento en móvil). */
export const MAX_RESOLUTION = 2;
export const renderResolution = (): number => Math.min(globalThis.devicePixelRatio || 1, MAX_RESOLUTION);
