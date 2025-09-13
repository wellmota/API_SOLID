import { expect, describe, it, beforeEach } from 'vitest'
import { makeCreateAcademyUseCaseWithRepository } from './factories/make-create-academy-use-case'
import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-gyms-repository'

describe('Create Academy Use Case', () => {
  let inMemoryGymsRepository: InMemoryGymRepository

  beforeEach(() => {
    inMemoryGymsRepository = new InMemoryGymRepository()
  })

  it('should be able to create an academy', async () => {
    const createAcademyUseCase = makeCreateAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const { academy } = await createAcademyUseCase.execute({
      title: 'Test Academy',
      description: 'A test academy for testing purposes',
      phone: '123-456-7890',
      latitude: -23.5505,
      longitude: -46.6333,
    })

    expect(academy.id).toBeDefined()
    expect(academy.title).toBe('Test Academy')
    expect(academy.description).toBe('A test academy for testing purposes')
    expect(academy.phone).toBe('123-456-7890')
    expect(Number(academy.latitude)).toBe(-23.5505)
    expect(Number(academy.longitude)).toBe(-46.6333)
  })

  it('should create academy with minimal required fields', async () => {
    const createAcademyUseCase = makeCreateAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const { academy } = await createAcademyUseCase.execute({
      title: 'Minimal Academy',
      description: null,
      phone: null,
      latitude: 0,
      longitude: 0,
    })

    expect(academy.id).toBeDefined()
    expect(academy.title).toBe('Minimal Academy')
    expect(academy.description).toBeNull()
    expect(academy.phone).toBeNull()
  })

  it('should trim whitespace from title', async () => {
    const createAcademyUseCase = makeCreateAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const { academy } = await createAcademyUseCase.execute({
      title: '  Test Academy  ',
      description: null,
      phone: null,
      latitude: 0,
      longitude: 0,
    })

    expect(academy.title).toBe('Test Academy')
  })

  it('should trim whitespace from description', async () => {
    const createAcademyUseCase = makeCreateAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const { academy } = await createAcademyUseCase.execute({
      title: 'Test Academy',
      description: '  Test description  ',
      phone: null,
      latitude: 0,
      longitude: 0,
    })

    expect(academy.description).toBe('Test description')
  })

  it('should trim whitespace from phone', async () => {
    const createAcademyUseCase = makeCreateAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const { academy } = await createAcademyUseCase.execute({
      title: 'Test Academy',
      description: null,
      phone: '  123-456-7890  ',
      latitude: 0,
      longitude: 0,
    })

    expect(academy.phone).toBe('123-456-7890')
  })

  it('should reject empty title', async () => {
    const createAcademyUseCase = makeCreateAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      createAcademyUseCase.execute({
        title: '',
        description: null,
        phone: null,
        latitude: 0,
        longitude: 0,
      }),
    ).rejects.toThrow('Title is required')
  })

  it('should reject whitespace-only title', async () => {
    const createAcademyUseCase = makeCreateAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      createAcademyUseCase.execute({
        title: '   ',
        description: null,
        phone: null,
        latitude: 0,
        longitude: 0,
      }),
    ).rejects.toThrow('Title is required')
  })

  it('should reject title shorter than 2 characters', async () => {
    const createAcademyUseCase = makeCreateAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      createAcademyUseCase.execute({
        title: 'A',
        description: null,
        phone: null,
        latitude: 0,
        longitude: 0,
      }),
    ).rejects.toThrow('Title must be at least 2 characters long')
  })

  it('should reject title longer than 100 characters', async () => {
    const createAcademyUseCase = makeCreateAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const longTitle = 'A'.repeat(101)

    await expect(
      createAcademyUseCase.execute({
        title: longTitle,
        description: null,
        phone: null,
        latitude: 0,
        longitude: 0,
      }),
    ).rejects.toThrow('Title must be at most 100 characters long')
  })

  it('should reject description longer than 500 characters', async () => {
    const createAcademyUseCase = makeCreateAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const longDescription = 'A'.repeat(501)

    await expect(
      createAcademyUseCase.execute({
        title: 'Test Academy',
        description: longDescription,
        phone: null,
        latitude: 0,
        longitude: 0,
      }),
    ).rejects.toThrow('Description must be at most 500 characters long')
  })

  it('should reject invalid phone number format', async () => {
    const createAcademyUseCase = makeCreateAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      createAcademyUseCase.execute({
        title: 'Test Academy',
        description: null,
        phone: 'invalid-phone',
        latitude: 0,
        longitude: 0,
      }),
    ).rejects.toThrow('Invalid phone number format')
  })

  it('should accept valid phone number formats', async () => {
    const createAcademyUseCase = makeCreateAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const validPhones = [
      '1234567890',
      '+1234567890',
      '123-456-7890',
      '(123) 456-7890',
      '+1 (123) 456-7890',
    ]

    for (const phone of validPhones) {
      const { academy } = await createAcademyUseCase.execute({
        title: `Test Academy ${phone}`,
        description: null,
        phone,
        latitude: 0,
        longitude: 0,
      })

      expect(academy.phone).toBe(phone)
    }
  })

  it('should reject invalid latitude', async () => {
    const createAcademyUseCase = makeCreateAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      createAcademyUseCase.execute({
        title: 'Test Academy',
        description: null,
        phone: null,
        latitude: 91,
        longitude: 0,
      }),
    ).rejects.toThrow('Latitude must be between -90 and 90 degrees')
  })

  it('should reject invalid longitude', async () => {
    const createAcademyUseCase = makeCreateAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      createAcademyUseCase.execute({
        title: 'Test Academy',
        description: null,
        phone: null,
        latitude: 0,
        longitude: 181,
      }),
    ).rejects.toThrow('Longitude must be between -180 and 180 degrees')
  })

  it('should accept valid latitude and longitude ranges', async () => {
    const createAcademyUseCase = makeCreateAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const validCoordinates = [
      { lat: -90, lon: -180 },
      { lat: 90, lon: 180 },
      { lat: 0, lon: 0 },
      { lat: -23.5505, lon: -46.6333 },
    ]

    for (const { lat, lon } of validCoordinates) {
      const { academy } = await createAcademyUseCase.execute({
        title: `Test Academy ${lat},${lon}`,
        description: null,
        phone: null,
        latitude: lat,
        longitude: lon,
      })

      expect(Number(academy.latitude)).toBe(lat)
      expect(Number(academy.longitude)).toBe(lon)
    }
  })

  it('should reject invalid email format', async () => {
    const createAcademyUseCase = makeCreateAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      createAcademyUseCase.execute({
        title: 'Test Academy',
        description: null,
        phone: null,
        latitude: 0,
        longitude: 0,
        email: 'invalid-email',
      }),
    ).rejects.toThrow('Invalid email format')
  })

  it('should accept valid email format', async () => {
    const createAcademyUseCase = makeCreateAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const { academy } = await createAcademyUseCase.execute({
      title: 'Test Academy',
      description: null,
      phone: null,
      latitude: 0,
      longitude: 0,
      email: 'test@example.com',
    })

    expect(academy).toBeDefined()
  })

  it('should reject invalid website URL', async () => {
    const createAcademyUseCase = makeCreateAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      createAcademyUseCase.execute({
        title: 'Test Academy',
        description: null,
        phone: null,
        latitude: 0,
        longitude: 0,
        website: 'invalid-url',
      }),
    ).rejects.toThrow('Invalid website URL format')
  })

  it('should accept valid website URL', async () => {
    const createAcademyUseCase = makeCreateAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const { academy } = await createAcademyUseCase.execute({
      title: 'Test Academy',
      description: null,
      phone: null,
      latitude: 0,
      longitude: 0,
      website: 'https://example.com',
    })

    expect(academy).toBeDefined()
  })

  it('should reject address longer than 200 characters', async () => {
    const createAcademyUseCase = makeCreateAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const longAddress = 'A'.repeat(201)

    await expect(
      createAcademyUseCase.execute({
        title: 'Test Academy',
        description: null,
        phone: null,
        latitude: 0,
        longitude: 0,
        address: longAddress,
      }),
    ).rejects.toThrow('Address must be at most 200 characters long')
  })

  it('should reject invalid opening hours format', async () => {
    const createAcademyUseCase = makeCreateAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    await expect(
      createAcademyUseCase.execute({
        title: 'Test Academy',
        description: null,
        phone: null,
        latitude: 0,
        longitude: 0,
        openingHours: 'invalid-hours',
      }),
    ).rejects.toThrow('Invalid opening hours format')
  })

  it('should accept valid opening hours format', async () => {
    const createAcademyUseCase = makeCreateAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const validHours = ['09:00-18:00', '09:00-18:00,19:00-22:00', '00:00-23:59']

    for (const hours of validHours) {
      const { academy } = await createAcademyUseCase.execute({
        title: `Test Academy ${hours}`,
        description: null,
        phone: null,
        latitude: 0,
        longitude: 0,
        openingHours: hours,
      })

      expect(academy).toBeDefined()
    }
  })

  it('should reject facilities array with more than 20 items', async () => {
    const createAcademyUseCase = makeCreateAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const facilities = Array(21).fill('Facility')

    await expect(
      createAcademyUseCase.execute({
        title: 'Test Academy',
        description: null,
        phone: null,
        latitude: 0,
        longitude: 0,
        facilities,
      }),
    ).rejects.toThrow('Facilities must be an array with at most 20 items')
  })

  it('should accept valid facilities array', async () => {
    const createAcademyUseCase = makeCreateAcademyUseCaseWithRepository(
      inMemoryGymsRepository,
    )

    const facilities = ['Pool', 'Gym', 'Sauna']

    const { academy } = await createAcademyUseCase.execute({
      title: 'Test Academy',
      description: null,
      phone: null,
      latitude: 0,
      longitude: 0,
      facilities,
    })

    expect(academy).toBeDefined()
  })
})
