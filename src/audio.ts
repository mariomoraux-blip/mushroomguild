// Audio del juego (049): Web Audio, fuera de src/rules/ y sin Phaser. Escucha al store y nunca cambia el estado.
// Nada se crea ni se descarga antes del primer gesto del jugador; se suspende con la pestaña oculta.
// Todo lo del navegador llega inyectado (`AudioDeps`) para probarlo sin navegador.
import { ambientLevel, busOf, cuesFor, type Bus, type Cue, type SoundId } from './audio-cues';
import type { Store } from './store';
import { MOTION } from './theme';

export interface AudioPrefs {
  /** «Sonido»: ambiente, efectos del tablero e interfaz. */
  readonly sound: boolean;
  /** «Música»: cortinas de victoria y derrota (y, cuando exista, el tema de portada). */
  readonly music: boolean;
}
export type PrefKey = keyof AudioPrefs;
export const PREFS_KEY = 'gremio.audio';

/** Lo que el motor necesita del navegador. */
export interface AudioDeps {
  makeContext(): AudioContext;
  /** Descarga un archivo de `public/assets/audio/` (ruta relativa) como bytes. */
  load(path: string): Promise<ArrayBuffer>;
  /** Donde se escuchan el primer gesto, los clics y la visibilidad. */
  doc: Pick<Document, 'addEventListener' | 'hidden'>;
  storage: { get(key: string): string | null; set(key: string, value: string): void };
  reducedMotion(): boolean;
  /** `navigator.audioSession` (Safari 17+), si existe. */
  audioSession?: { type: string } | undefined;
  random?: () => number;
  defer?: (fn: () => void) => void;
}

export interface GameAudio {
  prefs(): AudioPrefs;
  set(key: PrefKey, on: boolean): void;
  onPrefs(fn: (p: AudioPrefs) => void): () => void;
}

/** Mapa del sprite (`sfx.json`): `[inicio, duración]` en segundos por variante. */
interface SpriteMap {
  readonly sounds: Partial<Record<SoundId, [number, number][]>>;
}

const BUS_GAIN: Readonly<Record<Bus, number>> = { ambient: 1, music: 1, game: 1, ui: 0.7 };
const MAX_VOICES = 3;
const PITCH_JITTER = 0.03;
const GAIN_JITTER_DB = 1.5;
const RAMP = 0.2;
const DUCK = 0.5; // −6 dB
const REDUCED_MAX = MOTION.ms.standard / 1000;
const REDUCED_FADE = 0.08;
const STINGERS: readonly SoundId[] = ['stg-victory', 'stg-defeat'];
const PRIMARY = '.menu-btn--primary, .btn--primary, .story__btn--primary';

export function readPrefs(storage: AudioDeps['storage']): AudioPrefs {
  try {
    const v = JSON.parse(storage.get(PREFS_KEY) ?? '{}') as Partial<AudioPrefs>;
    return { sound: v.sound !== false, music: v.music !== false };
  } catch {
    return { sound: true, music: true };
  }
}

