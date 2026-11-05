import * as Phaser from 'phaser';
import { diffEffects } from '../effects';
import { H, seasonIndex, W } from '../rules';
import { BoardFx } from './fx';
import { paintBoard, paintMarked, paintMyceliumGlow, progressSaturation } from './paint';
import { highlighted, suggestedTile, type AppState, type Store } from '../store';
import { BOARD_HEADROOM, boardArtKeys, boardArtUrl, FATHER_SCALE, fatherKey, FROST_PULSE, FROST_PULSE_MS, hex, LIGHT_TRANSITION_MS, MOTION, MYCELIUM_GLOW, portraitKey, renderResolution, SEASON_SLUGS, SPRITE_SPECIES, spriteUrl, type ColorToken } from '../theme';

/** Color de la silueta de respaldo si falta el retrato de una especie. */
const SILHOUETTE: Readonly<Record<string, ColorToken>> = { champi: 'wood', lactarius: 'indigo', amanita: 'berry', gliophorus: 'leaf', mago: 'peach' };
const BOARD_KEY = 'claro';
const GLOW_KEY = 'micelio';
const FROST_KEY = 'escarcha';

/**
 * Dibuja el claro 5×8 (pintado en Canvas2D por `paint.ts` con las piezas pintadas por estación),
 * el Árbol Padre y a los miembros que trabajaron este mes (su retrato sobre la casilla, que tapa el objeto de abajo).
 * Entre el claro y lo demás va la luz de la red (016): una capa aditiva cuya intensidad sigue a la estación.
 * Encima, el velo del árbol marcado (019), que late suave (quieto con movimiento reducido).
 * Solo lee el estado del store; nunca lo cambia. La entrada la recibe la capa DOM de `ui/board.ts`.
 */
export class GameScene extends Phaser.Scene {
  private canvasTex: Phaser.Textures.CanvasTexture | null = null;
  private boardImage: Phaser.GameObjects.Image | null = null;
  private sprites = new Map<number, Phaser.GameObjects.Image>();
  private silhouettes = new Map<number, Phaser.GameObjects.Graphics>();
  private fx: BoardFx | null = null;
  private father: Phaser.GameObjects.Image | null = null;
  private glowTex: Phaser.Textures.CanvasTexture | null = null;
  private glowImage: Phaser.GameObjects.Image | null = null;
  /** Red y tamaño de casilla con que se pintó la luz (se repinta solo si cambian). */
  private glowPainted = '';
  private glowTarget: number | null = null;
  private glowTween: Phaser.Tweens.Tween | null = null;
  private frostTex: Phaser.Textures.CanvasTexture | null = null;
  private frostImage: Phaser.GameObjects.Image | null = null;
  private frostPainted = '';
  private frostTween: Phaser.Tweens.Tween | null = null;
  private readonly reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  private tile = 0;
  private created = false;
  /** Ya se dibujó una vez: desde aquí, llegar a una casilla o seleccionar se anima (022). */
  private drawn = false;
  private lastSelected: number | null = null;
  private lastMonth = 0;
  /** Casilla donde se dibujó cada retrato (para saber cuándo llega a otra). */
  private spots = new Map<number, string>();

  constructor(private readonly store: Store) {
    super('Game');
  }

  preload(): void {
    for (const sp of SPRITE_SPECIES) {
      const key = portraitKey(sp)!;
      this.load.image(key, spriteUrl(key));
    }
    for (const awake of [false, true]) this.load.image(fatherKey(awake), boardArtUrl(fatherKey(awake)));
    for (const key of boardArtKeys()) this.load.image(key, boardArtUrl(key));
  }

