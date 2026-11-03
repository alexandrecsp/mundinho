import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AnimalShapesPreference } from './animal-shapes-preference.js';

test('keeps the choice', () => {
  assert.equal(new AnimalShapesPreference(true).shown, true);
  assert.equal(new AnimalShapesPreference(false).shown, false);
});

test('rejects anything but true or false', () => {
  assert.throws(() => new AnimalShapesPreference('sim'), TypeError);
  assert.throws(() => new AnimalShapesPreference(undefined), TypeError);
});
