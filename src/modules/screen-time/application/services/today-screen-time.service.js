import { DailyScreenTime } from '../../domain/entities/daily-screen-time.js';
import { toScreenTimeResult } from '../dtos/screen-time.result.js';

/** Loads today's record, rolling over at midnight, and saves changes to it. */
export class TodayScreenTimeService {
  /**
   * @param {import('../../domain/ports/screen-time-repository.port.js').ScreenTimeRepositoryPort} repository
   * @param {import('../../domain/ports/clock.port.js').ClockPort} clock
   * @param {number | null} defaultLimitMs  the limit before the parents choose one
   */
  constructor(repository, clock, defaultLimitMs) {
    this.repository = repository;
    this.clock = clock;
    this.defaultLimitMs = defaultLimitMs;
  }

  load() {
    const today = this.clock.today();
    const saved = this.repository.load();
    return saved ? saved.forDay(today) : DailyScreenTime.start(today, this.defaultLimitMs);
  }

  save(record) {
    this.repository.save(record);
    return toScreenTimeResult(record);
  }
}
