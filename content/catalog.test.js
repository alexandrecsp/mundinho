// Guards every addition to the catalog: run `npm test` after adding a game or video.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import { Activity } from '../src/modules/catalog/domain/entities/activity.js';
import { catalog } from './catalog.js';

test('every entry is a valid activity', () => {
  for (const entry of catalog) assert.doesNotThrow(() => new Activity(entry), `entrada "${entry.id}"`);
});

test('no two entries share an id', () => {
  const ids = catalog.map((entry) => entry.id);
  assert.deepEqual(ids, [...new Set(ids)]);
});

for (const entry of catalog.filter((e) => typeof e.load === 'function')) {
  test(`${entry.id} exports default { mount(stage) }`, async () => {
    const { default: plugin } = await entry.load();
    assert.equal(typeof plugin?.mount, 'function');
  });
}

for (const entry of catalog.filter((e) => e.kind === 'file')) {
  test(`${entry.id} points at a file that exists`, () => {
    assert.ok(existsSync(new URL(`../${entry.src}`, import.meta.url)), entry.src);
  });
}
