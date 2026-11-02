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

/** Medallón festoneado de papel para los recursos. */
export const medallion = () => {
  const scallops = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    return `<circle cx="${(50 + Math.cos(a) * 41).toFixed(1)}" cy="${(50 + Math.sin(a) * 41).toFixed(1)}" r="10"/>`;
  }).join('');
  return svgArt(
    `<g fill="var(--paper)" stroke="${INK}" stroke-width="2.5">${scallops}</g>
     <g fill="var(--paper)">${scallops}</g>
     <circle cx="50" cy="50" r="41" fill="var(--paper)"/>
     <circle cx="50" cy="50" r="33" fill="none" stroke="var(--wood)" stroke-width="1.8" stroke-dasharray="4 3" opacity=".7"/>`,
    'art--medal',
    '0 0 100 100',
    'xMidYMid meet',
  );
};

/** Íconos ilustrados (a color, no de trazo) para los recursos. */
export const ICON_ART: Record<string, string> = {
  nutrients: `<path d="M8 26 C8 12 18 5 30 4 C29 17 22 26 8 26Z" fill="var(--leaf)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M9 25 C15 18 20 13 27 8" stroke="var(--leafDark)" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M24 20 Q27 25 24 28 Q21 25 24 20Z" fill="var(--mycelium)" stroke="${INK}" stroke-width="1.4"/>`,
  spores: `<circle cx="16" cy="18" r="7" fill="var(--mycelium)" stroke="${INK}" stroke-width="2"/>
    <circle cx="14" cy="16" r="2" fill="var(--glow)"/>
    <circle cx="27" cy="10" r="3.6" fill="var(--glow)" stroke="${INK}" stroke-width="1.6"/>
    <circle cx="7" cy="8" r="2.8" fill="var(--sun)" stroke="${INK}" stroke-width="1.4"/>
    <circle cx="27" cy="25" r="2.6" fill="var(--mycelium)" stroke="${INK}" stroke-width="1.4"/>`,
  trees: `<path d="M16 30 V20" stroke="var(--wood)" stroke-width="4" stroke-linecap="round"/>
    <circle cx="10" cy="15" r="6.5" fill="var(--leaf)" stroke="${INK}" stroke-width="2"/>
    <circle cx="22" cy="15" r="6.5" fill="var(--leaf)" stroke="${INK}" stroke-width="2"/>
    <circle cx="16" cy="9" r="7" fill="var(--leaf)" stroke="${INK}" stroke-width="2"/>
    <circle cx="10" cy="15" r="5" fill="var(--leaf)"/><circle cx="22" cy="15" r="5" fill="var(--leaf)"/>
    <circle cx="13" cy="7" r="2" fill="var(--glow)" opacity=".8"/><circle cx="21" cy="17" r="1.6" fill="var(--berry)"/>`,
};
export const iconArt = (name: keyof typeof ICON_ART | string) => svgArt(ICON_ART[name] ?? '', `art--icon art--icon-${name}`, '0 0 32 32', 'xMidYMid meet');

/** Sello de cera (botón de ayuda). */
export const waxSeal = () =>
  svgArt(
    `<path d="M50 4 C60 8 66 2 74 10 C82 16 90 14 92 26 C96 36 100 42 94 52 C90 62 96 70 86 78 C78 86 74 94 62 94 C52 98 46 100 36 94 C26 92 18 96 12 84 C6 76 0 70 4 58 C6 48 0 40 8 30 C12 20 12 12 24 8 C34 2 40 2 50 4Z" fill="var(--berry)" stroke="${INK}" stroke-width="3"/>
     <circle cx="50" cy="50" r="30" fill="none" stroke="var(--paper)" stroke-width="3" opacity=".55"/>
     <path d="M30 28 Q40 20 52 22" stroke="var(--glow)" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/>`,
    'art--seal',
    '0 0 100 100',
    'xMidYMid meet',
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

/** Botón redondo de madera con luna y estrellas ("Fin del día"). */
export const moonButton = () =>
  svgArt(
    `<circle cx="50" cy="50" r="46" fill="var(--wood)" stroke="${INK}" stroke-width="3.5"/>
     <circle cx="50" cy="50" r="38" fill="none" stroke="var(--bark)" stroke-width="2" opacity=".7"/>
     <circle cx="50" cy="50" r="28" fill="none" stroke="var(--bark)" stroke-width="1.6" opacity=".5"/>
     <circle cx="50" cy="50" r="30" fill="var(--sun)" stroke="${INK}" stroke-width="2.5"/>
     <path d="M60 30 A20 20 0 1 0 64 64 A16 16 0 1 1 60 30Z" fill="var(--glow)" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
     <path d="M30 34 l2 4 4 1 -4 2 -2 4 -1 -4 -4 -2 4 -1Z" fill="var(--paper)"/>
     <circle cx="38" cy="62" r="2" fill="var(--paper)"/>`,
    'art--moon',
    '0 0 100 100',
    'xMidYMid meet',
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

/** Enredadera con hojas y un hongo para las esquinas del tablero. */
export const vine = (flip = false) =>
  svgArt(
    `<g transform="${flip ? 'translate(120 0) scale(-1 1)' : ''}">
      <path d="M4 4 C30 10 40 30 70 32 S110 40 118 60" stroke="var(--leafDark)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M24 10 C22 0 34 -2 36 8 C30 10 26 12 24 10Z" fill="var(--leaf)" stroke="${INK}" stroke-width="1.8"/>
      <path d="M52 30 C46 20 60 14 64 26 C58 30 56 31 52 30Z" fill="var(--leaf)" stroke="${INK}" stroke-width="1.8"/>
      <path d="M86 36 C88 24 102 28 98 40 C92 41 90 40 86 36Z" fill="var(--leaf)" stroke="${INK}" stroke-width="1.8"/>
      <path d="M8 10 v10" stroke="var(--paper)" stroke-width="4" stroke-linecap="round"/>
      <path d="M0 12 Q8 0 16 12 Z" fill="var(--berry)" stroke="${INK}" stroke-width="1.8"/>
      <circle cx="6" cy="8" r="1.6" fill="var(--paper)"/>
      <circle cx="104" cy="50" r="3" fill="var(--glow)" stroke="${INK}" stroke-width="1.2"/>
    </g>`,
    `art--vine${flip ? ' art--vine-flip' : ''}`,
    '0 0 120 64',
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

/** Sobre de semillas para "+ Reclutar". */
export const seedPacket = () =>
  svgArt(
    `<path d="M6 8 H54 L50 58 H10 Z" fill="var(--mycelium)" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
     <path d="M6 8 L30 22 L54 8" fill="var(--paper)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
     <circle cx="30" cy="38" r="9" fill="var(--paper)" stroke="${INK}" stroke-width="1.8"/>
     <path d="M30 33 v10 M25 38 h10" stroke="var(--moss)" stroke-width="3" stroke-linecap="round"/>`,
    'art--packet',
    '0 0 60 64',
    'xMidYMid meet',
  );
