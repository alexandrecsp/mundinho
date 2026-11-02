export class ActivityNotFoundError extends Error {
  constructor(id) {
    super(`Nenhuma atividade com o id "${id}"`);
    this.name = 'ActivityNotFoundError';
    this.activityId = id;
  }
}
