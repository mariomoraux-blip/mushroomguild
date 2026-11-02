import * as Phaser from 'phaser';
import { neighbors, seasonIndex, W, type Tile } from '../rules';
import { highlighted, suggestedTile, type AppState, type Store } from '../store';
import { hex, renderResolution, SEASON_SLUGS, SPRITE_SPECIES, spriteKey, spriteUrl, type Pose } from '../theme';

const POSES: Pose[] = ['reposo', 'trabajando', 'feliz'];

/**
 * Dibuja el claro 5×8 y a los miembros que trabajaron hoy (sprites de Blender sobre su casilla).
 * Solo lee el estado del store; nunca lo cambia. La entrada la recibe la capa DOM de `ui/board.ts`.
 */
export class GameScene extends Phaser.Scene {
  private g: Phaser.GameObjects.Graphics | null = null;
  private fg: Phaser.GameObjects.Graphics | null = null;
  private sprites = new Map<number, Phaser.GameObjects.Image>();
  private tile = 0;

  constructor(private readonly store: Store) {
    super('Game');
  }

  preload(): void {
    for (const sp of SPRITE_SPECIES) {
      for (const pose of POSES) {
        const seasons = sp === 'gliophorus' ? SEASON_SLUGS.map((_, i) => i) : [0];
        for (const i of seasons) {
          const key = spriteKey(sp, pose, i)!;
          this.load.image(key, spriteUrl(key));
        }
      }
    }
  }

