import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ThemePreference } from './theme-preference.js';

const auto = new ThemePreference('auto');

test('auto is light from 7h', () => {
  assert.equal(auto.themeAt(6), 'dark');
  assert.equal(auto.themeAt(7), 'light');
});

test('auto turns dark at 18h', () => {
  assert.equal(auto.themeAt(17), 'light');
  assert.equal(auto.themeAt(18), 'dark');
});

test('auto is dark around midnight', () => {
  assert.equal(auto.themeAt(0), 'dark');
  assert.equal(auto.themeAt(23), 'dark');
});

test('a fixed choice ignores the hour', () => {
  assert.equal(new ThemePreference('light').themeAt(22), 'light');
  assert.equal(new ThemePreference('dark').themeAt(12), 'dark');
});

test('rejects an unknown preference', () => {
  assert.throws(() => new ThemePreference('sepia'), RangeError);
});
