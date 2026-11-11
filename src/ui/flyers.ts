import { diffEffects, type Effect } from '../effects';
import type { Store } from '../store';
import { reducedMotion } from '../scenes/fx';
import { MOTION } from '../theme';
import { el } from './dom';
import { countChange, replay } from './motion';

/** Tope de piezas (esporas y hojas) que vuelan a la vez (rendimiento en móvil). */
const MAX_FLYERS = 12;
const FLY_MS = MOTION.ms.narrative;
/** Pasar la voz (022): notitas que salen de Chispa hacia la tarjeta del llamado, con 40 ms entre cada una. */
const NOTES = ['♪', '♫', '♪'];
const NOTE_STAGGER = 40;
/** Entre pieza y pieza que sale volando. */
const FLY_STAGGER = 45;

/**
 * Esporas que vuelan al contador del HUD (004): al empezar el mes, desde cada árbol vivo; con la Lluvia de
 * esporas, desde el árbol del hechizo. Desde el 022, cada árbol manda también una hoja (hojarasca) al contador de
 * nutrientes, y entre las dos no pasan de 12. Al llegar, el contador da un saltito. Con movimiento reducido no hay vuelo.
 */
export function mountFlyers(store: Store, board: HTMLElement, tileSize: () => number) {
  /** Centro de una casilla en la pantalla. */
  const tileCenter = (p: { x: number; y: number }, dy = 0.4) => {
    const T = tileSize();
    const b = board.getBoundingClientRect();
    const border = (b.width - T * 5) / 2;
    return { x: b.left + border + (p.x + 0.5) * T, y: b.top + border + (p.y + dy) * T };
  };

  /** Pasar la voz: las notitas viajan a la tarjeta del llamado, que despierta. Con movimiento reducido, solo el aro. */
  const call = (fx: Extract<Effect, { kind: 'call' }>) => {
    const card = document.querySelector<HTMLElement>(`.card[data-id="${fx.memberId}"]`);
    if (!card) return;
    if (reducedMotion()) return replay(card, 'is-called');
    const from = tileCenter(fx.at, 0.3);
    const r = card.getBoundingClientRect();
    const to = { x: r.left + r.width / 2, y: r.top + r.height * 0.35 };
    NOTES.forEach((glyph, i) => {
      const note = el('span', { class: 'fx-note', 'aria-hidden': 'true' }, glyph);
      note.style.left = `${from.x}px`;
      note.style.top = `${from.y}px`;
      document.body.append(note);
      const mid = { x: (from.x + to.x) / 2 + (i - 1) * 24, y: Math.min(from.y, to.y) - 30 };
      const anim = note.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0.6)', opacity: 0 },
          { transform: `translate(calc(${mid.x - from.x}px - 50%), calc(${mid.y - from.y}px - 50%)) scale(1)`, opacity: 1, offset: 0.5 },
          { transform: `translate(calc(${to.x - from.x}px - 50%), calc(${to.y - from.y}px - 50%)) scale(0.8)`, opacity: 0.6 },
        ],
        { duration: MOTION.ms.standard, delay: i * NOTE_STAGGER, easing: MOTION.ease.settle.css, fill: 'backwards' },
      );
      anim.onfinish = () => {
        note.remove();
        if (i === NOTES.length - 1) replay(card, 'is-called');
      };
    });
  };

  store.subscribe((state, prev) => {
    if (state.game === prev.game) return;
    const effects = diffEffects(prev.game, state.game);
    const called = effects.find((e) => e.kind === 'call');
    if (called?.kind === 'call') requestAnimationFrame(() => call(called)); // la tarjeta ya pasó a lista en el dock
    if (reducedMotion()) return;
    const fx = effects.find((e) => e.kind === 'spores');
    if (!fx || fx.kind !== 'spores') return;
    const pieces = fx.leaves && fx.amount ? Math.floor(MAX_FLYERS / 2) : MAX_FLYERS;
    if (fx.amount) fly(fx.from.slice(0, pieces), 'spores', 'fx-spore', fx.amount);
    if (fx.leaves) fly(fx.from.slice(0, pieces), 'nutrients', 'fx-leaf', fx.leaves, fx.amount ? FLY_STAGGER / 2 : 0);
  });

  /** Vuela una pieza desde cada casilla hasta el ícono del contador; la primera que llega pone el «+n». */
  const fly = (from: readonly { x: number; y: number }[], counter: 'spores' | 'nutrients', cls: string, amount: number, offset = 0) => {
    const chip = document.querySelector<HTMLElement>(`.chip--${counter}`);
    const icon = chip?.querySelector<HTMLElement>('.chip__icon');
    if (!chip || !icon) return;
    const to = icon.getBoundingClientRect();
    const tx = to.left + to.width / 2;
    const ty = to.top + to.height / 2;
    let tagged = false;
    from.forEach((p, i) => {
      const { x, y } = tileCenter(p);
      const piece = el('span', { class: cls, 'aria-hidden': 'true' });
      piece.style.left = `${x}px`;
      piece.style.top = `${y}px`;
      document.body.append(piece);
      const mid = { x: (x + tx) / 2 + (i % 2 ? 30 : -30), y: Math.min(y, ty) - 40 };
      const anim = piece.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 0 },
          { transform: `translate(calc(${mid.x - x}px - 50%), calc(${mid.y - y}px - 50%)) scale(1.1)`, opacity: 1, offset: 0.45 },
          { transform: `translate(calc(${tx - x}px - 50%), calc(${ty - y}px - 50%)) scale(0.7)`, opacity: 0.9 },
        ],
        { duration: FLY_MS, delay: offset + i * FLY_STAGGER, easing: MOTION.ease.soft.css, fill: 'backwards' },
      );
      anim.onfinish = () => {
        piece.remove();
        // La primera que llega pone el «+n» (022); las demás, el saltito.
        if (tagged) replay(chip, 'is-bump');
        else countChange(chip, amount);
        tagged = true;
      };
    });
  };
}
