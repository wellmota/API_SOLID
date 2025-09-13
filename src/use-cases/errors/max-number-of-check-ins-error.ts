export class MaxNumberOfCheckInsError extends Error {
  constructor() {
    super('User can only check in once per day')
    this.name = 'MaxNumberOfCheckInsError'
  }
}
