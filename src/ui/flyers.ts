import { diffEffects } from '../effects';
import type { Store } from '../store';
import { reducedMotion } from '../scenes/fx';
import { el } from './dom';

/** Tope de esporas que vuelan a la vez (rendimiento en móvil). */
const MAX_FLYERS = 12;
const FLY_MS = 620;

/**
 * Esporas que vuelan al contador del HUD (004): al empezar el mes, desde cada árbol vivo; con la Lluvia de
 * esporas, desde el árbol del hechizo. Al llegar, el contador da un saltito. Con movimiento reducido no hay vuelo.
 */
export function mountFlyers(store: Store, board: HTMLElement, tileSize: () => number) {
  store.subscribe((state, prev) => {
    if (state.game === prev.game || reducedMotion()) return;
    const fx = diffEffects(prev.game, state.game).find((e) => e.kind === 'spores');
    const chip = document.querySelector<HTMLElement>('.chip--spores');
    const icon = chip?.querySelector<HTMLElement>('.chip__icon');
    if (!fx || fx.kind !== 'spores' || !chip || !icon) return;
    const T = tileSize();
    const b = board.getBoundingClientRect();
    const border = (b.width - T * 5) / 2;
    const to = icon.getBoundingClientRect();
    const tx = to.left + to.width / 2;
    const ty = to.top + to.height / 2;
    fx.from.slice(0, MAX_FLYERS).forEach((p, i) => {
      const x = b.left + border + (p.x + 0.5) * T;
      const y = b.top + border + (p.y + 0.4) * T;
      const spore = el('span', { class: 'fx-spore', 'aria-hidden': 'true' });
      spore.style.left = `${x}px`;
      spore.style.top = `${y}px`;
      document.body.append(spore);
      const mid = { x: (x + tx) / 2 + (i % 2 ? 30 : -30), y: Math.min(y, ty) - 40 };
      const anim = spore.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 0 },
          { transform: `translate(calc(${mid.x - x}px - 50%), calc(${mid.y - y}px - 50%)) scale(1.1)`, opacity: 1, offset: 0.45 },
          { transform: `translate(calc(${tx - x}px - 50%), calc(${ty - y}px - 50%)) scale(0.7)`, opacity: 0.9 },
        ],
        { duration: FLY_MS, delay: i * 45, easing: 'cubic-bezier(.5,0,.5,1)', fill: 'backwards' },
      );
      anim.onfinish = () => {
        spore.remove();
        chip.classList.remove('is-bump');
        void chip.offsetWidth; // reinicia la animación del saltito
        chip.classList.add('is-bump');
      };
    });
  });
}