  create(): void {
    this.created = true;
    this.fx = new BoardFx(this);
    const unsubscribe = this.store.subscribe((s, prev) => {
      this.draw(s);
      if (s.game !== prev.game) this.fx?.play(diffEffects(prev.game, s.game), SEASON_SLUGS[seasonIndex(s.game.month)] ?? 'spring');
    });
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
      this.boardImage = this.add.image(0, 0, BOARD_KEY).setOrigin(0, 0).setDepth(0);
    } else if (this.canvasTex.width !== w || this.canvasTex.height !== h) {
      this.canvasTex.setSize(w, h);
    }
    return this.canvasTex;
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
    const valid = highlighted(state);
    // Al seleccionar (022), las casillas válidas aparecen en un fundido: antes de pintarlas se copia el claro.
    const selected = state.ui.selected;
    const reveal = this.drawn && selected !== null && selected !== this.lastSelected && valid.length > 0;
    this.lastSelected = selected;
    if (reveal) this.fx?.snapshot(tex.getSourceImage() as HTMLCanvasElement);
    // Estación nueva al terminar el mes (022): el claro de antes se funde sobre el nuevo.
    const month = state.game.month;
    const season = seasonIndex(month);
    if (this.drawn && month === this.lastMonth + 1 && season !== seasonIndex(this.lastMonth))
      this.fx?.seasonFade(tex.getSourceImage() as HTMLCanvasElement, SEASON_SLUGS[season] ?? 'spring');
    this.lastMonth = month;
    paintBoard(tex.getContext(), T, {
      game: state.game,
      valid: new Set(valid.map((t) => `${t.x},${t.y}`)),
      star: star ? { x: star.x, y: star.y } : null,
      occupied,
      fatherSprite: this.textures.exists(fatherKey(false)) && this.textures.exists(fatherKey(true)),
      saturation: progressSaturation(state.game),
      art: (key) => (this.textures.exists(key) ? (this.textures.get(key).getSourceImage() as CanvasImageSource) : undefined),
    });
    tex.refresh();
    this.boardImage?.setTexture(BOARD_KEY).setDisplaySize(T * W, T * H);
    this.drawGlow(state, T);
    this.drawMarked(state, T);
    this.drawFather(state, T);
    this.fx?.update(state.game, T);
    this.drawWorkers(state, T);
    if (reveal) this.fx?.reveal(valid, star && valid.some((t) => t.x === star.x && t.y === star.y) ? star : null);
    this.drawn = true;
  }

  /** Luz de la red: se repinta si cambia la red o la casilla; su alfa va a la intensidad de la estación. */
  private drawGlow(state: AppState, T: number): void {
    const w = T * W;
    const h = T * H;
    if (!this.glowTex) {
      this.glowTex = this.textures.createCanvas(GLOW_KEY, w, h);
      if (!this.glowTex) return;
      // Encima del claro (0) y debajo de la animación de tejer (1), el Árbol Padre (4) y los retratos (5).
      this.glowImage = this.add.image(0, 0, GLOW_KEY).setOrigin(0, 0).setDepth(0.5).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
    } else if (this.glowTex.width !== w || this.glowTex.height !== h) {
      this.glowTex.setSize(w, h);
    }
    const net = state.game.tiles.filter((t) => t.net).map((t) => `${t.x},${t.y}`).join(' ');
    const painted = `${T}|${net}`;
    if (painted !== this.glowPainted) {
      this.glowPainted = painted;
      paintMyceliumGlow(this.glowTex.getContext(), T, state.game);
      this.glowTex.refresh();
      this.glowImage?.setTexture(GLOW_KEY).setDisplaySize(w, h);
    }
    const target = MYCELIUM_GLOW[seasonIndex(state.game.month)] ?? MYCELIUM_GLOW[0];
    if (target === this.glowTarget || !this.glowImage) return;
    const first = this.glowTarget === null;
    this.glowTarget = target;
    this.glowTween?.remove();
    this.glowTween = null;
    // Al cargar o con movimiento reducido, de inmediato; al pasar de estación, en 600 ms.
    if (first || this.reduceMotion.matches) {
      this.glowImage.setAlpha(target);
      return;
    }
    this.glowTween = this.tweens.add({ targets: this.glowImage, alpha: target, duration: LIGHT_TRANSITION_MS, ease: MOTION.ease.soft.phaser });
  }

  /** Velo del árbol marcado (019) y de la casilla con plaga (032): se repinta si cambian o cambia la casilla; su alfa late entre `FROST_PULSE`. */
  private drawMarked(state: AppState, T: number): void {
    const marked = state.game.tiles
      .filter((t) => (t.fading && !t.alive) || t.blighted)
      .map((t) => `${t.blighted ? 'p' : ''}${t.x},${t.y}`)
      .join(' ');
    const painted = `${T}|${marked}|${this.reduceMotion.matches}`;
    if (painted === this.frostPainted) return;
    this.frostPainted = painted;
    if (!this.frostTex) {
      this.frostTex = this.textures.createCanvas(FROST_KEY, T * W, T * H);
      if (!this.frostTex) return;
      // Sobre la luz de la red (0.5) y debajo de la animación de tejer (1), el Árbol Padre y los retratos.
      this.frostImage = this.add.image(0, 0, FROST_KEY).setOrigin(0, 0).setDepth(0.7);
    } else if (this.frostTex.width !== T * W || this.frostTex.height !== T * H) {
      this.frostTex.setSize(T * W, T * H);
    }
    paintMarked(this.frostTex.getContext(), T, state.game);
    this.frostTex.refresh();
    this.frostImage?.setTexture(FROST_KEY).setDisplaySize(T * W, T * H).setVisible(Boolean(marked));
    this.frostTween?.remove();
    this.frostTween = null;
    if (!marked || !this.frostImage) return;
    if (this.reduceMotion.matches) {
      this.frostImage.setAlpha(FROST_PULSE.rest);
      return;
    }
    this.frostImage.setAlpha(FROST_PULSE.min);
    this.frostTween = this.tweens.add({ targets: this.frostImage, alpha: FROST_PULSE.max, duration: FROST_PULSE_MS / 2, ease: MOTION.ease.soft.phaser, yoyo: true, repeat: -1 });
  }

  /** Árbol Padre: dormido o despierto, apoyado en el borde inferior de su casilla y sobresaliendo hacia arriba. */
  private drawFather(state: AppState, T: number): void {
    const tile = state.game.tiles.find((t) => t.kind === 'mother');
    this.fx?.fatherHalo(tile ?? null, Boolean(tile?.alive), T);
    const key = fatherKey(Boolean(tile?.alive));
    if (!tile || !this.textures.exists(key)) {
      this.father?.setVisible(false);
      return;
    }
    this.father ??= this.add.image(0, 0, key).setOrigin(0.5, 1).setDepth(4);
    // Un poco mayor que los personajes (es el patriarca del claro); quien trabaje encima (profundidad 5) queda delante.
    const w = T * FATHER_SCALE;
    const frame = this.textures.getFrame(key);
    this.father.setTexture(key).setDisplaySize(w, (w * frame.height) / frame.width).setPosition((tile.x + 0.5) * T, (tile.y + 1) * T).setVisible(true);
  }

  /** Miembros que trabajaron este mes: su retrato pintado sobre la casilla donde actuaron. */
  private drawWorkers(state: AppState, T: number): void {
    const seen = new Set<number>();
    for (const m of state.game.members) {
      if (!m.at) continue;
      const key = portraitKey(m.species);
      seen.add(m.id);
      if (!key || !this.textures.exists(key)) {
        this.drawSilhouette(m.id, m.species, m.at, T);
        continue;
      }
      this.silhouettes.get(m.id)?.setVisible(false);
      let img = this.sprites.get(m.id);
      if (!img) {
        img = this.add.image(0, 0, key).setOrigin(0.5, 1).setDepth(5);
        this.sprites.set(m.id, img);
      }
      // Mismo ancho para todos; el alto sale de cada retrato, así Maestra Bruma se ve más alta sin deformarse.
      const w = T * 0.92;
      const frame = this.textures.getFrame(key);
      const spot = `${m.at.x},${m.at.y}`;
      const arrived = this.spots.get(m.id) !== spot;
      this.spots.set(m.id, spot);
      if (arrived) this.tweens.killTweensOf(img);
      if (arrived || img.getData('leaving')) img.setAlpha(1).setAngle(0).setData('leaving', false);
      img.setTexture(key).setDisplaySize(w, (w * frame.height) / frame.width).setPosition((m.at.x + 0.5) * T, (m.at.y + 1) * T - T * 0.03).setVisible(true);
      // Llega a la casilla con la firma de su especie (022).
      if (arrived && this.drawn) this.fx?.arrive(img, m.species);
    }
    // Quien ya no trabaja este mes deja su casilla en un fundido.
    for (const [id, img] of this.sprites) {
      if (seen.has(id)) continue;
      this.spots.delete(id);
      if (img.visible && this.drawn) this.fx?.leave(img);
      else img.setVisible(false);
    }
    for (const [id, g] of this.silhouettes) if (!seen.has(id)) g.setVisible(false);
  }

  /** Respaldo si no cargó el retrato: sombrero redondo del color de la especie, con contorno. */
  private drawSilhouette(id: number, species: string, at: { x: number; y: number }, T: number): void {
    let g = this.silhouettes.get(id);
    if (!g) {
      g = this.add.graphics().setDepth(5);
      this.silhouettes.set(id, g);
    }
    const cx = (at.x + 0.5) * T;
    const base = (at.y + 0.92) * T;
    g.clear().setVisible(true);
    g.fillStyle(hex('paper')).lineStyle(T * 0.03, hex('ink'));
    g.fillRoundedRect(cx - T * 0.13, base - T * 0.3, T * 0.26, T * 0.3, T * 0.06).strokeRoundedRect(cx - T * 0.13, base - T * 0.3, T * 0.26, T * 0.3, T * 0.06);
    g.fillStyle(hex(SILHOUETTE[species] ?? 'wood'));
    g.beginPath();
    g.arc(cx, base - T * 0.3, T * 0.3, Math.PI, 0);
    g.closePath();
    g.fillPath().strokePath();
  }
}
