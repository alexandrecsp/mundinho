const DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * How much screen the baby has had on one day, against the limit the
 * parents chose. A null limit means no limit. Immutable: every change
 * returns a new value.
 */
export class DailyScreenTime {
  constructor({ day, usedMs = 0, limitMs = null }) {
    if (!DAY.test(day ?? '')) throw new RangeError(`Dia inválido: ${day}`);
    if (!(usedMs >= 0)) throw new RangeError(`Tempo usado inválido: ${usedMs}`);
    if (limitMs !== null && !(limitMs > 0)) throw new RangeError(`Limite inválido: ${limitMs}`);
    Object.assign(this, { day, usedMs, limitMs });
    Object.freeze(this);
  }

  static start(day, limitMs) {
    return new DailyScreenTime({ day, usedMs: 0, limitMs });
  }

  /** The same record if it is still that day; a fresh day with the same limit otherwise. */
  forDay(day) {
    return day === this.day ? this : DailyScreenTime.start(day, this.limitMs);
  }

  record(elapsedMs) {
    if (!(elapsedMs > 0)) return this;
    return new DailyScreenTime({ ...this, usedMs: this.usedMs + elapsedMs });
  }

  withLimit(limitMs) {
    return new DailyScreenTime({ ...this, limitMs });
  }

  reset() {
    return new DailyScreenTime({ ...this, usedMs: 0 });
  }

  /** Null when there is no limit. */
  get remainingMs() {
    return this.limitMs === null ? null : Math.max(0, this.limitMs - this.usedMs);
  }

  get isExhausted() {
    return this.limitMs !== null && this.usedMs >= this.limitMs;
  }
}
