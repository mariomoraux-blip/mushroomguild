// Microinteracciones del DOM (022): reinician una animación CSS de clase y ponen la etiqueta «±n» de un contador.
// Las duraciones y curvas viven en styles.css (--motion-*, --ease-*); con movimiento reducido, el CSS deja solo fundidos.
import { MOTION } from '../theme';
import { el } from './dom';

/** Vuelve a correr la animación de `cls` aunque ya la tenga: un toque repetido reinicia, no se acumula. */
export function replay(node: Element, cls: string): void {
  node.classList.remove(cls);
  void (node as HTMLElement).offsetWidth;
  node.classList.add(cls);
}

/** Saltito del contador, etiqueta «+2» o «−1» que sube y se funde, y el número teñido (ganancia o costo). */
export function countChange(chip: HTMLElement, n: number): void {
  replay(chip, 'is-bump');
  if (!n) return;
  chip.querySelector('.chip__delta')?.remove();
  const tag = el('span', { class: 'chip__delta', 'aria-hidden': 'true', 'data-sign': n > 0 ? '+' : '-' }, `${n > 0 ? '+' : '−'}${Math.abs(n)}`);
  tag.addEventListener('animationend', () => tag.remove());
  chip.append(tag);
  chip.classList.remove(n > 0 ? 'is-cost' : 'is-gain');
  replay(chip, n > 0 ? 'is-gain' : 'is-cost');
}

const leaving = new WeakMap<HTMLElement, number>();

/** Muestra una capa (hoja, carta, pantalla); si estaba saliendo, se queda. La entrada es CSS (al dejar de estar oculta). */
export function showLayer(root: HTMLElement): void {
  window.clearTimeout(leaving.get(root));
  leaving.delete(root);
  root.classList.remove('is-leaving');
  root.hidden = false;
}

/** Sale una capa (022): baja y se funde en `fast` sin atrapar toques (`.is-leaving`); después se oculta y se vacía. */
export function hideLayer(root: HTMLElement): void {
  if (root.hidden || leaving.has(root)) return;
  root.classList.add('is-leaving');
  leaving.set(root, window.setTimeout(() => {
    leaving.delete(root);
    root.classList.remove('is-leaving');
    root.hidden = true;
    root.replaceChildren();
  }, MOTION.ms.fast));
}

/**
 * Cambio de carta en una secuencia (intro): la carta vieja queda como copia muda, sale a la izquierda y se funde
 * mientras la nueva entra desde la derecha (`.is-out` / `.is-in`). La copia no es un diálogo ni tiene botones activos.
 */
export function turnCard(root: HTMLElement, old: HTMLElement, next: HTMLElement): void {
  const { offsetLeft: left, offsetTop: top, offsetWidth: width } = old;
  Object.assign(old.style, { position: 'absolute', left: `${left}px`, top: `${top}px`, width: `${width}px`, margin: '0' });
  old.inert = true;
  old.setAttribute('aria-hidden', 'true');
  old.removeAttribute('role');
  for (const n of old.querySelectorAll('[id]')) n.removeAttribute('id');
  for (const b of old.querySelectorAll('.story__btn--primary')) b.classList.replace('story__btn--primary', 'is-primary');
  old.classList.add('is-out');
  next.classList.add('is-in');
  window.setTimeout(() => old.remove(), MOTION.ms.fast);
  root.replaceChildren(old, next);
}
