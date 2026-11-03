import { renderAnimalShapesToggle } from '../modules/animal-shapes/index.js';
import { renderCatalogGrid } from '../modules/catalog/index.js';
import { renderColorWordsToggle } from '../modules/color-words/index.js';
import { renderScreenTimePanel } from '../modules/screen-time/index.js';
import { renderThemePicker } from '../modules/theme/index.js';
import { h } from '../shared/ui/dom.js';

export function mountHome(root, { catalog, screenTime, theme, colorWords, animalShapes, onOpen }) {
  const themePicker = renderThemePicker(theme);
  root.append(
    h('main', { class: 'home' },
      h('header', { class: 'hero' },
        h('span', { class: 'hero-mark', 'aria-hidden': 'true' }, '🌈'),
        h('h1', {}, 'Mundinho'),
        h('p', {}, 'Brincadeiras e musiquinhas para os primeiros meses')),
      renderCatalogGrid({ listActivities: catalog.listActivities, onOpen }),
      h('section', { class: 'parents', 'aria-labelledby': 'parents-title' },
        h('h2', { id: 'parents-title' }, 'Área dos pais'),
        renderScreenTimePanel(screenTime),
        themePicker.element,
        renderColorWordsToggle(colorWords),
        renderAnimalShapesToggle(animalShapes),
        h('p', { class: 'parents-tip' },
          'A Sociedade Brasileira de Pediatria recomenda evitar telas antes dos 2 anos. ',
          'Se usar, prefira poucos minutos, com você junto, conversando e cantando com o bebê. ',
          'Para sair de um jogo ou vídeo, segure o botão ✕ do canto por 2 segundos.'))),
  );
  return () => themePicker.destroy();
}
