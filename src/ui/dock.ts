import { es } from '../copy/es';
import { COST, DAYS, MAX_GUILD, magicSpent, recruitableCount, season, seasonIndex, DAYS_PER_SEASON, type Member } from '../rules';
import { suggestedMember, type AppState, type Store } from '../store';
import { el, icon, portrait, setPortrait, setText } from './dom';

/** Estado de la tarjeta: lista, descansa o (Maestra Bruna) cuándo vuelve su magia. */
function status(state: AppState, m: Member): { text: string; ready: boolean } {
  const g = state.game;
  if (m.species === 'mago' && magicSpent(g)) {
    const next = (seasonIndex(g.day) + 1) * DAYS_PER_SEASON + 1;
    return { text: next > DAYS ? es.dock.magicGone : es.dock.magicBack(season(next)), ready: false };
  }
  return m.used ? { text: es.dock.resting, ready: false } : { text: es.dock.ready, ready: true };
}

/** Dock del gremio: tarjetas con scroll horizontal interno + "Terminar el día" fijo en la misma fila. */
export function mountDock(root: HTMLElement, store: Store) {
  const cards = el('div', { class: 'dock__cards', role: 'list' });
  const recruit = el(
    'button',
    { class: 'card card--recruit', type: 'button', 'data-action': 'recruit' },
    el('span', { class: 'card__name' }, `+ ${es.dock.recruit}`),
    el('span', { class: 'card__meta' }, es.dock.recruitCost(COST.recruit)),
  );
  const endLabel = el('span', { class: 'end__label' });
  const end = el('button', { class: 'end', type: 'button' }, icon('moon'), endLabel);
  root.setAttribute('aria-label', es.dock.label);
  root.append(cards, end);

  const byId = new Map<number, { item: HTMLElement; button: HTMLButtonElement; status: HTMLElement; face: HTMLElement }>();

  cards.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('button');
    if (!target) return;
    if (target.dataset.action === 'recruit') store.dispatch({ type: 'openSheet', sheet: { kind: 'recruit' } });
    else if (target.dataset.id) store.dispatch({ type: 'select', id: Number(target.dataset.id) });
  });
  end.addEventListener('click', () => store.dispatch({ type: 'endDay' }));

  return (state: AppState) => {
    const g = state.game;
    const playing = g.status === 'playing';
    const suggested = suggestedMember(state);
    // Orden estable: orden de llegada al gremio. Las tarjetas existentes se reutilizan (no se pierde el foco).
    g.members.forEach((m, i) => {
      let card = byId.get(m.id);
      if (!card) {
        const sp = es.species[m.species];
        const statusNode = el('span', { class: 'card__status' });
        const face = portrait(m.species);
        const button = el(
          'button',
          { class: `card card--${m.species}`, type: 'button', 'data-id': m.id },
          face,
          el('span', { class: 'card__star', 'aria-hidden': 'true' }, '★'),
          el('span', { class: 'card__text' },
            el('span', { class: 'card__name' }, m.name, ' ', el('em', { class: 'card__species' }, sp.short)),
            el('span', { class: 'card__meta' }, sp.role),
            statusNode),
        );
        const item = el('div', { role: 'listitem', class: 'dock__item' }, button);
        card = { item, button, status: statusNode, face };
        byId.set(m.id, card);
      }
      if (cards.children[i] !== card.item) cards.insertBefore(card.item, cards.children[i] ?? null);
      // Tercera línea: la acción y su costo si está lista; si no, por qué descansa (o cuándo vuelve la magia).
      const st = status(state, m);
      const sp = es.species[m.species];
      const star = suggested === m.id;
      setText(card.status, st.ready ? sp.action : st.text);
      card.button.classList.toggle('is-suggested', star);
      setPortrait(card.face, m.species, st.ready && (star || state.ui.selected === m.id) ? 'feliz' : 'reposo', seasonIndex(g.day));
      card.button.setAttribute('aria-label', `${m.name}, ${sp.name}, ${sp.role}: ${sp.action}. ${st.text}.${star ? ` ★ ${es.advice.star}.` : ''}`);
      card.button.setAttribute('aria-pressed', String(state.ui.selected === m.id));
      card.button.classList.toggle('is-used', !st.ready);
      card.button.disabled = !playing;
    });
    if (recruit.parentElement !== cards || cards.lastElementChild !== recruit) cards.append(recruit);
    // El botón abre la hoja aunque no alcance (allí están las fichas); si no se puede reclutar, solo se atenúa.
    recruit.disabled = !playing;
    recruit.classList.toggle('is-used', g.spores < COST.recruit || recruitableCount(g) >= MAX_GUILD);

    const last = g.day >= DAYS;
    setText(endLabel, last ? es.dock.endWinterShort : es.dock.endShort);
    end.setAttribute('aria-label', last ? es.dock.endWinter : es.dock.endDay);
    end.disabled = !playing;
  };
}
