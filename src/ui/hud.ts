import { es } from '../copy/es';
import { DAYS, revivedCount, season, treeTotal } from '../rules';
import type { AppState, Store } from '../store';
import { el, icon, setText } from './dom';

/**
 * HUD en una cinta verde: día (de 12) y estación, nutrientes, esporas (abre reclutar) y árboles vivos
 * (del total del claro), más "?" (Libreta de campo).
 */
export function mountHud(root: HTMLElement, store: Store) {
  const dayValue = el('strong', { class: 'hud__day-value' });
  const dayCaption = el('span', { class: 'hud__day-caption' });
  const day = el('div', { class: 'hud__day' }, dayValue, dayCaption);

  const chip = (iconName: string, label: string, tag: 'div' | 'button' = 'div') => {
    const value = el('strong', { class: 'chip__value' });
    const caption = el('span', { class: 'chip__label' }, label);
    const node = el(
      tag,
      { class: `chip${tag === 'button' ? ' chip--button' : ''}`, ...(tag === 'button' ? { type: 'button' } : {}) },
      el('span', { class: 'chip__row' }, icon(iconName), value),
      caption,
    );
    return { node, value };
  };
  const nutrients = chip('leaf', es.hud.nutrients);
  const spores = chip('spore', es.hud.recruitHint, 'button');
  const trees = chip('tree', es.hud.trees);
  const help = el('button', { class: 'hud__help', type: 'button', 'aria-label': es.help.button }, '?');
  root.setAttribute('aria-label', es.hud.label);
  root.append(day, nutrients.node, spores.node, trees.node, help);

  spores.node.addEventListener('click', () => store.dispatch({ type: 'openSheet', sheet: { kind: 'recruit' } }));
  help.addEventListener('click', () => store.dispatch({ type: 'openSheet', sheet: { kind: 'help' } }));

  return (state: AppState) => {
    const g = state.game;
    setText(dayValue, `${es.hud.day} ${g.day}${es.hud.of(DAYS)}`);
    setText(dayCaption, season(g.day));
    setText(nutrients.value, String(g.nutrients));
    setText(spores.value, String(g.spores));
    spores.node.setAttribute('aria-label', es.hud.sporesButton(g.spores));
    setText(trees.value, `${revivedCount(g)}${es.hud.of(treeTotal(g))}`);
  };
}
