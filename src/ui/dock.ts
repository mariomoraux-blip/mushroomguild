import { es } from '../copy/es';
import { canRecruit, MONTHS, magicSpent, recruitCost, season, seasonIndex, MONTHS_PER_SEASON, weaveCost, type GameState, type Member } from '../rules';
import { reducedMotion } from '../scenes/fx';
import { suggestedMember, type AppState, type Store } from '../store';
import { el, portrait, setPortrait, setText } from './dom';
import { replay } from './motion';

/** Entre tarjeta y tarjeta que despierta al empezar el mes (022). */
const WAKE_STAGGER = 40;

/** Estado de la tarjeta: lista, descansa o (Maestra Bruma) cuándo vuelve su magia. */
function status(state: AppState, m: Member): { text: string; ready: boolean } {
  const g = state.game;
  if (m.species === 'mago' && magicSpent(g)) {
    const next = (seasonIndex(g.month) + 1) * MONTHS_PER_SEASON + 1;
    return { text: next > MONTHS ? es.dock.magicGone : es.dock.magicBack(season(next)), ready: false };
  }
  return m.used ? { text: es.dock.resting, ready: false } : { text: es.dock.ready, ready: true };
}

/**
 * Dock del gremio (011): medallones de madera con el retrato de cada miembro, su nombre en una cinta e
 * insignia de estado (★ sugerido, Zz descansa), con scroll horizontal interno que solo muestra tarjetas
 * enteras (018) y una flecha en el borde si hay más; "Fin del mes" es la píldora amarilla fija en la misma fila. La acción del miembro elegido se lee en la bitácora.
 */
