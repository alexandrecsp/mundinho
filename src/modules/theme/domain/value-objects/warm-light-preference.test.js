import assert from 'node:assert/strict';
import { test } from 'node:test';
import { WarmLightPreference } from './warm-light-preference.js';

const auto = new WarmLightPreference('auto');

test('auto is off by day', () => {
  assert.equal(auto.isOnAt(7), false);
  assert.equal(auto.isOnAt(17), false);
});

test('auto is on at night', () => {
  assert.equal(auto.isOnAt(18), true);
  assert.equal(auto.isOnAt(0), true);
  assert.equal(auto.isOnAt(6), true);
});

test('a fixed choice ignores the hour', () => {
  assert.equal(new WarmLightPreference('on').isOnAt(12), true);
  assert.equal(new WarmLightPreference('off').isOnAt(22), false);
});

test('rejects an unknown preference', () => {
  assert.throws(() => new WarmLightPreference('blue'), RangeError);
});
