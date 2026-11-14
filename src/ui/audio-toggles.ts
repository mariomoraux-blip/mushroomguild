// Interruptores «Sonido» y «Música» (049): los mismos en la portada y en la Libreta de campo.
// Un solo escucha de clics los atiende a todos, y cada cambio de preferencia actualiza los que estén en pantalla.
import { es } from '../copy/es';
import type { AudioPrefs, GameAudio, PrefKey } from '../audio';
import { el } from './dom';

const KEYS: readonly PrefKey[] = ['sound', 'music'];

function sync(button: HTMLElement, prefs: AudioPrefs) {
  const on = prefs[button.dataset.key as PrefKey];
  button.setAttribute('aria-pressed', String(on));
  const state = button.querySelector('.sound-toggle__state');
  if (state) state.textContent = on ? es.audio.on : es.audio.off;
}

/** Monta los interruptores y devuelve la fábrica del grupo para cada pantalla que los muestra. Sin Web Audio, no hay grupo. */
export function mountAudioToggles(audio: GameAudio | null, doc: Document = document): () => HTMLElement | null {
  if (!audio) return () => null;
  doc.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLElement>('[data-action="audio"]');
    const key = b?.dataset.key as PrefKey | undefined;
    if (key) audio.set(key, !audio.prefs()[key]);
  });
  audio.onPrefs((prefs) => doc.querySelectorAll<HTMLElement>('[data-action="audio"]').forEach((b) => sync(b, prefs)));
  return () =>
    el('div', { class: 'sound-toggles', role: 'group', 'aria-label': es.audio.label },
      ...KEYS.map((key) => {
        const b = el('button', { class: `sound-toggle sound-toggle--${key}`, type: 'button', 'data-action': 'audio', 'data-key': key },
          el('span', { class: 'sound-toggle__icon', 'aria-hidden': 'true' }),
          el('span', { class: 'sound-toggle__name' }, es.audio[key]),
          el('span', { class: 'sound-toggle__state', 'aria-hidden': 'true' }));
        sync(b, audio.prefs());
        return b;
      }));
}
