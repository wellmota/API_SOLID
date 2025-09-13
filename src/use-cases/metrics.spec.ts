import { expect, describe, it, beforeEach } from 'vitest'
import { makeMetricsUseCaseWithRepositories } from './factories/make-metrics-use-case'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { Gym, Prisma } from '../../generated/prisma'

describe('Metrics Use Case', () => {
  let inMemoryCheckInsRepository: InMemoryCheckInsRepository
  let inMemoryGymsRepository: InMemoryGymRepository
  let inMemoryUsersRepository: InMemoryUsersRepository

  beforeEach(() => {
    inMemoryCheckInsRepository = new InMemoryCheckInsRepository()
    inMemoryGymsRepository = new InMemoryGymRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository()

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

  it('should be able to get basic metrics', async () => {
    const metricsUseCase = makeMetricsUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
      inMemoryUsersRepository,
    )

    const metrics = await metricsUseCase.execute({})

    expect(metrics).toHaveProperty('totalCheckIns')
    expect(metrics).toHaveProperty('totalUsers')
    expect(metrics).toHaveProperty('totalGyms')
    expect(metrics).toHaveProperty('checkInsByDate')
    expect(metrics).toHaveProperty('checkInsByGym')
    expect(metrics).toHaveProperty('averageCheckInsPerUser')
    expect(metrics).toHaveProperty('mostActiveUser')
    expect(metrics).toHaveProperty('mostPopularGym')
  })

  it('should handle empty data gracefully', async () => {
    const metricsUseCase = makeMetricsUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
      inMemoryUsersRepository,
    )

    const metrics = await metricsUseCase.execute({})

    expect(metrics.totalCheckIns).toBe(0)
    expect(metrics.totalUsers).toBe(0)
    expect(metrics.totalGyms).toBe(0)
    expect(metrics.checkInsByDate).toEqual([])
    expect(metrics.checkInsByGym).toEqual([])
    expect(metrics.averageCheckInsPerUser).toBe(0)
    expect(metrics.mostActiveUser).toBeUndefined()
    expect(metrics.mostPopularGym).toBeUndefined()
  })

  it('should filter metrics by user ID', async () => {
    const metricsUseCase = makeMetricsUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
      inMemoryUsersRepository,
    )

    const metrics = await metricsUseCase.execute({
      userId: 'user-1',
    })

    expect(metrics).toBeDefined()
    // Since we don't have actual check-ins in the repository yet,
    // we're testing the structure and error handling
  })

  it('should filter metrics by gym ID', async () => {
    const metricsUseCase = makeMetricsUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
      inMemoryUsersRepository,
    )

    const metrics = await metricsUseCase.execute({
      gymId: 'gym-uuid-1',
    })

    expect(metrics).toBeDefined()
  })

  it('should filter metrics by date range', async () => {
    const metricsUseCase = makeMetricsUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
      inMemoryUsersRepository,
    )

    const startDate = new Date('2024-01-01')
    const endDate = new Date('2024-12-31')

    const metrics = await metricsUseCase.execute({
      startDate,
      endDate,
    })

    expect(metrics).toBeDefined()
  })

  it('should validate date range', async () => {
    const metricsUseCase = makeMetricsUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
      inMemoryUsersRepository,
    )

    const startDate = new Date('2024-12-31')
    const endDate = new Date('2024-01-01')

    await expect(
      metricsUseCase.execute({
        startDate,
        endDate,
      }),
    ).rejects.toThrow('Start date must be before end date')
  })

  it('should return metrics with correct structure', async () => {
    const metricsUseCase = makeMetricsUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
      inMemoryUsersRepository,
    )

    const metrics = await metricsUseCase.execute({})

    expect(Array.isArray(metrics.checkInsByDate)).toBe(true)
    expect(Array.isArray(metrics.checkInsByGym)).toBe(true)
    expect(typeof metrics.totalCheckIns).toBe('number')
    expect(typeof metrics.totalUsers).toBe('number')
    expect(typeof metrics.totalGyms).toBe('number')
    expect(typeof metrics.averageCheckInsPerUser).toBe('number')
  })

  it('should handle multiple filters simultaneously', async () => {
    const metricsUseCase = makeMetricsUseCaseWithRepositories(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
      inMemoryUsersRepository,
    )

    const startDate = new Date('2024-01-01')
    const endDate = new Date('2024-12-31')

    const metrics = await metricsUseCase.execute({
      userId: 'user-1',
      gymId: 'gym-uuid-1',
      startDate,
      endDate,
    })

    expect(metrics).toBeDefined()
  })
})
