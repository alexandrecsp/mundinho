import assert from 'node:assert/strict';
import { test } from 'node:test';
import { StaticCatalogAdapter } from '../../infrastructure/driven/static-catalog.adapter.js';
import { ListActivitiesUseCase } from './list-activities.use-case.js';

const load = () => Promise.resolve({ default: { mount() {} } });
const entries = [
  { id: 'bolhas', type: 'game', title: 'Bolhas', emoji: '🫧', load },
  { id: 'ninar', type: 'video', title: 'Ninar', load },
  { id: 'piano', type: 'game', title: 'Piano', load },
  { id: 'passeio', type: 'video', kind: 'file', title: 'Passeio', src: 'passeio.mp4' },
];
const quiet = { warn() {} };
const list = (catalogEntries, logger = quiet) => new ListActivitiesUseCase(new StaticCatalogAdapter(catalogEntries, logger)).execute();

test('lists games and videos apart, in catalog order', () => {
  const { games, videos } = list(entries);
  assert.deepEqual(games.map((game) => game.id), ['bolhas', 'piano']);
  assert.deepEqual(videos.map((video) => video.id), ['ninar', 'passeio']);
});

test('a card result carries no loader', () => {
  assert.equal('load' in list(entries).games[0], false);
});

test('skips an invalid entry and keeps the rest', () => {
  const warnings = [];
  const { games } = list([...entries, { id: 'quebrado', type: 'game' }], { warn: (message) => warnings.push(message) });
  assert.equal(games.length, 2);
  assert.equal(warnings.length, 1);
});

test('keeps the first of two entries with the same id', () => {
  const { games } = list([...entries, { id: 'bolhas', type: 'game', title: 'Outra', load }]);
  assert.deepEqual(games.map((game) => game.title), ['Bolhas', 'Piano']);
});
