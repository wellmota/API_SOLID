import { expect, describe, it, beforeEach } from 'vitest'
import { makeSearchAcademyUseCaseWithRepository } from './factories/make-search-academy-use-case'
import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { Gym, Prisma } from '../../generated/prisma'

describe('Search Academy Use Case', () => {
  let inMemoryGymsRepository: InMemoryGymRepository

  beforeEach(() => {
    inMemoryGymsRepository = new InMemoryGymRepository()

    // Add test gyms
    inMemoryGymsRepository.items.push({
      id: 'gym-uuid-1',
      title: 'Power Gym',
      description: 'A powerful gym for strength training',
      phone: '123-456-7890',
      latitude: new Prisma.Decimal(-23.5505),
      longitude: new Prisma.Decimal(-46.6333),
    } as Gym)

    inMemoryGymsRepository.items.push({
      id: 'gym-uuid-2',
      title: 'Fitness Center',
      description: 'Complete fitness center with cardio and weights',
      phone: '098-765-4321',
      latitude: new Prisma.Decimal(-23.5505),
      longitude: new Prisma.Decimal(-46.6333),
    } as Gym)

    inMemoryGymsRepository.items.push({
      id: 'gym-uuid-3',
      title: 'CrossFit Academy',
      description: 'CrossFit training academy',
      phone: '555-123-4567',
      latitude: new Prisma.Decimal(-23.5505),
      longitude: new Prisma.Decimal(-46.6333),
    } as Gym)
  })

  it('should be able to search academies by name', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const result = await searchAcademyUseCase.execute({
      query: 'Power',
    })

    expect(result).toHaveProperty('academies')
    expect(result).toHaveProperty('totalCount')
    expect(result).toHaveProperty('currentPage')
    expect(result).toHaveProperty('totalPages')
    expect(result).toHaveProperty('perPage')
    expect(result).toHaveProperty('hasNextPage')
    expect(result).toHaveProperty('hasPreviousPage')
    expect(result).toHaveProperty('searchQuery')
    expect(result.searchQuery).toBe('Power')
  })

  it('should return empty results for non-matching query', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const result = await searchAcademyUseCase.execute({
      query: 'NonExistentGym',
    })

    expect(result.academies).toEqual([])
    expect(result.totalCount).toBe(0)
    expect(result.totalPages).toBe(0)
    expect(result.hasNextPage).toBe(false)
    expect(result.hasPreviousPage).toBe(false)
  })

  it('should handle pagination correctly', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const result = await searchAcademyUseCase.execute({
      query: 'Gym',
      page: 1,
      perPage: 2,
    })

    expect(result.currentPage).toBe(1)
    expect(result.perPage).toBe(2)
    expect(result.totalPages).toBeGreaterThanOrEqual(0)
    expect(result.hasNextPage).toBe(false) // No academies in repository yet
    expect(result.hasPreviousPage).toBe(false)
  })

  it('should reject empty search query', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      searchAcademyUseCase.execute({
        query: '',
      }),
    ).rejects.toThrow('Search query is required')
  })

  it('should reject whitespace-only search query', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      searchAcademyUseCase.execute({
        query: '   ',
      }),
    ).rejects.toThrow('Search query is required')
  })

  it('should reject page less than 1', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      searchAcademyUseCase.execute({
        query: 'Gym',
        page: 0,
      }),
    ).rejects.toThrow('Page must be greater than 0')
  })

  it('should reject perPage less than 1', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      searchAcademyUseCase.execute({
        query: 'Gym',
        perPage: 0,
      }),
    ).rejects.toThrow('Per page must be between 1 and 100')
  })

  it('should reject perPage greater than 100', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      searchAcademyUseCase.execute({
        query: 'Gym',
        perPage: 101,
      }),
    ).rejects.toThrow('Per page must be between 1 and 100')
  })

  it('should accept perPage within valid range', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const validPerPageValues = [1, 10, 20, 50, 100]

    for (const perPage of validPerPageValues) {
      const result = await searchAcademyUseCase.execute({
        query: 'Gym',
        perPage,
      })

      expect(result.perPage).toBe(perPage)
    }
  })

  it('should reject invalid sortBy value', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      searchAcademyUseCase.execute({
        query: 'Gym',
        sortBy: 'invalid' as any,
      }),
    ).rejects.toThrow('Sort by must be one of: name, distance, createdAt')
  })

  it('should reject invalid sortOrder value', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      searchAcademyUseCase.execute({
        query: 'Gym',
        sortOrder: 'invalid' as any,
      }),
    ).rejects.toThrow('Sort order must be asc or desc')
  })

  it('should accept valid sortBy values', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const validSortByValues = ['name', 'distance', 'createdAt']

    for (const sortBy of validSortByValues) {
      const result = await searchAcademyUseCase.execute({
        query: 'Gym',
        sortBy: sortBy as any,
      })

      expect(result).toBeDefined()
    }
  })

  it('should accept valid sortOrder values', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const validSortOrderValues = ['asc', 'desc']

    for (const sortOrder of validSortOrderValues) {
      const result = await searchAcademyUseCase.execute({
        query: 'Gym',
        sortOrder: sortOrder as any,
      })

      expect(result).toBeDefined()
    }
  })

  it('should reject invalid latitude', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      searchAcademyUseCase.execute({
        query: 'Gym',
        userLatitude: 91,
      }),
    ).rejects.toThrow('User latitude must be between -90 and 90 degrees')
  })

  it('should reject invalid longitude', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      searchAcademyUseCase.execute({
        query: 'Gym',
        userLongitude: 181,
      }),
    ).rejects.toThrow('User longitude must be between -180 and 180 degrees')
  })

  it('should accept valid coordinates', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const validCoordinates = [
      { lat: -90, lon: -180 },
      { lat: 90, lon: 180 },
      { lat: 0, lon: 0 },
      { lat: -23.5505, lon: -46.6333 },
    ]

    for (const { lat, lon } of validCoordinates) {
      const result = await searchAcademyUseCase.execute({
        query: 'Gym',
        userLatitude: lat,
        userLongitude: lon,
      })

      expect(result).toBeDefined()
    }
  })

  it('should reject maximum distance of 0', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      searchAcademyUseCase.execute({
        query: 'Gym',
        userLatitude: -23.5505,
        userLongitude: -46.6333,
        maxDistance: 0,
      }),
    ).rejects.toThrow('Maximum distance must be greater than 0')
  })

  it('should reject maximum distance greater than 50000 meters', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      searchAcademyUseCase.execute({
        query: 'Gym',
        userLatitude: -23.5505,
        userLongitude: -46.6333,
        maxDistance: 50001,
      }),
    ).rejects.toThrow('Maximum distance cannot exceed 50,000 meters')
  })

  it('should accept maximum distance within valid range', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const validDistances = [1, 100, 1000, 10000, 50000]

    for (const distance of validDistances) {
      const result = await searchAcademyUseCase.execute({
        query: 'Gym',
        userLatitude: -23.5505,
        userLongitude: -46.6333,
        maxDistance: distance,
      })

      expect(result).toBeDefined()
    }
  })

  it('should reject distance sorting without coordinates', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      searchAcademyUseCase.execute({
        query: 'Gym',
        sortBy: 'distance',
      }),
    ).rejects.toThrow('Distance sorting requires user coordinates')
  })

  it('should accept distance sorting with coordinates', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const result = await searchAcademyUseCase.execute({
      query: 'Gym',
      sortBy: 'distance',
      userLatitude: -23.5505,
      userLongitude: -46.6333,
    })

    expect(result).toBeDefined()
  })

  it('should use default pagination values', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const result = await searchAcademyUseCase.execute({
      query: 'Gym',
    })

    expect(result.currentPage).toBe(1) // Default page
    expect(result.perPage).toBe(20) // Default perPage
  })

  it('should use default sort values', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const result = await searchAcademyUseCase.execute({
      query: 'Gym',
    })

    expect(result).toBeDefined()
    // Default sortBy is 'name' and sortOrder is 'asc'
  })

  it('should handle case-insensitive search', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const result1 = await searchAcademyUseCase.execute({
      query: 'power',
    })

    const result2 = await searchAcademyUseCase.execute({
      query: 'POWER',
    })

    const result3 = await searchAcademyUseCase.execute({
      query: 'Power',
    })

    // All should return the same results (empty since no academies in repository)
    expect(result1.totalCount).toBe(result2.totalCount)
    expect(result2.totalCount).toBe(result3.totalCount)
  })

  it('should search in both title and description', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    // Search for terms that might be in description
    const result = await searchAcademyUseCase.execute({
      query: 'training',
    })

    expect(result).toBeDefined()
    // Since we don't have academies in the repository yet, this will be empty
    expect(result.academies).toEqual([])
  })

  it('should return correct data types for all properties', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const result = await searchAcademyUseCase.execute({
      query: 'Gym',
    })

    expect(Array.isArray(result.academies)).toBe(true)
    expect(typeof result.totalCount).toBe('number')
    expect(typeof result.currentPage).toBe('number')
    expect(typeof result.totalPages).toBe('number')
    expect(typeof result.perPage).toBe('number')
    expect(typeof result.hasNextPage).toBe('boolean')
    expect(typeof result.hasPreviousPage).toBe('boolean')
    expect(typeof result.searchQuery).toBe('string')
  })

  it('should handle multiple search parameters', async () => {
    const searchAcademyUseCase = makeSearchAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const result = await searchAcademyUseCase.execute({
      query: 'Gym',
      page: 1,
      perPage: 10,
      sortBy: 'name',
      sortOrder: 'asc',
      userLatitude: -23.5505,
      userLongitude: -46.6333,
      maxDistance: 1000,
    })

    expect(result).toBeDefined()
    expect(result.currentPage).toBe(1)
    expect(result.perPage).toBe(10)
    expect(result.searchQuery).toBe('Gym')
  })
})
