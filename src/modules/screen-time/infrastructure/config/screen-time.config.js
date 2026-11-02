import { GetScreenTimeUseCase } from '../../application/use-cases/get-screen-time.use-case.js';
import { RecordScreenTimeUseCase } from '../../application/use-cases/record-screen-time.use-case.js';
import { ResetScreenTimeUseCase } from '../../application/use-cases/reset-screen-time.use-case.js';
import { SetScreenTimeLimitUseCase } from '../../application/use-cases/set-screen-time-limit.use-case.js';
import { TodayScreenTimeService } from '../../application/services/today-screen-time.service.js';
import { LocalStorageScreenTimeRepositoryAdapter } from '../driven/local-storage-screen-time-repository.adapter.js';
import { SystemClockAdapter } from '../driven/system-clock.adapter.js';

export function createScreenTimeModule({ storage, defaultLimitMs }) {
  const today = new TodayScreenTimeService(
    new LocalStorageScreenTimeRepositoryAdapter(storage),
    new SystemClockAdapter(),
    defaultLimitMs,
  );
  return {
    getScreenTime: new GetScreenTimeUseCase(today),
    recordScreenTime: new RecordScreenTimeUseCase(today),
    setScreenTimeLimit: new SetScreenTimeLimitUseCase(today),
    resetScreenTime: new ResetScreenTimeUseCase(today),
  };
}
