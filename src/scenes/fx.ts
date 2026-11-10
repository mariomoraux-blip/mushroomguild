// Efectos del tablero (004): animaciones cortas por jugada, motas sobre los árboles vivos y halo del Árbol Padre.
// Solo dibuja encima del claro ya pintado: el estado final lo muestra `paint.ts`, aquí solo va la transición.
// Con `prefers-reduced-motion` no se anima nada (solo queda el estado final).
import * as Phaser from 'phaser';
import type { Effect } from '../effects';
import { W, type GameState, type Point } from '../rules';
import { BOARD_ART, hex, MOTION, type ColorToken } from '../theme';
import { groundKey, objectKey } from './paint';
import type { SeasonSlug } from '../theme';

const DOT = 'fx-dot';
/** Copias del claro (022): antes de pintar las casillas válidas y antes de pintar la estación nueva. */
const COVER = 'fx-cover';
const SEASON = 'fx-season';
/** Ráfaga al cambiar de estación: pétalos, hojas o copos (como mucho 12). */
const FLURRY: Readonly<Record<SeasonSlug, readonly ColorToken[]>> = {
  spring: ['peach', 'glow', 'cream'],
  summer: ['leaf', 'sun', 'glow'],
  autumn: ['accent', 'berry', 'wood'],
  winter: ['frost', 'cream', 'paper'],
};
const FLURRY_MAX = 12;
/** Duración máxima de la animación de una jugada (spec visual-feedback › Respuesta a cada acción); despertar usa `narrative`. */
export const ACTION_MS = MOTION.ms.standard;
/** Bucles de ambiente (022: fuera de la escala de `MOTION`): latido del halo, subida y apagado de las motas. */
const HALO_MS = 1600;
const MOTE_RISE_MS = 1300;
const MOTE_FADE_MS = 900;
const E = MOTION.ease;
/** Tope de partículas vivas en pantalla (rendimiento en móvil). */
export const MAX_PARTICLES = 40;

export const reducedMotion = (): boolean => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/** Mezcla dos colores 0xRRGGBB (`t` de 0 a 1). */
const mix = (a: number, b: number, t: number): number => {
  const ch = (s: number) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t);
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
};

