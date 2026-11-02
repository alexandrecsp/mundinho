import { DailyScreenTime } from '../../../domain/entities/daily-screen-time.js';

/** The JSON kept in localStorage. */
export function toLocalStorageScreenTimeModel(record) {
  return { day: record.day, usedMs: Math.round(record.usedMs), limitMs: record.limitMs };
}

/** Throws on a model the entity rejects; the adapter treats that as nothing saved. */
export function fromLocalStorageScreenTimeModel(model) {
  return new DailyScreenTime({ day: model.day, usedMs: model.usedMs, limitMs: model.limitMs });
}
