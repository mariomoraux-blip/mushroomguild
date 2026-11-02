import * as Phaser from 'phaser';
import { neighbors, W, type Tile } from '../rules';
import { highlighted, type AppState, type Store } from '../store';
import { hex, renderResolution } from '../theme';

/**
 * Dibuja el tablero 5×8 con formas placeholder. Solo lee el estado del store; nunca lo cambia.
 * La entrada (toque, clic, teclado) la recibe la capa DOM de `ui/board.ts`.
 */
export class GameScene extends Phaser.Scene {
  private g: Phaser.GameObjects.Graphics | null = null;
  private tile = 0;

  constructor(private readonly store: Store) {
    super('Game');
  }

  create(): void {
    this.g = this.add.graphics();
    const unsubscribe = this.store.subscribe((s) => this.draw(s));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, unsubscribe);
    this.draw(this.store.getState());
  }

  /** Cambia el tamaño de casilla (px CSS) y redibuja. */
  setTile(tile: number): void {
    this.tile = tile;
    this.draw(this.store.getState());
  }

  private draw(state: AppState): void {
    const g = this.g;
    if (!g) return;
    g.clear();
    if (!this.tile) return;
    const T = this.tile * renderResolution(); // px del canvas (≤ 2×)
    const game = state.game;
    const valid = new Set(highlighted(state).map((t) => `${t.x},${t.y}`));
    const center = (t: Tile) => ({ cx: (t.x + 0.5) * T, cy: (t.y + 0.5) * T });

    // Suelo y cuadrícula.
    g.fillStyle(hex('soil'), 1).fillRect(0, 0, T * 5, T * 8);
    g.lineStyle(Math.max(1, T * 0.02), hex('ink'), 0.18);
    for (const t of game.tiles) g.strokeRect(t.x * T, t.y * T, T, T);

    // Red de micelio: tinte en las casillas de la red y líneas entre vecinas.
    for (const t of game.tiles) if (t.net) g.fillStyle(hex('mycelium'), 0.2).fillRect(t.x * T, t.y * T, T, T);
    g.lineStyle(T * 0.07, hex('mycelium'), 0.9);
    for (const t of game.tiles) {
      if (!t.net) continue;
      for (const n of neighbors(game, t.x, t.y)) {
        if (!n.net || n.y * W + n.x < t.y * W + t.x) continue; // cada par una vez
        const a = center(t);
        const b = center(n);
        g.lineBetween(a.cx, a.cy, b.cx, b.cy);
      }
    }

    for (const t of game.tiles) {
      const { cx, cy } = center(t);
      g.lineStyle(T * 0.035, hex('ink'), 1);
      switch (t.kind) {
        case 'soil':
          if (t.net) {
            // Destellos índigo del micelio tejido.
            g.fillStyle(hex('indigo'), 0.9);
            g.fillCircle(cx - T * 0.18, cy + T * 0.16, T * 0.045);
            g.fillCircle(cx + T * 0.2, cy - T * 0.14, T * 0.035);
          }
          break;
        case 'log': {
          const w = T * 0.7;
          const h = T * 0.28;
          g.fillStyle(hex('wood'), t.uses ? 0.55 : 1).fillRoundedRect(cx - w / 2, cy - h / 2, w, h, h / 2);
          g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, h / 2);
          break;
        }
        case 'rock':
          g.fillStyle(hex('ink'), 0.55).fillEllipse(cx, cy + T * 0.04, T * 0.62, T * 0.46);
          g.strokeEllipse(cx, cy + T * 0.04, T * 0.62, T * 0.46);
          break;
        case 'tree':
        case 'mother': {
          const big = t.kind === 'mother';
          const r = T * (big ? 0.4 : 0.28);
          g.fillStyle(hex('wood'), 1).fillRect(cx - T * 0.05, cy, T * 0.1, T * (big ? 0.42 : 0.36));
          // Copa opaca: el gris es tinta translúcida sobre la tierra base.
          g.fillStyle(hex('soil'), 1).fillCircle(cx, cy - T * 0.06, r);
          if (t.alive) g.fillStyle(hex(big ? 'accent' : 'mycelium'), 1);
          else g.fillStyle(hex('ink'), 0.35);
          g.fillCircle(cx, cy - T * 0.06, r);
          g.strokeCircle(cx, cy - T * 0.06, r);
          break;
        }
        case 'home':
          g.fillStyle(hex('paper'), 1).fillCircle(cx, cy, T * 0.3);
          g.lineStyle(T * 0.05, hex('wood'), 1).strokeCircle(cx, cy, T * 0.3);
          g.fillStyle(hex('wood'), 1).fillTriangle(cx - T * 0.14, cy + T * 0.1, cx + T * 0.14, cy + T * 0.1, cx, cy - T * 0.14);
          break;
      }
    }

    // Casillas válidas del miembro seleccionado.
    const inset = T * 0.06;
    for (const t of game.tiles) {
      if (!valid.has(`${t.x},${t.y}`)) continue;
      const x = t.x * T + inset;
      const y = t.y * T + inset;
      const s = T - 2 * inset;
      g.fillStyle(hex('accent'), 0.28).fillRoundedRect(x, y, s, s, T * 0.12);
      g.lineStyle(T * 0.06, hex('accent'), 1).strokeRoundedRect(x, y, s, s, T * 0.12);
    }
  }
}
