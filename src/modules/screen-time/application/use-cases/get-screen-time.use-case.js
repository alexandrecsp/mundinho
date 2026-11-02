import { toScreenTimeResult } from '../dtos/screen-time.result.js';

export class GetScreenTimeUseCase {
  /** @param {import('../services/today-screen-time.service.js').TodayScreenTimeService} today */
  constructor(today) {
    this.today = today;
  }

  execute() {
    return toScreenTimeResult(this.today.load());
  }
}
