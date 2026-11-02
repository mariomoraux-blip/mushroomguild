import { spriteKey, spriteUrl, type Pose } from '../theme';
/** Crea un elemento con atributos y hijos. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number | boolean | undefined> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === false) continue;
    if (k === 'class') node.className = String(v);
    else node.setAttribute(k, v === true ? '' : String(v));
  }
  node.append(...children);
  return node;
}

/** Cambia un texto solo si cambió (evita trabajo y parpadeos). */
export function setText(node: Element, text: string): void {
  if (node.textContent !== text) node.textContent = text;
}

/** Silueta placeholder del sombrero de cada especie (forma CSS, sin arte final). */
export const hat = (species: string) => el('span', { class: `hat hat--${species}`, 'aria-hidden': 'true' });

/**
 * Retrato de un miembro: sprite de Blender si existe (todas menos Maestra Bruna), si no la silueta.
 * Devuelve un contenedor estable; `setPortrait` cambia la pose sin recrearlo.
 */
export function portrait(species: string, pose: Pose = 'reposo', seasonIndex = 0, size: 'sm' | 'md' | 'lg' = 'sm'): HTMLElement {
  const box = el('span', { class: `portrait portrait--${size}`, 'aria-hidden': 'true' });
  setPortrait(box, species, pose, seasonIndex);
  return box;
}

export function setPortrait(box: HTMLElement, species: string, pose: Pose, seasonIndex = 0): void {
  const key = spriteKey(species, pose, seasonIndex);
  const want = key ?? `hat-${species}`;
  if (box.dataset.key === want) return;
  box.dataset.key = want;
  box.replaceChildren(key ? el('img', { src: spriteUrl(key), alt: '', draggable: 'false', decoding: 'async' }) : hat(species));
}

const ICONS: Record<string, string> = {
  leaf: '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z"/><path d="M5 19 14 10"/>',
  spore: '<circle cx="12" cy="12" r="4"/><circle cx="5" cy="7" r="2"/><circle cx="19" cy="6" r="1.6"/><circle cx="18" cy="18" r="2"/>',
  tree: '<circle cx="12" cy="9" r="6"/><path d="M12 15v6"/>',
  moon: '<path d="M18 15A7 7 0 0 1 9 6a7 7 0 1 0 9 9Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
  plus: '<path d="M12 6v12M6 12h12"/>',
};

/** Ícono SVG en línea (trazo con `currentColor`, sin colores sueltos). */
export function icon(name: keyof typeof ICONS | string): HTMLElement {
  const span = el('span', { class: `icon icon--${name}`, 'aria-hidden': 'true' });
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] ?? ''}</svg>`;
  return span;
}
