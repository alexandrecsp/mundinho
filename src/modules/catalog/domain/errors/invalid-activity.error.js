export class InvalidActivityError extends Error {
  constructor(id, reason) {
    super(`Atividade "${id ?? '(sem id)'}" inválida: ${reason}`);
    this.name = 'InvalidActivityError';
    this.activityId = id;
  }
}
