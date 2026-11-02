export class ResetScreenTimeUseCase {
  /** @param {import('../services/today-screen-time.service.js').TodayScreenTimeService} today */
  constructor(today) {
    this.today = today;
  }

  execute() {
    return this.today.save(this.today.load().reset());
  }
}
