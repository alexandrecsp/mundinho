import { h } from '../../../../shared/ui/dom.js';

const CHOICES = [
  ['auto', 'Automático'],
  ['light', '☀️ Claro'],
  ['dark', '🌙 Escuro'],
];

/** The parents' theme choice, redrawn whenever the theme changes. */
export function renderThemePicker({ setThemePreference, controller }) {
  const element = h('div', { class: 'theme-picker' });

  function choose(preference) {
    setThemePreference.execute({ preference });
    controller.refresh();
  }

  function draw({ preference, theme, dayStartsAt, nightStartsAt }) {
    const content = h('div', {},
      h('p', { class: 'parents-label', id: 'theme-label' }, 'Tema'),
      h('div', { class: 'chips', role: 'group', 'aria-labelledby': 'theme-label' },
        CHOICES.map(([value, label]) =>
          h('button', { class: 'chip', 'aria-pressed': String(preference === value), onclick: () => choose(value) }, label))),
      h('p', { class: 'parents-hint' },
        preference === 'auto'
          ? `Claro das ${dayStartsAt}h às ${nightStartsAt}h e escuro no resto do dia. Agora está ${theme === 'dark' ? 'escuro' : 'claro'}.`
          : 'Vale para esta página e para todos os jogos e vídeos.'));
    element.replaceChildren(...content.childNodes);
  }

  draw(controller.current);
  const unsubscribe = controller.subscribe(draw);
  return { element, destroy: unsubscribe };
}
