import { es } from '../copy/es';
import { COST, MAX_GUILD, RECRUITABLE, recruitableCount, validTargets, type SpeciesId, type Spell } from '../rules';
import type { AppState, Sheet, Store } from '../store';
import { el, hat } from './dom';

const SPECIES: readonly SpeciesId[] = [...RECRUITABLE, 'mago'];

/** Hoja inferior: reclutar (con fichas), ficha de criatura o elegir hechizo. */
export function mountSheet(root: HTMLElement, store: Store) {
  let shown: Sheet | null = null;
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
        el('button', { class: 'btn btn--icon', type: 'button', 'data-action': 'close', 'aria-label': es.sheet.close }, '×')),
      ...body,
    );
  };

  function recruitSheet(state: AppState) {
    const g = state.game;
    const can = g.status === 'playing' && g.spores >= COST.recruit && recruitableCount(g) < MAX_GUILD;
    const rows = SPECIES.map((sp) => {
      const info = es.species[sp];
      const action =
        sp === 'mago'
          ? el('span', { class: 'row__note' }, es.sheet.mageArrives)
          : el('button', { class: 'btn', type: 'button', 'data-action': 'recruit', 'data-species': sp, disabled: !can }, es.sheet.recruitAction);
      return el(
        'li',
        { class: 'row' },
        hat(sp),
        el('span', { class: 'row__text' }, el('strong', {}, info.name), el('span', {}, ` · ${info.role}`)),
        el('button', { class: 'btn btn--icon', type: 'button', 'data-action': 'info', 'data-species': sp, 'aria-label': es.sheet.info(info.name) }, 'i'),
        action,
      );
    });
    return panel(es.sheet.recruitTitle, el('p', { class: 'sheet__help' }, es.sheet.recruitHelp(COST.recruit, MAX_GUILD)), el('ul', { class: 'rows' }, ...rows));
  }

  function creatureSheet(species: SpeciesId) {
    const info = es.species[species];
    const name = species === 'mago' ? es.mageName : info.name;
    return panel(
      name,
      el('div', { class: 'creature' },
        hat(species),
        el('p', {}, el('em', {}, info.scientific), ` · ${info.role}`),
        el('p', {}, info.verb),
        el('p', { class: 'creature__quip' }, info.quip)),
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
    root.replaceChildren(sheet.kind === 'recruit' ? recruitSheet(state) : sheet.kind === 'creature' ? creatureSheet(sheet.species) : spellSheet(state));
    root.hidden = false;
    root.querySelector<HTMLElement>('.sheet__panel button:not([disabled])')?.focus();
  };
}
