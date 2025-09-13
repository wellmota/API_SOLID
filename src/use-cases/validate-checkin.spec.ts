import { expect, describe, it, beforeEach } from 'vitest'
import { makeValidateCheckInUseCaseWithRepositories } from './factories/make-validate-checkin-use-case'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { EarlyCheckInValidationError } from './errors/early-check-in-validation-error'
import { UnauthorizedError } from './errors/unauthorized-error'
import { CheckInAlreadyValidatedError } from './errors/check-in-already-validated-error'

describe('Validate Check-in Use Case', () => {
  let inMemoryCheckInsRepository: InMemoryCheckInsRepository
  let inMemoryUsersRepository: InMemoryUsersRepository

  beforeEach(() => {
    inMemoryCheckInsRepository = new InMemoryCheckInsRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository()

    // Add test users
    inMemoryUsersRepository.items.push({
      id: 'admin-user-1',
      name: 'Admin User',
      email: 'admin@example.com',
      password_hash: 'hashed-password',
      created_at: new Date(),
      role: 'ADMIN',
    } as any)

    inMemoryUsersRepository.items.push({
      id: 'regular-user-1',
      name: 'Regular User',
      email: 'user@example.com',
      password_hash: 'hashed-password',
      created_at: new Date(),
      role: 'USER',
    } as any)
  })

  it('should be able to validate a check-in after 20 minutes', async () => {
    const validateCheckInUseCase = makeValidateCheckInUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryUsersRepository,
    )

    // Create a check-in that's 25 minutes old
    const oldCheckIn = {
      id: 'checkin-1',
      user_id: 'user-1',
      gym_id: 'gym-1',
      createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
      validatedAt: null,
    } as any

    inMemoryCheckInsRepository.items.push(oldCheckIn)

    const result = await validateCheckInUseCase.execute({
      checkInId: 'checkin-1',
      adminUserId: 'admin-user-1',
    })

    expect(result.checkIn.id).toBe('checkin-1')
    expect(result.checkIn.validatedAt).toBeInstanceOf(Date)
    expect(result.checkIn.validatedAt).not.toBeNull()
  })

  it('should reject validation if less than 20 minutes have passed', async () => {
    const validateCheckInUseCase = makeValidateCheckInUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryUsersRepository,
    )

    // Create a check-in that's only 10 minutes old
    const recentCheckIn = {
      id: 'checkin-2',
      user_id: 'user-1',
      gym_id: 'gym-1',
      createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      validatedAt: null,
    } as any

    inMemoryCheckInsRepository.items.push(recentCheckIn)

    await expect(
      validateCheckInUseCase.execute({
        checkInId: 'checkin-2',
        adminUserId: 'admin-user-1',
      }),
    ).rejects.toBeInstanceOf(EarlyCheckInValidationError)
  })

  it('should reject validation if user is not admin', async () => {
    const validateCheckInUseCase = makeValidateCheckInUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryUsersRepository,
    )

    // Create a check-in that's 25 minutes old
    const oldCheckIn = {
      id: 'checkin-3',
      user_id: 'user-1',
      gym_id: 'gym-1',
      createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
      validatedAt: null,
    } as any

    inMemoryCheckInsRepository.items.push(oldCheckIn)

    await expect(
      validateCheckInUseCase.execute({
        checkInId: 'checkin-3',
        adminUserId: 'regular-user-1', // Regular user, not admin
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  it('should reject validation if check-in is already validated', async () => {
    const validateCheckInUseCase = makeValidateCheckInUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryUsersRepository,
    )

    // Create a check-in that's already validated
    const validatedCheckIn = {
      id: 'checkin-4',
      user_id: 'user-1',
      gym_id: 'gym-1',
      createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
      validatedAt: new Date(), // Already validated
    } as any

    inMemoryCheckInsRepository.items.push(validatedCheckIn)

    await expect(
      validateCheckInUseCase.execute({
        checkInId: 'checkin-4',
        adminUserId: 'admin-user-1',
      }),
    ).rejects.toBeInstanceOf(CheckInAlreadyValidatedError)
  })

  it('should throw error for non-existent check-in', async () => {
    const validateCheckInUseCase = makeValidateCheckInUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryUsersRepository,
    )

    await expect(
      validateCheckInUseCase.execute({
        checkInId: 'non-existent-checkin',
        adminUserId: 'admin-user-1',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should throw error for non-existent admin user', async () => {
    const validateCheckInUseCase = makeValidateCheckInUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryUsersRepository,
    )

    // Create a check-in that's 25 minutes old
    const oldCheckIn = {
      id: 'checkin-5',
      user_id: 'user-1',
      gym_id: 'gym-1',
      createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
      validatedAt: null,
    } as any

    inMemoryCheckInsRepository.items.push(oldCheckIn)

    await expect(
      validateCheckInUseCase.execute({
        checkInId: 'checkin-5',
        adminUserId: 'non-existent-admin',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should reject empty check-in ID', async () => {
    const validateCheckInUseCase = makeValidateCheckInUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryUsersRepository,
    )

    await expect(
      validateCheckInUseCase.execute({
        checkInId: '',
        adminUserId: 'admin-user-1',
      }),
    ).rejects.toThrow('Check-in ID is required')
  })

  it('should reject whitespace-only check-in ID', async () => {
    const validateCheckInUseCase = makeValidateCheckInUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryUsersRepository,
    )

    await expect(
      validateCheckInUseCase.execute({
        checkInId: '   ',
        adminUserId: 'admin-user-1',
      }),
    ).rejects.toThrow('Check-in ID is required')
  })

  it('should reject empty admin user ID', async () => {
    const validateCheckInUseCase = makeValidateCheckInUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryUsersRepository,
    )

    await expect(
      validateCheckInUseCase.execute({
        checkInId: 'checkin-1',
        adminUserId: '',
      }),
    ).rejects.toThrow('Admin user ID is required')
  })

  it('should reject whitespace-only admin user ID', async () => {
    const validateCheckInUseCase = makeValidateCheckInUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryUsersRepository,
    )

    await expect(
      validateCheckInUseCase.execute({
        checkInId: 'checkin-1',
        adminUserId: '   ',
      }),
    ).rejects.toThrow('Admin user ID is required')
  })

  it('should validate check-in exactly at 20 minutes', async () => {
    const validateCheckInUseCase = makeValidateCheckInUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryUsersRepository,
    )

    // Create a check-in that's exactly 20 minutes old
    const exactCheckIn = {
      id: 'checkin-6',
      user_id: 'user-1',
      gym_id: 'gym-1',
      createdAt: new Date(Date.now() - 20 * 60 * 1000), // Exactly 20 minutes ago
      validatedAt: null,
    } as any

    inMemoryCheckInsRepository.items.push(exactCheckIn)

    const result = await validateCheckInUseCase.execute({
      checkInId: 'checkin-6',
      adminUserId: 'admin-user-1',
    })

    expect(result.checkIn.id).toBe('checkin-6')
    expect(result.checkIn.validatedAt).toBeInstanceOf(Date)
    expect(result.checkIn.validatedAt).not.toBeNull()
  })

  it('should update the check-in in the repository', async () => {
    const validateCheckInUseCase = makeValidateCheckInUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryUsersRepository,
    )

    // Create a check-in that's 25 minutes old
    const oldCheckIn = {
      id: 'checkin-7',
      user_id: 'user-1',
      gym_id: 'gym-1',
      createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
      validatedAt: null,
    } as any

    inMemoryCheckInsRepository.items.push(oldCheckIn)

    await validateCheckInUseCase.execute({
      checkInId: 'checkin-7',
      adminUserId: 'admin-user-1',
    })

    // Check that the check-in was updated in the repository
    const updatedCheckIn = inMemoryCheckInsRepository.items.find(
      (item) => item.id === 'checkin-7',
    )

    expect(updatedCheckIn).toBeDefined()
    expect(updatedCheckIn?.validatedAt).toBeInstanceOf(Date)
    expect(updatedCheckIn?.validatedAt).not.toBeNull()
  })

  it('should handle edge case of 19 minutes and 59 seconds', async () => {
    const validateCheckInUseCase = makeValidateCheckInUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryUsersRepository,
    )

    // Create a check-in that's 19 minutes and 59 seconds old
    const almostCheckIn = {
      id: 'checkin-8',
      user_id: 'user-1',
      gym_id: 'gym-1',
      createdAt: new Date(Date.now() - (19 * 60 + 59) * 1000), // 19:59 minutes ago
      validatedAt: null,
    } as any

    inMemoryCheckInsRepository.items.push(almostCheckIn)

    await expect(
      validateCheckInUseCase.execute({
        checkInId: 'checkin-8',
        adminUserId: 'admin-user-1',
      }),
    ).rejects.toBeInstanceOf(EarlyCheckInValidationError)
  })

  it('should handle edge case of 20 minutes and 1 second', async () => {
    const validateCheckInUseCase = makeValidateCheckInUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryUsersRepository,
    )

    // Create a check-in that's 20 minutes and 1 second old
    const justOverCheckIn = {
      id: 'checkin-9',
      user_id: 'user-1',
      gym_id: 'gym-1',
      createdAt: new Date(Date.now() - (20 * 60 + 1) * 1000), // 20:01 minutes ago
      validatedAt: null,
    } as any

    inMemoryCheckInsRepository.items.push(justOverCheckIn)

    const result = await validateCheckInUseCase.execute({
      checkInId: 'checkin-9',
      adminUserId: 'admin-user-1',
    })

    expect(result.checkIn.id).toBe('checkin-9')
    expect(result.checkIn.validatedAt).toBeInstanceOf(Date)
    expect(result.checkIn.validatedAt).not.toBeNull()
  })
})
