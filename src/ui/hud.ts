import { es } from '../copy/es';
import { MONTHS, revivedCount, season, seasonIndex, treeTotal } from '../rules';
import { SEASON_SLUGS } from '../theme';
import type { AppState, Store } from '../store';
import { el, setText } from './dom';

/**
 * HUD del referente (011): mes y estación en una pastilla verde, pastillas de crema con ícono pintado
 * para nutrientes, esporas (abre reclutar) y árboles vivos (del total del claro), y "?" amarillo (Cómo jugar).
 */
export function mountHud(root: HTMLElement, store: Store) {
  const monthValue = el('strong', { class: 'hud__month-value' });
  const monthCaption = el('span');
  const seasonIcon = el('span', { class: 'hud__season', 'aria-hidden': 'true' });
  const month = el('div', { class: 'hud__month' }, monthValue, el('span', { class: 'hud__month-caption' }, seasonIcon, monthCaption));

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
  root.append(month, nutrients.node, spores.node, trees.node, help);

  spores.node.addEventListener('click', () => store.dispatch({ type: 'openSheet', sheet: { kind: 'recruit' } }));
  help.addEventListener('click', () => store.dispatch({ type: 'openScreen', screen: { kind: 'howto', step: 0, back: 'game' } }));

  return (state: AppState) => {
    const g = state.game;
    setText(monthValue, `${es.hud.month} ${g.month}${es.hud.of(MONTHS)}`);
    setText(monthCaption, season(g.month));
    seasonIcon.dataset.season = SEASON_SLUGS[seasonIndex(g.month)] ?? 'spring';
    setText(nutrients.value, String(g.nutrients));
    setText(spores.value, String(g.spores));
    spores.node.setAttribute('aria-label', es.hud.sporesButton(g.spores));
    setText(trees.value, `${revivedCount(g)}${es.hud.of(treeTotal(g))}`);
  };
}
