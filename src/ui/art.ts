// Piezas ilustradas de la interfaz en SVG en línea (madera, papel, cera, hojas). Los colores son
// variables CSS que define applyTheme() desde theme.ts: aquí no hay colores sueltos.

/** Crea un nodo con un SVG decorativo (oculto para lectores de pantalla). */
export function svgArt(markup: string, className: string, viewBox: string, preserve = 'none'): HTMLElement {
  const span = document.createElement('span');
  span.className = `art ${className}`;
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = `<svg viewBox="${viewBox}" preserveAspectRatio="${preserve}" xmlns="http://www.w3.org/2000/svg">${markup}</svg>`;
  return span;
}

const INK = 'var(--ink)';

/** Tablón de madera con vetas, clavos y cuerdas: fondo del HUD. */
export const woodSign = () =>
  svgArt(
    `<path d="M22 0v10M378 0v10" stroke="var(--bark)" stroke-width="3" stroke-dasharray="3 2"/>
     <path d="M8 12 Q4 10 6 18 L4 50 Q4 58 14 58 L388 60 Q397 59 396 50 L394 16 Q396 9 386 10 Z" fill="var(--wood)" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
     <path d="M14 16 L386 15 L386 22 Q200 26 14 22 Z" fill="var(--glow)" opacity=".18"/>
     <path d="M20 30 C90 26 140 36 210 31 S330 27 380 33" stroke="var(--bark)" stroke-width="1.6" fill="none" opacity=".7"/>
     <path d="M30 44 C110 40 170 49 240 44 S340 41 376 46" stroke="var(--bark)" stroke-width="1.3" fill="none" opacity=".55"/>
     <ellipse cx="300" cy="37" rx="9" ry="4" fill="none" stroke="var(--bark)" stroke-width="1.4" opacity=".6"/>
     <circle cx="22" cy="20" r="3.2" fill="var(--stone)" stroke="${INK}" stroke-width="1.2"/>
     <circle cx="378" cy="20" r="3.2" fill="var(--stone)" stroke="${INK}" stroke-width="1.2"/>`,
    'art--sign',
    '0 0 400 62',
  );

/** Etiqueta de papel colgante para el día y la estación. */
export const dayTag = () =>
  svgArt(
    `<path d="M10 4 H92 Q98 4 98 10 V48 Q98 54 92 54 H10 L2 29 Z" fill="var(--paper)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
     <circle cx="13" cy="29" r="3.5" fill="var(--wood)" stroke="${INK}" stroke-width="1.2"/>
     <path d="M20 47 Q55 51 92 46" stroke="var(--leaf)" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
    'art--tag',
    '0 0 100 58',
  );

/** Papel rasgado con cinta: fondo de la bitácora. */
export const tornPaper = () =>
  svgArt(
    `<path d="M4 6 L40 3 L80 7 L130 2 L180 6 L230 3 L280 7 L330 2 L380 6 L396 4 L395 20 L398 36 L394 52 L360 55 L310 51 L260 56 L210 52 L160 56 L110 51 L60 55 L20 51 L3 54 L6 38 L2 22 Z" fill="var(--paper)" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
     <path d="M14 46 L120 47" stroke="var(--wood)" stroke-width="1" opacity=".25"/>
     <rect x="-16" y="-7" width="46" height="15" rx="2" transform="translate(30 6) rotate(-8)" fill="var(--peach)" opacity=".85"/>`,
    'art--torn',
    '0 0 400 58',
  );

/** Montículo de pasto donde se para el retrato en la tarjeta. */
export const grassMound = () =>
  svgArt(
    `<ellipse cx="40" cy="14" rx="36" ry="9" fill="var(--leaf)" stroke="${INK}" stroke-width="2"/>
     <path d="M14 10 q2 -7 4 0 M24 8 q2 -8 5 -1 M52 8 q3 -7 5 0 M62 11 q2 -6 4 0" stroke="var(--leafDark)" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    'art--mound',
    '0 0 80 24',
    'xMidYMid meet',
  );

/** Ramita de hojas para las cintas de título. */
export const sprig = () =>
  svgArt(
    `<path d="M4 20 C14 16 24 12 36 4" stroke="var(--leafDark)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
     <path d="M14 15 C10 6 20 4 22 12Z" fill="var(--leaf)" stroke="${INK}" stroke-width="1.5"/>
     <path d="M24 10 C24 2 34 2 32 9Z" fill="var(--leaf)" stroke="${INK}" stroke-width="1.5"/>
     <path d="M20 16 C28 18 30 24 22 24Z" fill="var(--leaf)" stroke="${INK}" stroke-width="1.5"/>`,
    'art--sprig',
    '0 0 40 26',
    'xMidYMid meet',
  );

