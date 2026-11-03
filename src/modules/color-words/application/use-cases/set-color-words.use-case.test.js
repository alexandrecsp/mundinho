import assert from 'node:assert/strict';
import { test } from 'node:test';
import { InMemoryColorWordsPreferenceRepositoryAdapter } from '../../infrastructure/driven/in-memory-color-words-preference-repository.adapter.js';
import { GetColorWordsUseCase } from './get-color-words.use-case.js';
import { SetColorWordsUseCase } from './set-color-words.use-case.js';

function setup() {
  const repository = new InMemoryColorWordsPreferenceRepositoryAdapter();
  return { get: new GetColorWordsUseCase(repository), set: new SetColorWordsUseCase(repository) };
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
