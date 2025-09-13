export class CheckInAlreadyValidatedError extends Error {
  constructor() {
    super('Check-in has already been validated')
    this.name = 'CheckInAlreadyValidatedError'
  }
}
