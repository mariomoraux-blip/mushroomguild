import { es } from '../copy/es';
import { reducedMotion } from '../scenes/fx';
import type { AppState, Store } from '../store';
import { currentPart, TUTORIAL, type Part } from '../tutorial';
import { el, setText } from './dom';

/** Aire alrededor del objetivo, separación del globo y margen con los bordes de la pantalla (px). */
const PAD = 6;
const GAP = 14;
const EDGE = 12;
const BUBBLE_MAX = 320;

type Rect = { left: number; top: number; right: number; bottom: number };
type Side = 'below' | 'above' | 'right' | 'left' | 'center';

/** Lo que resalta una parte del guion: dónde va el hueco y qué recibe el foco (en los pasos «Hacer»). */
function targetOf(part: Part): { hole: HTMLElement[]; focus: HTMLElement | null } {
  const q = (sel: string) => document.querySelector<HTMLElement>(sel);
  const one = (n: HTMLElement | null, focus = n) => ({ hole: n ? [n] : [], focus });
  const cell = (x: number, y: number) => q(`#overlay .cell[data-x="${x}"][data-y="${y}"]`);
  const e = part.expect;
  switch (e.type) {
    case 'next': {
      const s = part.spot;
      if (!s) return { hole: [], focus: null };
      if (s.kind === 'tile') return one(cell(s.x, s.y), null);
      if (s.kind === 'hud') return { hole: [...document.querySelectorAll<HTMLElement>('#hud .chip')], focus: null };
      if (s.kind === 'notice') return one(q('#notice-bar'), null);
      if (s.kind === 'help') return one(q('#hud .hud__help'), null);
      return one(q(`#dock .card--${s.species}`), null);
    }
    case 'select':
      return one(q(`#dock .card--${e.species}`));
    case 'openCard':
      return one(q('#card-btn'));
    case 'closeSheet': {
      // La ficha entera es el hueco (se puede leer y desplazar); el foco va a «Entendido».
      const panel = q('#sheet .sheet__panel');
      return { hole: panel ? [panel] : [], focus: q('#sheet .btn--wide[data-action="close"]') };
    }
    case 'tapTile':
      return one(cell(e.x, e.y));
    case 'openRecruit':
      return one(q('#dock .card--recruit'));
    case 'recruit': {
      const b = q(`#sheet [data-action="recruit"][data-species="${e.species}"]`);
      return { hole: b ? [b.closest<HTMLElement>('.row') ?? b] : [], focus: b };
    }
    case 'chooseSpell':
      return one(q(`#sheet [data-spell="${e.spell}"]`));
    case 'endMonth':
      return one(q('#dock .end'));
    case 'closeStory':
      return { hole: [], focus: null };
  }
}

const union = (nodes: HTMLElement[]): Rect | null => {
  const rects = nodes.map((n) => n.getBoundingClientRect()).filter((r) => r.width > 0 && r.height > 0);
  if (!rects.length) return null;
  return {
    left: Math.min(...rects.map((r) => r.left)) - PAD,
    top: Math.min(...rects.map((r) => r.top)) - PAD,
    right: Math.max(...rects.map((r) => r.right)) + PAD,
    bottom: Math.max(...rects.map((r) => r.bottom)) + PAD,
  };
};

/**
 * Viñetas de el tutorial «Cómo jugar» (046): una máscara oscura con un hueco redondeado sobre el objetivo del paso, cuatro
 * bloques alrededor que atrapan los toques (el hueco deja pasar el toque a la interfaz real) y un globo con el texto,
 * «Paso N de M», «Siguiente» (pasos «Ver») y «Saltar tutorial» con confirmación. Se esconde con una carta o una
 * pantalla encima. Tab solo recorre el objetivo y el globo; Esc no salta el tutorial.
 */
