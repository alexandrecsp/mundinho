/** @implements {import('../../domain/ports/screen-time-repository.port.js').ScreenTimeRepositoryPort} */
export class InMemoryScreenTimeRepositoryAdapter {
  constructor(record = null) {
    this.record = record;
  }

  load() {
    return this.record;
  }

  save(record) {
    this.record = record;
  }
}
