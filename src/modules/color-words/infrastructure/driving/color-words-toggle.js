import { h } from '../../../../shared/ui/dom.js';

const CHOICES = [
  [true, 'Mostrar'],
  [false, 'Esconder'],
];

/** The parents' switch for the colour names written inside the bubbles. */
export function renderColorWordsToggle({ getColorWords, setColorWords }) {
  const element = h('div', { class: 'color-words' });

  function draw({ shown } = getColorWords.execute()) {
    const content = h('div', {},
      h('p', { class: 'parents-label', id: 'color-words-label' }, 'Nome das cores nas bolhas'),
      h('div', { class: 'chips', role: 'group', 'aria-labelledby': 'color-words-label' },
        CHOICES.map(([value, label]) =>
          h('button', { class: 'chip', 'aria-pressed': String(shown === value), onclick: () => draw(setColorWords.execute({ shown: value })) }, label))),
      h('p', { class: 'parents-hint' },
        shown
          ? 'Cada bolha traz o nome da sua cor. O bebê ainda não lê: é a deixa para você dizer "estourou a azul!".'
          : 'As bolhas aparecem sem o nome da cor.'));
    element.replaceChildren(...content.childNodes);
  }

  draw();
  return element;
}
