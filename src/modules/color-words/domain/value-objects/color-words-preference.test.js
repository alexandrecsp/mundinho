import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ColorWordsPreference } from './color-words-preference.js';

test('keeps the choice', () => {
  assert.equal(new ColorWordsPreference(true).shown, true);
  assert.equal(new ColorWordsPreference(false).shown, false);
});

test('rejects anything but true or false', () => {
  assert.throws(() => new ColorWordsPreference('sim'), TypeError);
  assert.throws(() => new ColorWordsPreference(undefined), TypeError);
});
