/** @implements {import('../../domain/ports/clock.port.js').ClockPort} */
export class FixedClockAdapter {
  constructor(hour) {
    this.current = hour;
  }

  hour() {
    return this.current;
  }

  set(hour) {
    this.current = hour;
  }
}
