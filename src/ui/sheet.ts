import { es } from '../copy/es';
import { COST, MAX_GUILD, RECRUITABLE, recruitableCount, seasonIndex, validTargets, type SpeciesId, type Spell } from '../rules';
import type { AppState, Sheet, Store } from '../store';
import { el, portrait } from './dom';

const SPECIES: readonly SpeciesId[] = [...RECRUITABLE, 'mago'];

/** Hoja inferior: reclutar (con fichas), ficha de criatura o elegir hechizo. */
export function mountSheet(root: HTMLElement, store: Store) {
  let shown: Sheet | null = null;
  let currentSeason = 0;
  let opener: HTMLElement | null = null;

  root.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t === root) return store.dispatch({ type: 'closeSheet' }); // tocar fuera del panel
    const b = t.closest('button');
    if (!b) return;
    const { action, species, spell } = b.dataset;
    if (action === 'close') store.dispatch({ type: 'closeSheet' });
    if (action === 'recruit') store.dispatch({ type: 'recruit', species: species as (typeof RECRUITABLE)[number] });
    if (action === 'info') store.dispatch({ type: 'openSheet', sheet: { kind: 'creature', species: species as SpeciesId } });
    if (action === 'spell') store.dispatch({ type: 'chooseSpell', spell: spell as Spell });
  });

  const panel = (title: string, ...body: Node[]) => {
    const id = 'sheet-title';
    return el(
      'div',
      { class: 'sheet__panel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': id },
      el('div', { class: 'sheet__head' },
        el('h2', { id, class: 'sheet__title' }, title),
        el('button', { class: 'round-btn round-btn--close', type: 'button', 'data-action': 'close', 'aria-label': es.sheet.close })),
      ...body,
    );
  };

  function recruitSheet(state: AppState) {
    const season = currentSeason;
    const g = state.game;
    const can = g.status === 'playing' && g.spores >= COST.recruit && recruitableCount(g) < MAX_GUILD;
    const rows = SPECIES.map((sp) => {
      const info = es.species[sp];
      const action =
        sp === 'mago'
          ? el('span', { class: 'row__note' }, es.sheet.mageArrives)
          : el('button', { class: 'btn btn--primary', type: 'button', 'data-action': 'recruit', 'data-species': sp, disabled: !can }, es.sheet.recruitAction);
      return el(
        'li',
        { class: 'row' },
        el('span', { class: 'medal' }, portrait(sp, 'reposo', season)),
        el('span', { class: 'row__text' },
          el('strong', {}, info.name), el('span', { class: 'row__role' }, ` · ${info.role}`),
          el('span', { class: 'row__verb' }, info.verb)),
        el('button', { class: 'btn btn--icon', type: 'button', 'data-action': 'info', 'data-species': sp, 'aria-label': es.sheet.info(info.name) }, 'i'),
        action,
      );
    });
    return panel(es.sheet.recruitTitle, el('p', { class: 'sheet__help' }, es.sheet.recruitHelp(COST.recruit, MAX_GUILD)), el('ul', { class: 'rows' }, ...rows));
  }

  /** Ficha de una especie (y de un miembro concreto, si se abrió al seleccionarlo). */
  function cardSheet(species: SpeciesId, memberName?: string) {
    const season = currentSeason;
    const info = es.species[species];
    const g = es.guide[species];
    const S = es.card.sections;
    const name = species === 'mago' ? es.mageName : info.name;
    const title = memberName && memberName !== name ? es.card.title(memberName, info.name) : species === 'mago' ? es.card.title(name, info.name) : name;
    const section = (heading: string, text?: string) => (text ? [el('h3', {}, heading), el('p', {}, text)] : []);
    return panel(
      title,
      el('div', { class: 'creature' },
        el('div', { class: 'creature__head' }, el('span', { class: 'medal medal--lg' }, portrait(species, 'feliz', season, 'lg')), el('p', {}, el('em', {}, info.scientific), el('br'), el('span', { class: 'creature__role' }, info.role))),
        el('p', {}, g.context),
        el('p', { class: 'creature__quip' }, es.quote(info.quip)),
        ...section(S.ability, g.ability),
        ...section(S.howTo, g.howTo),
        ...section(S.movement, g.movement),
        ...section(S.nutrients, g.nutrients),
        ...section(S.heals, 'heals' in g ? g.heals : undefined),
        ...section(S.messenger, 'messenger' in g ? g.messenger : undefined),
        ...section(S.powers, 'powers' in g ? g.powers : undefined),
        el('button', { class: 'btn btn--wide', type: 'button', 'data-action': 'close' }, es.card.understood)),
    );
  }

  function helpSheet() {
    const season = currentSeason;
    const h = es.help;
    const tiles = [es.tileHelp.mother, es.tileHelp.home, es.tileHelp.soil, es.tileHelp.log, es.tileHelp.tree, es.tileHelp.treeFading, es.tileHelp.treeFaded, es.tileHelp.treeAlive, es.tileHelp.rock];
    return panel(
      h.title,
      el('div', { class: 'help' },
        el('h3', {}, h.goalTitle),
        el('p', {}, h.goal),
        el('h3', {}, h.howTitle),
        el('ol', {}, ...h.how.map((step) => el('li', {}, step))),
        el('h3', {}, h.guildTitle),
        el('ul', { class: 'rows' },
          ...SPECIES.map((sp) =>
            el('li', { class: 'row' }, el('span', { class: 'medal' }, portrait(sp, 'reposo', season)),
              el('span', { class: 'row__text' },
                el('strong', {}, sp === 'mago' ? es.mageName : es.species[sp].short), el('span', { class: 'row__role' }, ` · ${es.species[sp].role}`),
                el('span', { class: 'row__verb' }, es.species[sp].verb))))),
        el('h3', {}, h.tilesTitle),
        el('ul', { class: 'help__tiles' }, ...tiles.map((t) => el('li', {}, t))),
        el('h3', {}, h.levelsTitle),
        el('p', {}, h.levels),
        el('p', { class: 'help__tip' }, h.tip),
        el('button', { class: 'btn btn--wide', type: 'button', 'data-action': 'close' }, h.start)),
    );
  }

  function spellSheet(state: AppState) {
    const id = state.ui.selected!;
    const spells: Spell[] = ['sprout', 'rain'];
    return panel(
      es.sheet.spellTitle,
      el('div', { class: 'spells' },
        ...spells.map((sp) =>
          el('button', { class: 'btn btn--spell', type: 'button', 'data-action': 'spell', 'data-spell': sp, disabled: !validTargets(state.game, id, sp).length },
            el('strong', {}, es.spells[sp]),
            el('span', {}, es.spellHelp[sp])))),
    );
  }

  return (state: AppState) => {
    currentSeason = seasonIndex(state.game.month);
    const sheet = state.ui.sheet;
    if (JSON.stringify(sheet) === JSON.stringify(shown)) return;
    const wasOpen = shown !== null;
    shown = sheet;
    if (!sheet) {
      root.hidden = true;
      root.replaceChildren();
      if (wasOpen) opener?.focus();
      return;
    }
    if (!wasOpen) opener = document.activeElement as HTMLElement | null;
    const views = {
      recruit: () => recruitSheet(state),
      creature: () => cardSheet((sheet as { species: SpeciesId }).species),
      member: () => {
        const m = state.game.members.find((mm) => mm.id === (sheet as { id: number }).id);
        return m ? cardSheet(m.species, m.name) : el('div');
      },
      spell: () => spellSheet(state),
      help: () => helpSheet(),
    };
    root.replaceChildren(views[sheet.kind]());
    root.hidden = false;
    root.querySelector<HTMLElement>('.sheet__panel button:not([disabled])')?.focus();
  };
}
