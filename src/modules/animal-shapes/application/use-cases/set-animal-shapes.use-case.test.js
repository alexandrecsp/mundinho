import assert from 'node:assert/strict';
import { test } from 'node:test';
import { InMemoryAnimalShapesPreferenceRepositoryAdapter } from '../../infrastructure/driven/in-memory-animal-shapes-preference-repository.adapter.js';
import { GetAnimalShapesUseCase } from './get-animal-shapes.use-case.js';
import { SetAnimalShapesUseCase } from './set-animal-shapes.use-case.js';

function setup() {
  const repository = new InMemoryAnimalShapesPreferenceRepositoryAdapter();
  return { get: new GetAnimalShapesUseCase(repository), set: new SetAnimalShapesUseCase(repository) };
}

test('starts shown', () => {
  const { get } = setup();
  assert.deepEqual(get.execute(), { shown: true });
});

test('turning it off is kept', () => {
  const { get, set } = setup();
  assert.deepEqual(set.execute({ shown: false }), { shown: false });
  assert.deepEqual(get.execute(), { shown: false });
});

test('rejects an unknown choice and keeps the old one', () => {
  const { get, set } = setup();
  set.execute({ shown: false });
  assert.throws(() => set.execute({ shown: 'sim' }), TypeError);
  assert.deepEqual(get.execute(), { shown: false });
});
