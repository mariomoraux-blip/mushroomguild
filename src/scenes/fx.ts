// Efectos del tablero (004): animaciones cortas por jugada, motas sobre los árboles vivos y halo del Árbol Padre.
// Solo dibuja encima del claro ya pintado: el estado final lo muestra `paint.ts`, aquí solo va la transición.
// Con `prefers-reduced-motion` no se anima nada (solo queda el estado final).
import * as Phaser from 'phaser';
import type { Effect } from '../effects';
import type { GameState, Point } from '../rules';
import { hex, type ColorToken } from '../theme';
import { groundKey, objectKey } from './paint';
import type { SeasonSlug } from '../theme';

const DOT = 'fx-dot';
/** Duración máxima de la animación de una jugada (spec visual-feedback › Respuesta a cada acción). */
export const ACTION_MS = 400;
/** Tope de partículas vivas en pantalla (rendimiento en móvil). */
export const MAX_PARTICLES = 40;

export const reducedMotion = (): boolean => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

export class BoardFx {
  private live = 0;
  private trees: Point[] = [];
  private T = 0;
  private halo: Phaser.GameObjects.Image | null = null;
  private haloTween: Phaser.Tweens.Tween | null = null;

  constructor(private readonly scene: Phaser.Scene) {
    // Textura de punto suave (degradado radial blanco), teñida por cada efecto.
    if (!scene.textures.exists(DOT)) {
      const size = 32;
      const tex = scene.textures.createCanvas(DOT, size, size);
      const ctx = tex?.getContext();
      if (tex && ctx) {
        const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.45, 'rgba(255,255,255,0.75)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
        tex.refresh();
      }
    }
    // Motas que suben de los árboles vivos, de a una cada tanto.
    scene.time.addEvent({ delay: 450, loop: true, callback: () => this.mote() });
  }

  /** Actualiza el tamaño de casilla y los árboles vivos (para las motas). */
  update(game: GameState, T: number): void {
    this.T = T;
    this.trees = game.tiles.filter((t) => t.kind === 'tree' && t.alive).map(({ x, y }) => ({ x, y }));
  }

