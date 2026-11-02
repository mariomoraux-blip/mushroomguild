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
