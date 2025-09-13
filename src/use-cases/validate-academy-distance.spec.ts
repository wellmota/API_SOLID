import { expect, describe, it, beforeEach } from 'vitest'
import { makeValidateAcademyDistanceUseCaseWithRepository } from './factories/make-validate-academy-distance-use-case'
import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { MaxDistanceError } from './errors/max-distance-error'
import { Gym, Prisma } from '../../generated/prisma'

describe('Validate Academy Distance Use Case', () => {
  let inMemoryGymsRepository: InMemoryGymRepository

  beforeEach(() => {
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

  it('should be able to validate academy distance', async () => {
    const validateAcademyDistanceUseCase =
      makeValidateAcademyDistanceUseCaseWithRepository(inMemoryGymsRepository)

    const result = await validateAcademyDistanceUseCase.execute({
      academyId: 'gym-uuid-1',
      userLatitude: -23.5505,
      userLongitude: -46.6333,
    })

    expect(result.isValid).toBe(true)
    expect(result.distanceInMeters).toBe(0)
    expect(result.academy.id).toBe('gym-uuid-1')
    expect(result.academy.title).toBe('Test Gym 1')
    expect(result.academy.latitude).toBe(-23.5505)
    expect(result.academy.longitude).toBe(-46.6333)
  })

  it('should validate distance within allowed range', async () => {
    const validateAcademyDistanceUseCase =
      makeValidateAcademyDistanceUseCaseWithRepository(inMemoryGymsRepository)

    // User coordinates very close to gym (within 100 meters)
    const result = await validateAcademyDistanceUseCase.execute({
      academyId: 'gym-uuid-1',
      userLatitude: -23.5505,
      userLongitude: -46.6333,
      maxDistanceInMeters: 100,
    })

    expect(result.isValid).toBe(true)
    expect(result.distanceInMeters).toBe(0)
  })

  it('should reject distance outside allowed range', async () => {
    const validateAcademyDistanceUseCase =
      makeValidateAcademyDistanceUseCaseWithRepository(inMemoryGymsRepository)

    // User coordinates far from gym (more than 100 meters)
    await expect(
      validateAcademyDistanceUseCase.execute({
        academyId: 'gym-uuid-1',
        userLatitude: -23.5505 + 0.01, // This creates a distance > 100m
        userLongitude: -46.6333 + 0.01,
        maxDistanceInMeters: 100,
      }),
    ).rejects.toBeInstanceOf(MaxDistanceError)
  })

  it('should throw error for non-existent academy', async () => {
    const validateAcademyDistanceUseCase =
      makeValidateAcademyDistanceUseCaseWithRepository(inMemoryGymsRepository)

    await expect(
      validateAcademyDistanceUseCase.execute({
        academyId: 'non-existent-gym',
        userLatitude: -23.5505,
        userLongitude: -46.6333,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should reject empty academy ID', async () => {
    const validateAcademyDistanceUseCase =
      makeValidateAcademyDistanceUseCaseWithRepository(inMemoryGymsRepository)

    await expect(
      validateAcademyDistanceUseCase.execute({
        academyId: '',
        userLatitude: -23.5505,
        userLongitude: -46.6333,
      }),
    ).rejects.toThrow('Academy ID is required')
  })

  it('should reject whitespace-only academy ID', async () => {
    const validateAcademyDistanceUseCase =
      makeValidateAcademyDistanceUseCaseWithRepository(inMemoryGymsRepository)

    await expect(
      validateAcademyDistanceUseCase.execute({
        academyId: '   ',
        userLatitude: -23.5505,
        userLongitude: -46.6333,
      }),
    ).rejects.toThrow('Academy ID is required')
  })

  it('should reject invalid latitude', async () => {
    const validateAcademyDistanceUseCase =
      makeValidateAcademyDistanceUseCaseWithRepository(inMemoryGymsRepository)

    await expect(
      validateAcademyDistanceUseCase.execute({
        academyId: 'gym-uuid-1',
        userLatitude: 91,
        userLongitude: -46.6333,
      }),
    ).rejects.toThrow('User latitude must be between -90 and 90 degrees')
  })

  it('should reject invalid longitude', async () => {
    const validateAcademyDistanceUseCase =
      makeValidateAcademyDistanceUseCaseWithRepository(inMemoryGymsRepository)

    await expect(
      validateAcademyDistanceUseCase.execute({
        academyId: 'gym-uuid-1',
        userLatitude: -23.5505,
        userLongitude: 181,
      }),
    ).rejects.toThrow('User longitude must be between -180 and 180 degrees')
  })

  it('should accept valid latitude and longitude ranges', async () => {
    const validateAcademyDistanceUseCase =
      makeValidateAcademyDistanceUseCaseWithRepository(inMemoryGymsRepository)

    const validCoordinates = [
      { lat: -90, lon: -180 },
      { lat: 90, lon: 180 },
      { lat: 0, lon: 0 },
      { lat: -23.5505, lon: -46.6333 },
    ]

    for (const { lat, lon } of validCoordinates) {
      const result = await validateAcademyDistanceUseCase.execute({
        academyId: 'gym-uuid-1',
        userLatitude: lat,
        userLongitude: lon,
      })

      expect(result).toBeDefined()
      expect(result.academy.id).toBe('gym-uuid-1')
    }
  })

  it('should reject maximum distance of 0', async () => {
    const validateAcademyDistanceUseCase =
      makeValidateAcademyDistanceUseCaseWithRepository(inMemoryGymsRepository)

    await expect(
      validateAcademyDistanceUseCase.execute({
        academyId: 'gym-uuid-1',
        userLatitude: -23.5505,
        userLongitude: -46.6333,
        maxDistanceInMeters: 0,
      }),
    ).rejects.toThrow('Maximum distance must be greater than 0')
  })

  it('should reject maximum distance greater than 10000 meters', async () => {
    const validateAcademyDistanceUseCase =
      makeValidateAcademyDistanceUseCaseWithRepository(inMemoryGymsRepository)

    await expect(
      validateAcademyDistanceUseCase.execute({
        academyId: 'gym-uuid-1',
        userLatitude: -23.5505,
        userLongitude: -46.6333,
        maxDistanceInMeters: 10001,
      }),
    ).rejects.toThrow('Maximum distance cannot exceed 10,000 meters')
  })

  it('should accept maximum distance within valid range', async () => {
    const validateAcademyDistanceUseCase =
      makeValidateAcademyDistanceUseCaseWithRepository(inMemoryGymsRepository)

    const validDistances = [1, 100, 1000, 5000, 10000]

    for (const distance of validDistances) {
      const result = await validateAcademyDistanceUseCase.execute({
        academyId: 'gym-uuid-1',
        userLatitude: -23.5505,
        userLongitude: -46.6333,
        maxDistanceInMeters: distance,
      })

      expect(result).toBeDefined()
      expect(result.isValid).toBe(true)
    }
  })

  it('should calculate distance correctly', async () => {
    const validateAcademyDistanceUseCase =
      makeValidateAcademyDistanceUseCaseWithRepository(inMemoryGymsRepository)

    // Test with known coordinates that should give a specific distance
    const result = await validateAcademyDistanceUseCase.execute({
      academyId: 'gym-uuid-1',
      userLatitude: -23.5505,
      userLongitude: -46.6333,
      maxDistanceInMeters: 1000,
    })

    expect(result.distanceInMeters).toBe(0) // Same coordinates should give 0 distance
    expect(typeof result.distanceInMeters).toBe('number')
    expect(result.distanceInMeters).toBeGreaterThanOrEqual(0)
  })

  it('should round distance to 2 decimal places', async () => {
    const validateAcademyDistanceUseCase =
      makeValidateAcademyDistanceUseCaseWithRepository(inMemoryGymsRepository)

    const result = await validateAcademyDistanceUseCase.execute({
      academyId: 'gym-uuid-1',
      userLatitude: -23.5505,
      userLongitude: -46.6333,
      maxDistanceInMeters: 1000,
    })

    // Check that the distance is rounded to 2 decimal places
    const decimalPlaces = (
      result.distanceInMeters.toString().split('.')[1] || ''
    ).length
    expect(decimalPlaces).toBeLessThanOrEqual(2)
  })

  it('should work with different academy', async () => {
    const validateAcademyDistanceUseCase =
      makeValidateAcademyDistanceUseCaseWithRepository(inMemoryGymsRepository)

    const result = await validateAcademyDistanceUseCase.execute({
      academyId: 'gym-uuid-2',
      userLatitude: -23.5505,
      userLongitude: -46.6333,
    })

    expect(result.isValid).toBe(true)
    expect(result.academy.id).toBe('gym-uuid-2')
    expect(result.academy.title).toBe('Test Gym 2')
  })

  it('should handle edge case coordinates', async () => {
    const validateAcademyDistanceUseCase =
      makeValidateAcademyDistanceUseCaseWithRepository(inMemoryGymsRepository)

    // Test with edge case coordinates
    const edgeCases = [
      { lat: -90, lon: -180 },
      { lat: 90, lon: 180 },
      { lat: 0, lon: 0 },
    ]

    for (const { lat, lon } of edgeCases) {
      const result = await validateAcademyDistanceUseCase.execute({
        academyId: 'gym-uuid-1',
        userLatitude: lat,
        userLongitude: lon,
        maxDistanceInMeters: 10000, // Large distance to ensure it passes
      })

      expect(result).toBeDefined()
      expect(typeof result.distanceInMeters).toBe('number')
    }
  })
})
