export class MaxDistanceError extends Error {
  constructor() {
    super('User is too far from the gym to check in')
    this.name = 'MaxDistanceError'
  }
}
