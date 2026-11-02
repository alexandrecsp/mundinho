import { h } from '../../../../shared/ui/dom.js';

export function renderCatalogGrid({ listActivities, onOpen }) {
  const { games, videos } = listActivities.execute();
  return h('div', { class: 'catalog' },
    shelf('Jogos', 'Toque, estoure e descubra', games, onOpen),
    shelf('Vídeos', 'Musiquinhas e animações calminhas', videos, onOpen));
}

function shelf(title, subtitle, items, onOpen) {
  if (items.length === 0) return null;
  return h('section', { class: 'shelf' },
    h('header', { class: 'shelf-header' }, h('h2', {}, title), h('p', {}, subtitle)),
    h('div', { class: 'cards' }, items.map((item) => card(item, onOpen))));
}

function card(item, onOpen) {
  return h('button', { class: 'card', style: `--card-color: ${item.color}`, onclick: () => onOpen(item.id) },
    h('span', { class: 'card-emoji', 'aria-hidden': 'true' }, item.emoji),
    h('span', { class: 'card-title' }, item.title),
    item.description && h('span', { class: 'card-description' }, item.description),
    item.ages && h('span', { class: 'card-age' }, formatAges(item.ages)));
}

function formatAges([from, to]) {
  return to >= 24 ? `${from}+ meses` : `${from}–${to} meses`;
}
