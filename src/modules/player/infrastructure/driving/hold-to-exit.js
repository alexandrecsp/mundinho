import { h } from '../../../../shared/ui/dom.js';

const HOLD_MS = 2000;

/**
 * The only way out of the player: hold for two seconds. Babies tap and
 * swipe; they rarely press one small spot and keep still.
 */
export function createHoldToExit({ onExit }) {
  let timer = 0;

  const element = h('button', { class: 'hold-exit', 'aria-label': 'Segure para sair', style: `--hold-ms: ${HOLD_MS}ms` },
    h('span', { class: 'hold-exit-ring', 'aria-hidden': 'true' }),
    h('span', { class: 'hold-exit-icon', 'aria-hidden': 'true' }, '✕'),
    h('span', { class: 'hold-exit-hint' }, 'Segure para sair'));

  function begin(event) {
    event.preventDefault();
    element.classList.add('holding');
    clearTimeout(timer);
    timer = setTimeout(onExit, HOLD_MS);
  }

  function cancel() {
    element.classList.remove('holding');
    clearTimeout(timer);
  }

  element.addEventListener('pointerdown', begin);
  for (const type of ['pointerup', 'pointerleave', 'pointercancel']) element.addEventListener(type, cancel);

  return { element, destroy: cancel };
}
