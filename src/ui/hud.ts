import { es } from '../copy/es';
import { DAYS, revivedCount, season, seasonIndex, treeTotal } from '../rules';
import { SEASON_SLUGS } from '../theme';
import type { AppState, Store } from '../store';
import { el, setText } from './dom';

/**
 * HUD del referente (011): día y estación en una pastilla verde, pastillas de crema con ícono pintado
 * para nutrientes, esporas (abre reclutar) y árboles vivos (del total del claro), y "?" amarillo (Libreta de campo).
 */
export function mountHud(root: HTMLElement, store: Store) {
  const dayValue = el('strong', { class: 'hud__day-value' });
  const dayCaption = el('span');
  const seasonIcon = el('span', { class: 'hud__season', 'aria-hidden': 'true' });
  const day = el('div', { class: 'hud__day' }, dayValue, el('span', { class: 'hud__day-caption' }, seasonIcon, dayCaption));

  const chip = (iconName: string, label: string, tag: 'div' | 'button' = 'div') => {
    const value = el('strong', { class: 'chip__value' });
    const node = el(
      tag,
      { class: `chip chip--${iconName}${tag === 'button' ? ' chip--button' : ''}`, ...(tag === 'button' ? { type: 'button' } : {}) },
      el('span', { class: 'chip__row' }, el('span', { class: 'chip__icon', 'aria-hidden': 'true' }), value),
      el('span', { class: 'chip__label' }, label),
    );
    return { node, value };
  };
  const nutrients = chip('nutrients', es.hud.nutrients);
  const spores = chip('spores', es.hud.recruitHint, 'button');
  const trees = chip('trees', es.hud.treesShort);
  const help = el('button', { class: 'hud__help', type: 'button', 'aria-label': es.help.button });
  root.setAttribute('aria-label', es.hud.label);
  root.append(day, nutrients.node, spores.node, trees.node, help);

  spores.node.addEventListener('click', () => store.dispatch({ type: 'openSheet', sheet: { kind: 'recruit' } }));
  help.addEventListener('click', () => store.dispatch({ type: 'openSheet', sheet: { kind: 'help' } }));

  return (state: AppState) => {
    const g = state.game;
    setText(dayValue, `${es.hud.day} ${g.day}${es.hud.of(DAYS)}`);
    setText(dayCaption, season(g.day));
    seasonIcon.dataset.season = SEASON_SLUGS[seasonIndex(g.day)] ?? 'spring';
    setText(nutrients.value, String(g.nutrients));
    setText(spores.value, String(g.spores));
    spores.node.setAttribute('aria-label', es.hud.sporesButton(g.spores));
    setText(trees.value, `${revivedCount(g)}${es.hud.of(treeTotal(g))}`);
  };
}
