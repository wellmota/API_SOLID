import { expect, describe, it, beforeEach } from 'vitest'
import { makeCheckInUseCaseWithRepository } from './factories/make-checkin-use-case'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'

describe('Check In Use Case', () => {
  let inMemoryCheckInsRepository: InMemoryCheckInsRepository

  beforeEach(() => {
    inMemoryCheckInsRepository = new InMemoryCheckInsRepository()
  })

  it('should be able to check in at a gym', async () => {
    const checkInUseCase = makeCheckInUseCaseWithRepository(
      inMemoryCheckInsRepository,
    )

    const { checkIn } = await checkInUseCase.execute({
      userId: 'user-1',
      gymId: 'gym-1',
    })

    await expect(checkIn.id).toBeDefined()
    await expect(checkIn.user_id).toBe('user-1')
    await expect(checkIn.gym_id).toBe('gym-1')
    await expect(checkIn.createdAt).toBeInstanceOf(Date)
    await expect(checkIn.validatedAt).toBeNull()
  })

  it('should create check-in with unique ID', async () => {
    const checkInUseCase = makeCheckInUseCaseWithRepository(
      inMemoryCheckInsRepository,
    )

    const { checkIn: checkIn1 } = await checkInUseCase.execute({
      userId: 'user-1',
      gymId: 'gym-1',
    })

    const { checkIn: checkIn2 } = await checkInUseCase.execute({
      userId: 'user-2',
      gymId: 'gym-2',
    })

    await expect(checkIn1.id).toBe('check-in-1')
    await expect(checkIn2.id).toBe('check-in-2')
    await expect(checkIn1.id).not.toBe(checkIn2.id)
  })

  it('should store check-in in repository', async () => {
    const checkInUseCase = makeCheckInUseCaseWithRepository(
      inMemoryCheckInsRepository,
    )

    const { checkIn } = await checkInUseCase.execute({
      userId: 'user-1',
      gymId: 'gym-1',
    })

    await expect(inMemoryCheckInsRepository.items).toHaveLength(1)
    await expect(inMemoryCheckInsRepository.items[0]).toEqual(checkIn)
  })

  it('should allow multiple check-ins for same user at different gyms', async () => {
    const checkInUseCase = makeCheckInUseCaseWithRepository(
      inMemoryCheckInsRepository,
    )

    const { checkIn: checkIn1 } = await checkInUseCase.execute({
      userId: 'user-1',
      gymId: 'gym-1',
    })

    const { checkIn: checkIn2 } = await checkInUseCase.execute({
      userId: 'user-1',
      gymId: 'gym-2',
    })

    await expect(checkIn1.user_id).toBe('user-1')
    await expect(checkIn2.user_id).toBe('user-1')
    await expect(checkIn1.gym_id).toBe('gym-1')
    await expect(checkIn2.gym_id).toBe('gym-2')
    expect(inMemoryCheckInsRepository.items).toHaveLength(2)
  })

  it('should allow multiple users to check in at same gym', async () => {
    const checkInUseCase = makeCheckInUseCaseWithRepository(
      inMemoryCheckInsRepository,
    )

    const { checkIn: checkIn1 } = await checkInUseCase.execute({
      userId: 'user-1',
      gymId: 'gym-1',
    })

    const { checkIn: checkIn2 } = await checkInUseCase.execute({
      userId: 'user-2',
      gymId: 'gym-1',
    })

    await expect(checkIn1.gym_id).toBe('gym-1')
    await expect(checkIn2.gym_id).toBe('gym-1')
    await expect(checkIn1.user_id).toBe('user-1')
    await expect(checkIn2.user_id).toBe('user-2')
    expect(inMemoryCheckInsRepository.items).toHaveLength(2)
  })

  it('should create check-in with current timestamp', async () => {
    const beforeCheckIn = new Date()

    const checkInUseCase = makeCheckInUseCaseWithRepository(
      inMemoryCheckInsRepository,
    )

    const { checkIn } = await checkInUseCase.execute({
      userId: 'user-1',
      gymId: 'gym-1',
    })

    const afterCheckIn = new Date()

    await expect(checkIn.createdAt.getTime()).toBeGreaterThanOrEqual(
      beforeCheckIn.getTime(),
    )
    await expect(checkIn.createdAt.getTime()).toBeLessThanOrEqual(
      afterCheckIn.getTime(),
    )
  })

  it('should handle empty user ID', async () => {
    const checkInUseCase = makeCheckInUseCaseWithRepository(
      inMemoryCheckInsRepository,
    )

    const { checkIn } = await checkInUseCase.execute({
      userId: '',
      gymId: 'gym-1',
    })

    await expect(checkIn.user_id).toBe('')
    await expect(checkIn.gym_id).toBe('gym-1')
  })

  it('should handle empty gym ID', async () => {
    const checkInUseCase = makeCheckInUseCaseWithRepository(
      inMemoryCheckInsRepository,
    )

    const { checkIn } = await checkInUseCase.execute({
      userId: 'user-1',
      gymId: '',
    })

    expect(checkIn.user_id).toBe('user-1')
    expect(checkIn.gym_id).toBe('')
  })
})
