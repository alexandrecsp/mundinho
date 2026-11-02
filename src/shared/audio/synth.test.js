import assert from 'node:assert/strict';
import { test } from 'node:test';
import { toFrequency } from './synth.js';

test('A4 is 440 Hz', () => {
  assert.equal(toFrequency('A4'), 440);
});

test('an octave up doubles the frequency', () => {
  assert.equal(toFrequency('A5'), 880);
});

test('sharps and flats meet on the same pitch', () => {
  assert.equal(toFrequency('C#4'), toFrequency('Db4'));
});

test('middle C is about 261.63 Hz', () => {
  assert.ok(Math.abs(toFrequency('C4') - 261.63) < 0.01);
});

test('numbers pass through as Hz', () => {
  assert.equal(toFrequency(150), 150);
});

test('rejects a name that is not a note', () => {
  assert.throws(() => toFrequency('H2'), /Nota inválida/);
});
