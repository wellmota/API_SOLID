import { expect, describe, it, beforeEach } from 'vitest'
import { makeCreateGymUseCaseWithRepository } from './factories/make-create-gym-use-case'
import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-gyms-repository'

describe('Create Gym Use Case', () => {
  let inMemoryGymsRepository: InMemoryGymRepository

  beforeEach(() => {
    inMemoryGymsRepository = new InMemoryGymRepository()
  })

  it('should be able to create a gym with valid data', async () => {
    const createGymUseCase = makeCreateGymUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const { gym } = await createGymUseCase.execute({
      title: 'Test Gym',
      description: 'A test gym for testing',
      phone: '123-456-7890',
      latitude: -23.5505,
      longitude: -46.6333,
    })

    expect(gym.id).toBeDefined()
    expect(gym.title).toBe('Test Gym')
    expect(gym.description).toBe('A test gym for testing')
    expect(gym.phone).toBe('123-456-7890')
    expect(gym.latitude).toBe(-23.5505)
    expect(gym.longitude).toBe(-46.6333)
  })

  it('should create gym with minimal required data', async () => {
    const createGymUseCase = makeCreateGymUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const { gym } = await createGymUseCase.execute({
      title: 'Minimal Gym',
      latitude: 0,
      longitude: 0,
    })

    expect(gym.title).toBe('Minimal Gym')
    expect(gym.description).toBeNull()
    expect(gym.phone).toBeNull()
    expect(gym.latitude).toBe(0)
    expect(gym.longitude).toBe(0)
  })

  it('should create gym with unique ID', async () => {
    const createGymUseCase = makeCreateGymUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const { gym: gym1 } = await createGymUseCase.execute({
      title: 'First Gym',
      latitude: 0,
      longitude: 0,
    })

    const { gym: gym2 } = await createGymUseCase.execute({
      title: 'Second Gym',
      latitude: 1,
      longitude: 1,
    })

    expect(gym1.id).toBe('gym-1')
    expect(gym2.id).toBe('gym-2')
    expect(gym1.id).not.toBe(gym2.id)
  })

  it('should store gym in repository', async () => {
    const createGymUseCase = makeCreateGymUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const { gym } = await createGymUseCase.execute({
      title: 'Test Gym',
      latitude: -23.5505,
      longitude: -46.6333,
    })

    expect(inMemoryGymsRepository.items).toHaveLength(1)
    expect(inMemoryGymsRepository.items[0]).toEqual(gym)
  })

  it('should trim whitespace from text fields', async () => {
    const createGymUseCase = makeCreateGymUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const { gym } = await createGymUseCase.execute({
      title: '  Test Gym  ',
      description: '  Test Description  ',
      phone: '  123-456-7890  ',
      latitude: -23.5505,
      longitude: -46.6333,
    })

    expect(gym.title).toBe('Test Gym')
    expect(gym.description).toBe('Test Description')
    expect(gym.phone).toBe('123-456-7890')
  })

  it('should reject gym creation with empty title', async () => {
    const createGymUseCase = makeCreateGymUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      createGymUseCase.execute({
        title: '',
        latitude: -23.5505,
        longitude: -46.6333,
      }),
    ).rejects.toThrow('Title is required')
  })

  it('should reject gym creation with whitespace-only title', async () => {
    const createGymUseCase = makeCreateGymUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      createGymUseCase.execute({
        title: '   ',
        latitude: -23.5505,
        longitude: -46.6333,
      }),
    ).rejects.toThrow('Title is required')
  })

  it('should reject gym creation with title too short', async () => {
    const createGymUseCase = makeCreateGymUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      createGymUseCase.execute({
        title: 'A',
        latitude: -23.5505,
        longitude: -46.6333,
      }),
    ).rejects.toThrow('Title must be at least 2 characters long')
  })

  it('should reject gym creation with invalid latitude (too low)', async () => {
    const createGymUseCase = makeCreateGymUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      createGymUseCase.execute({
        title: 'Test Gym',
        latitude: -91,
        longitude: -46.6333,
      }),
    ).rejects.toThrow('Latitude must be between -90 and 90 degrees')
  })

  it('should reject gym creation with invalid latitude (too high)', async () => {
    const createGymUseCase = makeCreateGymUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      createGymUseCase.execute({
        title: 'Test Gym',
        latitude: 91,
        longitude: -46.6333,
      }),
    ).rejects.toThrow('Latitude must be between -90 and 90 degrees')
  })

  it('should reject gym creation with invalid longitude (too low)', async () => {
    const createGymUseCase = makeCreateGymUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      createGymUseCase.execute({
        title: 'Test Gym',
        latitude: -23.5505,
        longitude: -181,
      }),
    ).rejects.toThrow('Longitude must be between -180 and 180 degrees')
  })

  it('should reject gym creation with invalid longitude (too high)', async () => {
    const createGymUseCase = makeCreateGymUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      createGymUseCase.execute({
        title: 'Test Gym',
        latitude: -23.5505,
        longitude: 181,
      }),
    ).rejects.toThrow('Longitude must be between -180 and 180 degrees')
  })

  it('should allow gym creation with boundary latitude values', async () => {
    const createGymUseCase = makeCreateGymUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const { gym: gym1 } = await createGymUseCase.execute({
      title: 'North Pole Gym',
      latitude: 90,
      longitude: 0,
    })

    const { gym: gym2 } = await createGymUseCase.execute({
      title: 'South Pole Gym',
      latitude: -90,
      longitude: 0,
    })

    expect(gym1.latitude).toBe(90)
    expect(gym2.latitude).toBe(-90)
  })

  it('should allow gym creation with boundary longitude values', async () => {
    const createGymUseCase = makeCreateGymUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const { gym: gym1 } = await createGymUseCase.execute({
      title: 'East Gym',
      latitude: 0,
      longitude: 180,
    })

    const { gym: gym2 } = await createGymUseCase.execute({
      title: 'West Gym',
      latitude: 0,
      longitude: -180,
    })

    expect(gym1.longitude).toBe(180)
    expect(gym2.longitude).toBe(-180)
  })
})
