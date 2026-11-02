import * as Phaser from 'phaser';
import { H, seasonIndex, W } from '../rules';
import { grade, gradeMatrix, mixGrade, sameGrade, stageLight, type Grade } from './light';
import { paintBoard, paintMyceliumGlow } from './paint';
import { highlighted, suggestedTile, type AppState, type Store } from '../store';
import { BOARD_HEADROOM, boardArtUrl, FATHER_SCALE, fatherKey, LIGHT_TRANSITION_MS, renderResolution, SEASON_SLUGS, SPRITE_SPECIES, spriteKey, spriteUrl, type Pose } from '../theme';

const POSES: Pose[] = ['reposo', 'trabajando', 'feliz'];
const BOARD_KEY = 'claro';
const GLOW_KEY = 'micelio';

/**
 * Dibuja el claro 5×8 (pintado en Canvas2D por `paint.ts`) y a los miembros que trabajaron hoy
 * (sprites de Blender sobre su casilla, que tapan el objeto de abajo).
 * El escenario (el claro, en un contenedor, y el Árbol Padre) lleva la gradación de la estación y la
 * saturación del progreso; entre ambos, la luz del micelio sin graduar; delante, los personajes sin filtro.
 * Solo lee el estado del store; nunca lo cambia. La entrada la recibe la capa DOM de `ui/board.ts`.
 */
