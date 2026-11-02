import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FixedClockAdapter } from '../../infrastructure/driven/fixed-clock.adapter.js';
import { InMemoryScreenTimeRepositoryAdapter } from '../../infrastructure/driven/in-memory-screen-time-repository.adapter.js';
import { TodayScreenTimeService } from '../services/today-screen-time.service.js';
import { GetScreenTimeUseCase } from './get-screen-time.use-case.js';
import { RecordScreenTimeUseCase } from './record-screen-time.use-case.js';
import { ResetScreenTimeUseCase } from './reset-screen-time.use-case.js';
import { SetScreenTimeLimitUseCase } from './set-screen-time-limit.use-case.js';

const MINUTE = 60_000;

function setup({ defaultLimitMs = 10 * MINUTE } = {}) {
  const clock = new FixedClockAdapter('2026-11-02');
  const today = new TodayScreenTimeService(new InMemoryScreenTimeRepositoryAdapter(), clock, defaultLimitMs);
  return {
    clock,
    get: new GetScreenTimeUseCase(today),
    record: new RecordScreenTimeUseCase(today),
    setLimit: new SetScreenTimeLimitUseCase(today),
    reset: new ResetScreenTimeUseCase(today),
  };
}

test('starts the day with the default limit', () => {
  const { get } = setup();
  assert.deepEqual(get.execute(), { usedMs: 0, limitMs: 10 * MINUTE, remainingMs: 10 * MINUTE, exhausted: false });
});

test('recorded time is kept between calls', () => {
  const { get, record } = setup();
  record.execute({ elapsedMs: MINUTE });
  record.execute({ elapsedMs: MINUTE });
  assert.equal(get.execute().usedMs, 2 * MINUTE);
});

test('says when the limit runs out', () => {
  const { record } = setup();
  assert.equal(record.execute({ elapsedMs: 9 * MINUTE }).exhausted, false);
  assert.equal(record.execute({ elapsedMs: MINUTE }).exhausted, true);
});

test('the next morning starts over with the chosen limit', () => {
  const { clock, get, record, setLimit } = setup();
  setLimit.execute({ limitMs: 15 * MINUTE });
  record.execute({ elapsedMs: 15 * MINUTE });
  clock.set('2026-11-03');
  assert.deepEqual(get.execute(), { usedMs: 0, limitMs: 15 * MINUTE, remainingMs: 15 * MINUTE, exhausted: false });
});

test('removing the limit lets play go on', () => {
  const { record, setLimit } = setup();
  setLimit.execute({ limitMs: null });
  assert.equal(record.execute({ elapsedMs: 60 * MINUTE }).exhausted, false);
});

test('reset gives the whole day back', () => {
  const { record, reset } = setup();
  record.execute({ elapsedMs: 10 * MINUTE });
  assert.equal(reset.execute().remainingMs, 10 * MINUTE);
});
