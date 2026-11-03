import { h } from '../../../../shared/ui/dom.js';

const CHOICES = [
  [true, 'Bichinhos'],
  [false, 'Redondas'],
];

/** The parents' switch for the animal-shaped bubbles. */
export function renderAnimalShapesToggle({ getAnimalShapes, setAnimalShapes }) {
  const element = h('div', { class: 'animal-shapes' });

  function draw({ shown } = getAnimalShapes.execute()) {
    const content = h('div', {},
      h('p', { class: 'parents-label', id: 'animal-shapes-label' }, 'Formato das bolhas'),
      h('div', { class: 'chips', role: 'group', 'aria-labelledby': 'animal-shapes-label' },
        CHOICES.map(([value, label]) =>
          h('button', { class: 'chip', 'aria-pressed': String(shown === value), onclick: () => draw(setAnimalShapes.execute({ shown: value })) }, label))),
      h('p', { class: 'parents-hint' },
        shown
          ? 'Cada bolha tem o contorno de um bichinho: urso, gato, coelho, peixinho ou pintinho. Dá para dizer "estourou o gatinho azul!".'
          : 'As bolhas aparecem redondas, sem bichinhos.'));
    element.replaceChildren(...content.childNodes);
  }

  draw();
  return element;
}