  create(): void {
    this.g = this.add.graphics();
    this.fg = this.add.graphics().setDepth(10);
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
    const fg = this.fg;
    if (!g || !fg) return;
    g.clear();
    fg.clear();
    if (!this.tile) return;
    const T = this.tile * renderResolution(); // px del canvas (≤ 2×)
    const game = state.game;
    const valid = new Set(highlighted(state).map((t) => `${t.x},${t.y}`));
    const center = (t: Tile) => ({ cx: (t.x + 0.5) * T, cy: (t.y + 0.5) * T });
    const pad = T * 0.04;

    // Pradera: casillas redondeadas con un ajedrezado muy suave.
    g.fillStyle(hex('soil'), 1).fillRect(0, 0, T * 5, T * 8);
    for (const t of game.tiles) {
      g.fillStyle(hex('meadow'), (t.x + t.y) % 2 ? 0.92 : 1);
      g.fillRoundedRect(t.x * T + pad, t.y * T + pad, T - 2 * pad, T - 2 * pad, T * 0.14);
      // Briznas de pasto.
      if (t.kind === 'soil' && !t.net && (t.x * 7 + t.y * 3) % 3 === 0) {
        g.lineStyle(T * 0.025, hex('leaf'), 0.9);
        const bx = t.x * T + T * 0.25;
        const by = t.y * T + T * 0.75;
        g.lineBetween(bx, by, bx - T * 0.04, by - T * 0.1).lineBetween(bx + T * 0.05, by, bx + T * 0.07, by - T * 0.12);
      }
    }

    // Red de micelio: tierra tejida y hilos entre casillas vecinas.
    for (const t of game.tiles) {
      if (!t.net) continue;
      g.fillStyle(hex('mycelium'), 0.55).fillRoundedRect(t.x * T + pad, t.y * T + pad, T - 2 * pad, T - 2 * pad, T * 0.14);
      g.lineStyle(T * 0.035, hex('mycelium'), 1).strokeRoundedRect(t.x * T + pad * 2, t.y * T + pad * 2, T - 4 * pad, T - 4 * pad, T * 0.12);
    }
    g.lineStyle(T * 0.06, hex('mycelium'), 1);
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
      const ink = () => g.lineStyle(T * 0.03, hex('ink'), 1);
      switch (t.kind) {
        case 'soil':
          if (t.net) {
            g.fillStyle(hex('indigo'), 0.9);
            g.fillCircle(cx - T * 0.2, cy + T * 0.18, T * 0.04);
            g.fillCircle(cx + T * 0.22, cy - T * 0.16, T * 0.03);
          }
          break;
        case 'log': {
          const w = T * 0.68;
          const h = T * 0.26;
          g.fillStyle(hex('wood'), t.uses ? 0.6 : 1).fillRoundedRect(cx - w / 2, cy - h / 2, w, h, h / 2);
          ink();
          g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, h / 2);
          g.fillStyle(hex('paper'), 1).fillEllipse(cx + w / 2 - h / 2, cy, h * 0.7, h * 0.85);
          g.strokeEllipse(cx + w / 2 - h / 2, cy, h * 0.7, h * 0.85);
          break;
        }
        case 'rock':
          g.fillStyle(hex('stone'), 1).fillEllipse(cx, cy + T * 0.05, T * 0.62, T * 0.44);
          ink();
          g.strokeEllipse(cx, cy + T * 0.05, T * 0.62, T * 0.44);
          g.fillStyle(hex('paper'), 0.45).fillEllipse(cx - T * 0.1, cy - T * 0.03, T * 0.18, T * 0.08);
          break;
        case 'tree':
        case 'mother': {
          const big = t.kind === 'mother';
          const r = T * (big ? 0.36 : 0.26);
          const crown = t.alive ? (big ? 'accent' : 'leaf') : 'stone';
          g.fillStyle(hex('wood'), 1).fillRoundedRect(cx - T * 0.055, cy - T * 0.02, T * 0.11, T * (big ? 0.44 : 0.38), T * 0.03);
          ink();
          g.strokeRoundedRect(cx - T * 0.055, cy - T * 0.02, T * 0.11, T * (big ? 0.44 : 0.38), T * 0.03);
          // Copa en tres bolas.
          const balls: [number, number, number][] = [
            [cx - r * 0.55, cy - T * 0.02, r * 0.7],
            [cx + r * 0.55, cy - T * 0.02, r * 0.7],
            [cx, cy - r * 0.55, r * 0.85],
          ];
          g.fillStyle(hex(crown), 1);
          for (const [bx, by, br] of balls) g.fillCircle(bx, by - T * 0.06, br);
          ink();
          for (const [bx, by, br] of balls) g.strokeCircle(bx, by - T * 0.06, br);
          g.fillStyle(hex(crown), 1);
          for (const [bx, by, br] of balls) g.fillCircle(bx, by - T * 0.06, br - T * 0.03);
          g.fillStyle(hex('paper'), t.alive ? 0.35 : 0.2).fillCircle(cx - r * 0.25, cy - r * 0.75 - T * 0.06, r * 0.22);
          break;
        }
        case 'home': {
          g.fillStyle(hex('paper'), 1).fillRoundedRect(cx - T * 0.2, cy - T * 0.02, T * 0.4, T * 0.3, T * 0.06);
          ink();
          g.strokeRoundedRect(cx - T * 0.2, cy - T * 0.02, T * 0.4, T * 0.3, T * 0.06);
          g.fillStyle(hex('accent'), 1).fillEllipse(cx, cy - T * 0.04, T * 0.62, T * 0.36);
          g.strokeEllipse(cx, cy - T * 0.04, T * 0.62, T * 0.36);
          g.fillStyle(hex('wood'), 1).fillRoundedRect(cx - T * 0.06, cy + T * 0.1, T * 0.12, T * 0.18, T * 0.05);
          g.fillStyle(hex('paper'), 1).fillCircle(cx - T * 0.13, cy - T * 0.08, T * 0.04).fillCircle(cx + T * 0.1, cy - T * 0.12, T * 0.03);
          break;
        }
      }
    }

    // Meta: aro dorado alrededor del Árbol Padre.
    const mother = game.tiles.find((t) => t.kind === 'mother');
    if (mother) {
      const { cx, cy } = center(mother);
      g.lineStyle(T * 0.05, hex('accent'), 1).strokeCircle(cx, cy - T * 0.02, T * 0.47);
    }

    // Casillas válidas del miembro seleccionado.
    const inset = T * 0.06;
    for (const t of game.tiles) {
      if (!valid.has(`${t.x},${t.y}`)) continue;
      const x = t.x * T + inset;
      const y = t.y * T + inset;
      const s = T - 2 * inset;
      fg.fillStyle(hex('sun'), 0.22).fillRoundedRect(x, y, s, s, T * 0.14);
      fg.lineStyle(T * 0.06, hex('sun'), 1).strokeRoundedRect(x, y, s, s, T * 0.14);
    }

    // ★ en la casilla sugerida.
    const star = suggestedTile(state);
    if (star && valid.has(`${star.x},${star.y}`)) {
      const { cx, cy } = center(star);
      const pts: Phaser.Math.Vector2[] = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? T * 0.1 : T * 0.24;
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        pts.push(new Phaser.Math.Vector2(cx + r * Math.cos(a), cy - T * 0.18 + r * Math.sin(a)));
      }
      fg.fillStyle(hex('sun'), 1).fillPoints(pts, true);
      fg.lineStyle(T * 0.03, hex('ink'), 1).strokePoints(pts, true);
    }

    this.drawWorkers(state, T);
  }

  /** Miembros que trabajaron hoy: su sprite "trabajando" sobre la casilla donde actuaron. */
  private drawWorkers(state: AppState, T: number): void {
    const season = seasonIndex(state.game.day);
    const seen = new Set<number>();
    for (const m of state.game.members) {
      if (!m.at) continue;
      const key = spriteKey(m.species, 'trabajando', season);
      if (!key || !this.textures.exists(key)) continue;
      seen.add(m.id);
      let img = this.sprites.get(m.id);
      if (!img) {
        img = this.add.image(0, 0, key).setOrigin(0.5, 1).setDepth(5);
        this.sprites.set(m.id, img);
      }
      // Mismo ancho para todos; el alto sale de cada sprite, así Maestra Bruna se ve más alta sin deformarse.
      const w = T * 1.05;
      const frame = this.textures.getFrame(key);
      img.setTexture(key).setDisplaySize(w, (w * frame.height) / frame.width).setPosition((m.at.x + 0.5) * T, (m.at.y + 1) * T - T * 0.04).setVisible(true);
    }
    for (const [id, img] of this.sprites) if (!seen.has(id)) img.setVisible(false);
  }
}