export class GameScene extends Phaser.Scene {
  private canvasTex: Phaser.Textures.CanvasTexture | null = null;
  private boardImage: Phaser.GameObjects.Image | null = null;
  private glowTex: Phaser.Textures.CanvasTexture | null = null;
  private glowImage: Phaser.GameObjects.Image | null = null;
  private stage: Phaser.GameObjects.Container | null = null;
  /** Filtros de la gradación: el del claro y el del Árbol Padre (va aparte, delante de la luz del micelio). */
  private colorMatrices: Phaser.Display.ColorMatrix[] = [];
  private grade: Grade | null = null;
  private target: Grade | null = null;
  private tween: Phaser.Tweens.Tween | null = null;
  private sprites = new Map<number, Phaser.GameObjects.Image>();
  private father: Phaser.GameObjects.Image | null = null;
  private tile = 0;
  private created = false;
  private readonly reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

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
    for (const awake of [false, true]) this.load.image(fatherKey(awake), boardArtUrl(fatherKey(awake)));
  }

  create(): void {
    this.created = true;
    this.stage = this.add.container(0, 0).setDepth(0);
    this.gradeWith(this.stage);
    const unsubscribe = this.store.subscribe((s) => this.draw(s));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, unsubscribe);
    this.draw(this.store.getState());
  }

  /** Cambia el tamaño de casilla (px CSS) y redibuja. */
  setTile(tile: number): void {
    this.tile = tile;
    this.draw(this.store.getState());
  }

  /** Lienzo del claro (Canvas2D) del tamaño del tablero en px del canvas. */
  private boardCanvas(w: number, h: number): Phaser.Textures.CanvasTexture | null {
    if (!this.canvasTex) {
      this.canvasTex = this.textures.createCanvas(BOARD_KEY, w, h);
      if (!this.canvasTex) return null;
      this.boardImage = this.add.image(0, 0, BOARD_KEY).setOrigin(0, 0);
      this.stage?.addAt(this.boardImage, 0);
    } else if (this.canvasTex.width !== w || this.canvasTex.height !== h) {
      this.canvasTex.setSize(w, h);
    }
    return this.canvasTex;
  }

  /** Lienzo de la luz del micelio, del mismo tamaño que el claro. */
  private glowCanvas(w: number, h: number): Phaser.Textures.CanvasTexture | null {
    if (!this.glowTex) {
      this.glowTex = this.textures.createCanvas(GLOW_KEY, w, h);
      if (!this.glowTex) return null;
      this.glowImage = this.add.image(0, 0, GLOW_KEY).setOrigin(0, 0).setDepth(3).setBlendMode(Phaser.BlendModes.ADD);
    } else if (this.glowTex.width !== w || this.glowTex.height !== h) {
      this.glowTex.setSize(w, h);
    }
    return this.glowTex;
  }

  /** Le pone a un objeto del escenario el filtro de la gradación. Sin WebGL no hay filtros: se ve sin gradación. */
  private gradeWith(obj: Phaser.GameObjects.Container | Phaser.GameObjects.Image): void {
    if (this.renderer.type !== Phaser.WEBGL) return;
    const cm = obj.enableFilters().filters!.internal.addColorMatrix().colorMatrix;
    if (this.grade) cm.set(gradeMatrix(this.grade));
    this.colorMatrices.push(cm);
  }

  /** Aplica una gradación: a los filtros del escenario y al alfa de la luz del micelio. */
  private applyGrade(g: Grade): void {
    this.grade = g;
    const m = gradeMatrix(g);
    for (const cm of this.colorMatrices) cm.set(m);
    this.glowImage?.setAlpha(g.mycelium);
  }

  /** Lleva la luz a la de la estación y el progreso actuales, en 600 ms (inmediato con movimiento reducido). */
  private light(state: AppState): void {
    const next = grade(stageLight(state.game));
    if (this.target && sameGrade(this.target, next)) return;
    this.target = next;
    this.tween?.remove();
    this.tween = null;
    const from = this.grade;
    if (!from || this.reduceMotion.matches) return this.applyGrade(next);
    this.tween = this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: LIGHT_TRANSITION_MS,
      ease: 'Sine.easeInOut',
      onUpdate: (tw) => this.applyGrade(mixGrade(from, next, tw.getValue() ?? 1)),
      onComplete: () => this.applyGrade(next),
    });
  }

  private draw(state: AppState): void {
    if (!this.tile || !this.created) return;
    const T = Math.round(this.tile * renderResolution()); // px del canvas (≤ 2×)
    const tex = this.boardCanvas(T * W, T * H);
    if (!tex) return;
    // El canvas tiene un margen arriba del claro para que la copa del Árbol Padre sobresalga del marco.
    this.cameras.main.setScroll(0, -Math.round(Math.round(BOARD_HEADROOM * this.tile) * renderResolution())); // igual que main.ts › resize
    const occupied = new Set(state.game.members.filter((m) => m.at).map((m) => `${m.at!.x},${m.at!.y}`));
    const star = suggestedTile(state);
    paintBoard(tex.getContext(), T, {
      game: state.game,
      valid: new Set(highlighted(state).map((t) => `${t.x},${t.y}`)),
      star: star ? { x: star.x, y: star.y } : null,
      occupied,
      fatherSprite: this.textures.exists(fatherKey(false)) && this.textures.exists(fatherKey(true)),
      foliage: stageLight(state.game).light.foliage,
    });
    tex.refresh();
    this.boardImage?.setTexture(BOARD_KEY).setDisplaySize(T * W, T * H);
    const glow = this.glowCanvas(T * W, T * H);
    if (glow) {
      paintMyceliumGlow(glow.getContext(), T, state.game);
      glow.refresh();
      this.glowImage?.setTexture(GLOW_KEY).setDisplaySize(T * W, T * H);
    }
    this.light(state);
    this.drawFather(state, T);
    this.drawWorkers(state, T);
  }

  /** Árbol Padre: dormido o despierto, apoyado en el borde inferior de su casilla y sobresaliendo hacia arriba. */
  private drawFather(state: AppState, T: number): void {
    const tile = state.game.tiles.find((t) => t.kind === 'mother');
    const key = fatherKey(Boolean(tile?.alive));
    if (!tile || !this.textures.exists(key)) {
      this.father?.setVisible(false);
      return;
    }
    if (!this.father) {
      // Parte del escenario (lleva la gradación), pero delante de la luz del micelio para que no se transparente.
      this.father = this.add.image(0, 0, key).setOrigin(0.5, 1).setDepth(4);
      this.gradeWith(this.father);
    }
    // Un poco mayor que los personajes (es el patriarca del claro); quien trabaje encima (profundidad 5) queda delante.
    const w = T * FATHER_SCALE;
    const frame = this.textures.getFrame(key);
    this.father.setTexture(key).setDisplaySize(w, (w * frame.height) / frame.width).setPosition((tile.x + 0.5) * T, (tile.y + 1) * T).setVisible(true);
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
