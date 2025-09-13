import { expect, describe, it, beforeEach } from 'vitest'
import { makeCheckinHistoryUseCaseWithRepositories } from './factories/make-checkin-history-use-case'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { Gym, Prisma } from '../../generated/prisma'

describe('Checkin History Use Case', () => {
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
      latitude: new Prisma.Decimal(-23.5505),
      longitude: new Prisma.Decimal(-46.6333),
    } as Gym)

    inMemoryGymsRepository.items.push({
      id: 'gym-uuid-2',
      title: 'Test Gym 2',
      description: 'Test gym description 2',
      phone: '098-765-4321',
      latitude: new Prisma.Decimal(-23.5505),
      longitude: new Prisma.Decimal(-46.6333),
    } as Gym)
  })

  it('should be able to fetch checkin history', async () => {
    const checkinHistoryUseCase = makeCheckinHistoryUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    const result = await checkinHistoryUseCase.execute({
      userId: 'user-1',
    })

    expect(result).toHaveProperty('checkIns')
    expect(result).toHaveProperty('totalCount')
    expect(result).toHaveProperty('currentPage')
    expect(result).toHaveProperty('totalPages')
    expect(result).toHaveProperty('perPage')
    expect(result).toHaveProperty('hasNextPage')
    expect(result).toHaveProperty('hasPreviousPage')
    expect(result).toHaveProperty('summary')
  })

  it('should return empty history for user with no check-ins', async () => {
    const checkinHistoryUseCase = makeCheckinHistoryUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    const result = await checkinHistoryUseCase.execute({
      userId: 'user-with-no-checkins',
    })

    expect(result.checkIns).toEqual([])
    expect(result.totalCount).toBe(0)
    expect(result.currentPage).toBe(1)
    expect(result.totalPages).toBe(0)
    expect(result.hasNextPage).toBe(false)
    expect(result.hasPreviousPage).toBe(false)
    expect(result.summary.totalCheckIns).toBe(0)
  })

  it('should handle pagination correctly', async () => {
    const checkinHistoryUseCase = makeCheckinHistoryUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    const result = await checkinHistoryUseCase.execute({
      userId: 'user-1',
      page: 1,
      perPage: 10,
    })

    expect(result.currentPage).toBe(1)
    expect(result.perPage).toBe(10)
    expect(result.totalPages).toBeGreaterThanOrEqual(0)
    expect(result.hasNextPage).toBe(false) // No check-ins, so no next page
    expect(result.hasPreviousPage).toBe(false)
  })

  it('should reject empty user ID', async () => {
    const checkinHistoryUseCase = makeCheckinHistoryUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    await expect(
      checkinHistoryUseCase.execute({
        userId: '',
      }),
    ).rejects.toThrow('User ID is required')
  })

  it('should reject whitespace-only user ID', async () => {
    const checkinHistoryUseCase = makeCheckinHistoryUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    await expect(
      checkinHistoryUseCase.execute({
        userId: '   ',
      }),
    ).rejects.toThrow('User ID is required')
  })

  it('should reject page less than 1', async () => {
    const checkinHistoryUseCase = makeCheckinHistoryUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    await expect(
      checkinHistoryUseCase.execute({
        userId: 'user-1',
        page: 0,
      }),
    ).rejects.toThrow('Page must be greater than 0')
  })

  it('should reject perPage less than 1', async () => {
    const checkinHistoryUseCase = makeCheckinHistoryUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    await expect(
      checkinHistoryUseCase.execute({
        userId: 'user-1',
        perPage: 0,
      }),
    ).rejects.toThrow('Per page must be between 1 and 100')
  })

  it('should reject perPage greater than 100', async () => {
    const checkinHistoryUseCase = makeCheckinHistoryUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    await expect(
      checkinHistoryUseCase.execute({
        userId: 'user-1',
        perPage: 101,
      }),
    ).rejects.toThrow('Per page must be between 1 and 100')
  })

  it('should accept perPage within valid range', async () => {
    const checkinHistoryUseCase = makeCheckinHistoryUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    const validPerPageValues = [1, 10, 20, 50, 100]

    for (const perPage of validPerPageValues) {
      const result = await checkinHistoryUseCase.execute({
        userId: 'user-1',
        perPage,
      })

      expect(result.perPage).toBe(perPage)
    }
  })

  it('should reject start date after end date', async () => {
    const checkinHistoryUseCase = makeCheckinHistoryUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    const startDate = new Date('2024-12-31')
    const endDate = new Date('2024-01-01')

    await expect(
      checkinHistoryUseCase.execute({
        userId: 'user-1',
        startDate,
        endDate,
      }),
    ).rejects.toThrow('Start date must be before end date')
  })

  it('should handle date range filtering', async () => {
    const checkinHistoryUseCase = makeCheckinHistoryUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    const startDate = new Date('2024-01-01')
    const endDate = new Date('2024-12-31')

    const result = await checkinHistoryUseCase.execute({
      userId: 'user-1',
      startDate,
      endDate,
    })

    expect(result).toBeDefined()
    expect(result.checkIns).toEqual([]) // No check-ins in the repository
  })

  it('should handle gym filtering', async () => {
    const checkinHistoryUseCase = makeCheckinHistoryUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    const result = await checkinHistoryUseCase.execute({
      userId: 'user-1',
      gymId: 'gym-uuid-1',
    })

    expect(result).toBeDefined()
    expect(result.checkIns).toEqual([]) // No check-ins in the repository
  })

  it('should include gym details when requested', async () => {
    const checkinHistoryUseCase = makeCheckinHistoryUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    const result = await checkinHistoryUseCase.execute({
      userId: 'user-1',
      includeGymDetails: true,
    })

    expect(result).toBeDefined()
    expect(result.checkIns).toEqual([]) // No check-ins in the repository
  })

  it('should return correct summary structure', async () => {
    const checkinHistoryUseCase = makeCheckinHistoryUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    const result = await checkinHistoryUseCase.execute({
      userId: 'user-1',
    })

    expect(result.summary).toHaveProperty('totalCheckIns')
    expect(result.summary).toHaveProperty('checkInsThisMonth')
    expect(result.summary).toHaveProperty('checkInsThisWeek')
    expect(result.summary).toHaveProperty('checkInsToday')
    expect(result.summary).toHaveProperty('mostFrequentGym')

    expect(typeof result.summary.totalCheckIns).toBe('number')
    expect(typeof result.summary.checkInsThisMonth).toBe('number')
    expect(typeof result.summary.checkInsThisWeek).toBe('number')
    expect(typeof result.summary.checkInsToday).toBe('number')
  })

  it('should handle multiple filters simultaneously', async () => {
    const checkinHistoryUseCase = makeCheckinHistoryUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    const startDate = new Date('2024-01-01')
    const endDate = new Date('2024-12-31')

    const result = await checkinHistoryUseCase.execute({
      userId: 'user-1',
      page: 1,
      perPage: 20,
      startDate,
      endDate,
      gymId: 'gym-uuid-1',
      includeGymDetails: true,
    })

    expect(result).toBeDefined()
    expect(result.currentPage).toBe(1)
    expect(result.perPage).toBe(20)
    expect(result.checkIns).toEqual([]) // No check-ins in the repository
  })

  it('should use default pagination values', async () => {
    const checkinHistoryUseCase = makeCheckinHistoryUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    const result = await checkinHistoryUseCase.execute({
      userId: 'user-1',
    })

    expect(result.currentPage).toBe(1) // Default page
    expect(result.perPage).toBe(20) // Default perPage
  })

  it('should use default date range when not provided', async () => {
    const checkinHistoryUseCase = makeCheckinHistoryUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    const result = await checkinHistoryUseCase.execute({
      userId: 'user-1',
    })

    expect(result).toBeDefined()
    // The default date range should be the last 30 days
    // Since we have no check-ins, the result should be empty
    expect(result.checkIns).toEqual([])
  })

  it('should handle edge case pagination', async () => {
    const checkinHistoryUseCase = makeCheckinHistoryUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    // Test with maximum allowed perPage
    const result = await checkinHistoryUseCase.execute({
      userId: 'user-1',
      page: 1,
      perPage: 100,
    })

    expect(result.perPage).toBe(100)
    expect(result.currentPage).toBe(1)
  })

  it('should return correct data types for all properties', async () => {
    const checkinHistoryUseCase = makeCheckinHistoryUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    )

    const result = await checkinHistoryUseCase.execute({
      userId: 'user-1',
    })

    expect(Array.isArray(result.checkIns)).toBe(true)
    expect(typeof result.totalCount).toBe('number')
    expect(typeof result.currentPage).toBe('number')
    expect(typeof result.totalPages).toBe('number')
    expect(typeof result.perPage).toBe('number')
    expect(typeof result.hasNextPage).toBe('boolean')
    expect(typeof result.hasPreviousPage).toBe('boolean')
    expect(typeof result.summary).toBe('object')
  })
})
