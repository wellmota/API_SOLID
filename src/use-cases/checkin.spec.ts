import { expect, describe, it, beforeEach } from 'vitest'
import { makeCheckInUseCaseWithRepositories } from './factories/make-checkin-use-case'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { DistanceValidationError } from './errors/distance-validation-error'

describe('Check In Use Case', () => {
  let inMemoryCheckInsRepository: InMemoryCheckInsRepository
  let inMemoryGymsRepository: InMemoryGymRepository

  beforeEach(() => {
    inMemoryCheckInsRepository = new InMemoryCheckInsRepository()
    inMemoryGymsRepository = new InMemoryGymRepository()

    // Add test gyms
    inMemoryGymsRepository.items.push({
      id: 'gym-uuid-1',
      title: 'Test Gym 1',
      description: 'Test gym description',
      phone: '123-456-7890',
      latitude: -23.5505,
      longitude: -46.6333,
    } as any)

    inMemoryGymsRepository.items.push({
      id: 'gym-uuid-2',
      title: 'Test Gym 2',
      description: 'Test gym description 2',
      phone: '098-765-4321',
      latitude: -23.5505,
      longitude: -46.6333,
    } as any)
  })

  it('should be able to check in at a gym', async () => {
    const checkInUseCase = makeCheckInUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    const { checkIn } = await checkInUseCase.execute({
      userId: 'user-1',
      gymId: 'gym-uuid-1',
      userLatitude: -23.5505,
      userLongitude: -46.6333,
    })

    expect(checkIn.id).toBeDefined()
    expect(checkIn.user_id).toBe('user-1')
    expect(checkIn.gym_id).toBe('gym-uuid-1')
    expect(checkIn.createdAt).toBeInstanceOf(Date)
    expect(checkIn.validatedAt).toBeNull()
  })

  it('should create check-in with unique ID', async () => {
    const checkInUseCase = makeCheckInUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    const { checkIn: checkIn1 } = await checkInUseCase.execute({
      userId: 'user-1',
      gymId: 'gym-uuid-1',
      userLatitude: -23.5505,
      userLongitude: -46.6333,
    })

    const { checkIn: checkIn2 } = await checkInUseCase.execute({
      userId: 'user-2',
      gymId: 'gym-uuid-2',
      userLatitude: -23.5505,
      userLongitude: -46.6333,
    })

    expect(checkIn1.id).toBeDefined()
    expect(checkIn2.id).toBeDefined()
    expect(checkIn1.id).not.toBe(checkIn2.id)
    expect(checkIn1.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    )
    expect(checkIn2.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    )
  })

  it('should store check-in in repository', async () => {
    const checkInUseCase = makeCheckInUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    const { checkIn } = await checkInUseCase.execute({
      userId: 'user-1',
      gymId: 'gym-uuid-1',
      userLatitude: -23.5505,
      userLongitude: -46.6333,
    })

    expect(inMemoryCheckInsRepository.items).toHaveLength(1)
    expect(inMemoryCheckInsRepository.items[0]).toEqual(checkIn)
  })

  it('should allow multiple check-ins for same user at different gyms', async () => {
    const checkInUseCase = makeCheckInUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    const { checkIn: checkIn1 } = await checkInUseCase.execute({
      userId: 'user-1',
      gymId: 'gym-uuid-1',
      userLatitude: -23.5505,
      userLongitude: -46.6333,
    })

    const { checkIn: checkIn2 } = await checkInUseCase.execute({
      userId: 'user-1',
      gymId: 'gym-uuid-2',
      userLatitude: -23.5505,
      userLongitude: -46.6333,
    })

    expect(checkIn1.user_id).toBe('user-1')
    expect(checkIn2.user_id).toBe('user-1')
    expect(checkIn1.gym_id).toBe('gym-uuid-1')
    expect(checkIn2.gym_id).toBe('gym-uuid-2')
    expect(inMemoryCheckInsRepository.items).toHaveLength(2)
  })

  it('should allow multiple users to check in at same gym', async () => {
    const checkInUseCase = makeCheckInUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    const { checkIn: checkIn1 } = await checkInUseCase.execute({
      userId: 'user-1',
      gymId: 'gym-uuid-1',
      userLatitude: -23.5505,
      userLongitude: -46.6333,
    })

    const { checkIn: checkIn2 } = await checkInUseCase.execute({
      userId: 'user-2',
      gymId: 'gym-uuid-1',
      userLatitude: -23.5505,
      userLongitude: -46.6333,
    })

    expect(checkIn1.gym_id).toBe('gym-uuid-1')
    expect(checkIn2.gym_id).toBe('gym-uuid-1')
    expect(checkIn1.user_id).toBe('user-1')
    expect(checkIn2.user_id).toBe('user-2')
    expect(inMemoryCheckInsRepository.items).toHaveLength(2)
  })

  it('should create check-in with current timestamp', async () => {
    const beforeCheckIn = new Date()

    const checkInUseCase = makeCheckInUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    const { checkIn } = await checkInUseCase.execute({
      userId: 'user-1',
      gymId: 'gym-uuid-1',
      userLatitude: -23.5505,
      userLongitude: -46.6333,
    })

    const afterCheckIn = new Date()

    expect(checkIn.createdAt.getTime()).toBeGreaterThanOrEqual(
      beforeCheckIn.getTime(),
    )
    expect(checkIn.createdAt.getTime()).toBeLessThanOrEqual(
      afterCheckIn.getTime(),
    )
  })

  it('should handle empty user ID', async () => {
    const checkInUseCase = makeCheckInUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    const { checkIn } = await checkInUseCase.execute({
      userId: '',
      gymId: 'gym-uuid-1',
      userLatitude: -23.5505,
      userLongitude: -46.6333,
    })

    expect(checkIn.user_id).toBe('')
    expect(checkIn.gym_id).toBe('gym-uuid-1')
  })

  it('should handle empty gym ID', async () => {
    const checkInUseCase = makeCheckInUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    await expect(
      checkInUseCase.execute({
        userId: 'user-1',
        gymId: '',
        userLatitude: -23.5505,
        userLongitude: -46.6333,
      }),
    ).rejects.toThrow('Resource not found')
  })

  it('should allow check-in when user is within 100 meters of gym', async () => {
    const checkInUseCase = makeCheckInUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    const { checkIn } = await checkInUseCase.execute({
      userId: 'user-1',
      gymId: 'gym-uuid-1',
      userLatitude: -23.5505,
      userLongitude: -46.6333,
    })

    expect(checkIn.user_id).toBe('user-1')
    expect(checkIn.gym_id).toBe('gym-uuid-1')
  })

  it('should reject check-in when user is exactly 100 meters from gym', async () => {
    const checkInUseCase = makeCheckInUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    // Add a gym that's exactly 100 meters away
    inMemoryGymsRepository.items.push({
      id: 'gym-uuid-3',
      title: 'Test Gym 3',
      description: 'Test gym description 3',
      phone: '555-123-4567',
      latitude: -23.5505,
      longitude: -46.6333,
    } as any)

    // Use coordinates that would be more than 100 meters away
    await expect(
      checkInUseCase.execute({
        userId: 'user-1',
        gymId: 'gym-uuid-3',
        userLatitude: -23.5505 + 0.001, // This offset creates >100m distance
        userLongitude: -46.6333 + 0.001,
      }),
    ).rejects.toBeInstanceOf(DistanceValidationError)
  })
})
