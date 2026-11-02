export class SetScreenTimeLimitUseCase {
  /** @param {import('../services/today-screen-time.service.js').TodayScreenTimeService} today */
  constructor(today) {
    this.today = today;
  }

  /** @param {{ limitMs: number | null }} command  null removes the limit */
  execute({ limitMs }) {
    return this.today.save(this.today.load().withLimit(limitMs));
  }
}
