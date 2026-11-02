export class RecordScreenTimeUseCase {
  /** @param {import('../services/today-screen-time.service.js').TodayScreenTimeService} today */
  constructor(today) {
    this.today = today;
  }

  execute({ elapsedMs }) {
    return this.today.save(this.today.load().record(elapsedMs));
  }
}