export function createAudio(store: Store, deps: AudioDeps): GameAudio {
  const random = deps.random ?? Math.random;
  const defer = deps.defer ?? ((fn) => setTimeout(fn, 0));
  let prefs = readPrefs(deps.storage);
  const listeners = new Set<(p: AudioPrefs) => void>();

  let ctx: AudioContext | null = null;
  let buses: Record<Bus, GainNode> | null = null;
  let duck: GainNode | null = null;
  let ambGain: GainNode | null = null;
  let ambSource: AudioBufferSourceNode | null = null;
  let sprite: { buffer: AudioBuffer; map: SpriteMap } | null = null;
  let ambience: AudioBuffer | null = null;
  const stingers = new Map<SoundId, AudioBuffer>();
  const loading = new Set<string>();
  const voices = new Map<SoundId, { src: AudioBufferSourceNode; gain: GainNode }[]>();
  const variant = new Map<SoundId, number>();
  let weaves = 0;
  let cued = 0;
  let ducks = 0;

  const enabled = (bus: Bus) => (bus === 'music' ? prefs.music : prefs.sound);
  const busLevel = (bus: Bus) => (enabled(bus) ? BUS_GAIN[bus] : 0);

  // ─── Desbloqueo: el primer gesto crea (o reanuda) el contexto ──────────────
  function unlock() {
    if (!ctx) {
      if (deps.audioSession) deps.audioSession.type = 'ambient';
      ctx = deps.makeContext();
      const master = ctx.createGain();
      master.connect(ctx.destination);
      const bus = (b: Bus) => {
        const g = ctx!.createGain();
        g.gain.value = busLevel(b);
        g.connect(master);
        return g;
      };
      buses = { ambient: bus('ambient'), music: bus('music'), game: bus('game'), ui: bus('ui') };
      duck = ctx.createGain();
      duck.connect(buses.ambient);
      ambGain = ctx.createGain();
      ambGain.gain.value = ambientLevel(store.getState());
      ambGain.connect(duck);
    }
    // `suspended` o, en iOS, `interrupted` (una llamada, otra app con audio): el gesto lo reanuda.
    if (ctx.state !== 'running' && !deps.doc.hidden) void ctx.resume();
    loadWanted();
  }
  // iOS solo deja reanudar el audio al soltar el dedo: `touchend` y `click` reintentan el mismo desbloqueo.
  for (const type of ['pointerdown', 'keydown', 'touchend', 'click']) deps.doc.addEventListener(type, unlock, { capture: true });

  // ─── Carga diferida: sprite, ambiente y cortinas, solo lo que está encendido ─
  const decode = (bytes: ArrayBuffer) => ctx!.decodeAudioData(bytes);
  function once(key: string, job: () => Promise<void>) {
    if (loading.has(key)) return;
    loading.add(key);
    job().catch(() => loading.delete(key)); // sin red o sin decodificar: se reintenta en el próximo gesto
  }
  function loadWanted() {
    if (!ctx) return;
    if (prefs.sound) {
      once('sfx', async () => {
        const map = JSON.parse(new TextDecoder().decode(await deps.load('sfx.json'))) as SpriteMap;
        sprite = { buffer: await decode(await deps.load('sfx.m4a')), map };
        once('ambience', async () => {
          ambience = await decode(await deps.load('ambience/amb-clearing.m4a'));
          startAmbient();
        });
      });
    }
    if (prefs.music) {
      for (const id of STINGERS) once(id, async () => void stingers.set(id, await decode(await deps.load(`stingers/${id}.m4a`))));
    }
  }

  // ─── Ambiente ────────────────────────────────────────────────────────────────
  function startAmbient() {
    if (!ctx || !ambience || !ambGain || ambSource || !prefs.sound) return;
    ambSource = ctx.createBufferSource();
    ambSource.buffer = ambience;
    ambSource.loop = true;
    ambSource.connect(ambGain);
    ambSource.start();
  }
  function stopAmbient() {
    const src = ambSource;
    ambSource = null;
    if (src && ctx) src.stop(ctx.currentTime + RAMP);
  }
  const ramp = (param: AudioParam, value: number, seconds = RAMP) => {
    if (!ctx) return;
    const t = ctx.currentTime;
    param.cancelScheduledValues(t);
    param.setValueAtTime(param.value, t);
    param.linearRampToValueAtTime(value, t + seconds);
  };

  // ─── Reproducir ─────────────────────────────────────────────────────────────
  function bufferFor(id: SoundId): { buffer: AudioBuffer; offset: number; duration: number } | null {
    if (busOf(id) === 'music') {
      const buffer = stingers.get(id);
      return buffer ? { buffer, offset: 0, duration: buffer.duration } : null;
    }
    const spans = sprite?.map.sounds[id];
    if (!sprite || !spans?.length) return null;
    const i = (variant.get(id) ?? 0) % spans.length;
    variant.set(id, i + 1);
    const [offset, duration] = spans[i]!;
    return { buffer: sprite.buffer, offset, duration };
  }

  function play(cue: Cue) {
    cued++;
    const bus = busOf(cue.id);
    if (!ctx || !buses || ctx.state !== 'running' || deps.doc.hidden || !enabled(bus)) return;
    const found = bufferFor(cue.id);
    if (!found) return; // todavía no cargó: sonar tarde es peor que no sonar
    const at = ctx.currentTime + (cue.delay ?? 0) / 1000;
    const src = ctx.createBufferSource();
    src.buffer = found.buffer;
    const jitter = (random() * 2 - 1) * PITCH_JITTER;
    src.playbackRate.value = 2 ** ((cue.step ?? 0) / 12) * (1 + jitter);
    const gain = ctx.createGain();
    gain.gain.value = 10 ** (((random() * 2 - 1) * GAIN_JITTER_DB) / 20);
    src.connect(gain);
    gain.connect(buses[bus]);
    let duration = found.duration;
    if (bus === 'game' && deps.reducedMotion() && duration > REDUCED_MAX) {
      duration = REDUCED_MAX;
      gain.gain.setValueAtTime(gain.gain.value, at + REDUCED_MAX - REDUCED_FADE);
      gain.gain.linearRampToValueAtTime(0, at + REDUCED_MAX);
    }
    // Máximo 3 del mismo sonido: la más vieja se funde en 30 ms.
    const list = voices.get(cue.id) ?? [];
    while (list.length >= MAX_VOICES) {
      const old = list.shift()!;
      ramp(old.gain.gain, 0, 0.03);
      old.src.stop(ctx.currentTime + 0.03);
    }
    const voice = { src, gain };
    list.push(voice);
    voices.set(cue.id, list);
    src.onended = () => {
      const l = voices.get(cue.id);
      const k = l?.indexOf(voice) ?? -1;
      if (l && k >= 0) l.splice(k, 1);
    };
    src.start(at, found.offset, duration);
    if (bus === 'music' && duck) {
      // Ducking: el ambiente baja 6 dB mientras suena la cortina.
      ducks++;
      const d = duck;
      d.gain.setValueAtTime(d.gain.value, at);
      d.gain.linearRampToValueAtTime(DUCK, at + RAMP);
      src.addEventListener('ended', () => {
        if (--ducks === 0) ramp(d.gain, 1);
      });
    }
  }

  // ─── Store: cues de cada cambio y volumen del ambiente por pantalla ─────────
  store.subscribe((state, prev, action) => {
    const r = cuesFor(prev, state, action, weaves);
    weaves = r.weaves;
    r.cues.forEach(play);
    if (ambGain && ambientLevel(state) !== ambientLevel(prev)) ramp(ambGain.gain, ambientLevel(state));
  });

  // Botones: «toc» de madera si el clic no produjo otro sonido (el principal, con campanita).
  deps.doc.addEventListener(
    'click',
    (e) => {
      const b = (e.target as Element | null)?.closest?.('button');
      if (!b || b.disabled) return;
      const before = cued;
      const primary = b.matches(PRIMARY);
      defer(() => {
        if (cued === before) play({ id: primary ? 'ui-tap-primary' : 'ui-tap' });
      });
    },
    { capture: true },
  );

  // Pestaña oculta: todo se suspende; al volver, sigue (si ya se había desbloqueado).
  deps.doc.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (deps.doc.hidden) void ctx.suspend();
    else void ctx.resume();
  });

  return {
    prefs: () => prefs,
    set(key, on) {
      if (prefs[key] === on) return;
      prefs = { ...prefs, [key]: on };
      deps.storage.set(PREFS_KEY, JSON.stringify(prefs));
      if (buses) for (const b of Object.keys(buses) as Bus[]) ramp(buses[b].gain, busLevel(b));
      if (key === 'sound') {
        if (on) startAmbient();
        else stopAmbient();
      }
      loadWanted();
      listeners.forEach((fn) => fn(prefs));
    },
    onPrefs(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

/** El motor con lo del navegador real. */
export function browserAudio(store: Store): GameAudio | null {
  const AC = globalThis.AudioContext ?? (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  const base = `${import.meta.env.BASE_URL}assets/audio/`;
  return createAudio(store, {
    makeContext: () => new AC(),
    load: async (path) => {
      const r = await fetch(base + path);
      if (!r.ok) throw new Error(`${path}: ${r.status}`);
      return r.arrayBuffer();
    },
    doc: document,
    storage: {
      get: (k) => {
        try {
          return localStorage.getItem(k);
        } catch {
          return null;
        }
      },
      set: (k, v) => {
        try {
          localStorage.setItem(k, v);
        } catch {
          /* sin almacenamiento: la preferencia dura la visita */
        }
      },
    },
    reducedMotion: () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
    audioSession: (navigator as { audioSession?: { type: string } }).audioSession,
  });
}