  /** Halo cálido detrás del Árbol Padre despierto; late suave si se permite movimiento. */
  fatherHalo(at: Point | null, awake: boolean, T: number): void {
    if (!at || !awake) {
      this.halo?.setVisible(false);
      return;
    }
    if (!this.halo) {
      this.halo = this.scene.add.image(0, 0, DOT).setDepth(3.5).setTint(hex('glow')).setBlendMode(Phaser.BlendModes.ADD);
    }
    this.halo.setPosition((at.x + 0.5) * T, (at.y + 0.35) * T).setDisplaySize(T * 2.4, T * 2.1).setVisible(true);
    if (reducedMotion()) {
      this.haloTween?.stop();
      this.haloTween = null;
      this.halo.setAlpha(0.55);
    } else if (!this.haloTween) {
      this.halo.setAlpha(0.4);
      this.haloTween = this.scene.tweens.add({ targets: this.halo, alpha: 0.75, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  }

  /** Anima los efectos de una jugada. */
  play(effects: Effect[], season: SeasonSlug): void {
    if (reducedMotion() || !this.T) return;
    for (const e of effects) {
      if (e.kind === 'weave') this.weave(e, season);
      else if (e.kind === 'decompose') this.decompose(e, season);
      else if (e.kind === 'revive') this.burst(e.at, ['leaf', 'glow', 'sun'], 12, 0.7);
      else if (e.kind === 'awaken') this.awaken(e.at);
    }
  }

  private center(p: Point): [number, number] {
    return [(p.x + 0.5) * this.T, (p.y + 0.5) * this.T];
  }

  /** Tejer: el pasto de antes se desvanece y un hilo dorado crece desde la casilla vecina de la red. */
  private weave(e: Extract<Effect, { kind: 'weave' }>, season: SeasonSlug): void {
    const T = this.T;
    const [cx, cy] = this.center(e.at);
    const ground = groundKey(e.before, season);
    if (this.scene.textures.exists(ground)) {
      const cover = this.scene.add.image(cx, cy, ground).setDisplaySize(T, T).setDepth(1);
      this.scene.tweens.add({ targets: cover, alpha: 0, duration: ACTION_MS, ease: 'Quad.easeIn', onComplete: () => cover.destroy() });
    }
    if (e.from) {
      const [fx, fy] = this.center(e.from);
      const line = this.scene.add.graphics().setDepth(2).setBlendMode(Phaser.BlendModes.ADD);
      const state = { t: 0 };
      this.scene.tweens.add({
        targets: state,
        t: 1,
        duration: ACTION_MS * 0.8,
        ease: 'Cubic.easeOut',
        onUpdate: () => {
          line.clear();
          line.lineStyle(T * 0.07, hex('sun'), 0.9);
          line.lineBetween(fx, fy, fx + (cx - fx) * state.t, fy + (cy - fy) * state.t);
          line.lineStyle(T * 0.025, hex('glow'), 1);
          line.lineBetween(fx, fy, fx + (cx - fx) * state.t, fy + (cy - fy) * state.t);
        },
        onComplete: () => this.scene.tweens.add({ targets: line, alpha: 0, duration: 120, onComplete: () => line.destroy() }),
      });
    }
    this.burst(e.at, ['glow', 'sun'], 6, 0.45);
  }

  /** Descomponer: el tronco de antes se encoge y se hunde, con astillas que saltan. */
  private decompose(e: Extract<Effect, { kind: 'decompose' }>, season: SeasonSlug): void {
    const T = this.T;
    const key = objectKey(e.before, season);
    if (key && this.scene.textures.exists(key)) {
      const frame = this.scene.textures.getFrame(key);
      const w = T * 0.92;
      const img = this.scene.add.image((e.at.x + 0.5) * T, (e.at.y + 0.9) * T, key).setOrigin(0.5, 1).setDepth(3);
      img.setDisplaySize(w, (w * frame.height) / frame.width);
      this.scene.tweens.add({ targets: img, scaleX: img.scaleX * 0.4, scaleY: img.scaleY * 0.25, alpha: 0, duration: ACTION_MS, ease: 'Back.easeIn', onComplete: () => img.destroy() });
    }
    this.burst(e.at, ['wood', 'peach', 'leaf'], 8, 0.55);
  }

  /** Despertar: un anillo de luz se abre desde el Árbol Padre. */
  private awaken(at: Point): void {
    const [cx, cy] = this.center(at);
    const ring = this.scene.add.image(cx, cy - this.T * 0.2, DOT).setDepth(6).setTint(hex('glow')).setBlendMode(Phaser.BlendModes.ADD);
    ring.setDisplaySize(this.T * 0.6, this.T * 0.6).setAlpha(1);
    this.scene.tweens.add({ targets: ring, displayWidth: this.T * 4, displayHeight: this.T * 4, alpha: 0, duration: ACTION_MS, ease: 'Quad.easeOut', onComplete: () => ring.destroy() });
    this.burst(at, ['glow', 'sun'], 14, 1);
  }

  /** Estallido de puntos que salen desde el centro de la casilla y se apagan. */
  private burst(at: Point, colors: ColorToken[], n: number, reach: number): void {
    const [cx, cy] = this.center(at);
    const count = Math.min(n, MAX_PARTICLES - this.live);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const d = this.T * reach * (0.6 + Math.random() * 0.4);
      const dot = this.scene.add.image(cx, cy, DOT).setDepth(6).setTint(hex(colors[i % colors.length]!)).setBlendMode(Phaser.BlendModes.ADD);
      dot.setDisplaySize(this.T * 0.16, this.T * 0.16);
      this.live++;
      this.scene.tweens.add({
        targets: dot,
        x: cx + Math.cos(a) * d,
        y: cy + Math.sin(a) * d,
        alpha: 0,
        scale: dot.scale * 0.4,
        duration: ACTION_MS,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this.live--;
          dot.destroy();
        },
      });
    }
  }

  /** Una mota de luz que sube despacio desde un árbol vivo al azar. */
  private mote(): void {
    if (reducedMotion() || !this.T || !this.trees.length || this.live >= MAX_PARTICLES) return;
    const t = this.trees[Math.floor(Math.random() * this.trees.length)]!;
    const x = (t.x + 0.2 + Math.random() * 0.6) * this.T;
    const y = (t.y + 0.35 + Math.random() * 0.3) * this.T;
    const dot = this.scene.add.image(x, y, DOT).setDepth(6).setTint(hex(Math.random() < 0.5 ? 'glow' : 'mycelium')).setBlendMode(Phaser.BlendModes.ADD);
    dot.setDisplaySize(this.T * 0.12, this.T * 0.12).setAlpha(0);
    this.live++;
    this.scene.tweens.add({
      targets: dot,
      y: y - this.T * 0.6,
      x: x + (Math.random() - 0.5) * this.T * 0.3,
      alpha: { from: 0, to: 0.9 },
      duration: 1300,
      yoyo: false,
      ease: 'Sine.easeOut',
      onComplete: () =>
        this.scene.tweens.add({
          targets: dot,
          alpha: 0,
          duration: 900,
          onComplete: () => {
            this.live--;
            dot.destroy();
          },
        }),
    });
  }
}
