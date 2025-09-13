export class EarlyCheckInValidationError extends Error {
  constructor() {
    super('Check-in can only be validated after 20 minutes')
    this.name = 'EarlyCheckInValidationError'
  }
}
