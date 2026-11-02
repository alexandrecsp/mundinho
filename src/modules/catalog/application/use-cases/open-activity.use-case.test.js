import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ActivityNotFoundError } from '../../domain/errors/activity-not-found.error.js';
import { StaticCatalogAdapter } from '../../infrastructure/driven/static-catalog.adapter.js';
import { OpenActivityUseCase } from './open-activity.use-case.js';

const load = () => Promise.resolve({ default: { mount() {} } });
const open = new OpenActivityUseCase(new StaticCatalogAdapter([
  { id: 'bolhas', type: 'game', title: 'Bolhas', load },
  { id: 'passeio', type: 'video', kind: 'file', title: 'Passeio', src: 'passeio.mp4' },
]));

test('opens an activity with what the player needs', () => {
  assert.deepEqual(open.execute({ id: 'passeio' }), { id: 'passeio', title: 'Passeio', kind: 'file', src: 'passeio.mp4', load: null });
});

test('a module activity comes with its loader', () => {
  assert.equal(open.execute({ id: 'bolhas' }).load, load);
});

test('opening an unknown id fails', () => {
  assert.throws(() => open.execute({ id: 'nada' }), ActivityNotFoundError);
});
