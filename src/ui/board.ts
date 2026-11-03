import { es } from '../copy/es';
import { tileToScreen } from '../layout';
import { H, W, type Tile } from '../rules';
import { highlighted, suggestedTile, type AppState, type Store } from '../store';
import { el } from './dom';
import { replay } from './motion';

function tileName(t: Tile): string {
  if (t.kind === 'mother') return t.alive ? es.tiles.motherAwake : es.tiles.mother;
  if (t.kind === 'tree') return t.alive ? es.tiles.treeAlive : es.tiles.tree;
  return es.tiles[t.kind];
}

/**
 * Capa de botones transparentes sobre el canvas: una por casilla. Unifica toque, clic y teclado
 * (Phaser solo dibuja). Tab recorre solo las casillas válidas.
 */
export function mountBoardOverlay(root: HTMLElement, store: Store) {
  root.setAttribute('role', 'group');
  root.setAttribute('aria-label', es.tiles.boardLabel);
  const buttons: HTMLButtonElement[] = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const b = el('button', { class: 'cell', type: 'button', 'data-x': x, 'data-y': y, tabindex: -1 });
      buttons.push(b);
      root.append(b);
    }
  }
  root.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('.cell');
    if (!b) return;
    const before = store.getState();
    store.dispatch({ type: 'tapTile', x: Number(b.dataset.x), y: Number(b.dataset.y) });
    rejected(before, b);
  });
  root.addEventListener('contextmenu', (e) => e.preventDefault());

  /** Rechazo en el lugar del toque (022): el juego no cambió y la bitácora dio un motivo. */
  const rejected = (before: AppState, b: HTMLElement) => {
    const after = store.getState();
    if (after.game === before.game && after.ui.notice !== before.ui.notice && after.ui.notice.tone === 'warn') replay(b, 'is-reject');
  };

  let tile = 0;
  const place = (size: number) => {
    tile = size;
    buttons.forEach((b) => {
      const { left, top } = tileToScreen(Number(b.dataset.x), Number(b.dataset.y), tile);
      b.style.left = `${left}px`;
      b.style.top = `${top}px`;
      b.style.width = b.style.height = `${tile}px`;
    });
  };

  const render = (state: AppState) => {
    const valid = new Set(highlighted(state).map((t) => `${t.x},${t.y}`));
    const star = suggestedTile(state);
    state.game.tiles.forEach((t, i) => {
      const b = buttons[i]!;
      const ok = valid.has(`${t.x},${t.y}`);
      const parts = [tileName(t), es.tiles.position(t.x, t.y)];
      if (t.kind === 'mother') parts.push(es.tiles.goal);
      if (t.kind === 'tree' && !t.alive && t.faded) parts.push(es.tiles.faded);
      else if (t.kind === 'tree' && !t.alive && t.fading) parts.push(es.tiles.fading);
      if (t.net && t.kind !== 'home') parts.push(es.tiles.inNet);
      if (ok) parts.push(es.tiles.valid);
      if (ok && star && star.x === t.x && star.y === t.y) parts.push(`★ ${es.advice.star}`);
      b.setAttribute('aria-label', parts.join(', '));
      b.dataset.valid = String(ok);
      b.tabIndex = ok ? 0 : -1;
    });
  };

  /** Lleva el foco a la primera casilla válida (flujo de teclado). */
  const focusFirstValid = () => buttons.find((b) => b.dataset.valid === 'true')?.focus();

  /** Toque que llega desde fuera de la capa (el fondo de una hoja abierta): mismo camino que un toque en la casilla. */
  const tap = (x: number, y: number) => {
    const b = buttons[y * W + x];
    const before = store.getState();
    store.dispatch({ type: 'tapTile', x, y });
    if (b) rejected(before, b);
  };

  return { place, render, focusFirstValid, tap };
}
