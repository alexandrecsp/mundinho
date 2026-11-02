import assert from 'node:assert/strict';
import { test } from 'node:test';
import { InvalidActivityError } from '../errors/invalid-activity.error.js';
import { Activity } from './activity.js';

const load = () => Promise.resolve({ default: { mount() {} } });
const game = { id: 'bolhas', type: 'game', title: 'Bolhas', load };

test('a game is interactive by default', () => {
  assert.equal(new Activity(game).kind, 'interactive');
});

test('a video with a module is an animation by default', () => {
  assert.equal(new Activity({ ...game, type: 'video' }).kind, 'animation');
});

test('a file video needs a src and no module', () => {
  const video = new Activity({ id: 'passeio', type: 'video', kind: 'file', title: 'Passeio', src: 'content/videos/media/passeio.mp4' });
  assert.equal(video.runsCode, false);
});

test('rejects an id with spaces or capitals', () => {
  assert.throws(() => new Activity({ ...game, id: 'Minhas Bolhas' }), InvalidActivityError);
});

test('rejects a game that is not interactive', () => {
  assert.throws(() => new Activity({ ...game, kind: 'file', src: 'x.mp4' }), /jogo é sempre interactive/);
});

test('rejects a module activity without load', () => {
  assert.throws(() => new Activity({ ...game, load: undefined }), /falta load/);
});

test('rejects a file video without src', () => {
  assert.throws(() => new Activity({ id: 'v', type: 'video', kind: 'file', title: 'V' }), /falta o src/);
});

test('rejects a color that is not hex', () => {
  assert.throws(() => new Activity({ ...game, color: 'azul' }), /hexadecimal/);
});

test('rejects an age range that runs backwards', () => {
  assert.throws(() => new Activity({ ...game, ages: [12, 3] }), /ages/);
});

test('is frozen', () => {
  const activity = new Activity(game);
  assert.throws(() => {
    activity.title = 'Outra';
  });
});
