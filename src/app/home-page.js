import { renderCatalogGrid } from '../modules/catalog/index.js';
import { renderScreenTimePanel } from '../modules/screen-time/index.js';
import { h } from '../shared/ui/dom.js';

export function mountHome(root, { catalog, screenTime, onOpen }) {
  root.append(
    h('main', { class: 'home' },
      h('header', { class: 'hero' },
        h('span', { class: 'hero-mark', 'aria-hidden': 'true' }, '🌈'),
        h('h1', {}, 'Mundinho'),
        h('p', {}, 'Brincadeiras e musiquinhas para os primeiros meses')),
      renderCatalogGrid({ listActivities: catalog.listActivities, onOpen }),
      renderScreenTimePanel(screenTime)),
  );
  return () => {};
}
