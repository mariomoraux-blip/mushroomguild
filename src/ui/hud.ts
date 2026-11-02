import { es } from '../copy/es';
import { DAYS, revivedCount, season, treeTotal } from '../rules';
import type { AppState, Store } from '../store';
import { el, setText } from './dom';

/** HUD: día (de 12) y estación, nutrientes, esporas (abre reclutar) y árboles vivos (de 5), más "?" (ayuda). */
export function mountHud(root: HTMLElement, store: Store) {
  const chip = (label: string, tag: 'div' | 'button' = 'div') => {
    const value = el('strong', { class: 'chip__value' });
    const caption = el('span', { class: 'chip__label' }, label);
    const node = el(tag, { class: `chip${tag === 'button' ? ' chip--button' : ''}`, ...(tag === 'button' ? { type: 'button' } : {}) }, value, caption);
    return { node, value, caption };
  };
  const day = chip(es.hud.day);
  const nutrients = chip(es.hud.nutrients);
  const spores = chip(es.hud.recruitHint, 'button');
  const trees = chip(es.hud.trees);
  const help = el('button', { class: 'chip chip--button chip--help', type: 'button', 'aria-label': es.help.button }, '?');
  root.setAttribute('aria-label', es.hud.label);
  root.append(day.node, nutrients.node, spores.node, trees.node, help);

  spores.node.addEventListener('click', () => store.dispatch({ type: 'openSheet', sheet: { kind: 'recruit' } }));
  help.addEventListener('click', () => store.dispatch({ type: 'openSheet', sheet: { kind: 'help' } }));

  return (state: AppState) => {
    const g = state.game;
    setText(day.value, `${g.day}${es.hud.of(DAYS)}`);
    setText(day.caption, season(g.day));
    setText(nutrients.value, String(g.nutrients));
    setText(spores.value, String(g.spores));
    spores.node.setAttribute('aria-label', es.hud.sporesButton(g.spores));
    setText(trees.value, `${revivedCount(g)}${es.hud.of(treeTotal(g))}`);
  };
}