export function mountCoach(root: HTMLElement, store: Store) {
  const ring = el('div', { class: 'coach__ring', 'aria-hidden': 'true' });
  const block = (side: string) => el('div', { class: `coach__block coach__block--${side}` });
  const [top, right, bottom, left] = [block('top'), block('right'), block('bottom'), block('left')];
  const blocks = [top, right, bottom, left];
  const text = el('p', { class: 'coach__text', id: 'coach-text', 'aria-live': 'polite' });
  const count = el('span', { class: 'coach__count' });
  const next = el('button', { class: 'btn btn--primary coach__next', type: 'button' }, es.tutorial.next);
  const skip = el('button', { class: 'coach__skip', type: 'button' }, es.tutorial.skip);
  const foot = el('div', { class: 'coach__foot' }, count, skip, next);
  const no = el('button', { class: 'btn btn--primary coach__no', type: 'button' }, es.tutorial.skipNo);
  const yes = el('button', { class: 'btn coach__yes', type: 'button' }, es.tutorial.skipYes);
  const confirm = el('div', { class: 'coach__confirm', hidden: true }, el('p', { class: 'coach__ask' }, es.tutorial.skipAsk), el('div', { class: 'coach__row' }, no, yes));
  const arrow = el('span', { class: 'coach__arrow', 'aria-hidden': 'true' });
  const bubble = el('div', { class: 'coach__bubble', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'coach-text', 'aria-label': es.tutorial.label }, arrow, text, foot, confirm);
  root.append(ring, ...blocks, bubble);

  let shownKey = '';
  let part: Part | null = null;
  let focusTarget: HTMLElement | null = null;
  let frame = 0;
  let lastGeom = '';

  const setConfirm = (on: boolean) => {
    confirm.hidden = !on;
    foot.hidden = on;
    lastGeom = '';
    requestAnimationFrame(() => (on ? no : part?.expect.type === 'next' ? next : (focusTarget ?? skip)).focus({ preventScroll: true }));
  };
  next.addEventListener('click', () => store.dispatch({ type: 'tutorialNext' }));
  skip.addEventListener('click', () => setConfirm(true));
  no.addEventListener('click', () => setConfirm(false));
  yes.addEventListener('click', () => store.dispatch({ type: 'tutorialSkip' }));

  // Tab y Mayús+Tab dan la vuelta entre el objetivo y los botones del globo.
  document.addEventListener(
    'keydown',
    (e) => {
      if (root.hidden || e.key !== 'Tab') return;
      const list = [focusTarget, ...bubble.querySelectorAll<HTMLElement>('button')].filter((n): n is HTMLElement => Boolean(n && n.offsetParent !== null && !(n as HTMLButtonElement).disabled));
      if (!list.length) return;
      e.preventDefault();
      const i = list.indexOf(document.activeElement as HTMLElement);
      const to = i < 0 ? 0 : (i + (e.shiftKey ? -1 : 1) + list.length) % list.length;
      list[to]!.focus();
    },
    true,
  );

  const place = (full: Rect | null) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Solo la parte visible del objetivo (mientras se desplaza puede asomar a medias).
    const cut = full && { left: Math.max(0, full.left), top: Math.max(0, full.top), right: Math.min(vw, full.right), bottom: Math.min(vh, full.bottom) };
    const r = cut && cut.right > cut.left && cut.bottom > cut.top ? cut : null;
    const width = Math.min(BUBBLE_MAX, vw - 2 * EDGE);
    bubble.style.width = `${width}px`;
    const bh = bubble.offsetHeight;
    const geom = `${vw}x${vh}|${bh}|${r ? [r.left, r.top, r.right, r.bottom].map(Math.round).join(',') : '-'}`;
    if (geom === lastGeom) return;
    lastGeom = geom;
    // Hueco (o, sin objetivo, un punto en el centro: la máscara cubre todo) y bloques que lo rodean.
    const h = r ?? { left: vw / 2, top: vh / 2, right: vw / 2, bottom: vh / 2 };
    ring.classList.toggle('is-empty', !r);
    Object.assign(ring.style, { left: `${h.left}px`, top: `${h.top}px`, width: `${h.right - h.left}px`, height: `${h.bottom - h.top}px` });
    Object.assign(top.style, { left: '0', top: '0', width: '100%', height: `${Math.max(0, h.top)}px` });
    Object.assign(bottom.style, { left: '0', top: `${h.bottom}px`, width: '100%', height: `${Math.max(0, vh - h.bottom)}px` });
    Object.assign(left.style, { left: '0', top: `${h.top}px`, width: `${Math.max(0, h.left)}px`, height: `${h.bottom - h.top}px` });
    Object.assign(right.style, { left: `${h.right}px`, top: `${h.top}px`, width: `${Math.max(0, vw - h.right)}px`, height: `${h.bottom - h.top}px` });
    // Globo: donde quepa sin tapar el objetivo; en horizontal, primero a los costados.
    let side: Side = 'center';
    if (r) {
      const room = { below: vh - r.bottom - GAP - EDGE, above: r.top - GAP - EDGE, right: vw - r.right - GAP - EDGE, left: r.left - GAP - EDGE };
      const fits = (s: keyof typeof room) => (s === 'below' || s === 'above' ? room[s] >= bh : room[s] >= width);
      const order: (keyof typeof room)[] = vw > vh ? ['right', 'left', 'below', 'above'] : room.below >= room.above ? ['below', 'above', 'right', 'left'] : ['above', 'below', 'right', 'left'];
      side = order.find(fits) ?? 'center';
    }
    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
    let x = (vw - width) / 2;
    let y = (vh - bh) / 2;
    if (r && (side === 'below' || side === 'above')) {
      x = clamp((r.left + r.right) / 2 - width / 2, EDGE, vw - width - EDGE);
      y = side === 'below' ? r.bottom + GAP : r.top - GAP - bh;
      arrow.style.left = `${clamp((r.left + r.right) / 2 - x, 22, width - 22)}px`;
      arrow.style.top = '';
    } else if (r && (side === 'right' || side === 'left')) {
      x = side === 'right' ? r.right + GAP : r.left - GAP - width;
      y = clamp((r.top + r.bottom) / 2 - bh / 2, EDGE, vh - bh - EDGE);
      arrow.style.top = `${clamp((r.top + r.bottom) / 2 - y, 22, bh - 22)}px`;
      arrow.style.left = '';
    } else if (r) {
      // Un objetivo enorme (la ficha abierta): el globo arriba, encima de su cabecera.
      y = EDGE;
    }
    // Nunca fuera de la pantalla.
    x = clamp(x, EDGE, Math.max(EDGE, vw - width - EDGE));
    y = clamp(y, EDGE, Math.max(EDGE, vh - bh - EDGE));
    bubble.dataset.side = r && side === 'center' ? 'top' : side;
    bubble.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  };

  // El objetivo puede moverse (la hoja que sube, el dock que se desplaza, la pantalla que gira): se sigue cada cuadro.
  const loop = () => {
    frame = 0;
    if (root.hidden || !part) return;
    place(union(targetOf(part).hole));
    frame = requestAnimationFrame(loop);
  };

  return (state: AppState) => {
    const t = state.ui.tutorial;
    const p = t ? currentPart(t) : undefined;
    const active = Boolean(t && p && !state.ui.story && !state.ui.screen && state.game.status === 'playing');
    if (!active || !t || !p) {
      root.hidden = true;
      part = null;
      if (!t) shownKey = '';
      return;
    }
    const key = `${t.step}:${t.part}|${state.ui.sheet?.kind ?? ''}|${state.ui.selected ?? ''}|${state.ui.spell ?? ''}`;
    const wasHidden = root.hidden;
    root.hidden = false;
    part = p;
    const see = p.expect.type === 'next';
    root.dataset.mode = see ? 'see' : 'do';
    if (key === shownKey && !wasHidden) return;
    const stepChanged = !shownKey.startsWith(`${t.step}:${t.part}|`);
    shownKey = key;
    setText(text, p.text);
    setText(count, es.tutorial.count(t.step + 1, TUTORIAL.length));
    next.hidden = !see;
    if (stepChanged) {
      confirm.hidden = true;
      foot.hidden = false;
    }
    lastGeom = '';
    // Objetivo a la vista (dock o lista de la hoja) y foco: el objetivo en «Hacer», «Siguiente» en «Ver».
    requestAnimationFrame(() => {
      if (!part) return;
      const { hole, focus } = targetOf(part);
      const behavior = reducedMotion() ? 'auto' : 'smooth';
      // En la ficha, el foco va a «Entendido» sin bajar: primero se lee desde arriba.
      if (part.expect.type !== 'closeSheet' && hole[0]?.closest('.dock__cards, .sheet__panel')) hole[0].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior });
      focusTarget = focus;
      if (confirm.hidden) (see ? next : focus)?.focus({ preventScroll: true });
    });
    if (!frame) frame = requestAnimationFrame(loop);
  };
}
