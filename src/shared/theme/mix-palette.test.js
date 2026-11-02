import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mixPalette } from './mix-palette.js';

const light = { ground: '#ffffff', glow: 0.4, bands: ['#000', '#ff0000'], deep: { ink: '#000000' }, blend: 'source-over' };
const dark = { ground: '#000000', glow: 0.2, bands: ['#fff', '#0000ff'], deep: { ink: '#ffffff' }, blend: 'lighter' };

test('fully light returns the light palette itself', () => {
  assert.equal(mixPalette(light, dark, 0), light);
});

test('fully dark returns the dark values', () => {
  assert.deepEqual(mixPalette(light, dark, 1), dark);
});

test('halfway mixes colours and numbers', () => {
  const half = mixPalette(light, dark, 0.5);
  assert.equal(half.ground, 'rgba(128, 128, 128, 1.000)');
  assert.ok(Math.abs(half.glow - 0.3) < 1e-9);
});

test('mixes inside arrays and nested objects, short hex too', () => {
  const half = mixPalette(light, dark, 0.5);
  assert.equal(half.bands[0], 'rgba(128, 128, 128, 1.000)');
  assert.equal(half.bands[1], 'rgba(128, 0, 128, 1.000)');
  assert.equal(half.deep.ink, 'rgba(128, 128, 128, 1.000)');
});

test('mixes alpha from 8-digit hex', () => {
  assert.equal(mixPalette({ c: '#00000000' }, { c: '#000000ff' }, 0.5).c, 'rgba(0, 0, 0, 0.500)');
});

test('a value that is not a colour switches halfway', () => {
  assert.equal(mixPalette(light, dark, 0.4).blend, 'source-over');
  assert.equal(mixPalette(light, dark, 0.6).blend, 'lighter');
});

test('a key missing from dark keeps its light value', () => {
  assert.equal(mixPalette({ a: '#fff', b: 1 }, { a: '#000' }, 0.5).b, 1);
  assert.equal(mixPalette({ a: '#fff', deep: { b: 1 } }, { a: '#000', deep: {} }, 1).deep.b, 1);
});

test('the settled dark palette is the same object every frame', () => {
  assert.equal(mixPalette(light, dark, 1), mixPalette(light, dark, 1));
});
