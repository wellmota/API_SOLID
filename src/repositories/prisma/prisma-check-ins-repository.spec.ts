import { expect, describe, it, beforeEach, afterEach } from 'vitest'
import { PrismaCheckInsRepository } from './prisma-check-ins-repository'
import { prisma } from '@/lib/prisma'

describe('Prisma Check-ins Repository', () => {
  let prismaCheckInsRepository: PrismaCheckInsRepository

  beforeEach(() => {
    prismaCheckInsRepository = new PrismaCheckInsRepository()
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.checkIn.deleteMany()
  })

  it('should be able to create a check-in', async () => {
    const checkInData = {
      gym_id: 'gym-1',
      user_id: 'user-1',
    }

    const checkIn = await prismaCheckInsRepository.create(checkInData)

    expect(checkIn).toBeDefined()
    expect(checkIn.id).toBeDefined()
    expect(checkIn.gym_id).toBe('gym-1')
    expect(checkIn.user_id).toBe('user-1')
    expect(checkIn.createdAt).toBeInstanceOf(Date)
    expect(checkIn.validatedAt).toBeNull()
  })

  it('should be able to find a check-in by id', async () => {
    // First create a check-in
    const checkInData = {
      gym_id: 'gym-1',
      user_id: 'user-1',
    }

    const createdCheckIn = await prismaCheckInsRepository.create(checkInData)

    // Then find it by id
    const foundCheckIn = await prismaCheckInsRepository.findById(
      createdCheckIn.id,
    )

    expect(foundCheckIn).toBeDefined()
    expect(foundCheckIn?.id).toBe(createdCheckIn.id)
    expect(foundCheckIn?.gym_id).toBe('gym-1')
    expect(foundCheckIn?.user_id).toBe('user-1')
  })

  it('should return null when check-in is not found', async () => {
    const foundCheckIn =
      await prismaCheckInsRepository.findById('non-existent-id')

    expect(foundCheckIn).toBeNull()
  })

  it('should be able to validate a check-in', async () => {
    // First create a check-in
    const checkInData = {
      gym_id: 'gym-1',
      user_id: 'user-1',
    }

    const createdCheckIn = await prismaCheckInsRepository.create(checkInData)

    // Then validate it
    const validatedCheckIn = await prismaCheckInsRepository.validate(
      createdCheckIn.id,
    )

    expect(validatedCheckIn).toBeDefined()
    expect(validatedCheckIn.id).toBe(createdCheckIn.id)
    expect(validatedCheckIn.validatedAt).toBeInstanceOf(Date)
    expect(validatedCheckIn.validatedAt).not.toBeNull()
  })

  it('should be able to find check-ins by user id on date', async () => {
    const userId = 'user-1'
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Create a check-in for today
    const checkInData = {
      gym_id: 'gym-1',
      user_id: userId,
    }

    await prismaCheckInsRepository.create(checkInData)

    // Find check-ins for today
    const foundCheckIn = await prismaCheckInsRepository.findByUserIdOnDate(
      userId,
      today,
      tomorrow,
    )

    expect(foundCheckIn).toBeDefined()
    expect(foundCheckIn?.user_id).toBe(userId)
  })

  it('should return null when no check-ins found for user on date', async () => {
    const userId = 'user-1'
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const foundCheckIn = await prismaCheckInsRepository.findByUserIdOnDate(
      userId,
      today,
      tomorrow,
    )

    expect(foundCheckIn).toBeNull()
  })

  it('should be able to find many check-ins by user id with pagination', async () => {
    const userId = 'user-1'

    // Create multiple check-ins
    for (let i = 0; i < 5; i++) {
      await prismaCheckInsRepository.create({
        gym_id: `gym-${i}`,
        user_id: userId,
      })
    }

    // Find check-ins with pagination
    const checkIns = await prismaCheckInsRepository.findManyByUserId(userId, {
      skip: 0,
      take: 3,
      orderBy: { createdAt: 'desc' },
    })

    expect(checkIns).toHaveLength(3)
    expect(checkIns[0].user_id).toBe(userId)
  })

  it('should be able to count check-ins by user id', async () => {
    const userId = 'user-1'

    // Create multiple check-ins
    for (let i = 0; i < 3; i++) {
      await prismaCheckInsRepository.create({
        gym_id: `gym-${i}`,
        user_id: userId,
      })
    }

    // Count check-ins
    const count = await prismaCheckInsRepository.countByUserId(userId)

    expect(count).toBe(3)
  })

  it('should return 0 count when user has no check-ins', async () => {
    const userId = 'user-with-no-checkins'

    const count = await prismaCheckInsRepository.countByUserId(userId)

    expect(count).toBe(0)
  })

  it('should handle ordering correctly', async () => {
    const userId = 'user-1'

    // Create check-ins with slight delays to ensure different timestamps
    await prismaCheckInsRepository.create({
      gym_id: 'gym-1',
      user_id: userId,
    })

    await new Promise((resolve) => setTimeout(resolve, 10))

    await prismaCheckInsRepository.create({
      gym_id: 'gym-2',
      user_id: userId,
    })

    // Test ascending order
    const ascendingCheckIns = await prismaCheckInsRepository.findManyByUserId(
      userId,
      {
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'asc' },
      },
    )

    expect(ascendingCheckIns).toHaveLength(2)
    expect(ascendingCheckIns[0].gym_id).toBe('gym-1')
    expect(ascendingCheckIns[1].gym_id).toBe('gym-2')

    // Test descending order
    const descendingCheckIns = await prismaCheckInsRepository.findManyByUserId(
      userId,
      {
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
    )

    expect(descendingCheckIns).toHaveLength(2)
    expect(descendingCheckIns[0].gym_id).toBe('gym-2')
    expect(descendingCheckIns[1].gym_id).toBe('gym-1')
  })

  it('should handle pagination correctly', async () => {
    const userId = 'user-1'

    // Create 5 check-ins
    for (let i = 0; i < 5; i++) {
      await prismaCheckInsRepository.create({
        gym_id: `gym-${i}`,
        user_id: userId,
      })
    }

    // Test first page
    const firstPage = await prismaCheckInsRepository.findManyByUserId(userId, {
      skip: 0,
      take: 2,
      orderBy: { createdAt: 'desc' },
    })

    expect(firstPage).toHaveLength(2)

    // Test second page
    const secondPage = await prismaCheckInsRepository.findManyByUserId(userId, {
      skip: 2,
      take: 2,
      orderBy: { createdAt: 'desc' },
    })

    expect(secondPage).toHaveLength(2)

    // Test third page (should have 1 item)
    const thirdPage = await prismaCheckInsRepository.findManyByUserId(userId, {
      skip: 4,
      take: 2,
      orderBy: { createdAt: 'desc' },
    })

    expect(thirdPage).toHaveLength(1)
  })
})
