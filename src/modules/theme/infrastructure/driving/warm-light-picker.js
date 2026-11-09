import { h } from '../../../../shared/ui/dom.js';

const CHOICES = [
  ['auto', 'Automático'],
  ['on', '🕯️ Ligada'],
  ['off', 'Desligada'],
];

/** The parents' warm-light choice, redrawn whenever it changes. */
export function renderWarmLightPicker({ setWarmLightPreference, warmLight }) {
  const element = h('div', { class: 'theme-picker' });

  function choose(preference) {
    setWarmLightPreference.execute({ preference });
    warmLight.refresh();
  }

  function draw({ preference, on, dayStartsAt, nightStartsAt }) {
    const content = h('div', {},
      h('p', { class: 'parents-label', id: 'warm-light-label' }, 'Luz quente'),
      h('div', { class: 'chips', role: 'group', 'aria-labelledby': 'warm-light-label' },
        CHOICES.map(([value, label]) =>
          h('button', { class: 'chip', 'aria-pressed': String(preference === value), onclick: () => choose(value) }, label))),
      h('p', { class: 'parents-hint' },
        'Um filtro âmbar que corta a maior parte da luz azul da tela. ',
        preference === 'auto'
          ? `Liga das ${nightStartsAt}h às ${dayStartsAt}h. Agora está ${on ? 'ligada' : 'desligada'}.`
          : 'Para cortar ainda mais, ligue também o modo noturno do aparelho e baixe o brilho.'));
    element.replaceChildren(...content.childNodes);
  }

  draw(warmLight.current);
  const unsubscribe = warmLight.subscribe(draw);
  return { element, destroy: unsubscribe };
}
