/** @implements {import('../../domain/ports/clock.port.js').ClockPort} */
export class FixedClockAdapter {
  constructor(day) {
    this.day = day;
  }

  today() {
    return this.day;
  }

  set(day) {
    this.day = day;
  }
}