export function mountDock(root: HTMLElement, store: Store) {
  const cards = el('div', { class: 'dock__cards', role: 'list' });
  const recruit = el(
    'button',
    { class: 'card card--recruit', type: 'button', 'data-action': 'recruit' },
    el('span', { class: 'card__medal' }, el('span', { class: 'card__icon card__icon--recruit', 'aria-hidden': 'true' })),
    el('span', { class: 'card__badge card__badge--plus', 'aria-hidden': 'true' }, '+'),
    el('span', { class: 'card__name' }, es.dock.recruit),
  );
  const endLabel = el('span', { class: 'end__label' });
  const end = el('button', { class: 'end', type: 'button' }, el('span', { class: 'end__moon', 'aria-hidden': 'true' }), endLabel);
  const more = (side: 'start' | 'end') => el('span', { class: `dock__more dock__more--${side}`, 'aria-hidden': 'true' });
  const rail = el('div', { class: 'dock__rail' }, cards, more('start'), more('end'));
  root.setAttribute('aria-label', es.dock.label);
  root.append(rail, end);

  // Solo tarjetas enteras (018): el espacio sobrante se reparte entre las que caben, así cada parada
  // del scroll (snap de tarjeta en tarjeta) cae justo en el borde. Las flechas avisan qué lado tiene más.
  const edges = () => {
    const max = cards.scrollWidth - cards.clientWidth;
    rail.dataset.more = [cards.scrollLeft > 1 ? 'start' : '', cards.scrollLeft < max - 1 ? 'end' : ''].join(' ').trim();
  };
  const fit = () => {
    const first = cards.firstElementChild as HTMLElement | null;
    if (!first) return;
    const style = getComputedStyle(cards);
    const inner = cards.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const card = first.offsetWidth;
    const minGap = parseFloat(style.getPropertyValue('--dock-gap-min')) || 4;
    const fits = Math.max(1, Math.floor((inner + minGap) / (card + minGap)));
    const extra = cards.children.length - fits;
    const gap = extra > 0 && fits > 1 ? (inner - fits * card) / (fits - 1) : minGap;
    cards.style.setProperty('--dock-gap', `${gap}px`);
    // El final también cae en una tarjeta entera: se completa el ancho que le falta al scroll.
    const last = cards.lastElementChild as HTMLElement;
    for (const c of cards.children) (c as HTMLElement).style.marginInlineEnd = '';
    if (extra > 0) last.style.marginInlineEnd = `${Math.max(0, extra * (card + gap) - (cards.scrollWidth - cards.clientWidth))}px`;
    edges();
  };
  cards.addEventListener('scroll', edges, { passive: true });
  new ResizeObserver(fit).observe(cards);

  let shown = 0;
  let last: GameState | null = null;
  let lastSelected: number | null = null;
  let lastSeason: number | null = null;
  /** Animaciones del dock (022) que esperan a que se cierre la carta de historia que las taparía. */
  let queued: { id: number; cls: string; delay: number }[] = [];
  const byId = new Map<number, { item: HTMLElement; button: HTMLButtonElement; badge: HTMLElement; face: HTMLElement }>();

  cards.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('button');
    if (!target) return;
    if (target.dataset.action === 'recruit') store.dispatch({ type: 'openSheet', sheet: { kind: 'recruit' } });
    else if (target.dataset.id) {
      const id = Number(target.dataset.id);
      const tired = store.getState().game.members.find((m) => m.id === id)?.used;
      store.dispatch({ type: 'select', id });
      // Miembro cansado (022): su «Zz» se mece donde se tocó.
      if (tired && store.getState().game.status === 'playing') replay(target, 'is-tired');
    }
  });
  // Con la partida terminada, el mismo botón vuelve a la carta de final (017): nunca queda sin salida.
  end.addEventListener('click', () => store.dispatch(store.getState().game.status === 'playing' ? { type: 'endMonth' } : { type: 'showEnd' }));

  /**
   * Movimiento del dock (022): quien se suma entra creciendo (Maestra Bruma, con un fundido y su halo); al empezar
   * el mes, las tarjetas que descansaban despiertan de a una (40 ms) y la luna del botón gira media vuelta.
   */
  const animate = (prev: GameState, g: GameState) => {
    const was = new Map(prev.members.map((m) => [m.id, m]));
    if (g.month >= prev.month)
      for (const m of g.members) if (!was.has(m.id)) queued.push({ id: m.id, cls: m.species === 'mago' ? 'is-arriving' : 'is-joining', delay: 0 });
    if (g.month > prev.month) {
      replay(end, 'is-turning');
      g.members.filter((m) => was.get(m.id)?.used && !m.used).forEach((m, i) => queued.push({ id: m.id, cls: 'is-waking', delay: i * WAKE_STAGGER }));
    }
  };
  const flush = () => {
    for (const { id, cls, delay } of queued) {
      const card = byId.get(id);
      if (!card) continue;
      card.button.style.setProperty('--wake-delay', `${delay}ms`);
      replay(card.button, cls);
      if (cls !== 'is-waking') card.item.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
    }
    queued = [];
  };

  return (state: AppState) => {
    const g = state.game;
    const playing = g.status === 'playing';
    const suggested = suggestedMember(state);
    // Orden estable: orden de llegada al gremio. Las tarjetas existentes se reutilizan (no se pierde el foco).
    g.members.forEach((m, i) => {
      let card = byId.get(m.id);
      if (!card) {
        const sp = es.species[m.species];
        const badge = el('span', { class: 'card__badge', 'aria-hidden': 'true' });
        const face = portrait(m.species);
        const button = el(
          'button',
          { class: `card card--${m.species}`, type: 'button', 'data-id': m.id, title: `${m.name} · ${sp.short}` },
          el('span', { class: 'card__medal' }, face),
          badge,
          el('span', { class: 'card__name' }, m.name),
        );
        const item = el('div', { role: 'listitem', class: 'dock__item' }, button);
        card = { item, button, badge, face };
        byId.set(m.id, card);
      }
      if (cards.children[i] !== card.item) cards.insertBefore(card.item, cards.children[i] ?? null);
      // Insignia: ★ si es la sugerida; Zz si descansa (o se le acabó la magia por esta estación).
      const st = status(state, m);
      const sp = es.species[m.species];
      const star = suggested === m.id;
      setText(card.badge, star ? '★' : st.ready ? '' : 'Zz');
      card.badge.dataset.kind = star ? 'star' : st.ready ? 'none' : 'rest';
      card.button.classList.toggle('is-suggested', star);
      setPortrait(card.face, m.species, st.ready && (star || state.ui.selected === m.id) ? 'feliz' : 'reposo', seasonIndex(g.month));
      // La corona de Chispa cambia con la estación (022): la nueva se funde.
      if (m.species === 'gliophorus' && lastSeason !== null && lastSeason !== seasonIndex(g.month)) replay(card.face, 'is-new-season');
      // El Tejedor dice el costo de este mes (con escarcha, 2).
      const action = m.species === 'lactarius' ? es.weaveAction(weaveCost(g)) : sp.action;
      card.button.setAttribute('aria-label', `${m.name}, ${sp.name}, ${sp.role}: ${action}. ${st.text}.${star ? ` ★ ${es.advice.star}.` : ''}`);
      card.button.setAttribute('aria-pressed', String(state.ui.selected === m.id));
      // Al seleccionarla, la tarjeta sube y el retrato hace la firma de su especie.
      if (state.ui.selected === m.id && lastSelected !== m.id) replay(card.button, 'is-picked');
      card.button.classList.toggle('is-used', !st.ready);
      card.button.disabled = !playing;
    });
    if (recruit.parentElement !== cards || cards.lastElementChild !== recruit) cards.append(recruit);
    if (cards.children.length !== shown) {
      shown = cards.children.length;
      fit();
    }
    if (last && g !== last) animate(last, g);
    last = g;
    lastSelected = state.ui.selected;
    lastSeason = seasonIndex(g.month);
    if (!state.ui.story) flush();
    // El botón abre la hoja aunque no alcance (allí están las fichas); si no se puede reclutar, solo se atenúa.
    recruit.disabled = !playing;
    recruit.classList.toggle('is-used', !canRecruit(g));
    const cost = recruitCost(g);
    recruit.setAttribute('aria-label', `${es.dock.recruit}: ${cost === null ? es.dock.recruitFull : es.dock.recruitCost(cost)}`);

    const lastMonth = g.month >= MONTHS;
    setText(endLabel, !playing ? es.dock.showEndShort : lastMonth ? es.dock.endWinterShort : es.dock.endShort);
    end.setAttribute('aria-label', !playing ? es.dock.showEnd : lastMonth ? es.dock.endWinter : es.dock.endMonth);
  };
}
