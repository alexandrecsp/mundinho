/** @implements {import('../../domain/ports/clock.port.js').ClockPort} */
export class SystemClockAdapter {
  hour() {
    return new Date().getHours();
  }
}
