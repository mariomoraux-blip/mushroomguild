import { describe, expect, it } from 'vitest';
import { createAudio, PREFS_KEY, readPrefs, type AudioDeps } from '../src/audio';
import { newGame, type SpeciesId } from '../src/rules';
import { createStore, initialState } from '../src/store';
import { MOTION } from '../src/theme';
import { INDI } from './helpers';

// ─── Un AudioContext falso: registra lo que se crea, se arranca y se suspende ──────────
class Param {
  constructor(public value = 1) {}
  setValueAtTime(v: number) { this.value = v; return this; }
  linearRampToValueAtTime(v: number) { this.value = v; return this; }
  cancelScheduledValues() { return this; }
}
class Node {
  connect<T>(n: T) { return n; }
}
class Gain extends Node {
  gain = new Param();
}
class Source extends Node {
  buffer: unknown = null;
  loop = false;
  playbackRate = new Param();
  onended: (() => void) | null = null;
  stopped = false;
  constructor(private ctx: FakeContext) { super(); }
  start(...args: number[]) { this.ctx.started.push({ src: this, args }); }
  stop() { this.stopped = true; }
  addEventListener() {}
}
class FakeContext {
  state: AudioContextState = 'running';
  currentTime = 0;
  destination = new Node();
  started: { src: Source; args: number[] }[] = [];
  calls: string[] = [];
  createGain() { return new Gain(); }
  createBufferSource() { return new Source(this); }
  decodeAudioData(bytes: ArrayBuffer) { return Promise.resolve({ duration: 4, bytes }); }
  async suspend() { this.state = 'suspended'; this.calls.push('suspend'); }
  async resume() { this.state = 'running'; this.calls.push('resume'); }
}

const SPRITE = { length: 2, sounds: { 'ui-select': [[0.1, 0.08]], 'sfx-weave': [[0.5, 0.48]], 'sfx-revive': [[1, 0.9]] } };

function rig(stored: string | null = null, opts: { reduced?: boolean } = {}) {
  const ALL: SpeciesId[] = ['champi', 'lactarius', 'amanita', 'gliophorus', 'mago'];
  const store = createStore(initialState(newGame(), ALL));
  const doc = Object.assign(new EventTarget(), { hidden: false });
  const contexts: FakeContext[] = [];
  const loads: string[] = [];
  const saved = new Map<string, string>(stored ? [[PREFS_KEY, stored]] : []);
  const session = { type: 'auto' };
  const deps: AudioDeps = {
    makeContext: () => {
      const c = new FakeContext();
      contexts.push(c);
      return c as unknown as AudioContext;
    },
    load: async (path) => {
      loads.push(path);
      return path.endsWith('.json') ? new TextEncoder().encode(JSON.stringify(SPRITE)).buffer : new ArrayBuffer(8);
    },
    doc: doc as unknown as AudioDeps['doc'],
    storage: { get: (k) => saved.get(k) ?? null, set: (k, v) => void saved.set(k, v) },
    reducedMotion: () => opts.reduced ?? false,
    audioSession: session,
    random: () => 0.5,
    defer: (fn) => fn(),
  };
  const audio = createAudio(store, deps);
  const gesture = async () => {
    doc.dispatchEvent(new Event('pointerdown'));
    for (let i = 0; i < 10; i++) await Promise.resolve();
  };
  const ctx = () => contexts[0]!;
  const offsets = () => ctx().started.filter((s) => !s.src.loop).map((s) => s.args[1]);
  return { store, doc, contexts, loads, saved, session, audio, gesture, ctx, offsets };
}

describe('Requirement: Nada suena antes del primer gesto', () => {
  it('Scenario: Abrir sin tocar — sin AudioContext, sin descargas y sin sonido', () => {
    const r = rig();
    r.store.dispatch({ type: 'select', id: INDI });
    r.store.dispatch({ type: 'tapTile', x: 2, y: 6 });
    expect(r.contexts).toHaveLength(0);
    expect(r.loads).toEqual([]);
  });

  it('Scenario: Primer toque — crea el contexto en modo ambient, descarga el audio y suena lo que sigue', async () => {
    const r = rig();
    await r.gesture();
    expect(r.contexts).toHaveLength(1);
    expect(r.session.type).toBe('ambient');
    expect(r.loads).toEqual(['sfx.json', 'stingers/stg-victory.m4a', 'stingers/stg-defeat.m4a', 'sfx.m4a', 'ambience/amb-clearing.m4a']);
    // El ambiente arranca en loop al cargar.
    expect(r.ctx().started.filter((s) => s.src.loop)).toHaveLength(1);
    r.store.dispatch({ type: 'select', id: INDI });
    expect(r.offsets()).toEqual([0.1]);
    // Un segundo gesto no crea otro contexto ni vuelve a descargar.
    await r.gesture();
    expect(r.contexts).toHaveLength(1);
    expect(r.loads).toHaveLength(5);
  });
});

