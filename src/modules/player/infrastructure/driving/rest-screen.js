import { h } from '../../../../shared/ui/dom.js';

const GOODNIGHT = [['E5', 1], ['C5', 1], ['A4', 1], ['F4', 2], ['C4', 3]];

/** Shown when today's screen time is over: calm, with a soft goodnight tune. */
export function renderRestScreen(synth) {
  const audio = synth.channel();
  audio.play(GOODNIGHT, { bpm: 60, loop: false, wave: 'triangle', gain: 0.2, ring: 1.6 });

  const element = h('div', { class: 'rest' },
    h('div', { class: 'rest-moon', 'aria-hidden': 'true' }, '🌙'),
    h('h1', {}, 'Hora de descansar'),
    h('p', {}, 'Que tal um colinho, uma música cantada ou uma brincadeira longe da tela?'));

  return { element, destroy: () => audio.close() };
}
