import { CheckIn } from '@prisma/client'
import { CheckInsRepository } from '@/repositories/check-ins-repository'

interface FetchUserCheckInHistoryUseCaseRequest {
  userId: string
  page?: number
  perPage?: number
}

interface FetchUserCheckInHistoryUseCaseResponse {
  checkIns: CheckIn[]
  totalCount: number
  currentPage: number
  totalPages: number
  perPage: number
}

export class FetchUserCheckInHistoryUseCase {
  constructor(private checkInsRepository: CheckInsRepository) {}

  async execute({
    userId,
    page = 1,
    perPage = 20,
  }: FetchUserCheckInHistoryUseCaseRequest): Promise<FetchUserCheckInHistoryUseCaseResponse> {
    // Validate pagination parameters
    if (page < 1) {
      throw new Error('Page must be greater than 0')
    }

    if (perPage < 1 || perPage > 100) {
      throw new Error('Per page must be between 1 and 100')
    }

    // Calculate pagination
    const skip = (page - 1) * perPage

    // Fetch check-ins with pagination
    const [checkIns, totalCount] = await Promise.all([
      this.checkInsRepository.findManyByUserId(userId, {
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.checkInsRepository.countByUserId(userId),
    ])

    const totalPages = Math.ceil(totalCount / perPage)

    return {
      checkIns,
      totalCount,
      currentPage: page,
      totalPages,
      perPage,
    }
  }
}
