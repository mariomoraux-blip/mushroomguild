// Miniaturas de «Cómo jugar» (029): cada paso muestra la interfaz de la partida hecha con sus mismos componentes
// (tarjetas del dock, casillas, «Fin del mes», pastillas del HUD) para que el jugador la reconozca al jugar.
// Son decorativas: el contenedor es `aria-hidden` e `inert`, y el texto del paso lo explica.
import { es } from '../copy/es';
import { GAIN, motherCost, motherTrees, type GameState, type GuildSpecies } from '../rules';
import { assetUrl } from '../theme';
import { el, portrait } from './dom';
import { chip, piece } from './recipe';

/** Tarjeta del dock: medallón con retrato, cinta con el nombre e insignia (★ sugerido, Zz descansa, + reclutar). */
function card(species: GuildSpecies | 'recruit', o: { badge?: 'star' | 'rest' | 'plus'; picked?: boolean; used?: boolean } = {}, season = 0): HTMLElement {
  const recruit = species === 'recruit';
  const name = recruit ? es.dock.recruit : es.memberNames[species][0]!;
  const badge = o.badge === 'star' ? '★' : o.badge === 'rest' ? 'Zz' : o.badge === 'plus' ? '+' : '';
  return el('span', { class: `card${recruit ? ' card--recruit' : ` card--${species}`}${o.used ? ' is-used' : ''}`, 'aria-pressed': o.picked ? 'true' : undefined },
    el('span', { class: 'card__medal' }, recruit ? el('span', { class: 'card__icon card__icon--recruit' }) : portrait(species, o.picked ? 'feliz' : 'reposo', season)),
    ...(badge ? [el('span', { class: `card__badge${o.badge === 'plus' ? ' card__badge--plus' : ''}`, 'data-kind': o.badge === 'plus' ? undefined : o.badge }, badge)] : []),
    el('span', { class: 'card__name' }, name));
}

/** Pastilla del HUD con su ícono, valor y etiqueta. */
const hudChip = (icon: 'trees' | 'nutrients', value: number, label: string) =>
  el('span', { class: `chip chip--${icon}` }, el('span', { class: 'chip__row' }, el('span', { class: 'chip__icon' }), el('strong', { class: 'chip__value' }, String(value))), el('span', { class: 'chip__label' }, label));

const NET = { ground: 'net' } as const;

/** Miniatura del paso `step` (0–4) en la estación de la partida. */
export function howtoArt(step: number, game: GameState, season: number): HTMLElement[] {
  switch (step) {
    case 0:
      return [el('span', { class: 'howto-ui howto-ui--dock' },
        card('lactarius', {}, season), card('champi', { badge: 'star', picked: true }, season), card('amanita', {}, season))];
    case 1:
      return [el('span', { class: 'howto-ui howto-ui--tiles' },
        piece(NET, season), piece({ ground: 'grass', valid: true }, season), piece({ ground: 'grass', object: 'log', valid: true }, season))];
    case 2:
      return [el('span', { class: 'howto-ui howto-ui--dock' },
        card('lactarius', { badge: 'rest', used: true }, season),
        el('span', { class: 'end' }, el('span', { class: 'end__moon' }), el('span', { class: 'end__label' }, es.dock.endShort)))];
    case 3:
      return [el('span', { class: 'howto-ui howto-ui--tiles' },
        piece({ ground: 'net', object: 'alive' }, season),
        el('span', { class: 'howto-ui__chips' }, chip({ icon: 'spores', n: GAIN.treeSpores }), chip({ icon: 'nutrients', n: GAIN.treeNutrients })),
        card('recruit', { badge: 'plus' }))];
    default:
      return [el('span', { class: 'howto-ui howto-ui--goal' },
        el('img', { class: 'howto-ui__father', src: assetUrl('board/father-tree/asleep-painted'), alt: '', draggable: 'false', decoding: 'async' }),
        el('span', { class: 'howto-ui__chips howto-ui__chips--hud' }, hudChip('trees', motherTrees(game), es.hud.treesShort), hudChip('nutrients', motherCost(game), es.hud.nutrients)))];
  }
}