describe('Requirement: Pausa con la pestaña oculta', () => {
  it('Scenario: Cambiar de app — se suspende, no suena nada oculto y al volver se reanuda', async () => {
    const r = rig();
    await r.gesture();
    r.doc.hidden = true;
    r.doc.dispatchEvent(new Event('visibilitychange'));
    expect(r.ctx().calls).toContain('suspend');
    r.store.dispatch({ type: 'select', id: INDI });
    expect(r.offsets()).toEqual([]);
    r.doc.hidden = false;
    r.doc.dispatchEvent(new Event('visibilitychange'));
    expect(r.ctx().calls.at(-1)).toBe('resume');
    r.store.dispatch({ type: 'select', id: INDI });
    r.store.dispatch({ type: 'select', id: INDI });
    expect(r.offsets()).toEqual([0.1]);
  });
});

describe('Requirement: Interruptores de sonido', () => {
  it('Scenario: Apagar el sonido — nada de efectos ni ambiente, y la preferencia queda guardada', async () => {
    const r = rig();
    await r.gesture();
    const amb = r.ctx().started.find((s) => s.src.loop)!;
    r.audio.set('sound', false);
    expect(amb.src.stopped).toBe(true);
    expect(JSON.parse(r.saved.get(PREFS_KEY)!)).toEqual({ sound: false, music: true });
    r.store.dispatch({ type: 'select', id: INDI });
    expect(r.offsets()).toEqual([]);
  });

  it('con «Sonido» apagado desde antes, el primer gesto no descarga efectos ni ambiente', async () => {
    const r = rig(JSON.stringify({ sound: false, music: true }));
    await r.gesture();
    expect(r.loads).toEqual(['stingers/stg-victory.m4a', 'stingers/stg-defeat.m4a']);
    r.audio.set('sound', true);
    for (let i = 0; i < 10; i++) await Promise.resolve();
    expect(r.loads).toContain('sfx.m4a');
  });

  it('avisa a los interruptores en pantalla y lee lo guardado (o los dos encendidos)', () => {
    const r = rig();
    const seen: unknown[] = [];
    r.audio.onPrefs((p) => seen.push(p));
    r.audio.set('music', false);
    expect(seen).toEqual([{ sound: true, music: false }]);
    expect(readPrefs({ get: () => null, set: () => {} })).toEqual({ sound: true, music: true });
    expect(readPrefs({ get: () => '{roto', set: () => {} })).toEqual({ sound: true, music: true });
  });
});

describe('Requirement: Mezcla y variedad', () => {
  it('no más de 3 copias del mismo sonido a la vez', async () => {
    const r = rig();
    await r.gesture();
    for (let i = 0; i < 4; i++) {
      r.store.dispatch({ type: 'select', id: INDI });
      r.store.dispatch({ type: 'cancel' });
    }
    const selects = r.ctx().started.filter((s) => s.args[1] === 0.1);
    expect(selects).toHaveLength(4);
    expect(selects[0]!.src.stopped).toBe(true);
    expect(selects.slice(1).every((s) => !s.src.stopped)).toBe(true);
  });

  it('Scenario: Movimiento reducido — el efecto del tablero dura como mucho MOTION.ms.standard', async () => {
    const r = rig(null, { reduced: true });
    await r.gesture();
    r.store.dispatch({ type: 'select', id: INDI });
    r.store.dispatch({ type: 'tapTile', x: 2, y: 6 });
    const weave = r.ctx().started.find((s) => s.args[1] === 0.5)!;
    expect(weave.args[2]).toBe(MOTION.ms.standard / 1000);
  });
});
