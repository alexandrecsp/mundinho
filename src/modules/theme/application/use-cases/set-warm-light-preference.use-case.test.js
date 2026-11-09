import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FixedClockAdapter } from '../../infrastructure/driven/fixed-clock.adapter.js';
import { InMemoryThemePreferenceRepositoryAdapter } from '../../infrastructure/driven/in-memory-theme-preference-repository.adapter.js';
import { GetWarmLightUseCase } from './get-warm-light.use-case.js';
import { SetWarmLightPreferenceUseCase } from './set-warm-light-preference.use-case.js';

function setup(hour) {
  const repository = new InMemoryThemePreferenceRepositoryAdapter();
  const clock = new FixedClockAdapter(hour);
  return { clock, get: new GetWarmLightUseCase(repository, clock), set: new SetWarmLightPreferenceUseCase(repository, clock) };
}

test('starts on auto, off by day', () => {
  const { get } = setup(10);
  assert.deepEqual(get.execute(), { preference: 'auto', on: false, dayStartsAt: 7, nightStartsAt: 18 });
});

test('auto turns on at night', () => {
  const { clock, get } = setup(10);
  clock.set(19);
  assert.equal(get.execute().on, true);
});

test('a chosen setting is kept', () => {
  const { get, set } = setup(22);
  set.execute({ preference: 'off' });
  assert.deepEqual([get.execute().preference, get.execute().on], ['off', false]);
});

test('rejects an unknown choice and keeps the old one', () => {
  const { get, set } = setup(10);
  set.execute({ preference: 'on' });
  assert.throws(() => set.execute({ preference: 'blue' }), RangeError);
  assert.equal(get.execute().preference, 'on');
});
