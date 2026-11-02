/** @implements {import('../../domain/ports/clock.port.js').ClockPort} */
export class SystemClockAdapter {
  today() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }
}
