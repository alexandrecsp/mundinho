import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FixedClockAdapter } from '../../infrastructure/driven/fixed-clock.adapter.js';
import { InMemoryThemePreferenceRepositoryAdapter } from '../../infrastructure/driven/in-memory-theme-preference-repository.adapter.js';
import { GetThemeUseCase } from './get-theme.use-case.js';
import { SetThemePreferenceUseCase } from './set-theme-preference.use-case.js';

function setup(hour) {
  const repository = new InMemoryThemePreferenceRepositoryAdapter();
  const clock = new FixedClockAdapter(hour);
  return { clock, get: new GetThemeUseCase(repository, clock), set: new SetThemePreferenceUseCase(repository, clock) };
}

test('starts on auto', () => {
  const { get } = setup(10);
  assert.deepEqual(get.execute(), { preference: 'auto', theme: 'light', dayStartsAt: 7, nightStartsAt: 18 });
});

test('auto follows the clock', () => {
  const { clock, get } = setup(10);
  clock.set(20);
  assert.equal(get.execute().theme, 'dark');
});

test('a chosen theme is kept', () => {
  const { get, set } = setup(10);
  set.execute({ preference: 'dark' });
  assert.deepEqual([get.execute().preference, get.execute().theme], ['dark', 'dark']);
});

test('rejects an unknown choice and keeps the old one', () => {
  const { get, set } = setup(10);
  set.execute({ preference: 'dark' });
  assert.throws(() => set.execute({ preference: 'sepia' }), RangeError);
  assert.equal(get.execute().preference, 'dark');
});