export class BoardFx {
  private live = 0;
  private trees: Point[] = [];
  private net: Point[] = [];
  private T = 0;
  private halo: Phaser.GameObjects.Image | null = null;
  private haloTween: Phaser.Tweens.Tween | null = null;
  private copies = new Map<string, Phaser.Textures.CanvasTexture>();
  private covers: Phaser.GameObjects.Image[] = [];
  private seasonCover: Phaser.GameObjects.Image | null = null;

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
    this.net = game.tiles.filter((t) => t.net).map(({ x, y }) => ({ x, y }));
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
      this.haloTween = this.scene.tweens.add({ targets: this.halo, alpha: 0.75, duration: HALO_MS, yoyo: true, repeat: -1, ease: E.soft.phaser });
    }
  }

  /** Copia el claro tal como está en la textura `key` (se reutiliza entre jugadas). */
  private copy(key: string, board: HTMLCanvasElement): boolean {
    const { width: w, height: h } = board;
    let tex = this.copies.get(key) ?? null;
    if (!tex) {
      tex = this.scene.textures.createCanvas(key, w, h);
      if (tex) this.copies.set(key, tex);
    } else if (tex.width !== w || tex.height !== h) tex.setSize(w, h);
    const ctx = tex?.getContext();
    if (!tex || !ctx) return false;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(board, 0, 0);
    tex.refresh();
    return true;
  }

  /** Selección (022): copia el claro antes de que se pinten las casillas válidas encima. */
  snapshot(board: HTMLCanvasElement): void {
    this.copy(COVER, board);
  }

  /**
   * Cambio de estación (022): el claro de antes (copiado antes de pintar el nuevo) se funde sobre el nuevo en
   * `narrative`, al mismo tiempo que la luz de la red, y cae una ráfaga corta de la estación nueva.
   * Con movimiento reducido, el fundido dura `fast` y no hay ráfaga.
   */
  seasonFade(board: HTMLCanvasElement, season: SeasonSlug): void {
    if (!this.copy(SEASON, board)) return;
    const reduce = reducedMotion();
    this.seasonCover?.destroy();
    const img = this.scene.add.image(0, 0, SEASON).setOrigin(0, 0).setDepth(0.45);
    this.seasonCover = img;
    this.scene.tweens.add({
      targets: img,
      alpha: 0,
      duration: reduce ? MOTION.ms.fast : MOTION.ms.narrative,
      ease: E.soft.phaser,
      onComplete: () => {
        img.destroy();
        if (this.seasonCover === img) this.seasonCover = null;
      },
    });
    if (!reduce) this.flurry(season);
  }

  /** Pétalos, hojas o copos que caen sobre el claro y se apagan (comparten el tope de partículas). */
  private flurry(season: SeasonSlug): void {
    const T = this.T;
    const colors = FLURRY[season];
    const count = Math.min(FLURRY_MAX, MAX_PARTICLES - this.live);
    for (let i = 0; i < count; i++) {
      const x = (0.2 + Math.random() * (W - 0.4)) * T;
      const y = (Math.random() * 1.5 - 0.5) * T;
      const dot = this.scene.add.image(x, y, DOT).setDepth(6).setTint(hex(colors[i % colors.length]!)).setDisplaySize(T * 0.14, T * 0.1).setAlpha(0);
      this.live++;
      this.scene.tweens.add({
        targets: dot,
        x: x + (Math.random() - 0.5) * T,
        y: y + (1.5 + Math.random()) * T,
        angle: (Math.random() - 0.5) * 180,
        alpha: { from: 0.95, to: 0 },
        duration: MOTION.ms.narrative,
        delay: i * (MOTION.ms.standard / FLURRY_MAX),
        ease: E.soft.phaser,
        onComplete: () => {
          this.live--;
          dot.destroy();
        },
      });
    }
  }

  /**
   * Las casillas válidas aparecen en un fundido escalonado desde el dock (de abajo hacia arriba, `fast` en total):
   * cada una queda tapada por su recorte de la copia, que se desvanece. La ★ late una vez. Con movimiento reducido,
   * todas juntas en `fast` y sin latido.
   */
  reveal(tiles: readonly Point[], star: Point | null): void {
    for (const c of this.covers) c.destroy();
    this.covers = [];
    if (!this.copies.has(COVER) || !this.T || !tiles.length) return;
    const T = this.T;
    const reduce = reducedMotion();
    const ys = tiles.map((t) => t.y);
    const [top, bottom] = [Math.min(...ys), Math.max(...ys)];
    const spread = MOTION.ms.fast - MOTION.ms.instant;
    for (const t of tiles) {
      const img = this.scene.add.image(0, 0, COVER).setOrigin(0, 0).setDepth(0.4).setCrop(t.x * T, t.y * T, T, T);
      this.covers.push(img);
      this.scene.tweens.add({
        targets: img,
        alpha: 0,
        duration: reduce ? MOTION.ms.fast : MOTION.ms.instant,
        delay: reduce || bottom === top ? 0 : ((bottom - t.y) / (bottom - top)) * spread,
        ease: E.soft.phaser,
        onComplete: () => {
          img.destroy();
          this.covers = this.covers.filter((c) => c !== img);
        },
      });
    }
    if (!star || reduce) return;
    const [cx, cy] = this.center(star);
    const pulse = this.scene.add.image(cx, cy, DOT).setDepth(6).setTint(hex('sun')).setBlendMode(Phaser.BlendModes.ADD).setDisplaySize(T * 0.5, T * 0.5);
    this.scene.tweens.add({ targets: pulse, displayWidth: T * 1.1, displayHeight: T * 1.1, alpha: 0, duration: MOTION.ms.standard, ease: E.springy.phaser, onComplete: () => pulse.destroy() });
  }

  /**
   * Un retrato llega a su casilla (022) con la firma de su especie (design.md › Firma por especie). `img` ya está en
   * su lugar final; el tween parte de un poco antes. Con movimiento reducido, solo un fundido `fast`.
   */
  arrive(img: Phaser.GameObjects.Image, species: string): void {
    const tw = this.scene.tweens;
    const T = this.T;
    const { y, scaleX, scaleY } = img;
    if (reducedMotion() || !T) {
      tw.add({ targets: img, alpha: { from: 0, to: 1 }, duration: MOTION.ms.fast, ease: E.soft.phaser });
      return;
    }
    switch (species) {
      case 'champi': // Bruno: cae 6 px y aplasta una vez.
        tw.add({ targets: img, y: { from: y - T * 0.09, to: y }, duration: MOTION.ms.standard, ease: E.springy.phaser });
        tw.add({ targets: img, scaleX: scaleX * 1.05, scaleY: scaleY * 0.92, duration: MOTION.ms.instant, delay: MOTION.ms.fast, yoyo: true, ease: E.soft.phaser });
        break;
      case 'lactarius': // Indi: se funde y baja flotando.
        tw.add({ targets: img, alpha: { from: 0, to: 1 }, y: { from: y - T * 0.08, to: y }, duration: MOTION.ms.standard, ease: E.soft.phaser });
        break;
      case 'amanita': // Rubí: se agacha un 5 % y se acomoda.
        tw.add({ targets: img, scaleY: { from: scaleY * 0.95, to: scaleY }, duration: MOTION.ms.standard, delay: MOTION.ms.instant, ease: E.settle.phaser });
        break;
      case 'gliophorus': { // Chispa: doble meneo de ±4°.
        const s = { t: 0 };
        tw.add({ targets: s, t: 1, duration: MOTION.ms.fast * 2, ease: E.soft.phaser, onUpdate: () => img.setAngle(4 * Math.sin(s.t * Math.PI * 4)), onComplete: () => img.setAngle(0) });
        break;
      }
      case 'mago': { // Maestra Bruma: fundido solemne con un halo arcano, sin rebote.
        tw.add({ targets: img, alpha: { from: 0, to: 1 }, duration: MOTION.ms.narrative, ease: E.soft.phaser });
        const halo = this.scene.add.image(img.x, y - img.displayHeight * 0.45, DOT).setDepth(4.9).setTint(hex('arcane')).setBlendMode(Phaser.BlendModes.ADD);
        halo.setDisplaySize(T * 1.3, T * 1.3).setAlpha(0);
        tw.add({ targets: halo, alpha: 0.8, duration: MOTION.ms.narrative / 2, yoyo: true, ease: E.soft.phaser, onComplete: () => halo.destroy() });
        break;
      }
    }
  }

  /** Mes nuevo (022): el retrato deja su casilla con un fundido (también con movimiento reducido: solo opacidad). */
  leave(img: Phaser.GameObjects.Image): void {
    if (img.getData('leaving')) return;
    if (!this.T) return void img.setVisible(false);
    img.setData('leaving', true);
    this.scene.tweens.add({ targets: img, alpha: 0, duration: MOTION.ms.fast, ease: E.leave.phaser, onComplete: () => img.setVisible(false).setAlpha(1).setData('leaving', false) });
  }

  /** Anima los efectos de una jugada. */
  play(effects: Effect[], season: SeasonSlug): void {
    if (reducedMotion() || !this.T) return;
    for (const e of effects) {
      if (e.kind === 'weave') this.weave(e, season);
      else if (e.kind === 'decompose') this.decompose(e, season);
      else if (e.kind === 'revive') this.burst(e.at, ['leaf', 'glow', 'sun'], 12, 0.7);
      else if (e.kind === 'awaken') this.awaken(e.at);
      else if (e.kind === 'wither') this.wither(e.at, season);
    }
  }

  private center(p: Point): [number, number] {
    return [(p.x + 0.5) * this.T, (p.y + 0.5) * this.T];
  }

  /**
   * Tejer: el pasto de antes se desvanece y un hilo crece desde la casilla vecina de la red. Nace con un destello
   * índigo (Indi) que se vuelve dorado (022). El Brote arcano (una roca) abre antes un aro `arcane` lento y la roca se funde.
   */
  private weave(e: Extract<Effect, { kind: 'weave' }>, season: SeasonSlug): void {
    const T = this.T;
    const [cx, cy] = this.center(e.at);
    const arcane = e.before.kind === 'rock';
    const delay = arcane ? MOTION.ms.standard : 0;
    if (arcane) {
      const ring = this.scene.add.image(cx, cy, DOT).setDepth(6).setTint(hex('arcane')).setBlendMode(Phaser.BlendModes.ADD).setDisplaySize(T * 0.3, T * 0.3);
      this.scene.tweens.add({ targets: ring, displayWidth: T * 1.5, displayHeight: T * 1.5, alpha: 0, duration: MOTION.ms.narrative, ease: E.soft.phaser, onComplete: () => ring.destroy() });
      const rock = objectKey(e.before, season);
      if (rock && this.scene.textures.exists(rock)) {
        const frame = this.scene.textures.getFrame(rock);
        const img = this.scene.add.image(cx, (e.at.y + 0.9) * T, rock).setOrigin(0.5, 1).setDepth(3);
        img.setDisplaySize(T * 0.92, (T * 0.92 * frame.height) / frame.width);
        this.scene.tweens.add({ targets: img, alpha: 0, duration: MOTION.ms.narrative, ease: E.soft.phaser, onComplete: () => img.destroy() });
      }
    }
    const flash = hex(arcane ? 'arcane' : 'indigo');
    const ground = groundKey(e.before, season);
    if (this.scene.textures.exists(ground)) {
      const cover = this.scene.add.image(cx, cy, ground).setDisplaySize(T, T).setDepth(1);
      this.scene.tweens.add({ targets: cover, alpha: 0, duration: ACTION_MS, ease: E.leave.phaser, onComplete: () => cover.destroy() });
    }
    if (e.from) {
      const [fx, fy] = this.center(e.from);
      const line = this.scene.add.graphics().setDepth(2).setBlendMode(Phaser.BlendModes.ADD);
      const state = { t: 0 };
      this.scene.tweens.add({
        targets: state,
        t: 1,
        duration: ACTION_MS * 0.8,
        delay,
        ease: E.settle.phaser,
        onUpdate: () => {
          line.clear();
          line.lineStyle(T * 0.07, mix(flash, hex('sun'), state.t), 0.9);
          line.lineBetween(fx, fy, fx + (cx - fx) * state.t, fy + (cy - fy) * state.t);
          line.lineStyle(T * 0.025, hex('glow'), 1);
          line.lineBetween(fx, fy, fx + (cx - fx) * state.t, fy + (cy - fy) * state.t);
        },
        onComplete: () => this.scene.tweens.add({ targets: line, alpha: 0, duration: MOTION.ms.instant, onComplete: () => line.destroy() }),
      });
    }
    this.burst(e.at, ['glow', 'sun'], 6, 0.45);
  }

  /** Marchitarse (033): la red muerta (`withered`) queda un momento sobre el pasto y se funde, con polvo violeta. */
  /** La plaga viva (`blight`) se funde y deja ver la red muerta que ya pinta el suelo (035). */
  private wither(at: Point, season: SeasonSlug): void {
    const T = this.T;
    const key = season === 'winter' ? BOARD_ART.plague.winter : BOARD_ART.plague.blight;
    if (this.scene.textures.exists(key)) {
      const [cx, cy] = this.center(at);
      const img = this.scene.add.image(cx, cy, key).setDisplaySize(T, T).setDepth(1);
      this.scene.tweens.add({ targets: img, alpha: 0, delay: MOTION.ms.standard, duration: MOTION.ms.narrative, ease: E.leave.phaser, onComplete: () => img.destroy() });
    }
    this.burst(at, ['blight', 'stone'], 8, 0.5);
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
      this.scene.tweens.add({ targets: img, scaleX: img.scaleX * 0.4, scaleY: img.scaleY * 0.25, alpha: 0, duration: ACTION_MS, ease: E.leave.phaser, onComplete: () => img.destroy() });
    }
    this.burst(e.at, ['wood', 'peach', 'leaf'], 8, 0.55);
  }

  /** Despertar: un anillo de luz se abre desde el Árbol Padre y una ola dorada recorre la red desde él (022). */
  private awaken(at: Point): void {
    const [cx, cy] = this.center(at);
    const ring = this.scene.add.image(cx, cy - this.T * 0.2, DOT).setDepth(6).setTint(hex('glow')).setBlendMode(Phaser.BlendModes.ADD);
    ring.setDisplaySize(this.T * 0.6, this.T * 0.6).setAlpha(1);
    this.scene.tweens.add({ targets: ring, displayWidth: this.T * 4, displayHeight: this.T * 4, alpha: 0, duration: MOTION.ms.narrative, ease: E.settle.phaser, onComplete: () => ring.destroy() });
    this.burst(at, ['glow', 'sun'], 10, 1);
    this.wave(at);
  }

  /** Ola dorada: cada casilla de la red se enciende según su distancia por la red al árbol (`narrative` en total). */
  private wave(from: Point): void {
    const k = (p: Point) => `${p.x},${p.y}`;
    const net = new Map(this.net.map((p) => [k(p), p]));
    const dist = new Map<string, number>([[k(from), 0]]);
    const queue: Point[] = [from];
    while (queue.length) {
      const p = queue.shift()!;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const n = net.get(`${p.x + dx},${p.y + dy}`);
        if (n && !dist.has(k(n))) {
          dist.set(k(n), dist.get(k(p))! + 1);
          queue.push(n);
        }
      }
    }
    dist.delete(k(from));
    const far = Math.max(1, ...dist.values());
    const tiles = [...dist].sort((a, b) => a[1] - b[1]).slice(0, Math.max(0, MAX_PARTICLES - this.live));
    for (const [key, d] of tiles) {
      const [cx, cy] = this.center(net.get(key)!);
      const dot = this.scene.add.image(cx, cy, DOT).setDepth(6).setTint(hex('sun')).setBlendMode(Phaser.BlendModes.ADD).setDisplaySize(this.T * 0.5, this.T * 0.5).setAlpha(0);
      this.live++;
      this.scene.tweens.add({
        targets: dot,
        alpha: 0.85,
        duration: MOTION.ms.standard / 2,
        delay: (d / far) * (MOTION.ms.narrative - MOTION.ms.standard),
        yoyo: true,
        ease: E.soft.phaser,
        onComplete: () => {
          this.live--;
          dot.destroy();
        },
      });
    }
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
        ease: E.settle.phaser,
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
      duration: MOTE_RISE_MS,
      yoyo: false,
      ease: E.settle.phaser,
      onComplete: () =>
        this.scene.tweens.add({
          targets: dot,
          alpha: 0,
          duration: MOTE_FADE_MS,
          onComplete: () => {
            this.live--;
            dot.destroy();
          },
        }),
    });
  }
}
