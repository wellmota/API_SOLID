import { CheckIn } from '@prisma/client'
import { CheckInsRepository } from '@/repositories/check-ins-repository'
import { UsersRepository } from '@/repositories/users-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { EarlyCheckInValidationError } from './errors/early-check-in-validation-error'
import { UnauthorizedError } from './errors/unauthorized-error'
import { CheckInAlreadyValidatedError } from './errors/check-in-already-validated-error'

interface ValidateCheckInUseCaseRequest {
  checkInId: string
  adminUserId: string
}

interface ValidateCheckInUseCaseResponse {
  checkIn: CheckIn
}

export class ValidateCheckInUseCase {
  constructor(
    private checkInsRepository: CheckInsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    checkInId,
    adminUserId,
  }: ValidateCheckInUseCaseRequest): Promise<ValidateCheckInUseCaseResponse> {
    // Validate input parameters
    if (!checkInId || checkInId.trim() === '') {
      throw new Error('Check-in ID is required')
    }

    if (!adminUserId || adminUserId.trim() === '') {
      throw new Error('Admin user ID is required')
    }

    // Find the check-in
    const checkIn = await this.checkInsRepository.findById(checkInId)

    if (!checkIn) {
      throw new ResourceNotFoundError()
    }

    // Check if check-in is already validated
    if (checkIn.validatedAt) {
      throw new CheckInAlreadyValidatedError()
    }

    // Verify admin user exists and has admin role
    const adminUser = await this.usersRepository.findById(adminUserId)

    if (!adminUser) {
      throw new ResourceNotFoundError()
    }

    // Check if user is admin (assuming we have a role field in the user model)
    if (!this.isAdmin(adminUser)) {
      throw new UnauthorizedError()
    }

    // Check if 20 minutes have passed since check-in creation
    const now = new Date()
    const checkInCreatedAt = new Date(checkIn.createdAt)
    const timeDifferenceInMinutes = (now.getTime() - checkInCreatedAt.getTime()) / (1000 * 60)

    if (timeDifferenceInMinutes < 20) {
      throw new EarlyCheckInValidationError()
    }

    // Validate the check-in
    const validatedCheckIn = await this.checkInsRepository.validate(checkInId)

    return {
      checkIn: validatedCheckIn,
    }
  }

  private isAdmin(user: any): boolean {
    // This would need to be implemented based on your user model
    // For now, we'll assume there's a role field or isAdmin field
    return user.role === 'ADMIN' || user.isAdmin === true
  }
}
