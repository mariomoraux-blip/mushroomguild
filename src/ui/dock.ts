import { es } from '../copy/es';
import { COST, MONTHS, MAX_GUILD, magicSpent, recruitableCount, season, seasonIndex, MONTHS_PER_SEASON, type Member } from '../rules';
import { suggestedMember, type AppState, type Store } from '../store';
import { el, portrait, setPortrait, setText } from './dom';

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
 * insignia de estado (★ sugerido, Zz descansa), con scroll horizontal interno; "Fin del mes" es la
 * píldora amarilla fija en la misma fila. La acción del miembro elegido se lee en la bitácora.
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
  recruit.setAttribute('aria-label', `${es.dock.recruit}: ${es.dock.recruitCost(COST.recruit)}`);
  const endLabel = el('span', { class: 'end__label' });
  const end = el('button', { class: 'end', type: 'button' }, el('span', { class: 'end__moon', 'aria-hidden': 'true' }), endLabel);
  root.setAttribute('aria-label', es.dock.label);
  root.append(cards, end);

  const byId = new Map<number, { item: HTMLElement; button: HTMLButtonElement; badge: HTMLElement; face: HTMLElement }>();

  cards.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('button');
    if (!target) return;
    if (target.dataset.action === 'recruit') store.dispatch({ type: 'openSheet', sheet: { kind: 'recruit' } });
    else if (target.dataset.id) store.dispatch({ type: 'select', id: Number(target.dataset.id) });
  });
  end.addEventListener('click', () => store.dispatch({ type: 'endMonth' }));

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
      card.button.setAttribute('aria-label', `${m.name}, ${sp.name}, ${sp.role}: ${sp.action}. ${st.text}.${star ? ` ★ ${es.advice.star}.` : ''}`);
      card.button.setAttribute('aria-pressed', String(state.ui.selected === m.id));
      card.button.classList.toggle('is-used', !st.ready);
      card.button.disabled = !playing;
    });
    if (recruit.parentElement !== cards || cards.lastElementChild !== recruit) cards.append(recruit);
    // El botón abre la hoja aunque no alcance (allí están las fichas); si no se puede reclutar, solo se atenúa.
    recruit.disabled = !playing;
    recruit.classList.toggle('is-used', g.spores < COST.recruit || recruitableCount(g) >= MAX_GUILD);

    const last = g.month >= MONTHS;
    setText(endLabel, last ? es.dock.endWinterShort : es.dock.endShort);
    end.setAttribute('aria-label', last ? es.dock.endWinter : es.dock.endMonth);
    end.disabled = !playing;
  };
}
