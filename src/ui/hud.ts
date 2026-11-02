import { es } from '../copy/es';
import { DAYS, revivedCount, season, treeTotal } from '../rules';
import type { AppState, Store } from '../store';
import { dayTag, iconArt, medallion, waxSeal, woodSign } from './art';
import { el, setText } from './dom';

/**
 * HUD en una cinta verde: día (de 12) y estación, nutrientes, esporas (abre reclutar) y árboles vivos
 * (del total del claro), más "?" (Libreta de campo).
 */
export function mountHud(root: HTMLElement, store: Store) {
  const dayValue = el('strong', { class: 'hud__day-value' });
  const dayCaption = el('span', { class: 'hud__day-caption' });
  const day = el('div', { class: 'hud__day' }, dayTag(), dayValue, dayCaption);

  const chip = (iconName: string, label: string, tag: 'div' | 'button' = 'div') => {
    const value = el('strong', { class: 'chip__value' });
    const caption = el('span', { class: 'chip__label' }, label);
    const node = el(
      tag,
      { class: `chip${tag === 'button' ? ' chip--button' : ''}`, ...(tag === 'button' ? { type: 'button' } : {}) },
      el('span', { class: 'chip__medal' }, medallion(), iconArt(iconName)),
      el('span', { class: 'chip__text' }, value, caption),
    );
    return { node, value };
  };
  const nutrients = chip('nutrients', es.hud.nutrients);
  const spores = chip('spores', es.hud.recruitHint, 'button');
  const trees = chip('trees', es.hud.treesShort);
  const help = el('button', { class: 'hud__help', type: 'button', 'aria-label': es.help.button }, waxSeal(), el('span', { class: 'hud__help-mark' }, '?'));
  root.setAttribute('aria-label', es.hud.label);
  root.append(woodSign(), day, nutrients.node, spores.node, trees.node, help);

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
