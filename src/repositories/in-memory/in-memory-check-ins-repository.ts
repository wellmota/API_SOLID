import dayjs from 'dayjs'
import { CheckIn } from '../../../generated/prisma'
import { CheckInsRepository } from '../check-ins-repository'
import { randomUUID } from 'crypto'

export class InMemoryCheckInsRepository implements CheckInsRepository {
  public items: CheckIn[] = []

  async findByUserIdOnDate(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<CheckIn | null> {
    const checkIn = this.items.find(
      (item) =>
        item.user_id === userId &&
        item.createdAt >= from &&
        item.createdAt < to,
    )
    return checkIn || null
  }

  async findManyByUserId(
    userId: string,
    options: {
      skip: number
      take: number
      orderBy: { createdAt: 'desc' | 'asc' }
    },
  ): Promise<CheckIn[]> {
    let userCheckIns = this.items.filter((item) => item.user_id === userId)

    // Sort by creation date
    if (options.orderBy.createdAt === 'desc') {
      userCheckIns.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } else {
      userCheckIns.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    }

    // Apply pagination
    return userCheckIns.slice(options.skip, options.skip + options.take)
  }

  async countByUserId(userId: string): Promise<number> {
    return this.items.filter((item) => item.user_id === userId).length
  }

  async findById(id: string) {
    const checkIn = this.items.find((item) => item.id === id)
    if (!checkIn) {
      return null
    }
    return checkIn
  }

  async create(data: { gym_id: string; user_id: string }): Promise<CheckIn> {
    const checkIn: CheckIn = {
      id: randomUUID(),
      createdAt: new Date(),
      validatedAt: null,
      gym_id: data.gym_id,
      user_id: data.user_id,
    } as any

    this.items.push(checkIn)
    return checkIn
  }
}
