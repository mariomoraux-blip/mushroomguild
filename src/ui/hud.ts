import { es } from '../copy/es';
import { DAYS, revivedCount, season, treeTotal } from '../rules';
import type { AppState } from '../store';
import { el, setText } from './dom';

/** HUD: día (de 12) y estación, nutrientes, esporas y árboles vivos (de 5). */
export function mountHud(root: HTMLElement) {
  const chip = (label: string) => {
    const value = el('strong', { class: 'chip__value' });
    const caption = el('span', { class: 'chip__label' }, label);
    const node = el('div', { class: 'chip' }, value, caption);
    return { node, value, caption };
  };
  const day = chip(es.hud.day);
  const nutrients = chip(es.hud.nutrients);
  const spores = chip(es.hud.spores);
  const trees = chip(es.hud.trees);
  root.setAttribute('aria-label', es.hud.label);
  root.append(day.node, nutrients.node, spores.node, trees.node);

  return (state: AppState) => {
    const g = state.game;
    setText(day.value, `${g.day}${es.hud.of(DAYS)}`);
    setText(day.caption, season(g.day));
    setText(nutrients.value, String(g.nutrients));
    setText(spores.value, String(g.spores));
    setText(trees.value, `${revivedCount(g)}${es.hud.of(treeTotal(g))}`);
  };
}
