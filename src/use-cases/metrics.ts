import { CheckInsRepository } from '@/repositories/check-ins-repository'
import { GymsRepository } from '@/repositories/gym-repository'
import { UsersRepository } from '@/repositories/users-repository'

interface MetricsUseCaseRequest {
  userId?: string
  gymId?: string
  startDate?: Date
  endDate?: Date
}

interface MetricsUseCaseResponse {
  totalCheckIns: number
  totalUsers: number
  totalGyms: number
  checkInsByDate: Array<{
    date: string
    count: number
  }>
  checkInsByGym: Array<{
    gymId: string
    gymTitle: string
    count: number
  }>
  averageCheckInsPerUser: number
  mostActiveUser?: {
    userId: string
    checkInCount: number
  }
  mostPopularGym?: {
    gymId: string
    gymTitle: string
    checkInCount: number
  }
}

export class MetricsUseCase {
  constructor(
    private checkInsRepository: CheckInsRepository,
    private gymsRepository: GymsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    userId,
    gymId,
    startDate,
    endDate,
  }: MetricsUseCaseRequest): Promise<MetricsUseCaseResponse> {
    // Set default date range if not provided
    const defaultStartDate =
      startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    const defaultEndDate = endDate || new Date()

    // Validate date range
    if (defaultStartDate > defaultEndDate) {
      throw new Error('Start date must be before end date')
    }

    // Get all check-ins within the date range
    const allCheckIns = await this.getAllCheckInsInRange(
      defaultStartDate,
      defaultEndDate,
    )

    // Filter by user if specified
    const filteredCheckIns = userId
      ? allCheckIns.filter((checkIn) => checkIn.user_id === userId)
      : allCheckIns

    // Filter by gym if specified
    const finalCheckIns = gymId
      ? filteredCheckIns.filter((checkIn) => checkIn.gym_id === gymId)
      : filteredCheckIns

    // Calculate basic metrics
    const totalCheckIns = finalCheckIns.length
    const totalUsers = await this.getTotalUsers()
    const totalGyms = await this.getTotalGyms()

    // Calculate check-ins by date
    const checkInsByDate = this.calculateCheckInsByDate(finalCheckIns)

    // Calculate check-ins by gym
    const checkInsByGym = await this.calculateCheckInsByGym(finalCheckIns)

    // Calculate average check-ins per user
    const averageCheckInsPerUser =
      totalUsers > 0 ? totalCheckIns / totalUsers : 0

    // Find most active user
    const mostActiveUser = await this.findMostActiveUser(finalCheckIns)

    // Find most popular gym
    const mostPopularGym = await this.findMostPopularGym(finalCheckIns)

    return {
      totalCheckIns,
      totalUsers,
      totalGyms,
      checkInsByDate,
      checkInsByGym,
      averageCheckInsPerUser: Math.round(averageCheckInsPerUser * 100) / 100,
      mostActiveUser,
      mostPopularGym,
    }
  }

  private async getAllCheckInsInRange(startDate: Date, endDate: Date) {
    // This would need to be implemented in the repository
    // For now, we'll return an empty array as a placeholder
    // In a real implementation, you'd add a method to the CheckInsRepository
    return []
  }

  private async getTotalUsers(): Promise<number> {
    // This would need to be implemented in the repository
    // For now, we'll return 0 as a placeholder
    return 0
  }

  private async getTotalGyms(): Promise<number> {
    // This would need to be implemented in the repository
    // For now, we'll return 0 as a placeholder
    return 0
  }

  private calculateCheckInsByDate(
    checkIns: any[],
  ): Array<{ date: string; count: number }> {
    const checkInsByDate = new Map<string, number>()

    checkIns.forEach((checkIn) => {
      const date = checkIn.createdAt.toISOString().split('T')[0]
      checkInsByDate.set(date, (checkInsByDate.get(date) || 0) + 1)
    })

    return Array.from(checkInsByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private async calculateCheckInsByGym(
    checkIns: any[],
  ): Promise<Array<{ gymId: string; gymTitle: string; count: number }>> {
    const checkInsByGym = new Map<string, number>()

    checkIns.forEach((checkIn) => {
      checkInsByGym.set(
        checkIn.gym_id,
        (checkInsByGym.get(checkIn.gym_id) || 0) + 1,
      )
    })

    const result = []
    for (const [gymId, count] of checkInsByGym.entries()) {
      const gym = await this.gymsRepository.findById(gymId)
      result.push({
        gymId,
        gymTitle: gym?.title || 'Unknown Gym',
        count,
      })
    }

    return result.sort((a, b) => b.count - a.count)
  }

  private async findMostActiveUser(
    checkIns: any[],
  ): Promise<{ userId: string; checkInCount: number } | undefined> {
    const userCheckInCounts = new Map<string, number>()

    checkIns.forEach((checkIn) => {
      userCheckInCounts.set(
        checkIn.user_id,
        (userCheckInCounts.get(checkIn.user_id) || 0) + 1,
      )
    })

    if (userCheckInCounts.size === 0) return undefined

    let mostActiveUserId = ''
    let maxCount = 0

    for (const [userId, count] of userCheckInCounts.entries()) {
      if (count > maxCount) {
        maxCount = count
        mostActiveUserId = userId
      }
    }

    return {
      userId: mostActiveUserId,
      checkInCount: maxCount,
    }
  }

  private async findMostPopularGym(
    checkIns: any[],
  ): Promise<
    { gymId: string; gymTitle: string; checkInCount: number } | undefined
  > {
    const gymCheckInCounts = new Map<string, number>()

    checkIns.forEach((checkIn) => {
      gymCheckInCounts.set(
        checkIn.gym_id,
        (gymCheckInCounts.get(checkIn.gym_id) || 0) + 1,
      )
    })

    if (gymCheckInCounts.size === 0) return undefined

    let mostPopularGymId = ''
    let maxCount = 0

    for (const [gymId, count] of gymCheckInCounts.entries()) {
      if (count > maxCount) {
        maxCount = count
        mostPopularGymId = gymId
      }
    }

    const gym = await this.gymsRepository.findById(mostPopularGymId)

    return {
      gymId: mostPopularGymId,
      gymTitle: gym?.title || 'Unknown Gym',
      checkInCount: maxCount,
    }
  }
}
