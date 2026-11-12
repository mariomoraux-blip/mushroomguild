import { es } from '../copy/es';
import { diffEffects } from '../effects';
import { hasFrost, MONTHS, recruitCost, revivedCount, season, seasonIndex, treeTotal, type GameState } from '../rules';
import { reducedMotion } from '../scenes/fx';
import { SEASON_SLUGS } from '../theme';
import type { AppState, Notice, Store } from '../store';
import { el, setText } from './dom';
import { countChange, replay } from './motion';

/**
 * HUD del referente (011): mes y estación en una pastilla verde, pastillas de crema con ícono pintado
 * para nutrientes, esporas (abre reclutar) y árboles vivos (del total del claro), y "?" amarillo (Cómo jugar).
 * Devuelve `render` (estado) y `setTime` (mm:ss del cronómetro, sin `aria-live`: no se anuncia cada segundo).
 */
export function mountHud(root: HTMLElement, store: Store) {
  const monthValue = el('strong', { class: 'hud__month-value' });
  // Segunda línea (015): ícono de la estación (su nombre como etiqueta accesible) y el cronómetro de juego activo.
  // Con escarcha (019), un copo junto a la estación; la etiqueta del ícono dice estación, escarcha y nivel.
  const seasonIcon = el('span', { class: 'hud__season', role: 'img' });
  const frost = el('span', { class: 'hud__frost', 'aria-hidden': 'true' });
  // Plaga (033): una hoja podrida junto a la estación mientras hay una casilla marcada.
  const plague = el('span', { class: 'hud__plague', 'aria-hidden': 'true' });
  const time = el('span', { class: 'hud__time' }, '00:00');
  const month = el('div', { class: 'hud__month' }, monthValue, el('span', { class: 'hud__month-caption' }, seasonIcon, frost, plague, time));

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
  const treesChip = chip('trees', es.hud.treesShort);
  const help = el('button', { class: 'hud__help', type: 'button', 'aria-label': es.help.button });
  root.setAttribute('aria-label', es.hud.label);
  root.append(month, nutrients.node, spores.node, treesChip.node, help);

  spores.node.addEventListener('click', () => store.dispatch({ type: 'openSheet', sheet: { kind: 'recruit' } }));
  help.addEventListener('click', () => store.dispatch({ type: 'openScreen', screen: { kind: 'howto', step: 0, back: 'game' } }));

  const setTime = (text: string) => {
    setText(time, text);
    time.setAttribute('aria-label', es.hud.time(text));
  };
  setTime('00:00');

  const chips = { nutrients: nutrients.node, spores: spores.node };
  let last: GameState | null = null;
  let lastNotice: Notice | null = null;
  /**
   * Cambios de una jugada, un hechizo o el mes nuevo (022): saltito y «±n» en cada contador. Las esporas y las hojas
   * que vuelan (`flyers.ts`) ponen su propia etiqueta al llegar. Cargar o empezar una partida no anima (el registro no crece en uno).
   */
  const animate = (prev: GameState, g: GameState) => {
    if (g.log.length !== prev.log.length + 1) return;
    const flying = reducedMotion() ? undefined : diffEffects(prev, g).find((e) => e.kind === 'spores');
    if (g.nutrients !== prev.nutrients && !flying?.leaves) countChange(nutrients.node, g.nutrients - prev.nutrients);
    if (g.spores !== prev.spores && !flying?.amount) countChange(spores.node, g.spores - prev.spores);
    const trees = revivedCount(g) - revivedCount(prev);
    if (trees) countChange(treesChip.node, trees);
    if (g.month !== prev.month) replay(month, 'is-bump');
  };

  const render = (state: AppState) => {
    const g = state.game;
    if (last && g !== last) animate(last, g);
    last = g;
    // Rechazo por falta de recursos: el contador que falta se tiñe.
    const n = state.ui.notice;
    if (n !== lastNotice && n.short && lastNotice) replay(chips[n.short], 'is-short');
    lastNotice = n;
    setText(monthValue, `${es.hud.month} ${g.month}${es.hud.of(MONTHS)}`);
    const frosty = hasFrost(g);
    const blighted = g.tiles.filter((t) => t.blighted).length;
    seasonIcon.setAttribute('aria-label', es.hud.season(season(g.month), frosty, es.levels.names[g.level], blighted));
    frost.hidden = !frosty;
    plague.hidden = !blighted;
    // 043: con más de una casilla con plaga, el número junto al ícono.
    plague.dataset.count = blighted > 1 ? String(blighted) : '';
    const slug = SEASON_SLUGS[seasonIndex(g.month)] ?? 'spring';
    // Estación nueva (022): el ícono cambia en un fundido, junto con el claro.
    if (seasonIcon.dataset.season && seasonIcon.dataset.season !== slug) replay(seasonIcon, 'is-new-season');
    seasonIcon.dataset.season = slug;
    setText(nutrients.value, String(g.nutrients));
    setText(spores.value, String(g.spores));
    spores.node.setAttribute('aria-label', es.hud.sporesButton(g.spores, recruitCost(g)));
    setText(treesChip.value, `${revivedCount(g)}${es.hud.of(treeTotal(g))}`);
  };
  return { render, setTime };
}
