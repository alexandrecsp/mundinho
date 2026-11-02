import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DailyScreenTime } from './daily-screen-time.js';

const TEN_MINUTES = 10 * 60_000;

test('a day starts with nothing used', () => {
  const today = DailyScreenTime.start('2026-11-02', TEN_MINUTES);
  assert.equal(today.usedMs, 0);
  assert.equal(today.remainingMs, TEN_MINUTES);
  assert.equal(today.isExhausted, false);
});

test('recording adds up', () => {
  const today = DailyScreenTime.start('2026-11-02', TEN_MINUTES).record(60_000).record(30_000);
  assert.equal(today.usedMs, 90_000);
});

test('is exhausted once the limit is reached', () => {
  const today = DailyScreenTime.start('2026-11-02', TEN_MINUTES).record(TEN_MINUTES);
  assert.equal(today.isExhausted, true);
  assert.equal(today.remainingMs, 0);
});

test('recording nothing or a negative time changes nothing', () => {
  const today = DailyScreenTime.start('2026-11-02', TEN_MINUTES);
  assert.equal(today.record(0), today);
  assert.equal(today.record(-500), today);
});

test('a new day starts over and keeps the limit', () => {
  const tomorrow = DailyScreenTime.start('2026-11-02', TEN_MINUTES).record(TEN_MINUTES).forDay('2026-11-03');
  assert.equal(tomorrow.usedMs, 0);
  assert.equal(tomorrow.limitMs, TEN_MINUTES);
});

test('the same day stays the same', () => {
  const today = DailyScreenTime.start('2026-11-02', TEN_MINUTES).record(5_000);
  assert.equal(today.forDay('2026-11-02'), today);
});

test('without a limit it never runs out', () => {
  const today = DailyScreenTime.start('2026-11-02', null).record(10 * TEN_MINUTES);
  assert.equal(today.isExhausted, false);
  assert.equal(today.remainingMs, null);
});

test('raising the limit gives time back', () => {
  const today = DailyScreenTime.start('2026-11-02', TEN_MINUTES).record(TEN_MINUTES).withLimit(2 * TEN_MINUTES);
  assert.equal(today.isExhausted, false);
});

test('reset keeps the day and the limit', () => {
  const today = DailyScreenTime.start('2026-11-02', TEN_MINUTES).record(TEN_MINUTES).reset();
  assert.deepEqual({ ...today }, { day: '2026-11-02', usedMs: 0, limitMs: TEN_MINUTES });
});

test('rejects a malformed day or limit', () => {
  assert.throws(() => DailyScreenTime.start('02/11/2026', TEN_MINUTES), RangeError);
  assert.throws(() => DailyScreenTime.start('2026-11-02', 0), RangeError);
});
