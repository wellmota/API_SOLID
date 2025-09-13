import { CheckIn } from '@prisma/client'
import { CheckInsRepository } from '@/repositories/check-ins-repository'
import { GymsRepository } from '@/repositories/gym-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface CheckinHistoryUseCaseRequest {
  userId: string
  page?: number
  perPage?: number
  startDate?: Date
  endDate?: Date
  gymId?: string
  includeGymDetails?: boolean
}

interface CheckinHistoryUseCaseResponse {
  checkIns: Array<{
    id: string
    userId: string
    gymId: string
    createdAt: Date
    validatedAt: Date | null
    gym?: {
      id: string
      title: string
      description: string | null
      phone: string | null
      latitude: number
      longitude: number
    }
  }>
  totalCount: number
  currentPage: number
  totalPages: number
  perPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  summary: {
    totalCheckIns: number
    checkInsThisMonth: number
    checkInsThisWeek: number
    checkInsToday: number
    mostFrequentGym?: {
      gymId: string
      gymTitle: string
      count: number
    }
  }
}

export class CheckinHistoryUseCase {
  constructor(
    private checkInsRepository: CheckInsRepository,
    private gymsRepository: GymsRepository,
  ) {}

  async execute({
    userId,
    page = 1,
    perPage = 20,
    startDate,
    endDate,
    gymId,
    includeGymDetails = false,
  }: CheckinHistoryUseCaseRequest): Promise<CheckinHistoryUseCaseResponse> {
    // Validate input parameters
    if (!userId || userId.trim() === '') {
      throw new Error('User ID is required')
    }

    if (page < 1) {
      throw new Error('Page must be greater than 0')
    }

    if (perPage < 1 || perPage > 100) {
      throw new Error('Per page must be between 1 and 100')
    }

    if (startDate && endDate && startDate > endDate) {
      throw new Error('Start date must be before end date')
    }

    // Set default date range if not provided (last 30 days)
    const defaultStartDate =
      startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const defaultEndDate = endDate || new Date()

    // Calculate pagination
    const skip = (page - 1) * perPage

    // Fetch check-ins with filters and pagination
    const [checkIns, totalCount] = await Promise.all([
      this.checkInsRepository.findManyByUserId(userId, {
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.checkInsRepository.countByUserId(userId),
    ])

    // Filter by date range if provided
    const filteredCheckIns = this.filterCheckInsByDateRange(
      checkIns,
      defaultStartDate,
      defaultEndDate,
    )

    // Filter by gym if provided
    const finalCheckIns = gymId
      ? filteredCheckIns.filter((checkIn) => checkIn.gym_id === gymId)
      : filteredCheckIns

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / perPage)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    // Get gym details if requested
    const checkInsWithDetails = includeGymDetails
      ? await this.enrichCheckInsWithGymDetails(finalCheckIns)
      : finalCheckIns.map((checkIn) => ({
          id: checkIn.id,
          userId: checkIn.user_id,
          gymId: checkIn.gym_id,
          createdAt: checkIn.createdAt,
          validatedAt: checkIn.validatedAt,
        }))

    // Calculate summary statistics
    const summary = await this.calculateSummary(
      userId,
      defaultStartDate,
      defaultEndDate,
    )

    return {
      checkIns: checkInsWithDetails,
      totalCount,
      currentPage: page,
      totalPages,
      perPage,
      hasNextPage,
      hasPreviousPage,
      summary,
    }
  }

  private filterCheckInsByDateRange(
    checkIns: CheckIn[],
    startDate: Date,
    endDate: Date,
  ): CheckIn[] {
    return checkIns.filter((checkIn) => {
      const checkInDate = new Date(checkIn.createdAt)
      return checkInDate >= startDate && checkInDate <= endDate
    })
  }

  private async enrichCheckInsWithGymDetails(checkIns: CheckIn[]) {
    const enrichedCheckIns = []

    for (const checkIn of checkIns) {
      const gym = await this.gymsRepository.findById(checkIn.gym_id)

      enrichedCheckIns.push({
        id: checkIn.id,
        userId: checkIn.user_id,
        gymId: checkIn.gym_id,
        createdAt: checkIn.createdAt,
        validatedAt: checkIn.validatedAt,
        gym: gym
          ? {
              id: gym.id,
              title: gym.title,
              description: gym.description,
              phone: gym.phone,
              latitude: Number(gym.latitude),
              longitude: Number(gym.longitude),
            }
          : undefined,
      })
    }

    return enrichedCheckIns
  }

  private async calculateSummary(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CheckinHistoryUseCaseResponse['summary']> {
    // Get all check-ins for the user
    const allCheckIns = await this.checkInsRepository.findManyByUserId(userId, {
      skip: 0,
      take: 1000, // Large number to get all check-ins
      orderBy: { createdAt: 'desc' },
    })

    const totalCheckIns = allCheckIns.length

    // Calculate check-ins for different time periods
    const now = new Date()
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    )
    const startOfWeek = new Date(startOfToday)
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const checkInsToday = allCheckIns.filter(
      (checkIn) => new Date(checkIn.createdAt) >= startOfToday,
    ).length

    const checkInsThisWeek = allCheckIns.filter(
      (checkIn) => new Date(checkIn.createdAt) >= startOfWeek,
    ).length

    const checkInsThisMonth = allCheckIns.filter(
      (checkIn) => new Date(checkIn.createdAt) >= startOfMonth,
    ).length

    // Find most frequent gym
    const gymCounts = new Map<string, number>()
    allCheckIns.forEach((checkIn) => {
      gymCounts.set(checkIn.gym_id, (gymCounts.get(checkIn.gym_id) || 0) + 1)
    })

    let mostFrequentGym:
      | { gymId: string; gymTitle: string; count: number }
      | undefined
    if (gymCounts.size > 0) {
      let maxCount = 0
      let mostFrequentGymId = ''

      for (const [gymId, count] of gymCounts.entries()) {
        if (count > maxCount) {
          maxCount = count
          mostFrequentGymId = gymId
        }
      }

      const gym = await this.gymsRepository.findById(mostFrequentGymId)
      mostFrequentGym = {
        gymId: mostFrequentGymId,
        gymTitle: gym?.title || 'Unknown Gym',
        count: maxCount,
      }
    }

    return {
      totalCheckIns,
      checkInsThisMonth,
      checkInsThisWeek,
      checkInsToday,
      mostFrequentGym,
    }
  }
}
