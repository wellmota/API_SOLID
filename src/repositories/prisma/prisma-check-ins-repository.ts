import { CheckIn, Prisma } from '@prisma/client'
import { CheckInsRepository } from '../check-ins-repository'
import { prisma } from '@/lib/prisma'

export class PrismaCheckInsRepository implements CheckInsRepository {
  async findById(id: string): Promise<CheckIn | null> {
    const checkIn = await prisma.checkIn.findUnique({
      where: {
        id,
      },
    })

    return checkIn
  }

  async create(data: { gym_id: string; user_id: string }): Promise<CheckIn> {
    const checkIn = await prisma.checkIn.create({
      data: {
        gym_id: data.gym_id,
        user_id: data.user_id,
      },
    })

    return checkIn
  }

  async validate(id: string): Promise<CheckIn> {
    const checkIn = await prisma.checkIn.update({
      where: {
        id,
      },
      data: {
        validatedAt: new Date(),
      },
    })

    return checkIn
  }

  async findByUserIdOnDate(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<CheckIn | null> {
    const checkIn = await prisma.checkIn.findFirst({
      where: {
        user_id: userId,
        createdAt: {
          gte: from,
          lt: to,
        },
      },
    })

    return checkIn
  }

  async findManyByUserId(
    userId: string,
    options: {
      skip: number
      take: number
      orderBy: { createdAt: 'desc' | 'asc' }
    },
  ): Promise<CheckIn[]> {
    const checkIns = await prisma.checkIn.findMany({
      where: {
        user_id: userId,
      },
      skip: options.skip,
      take: options.take,
      orderBy: {
        createdAt: options.orderBy.createdAt,
      },
    })

    return checkIns
  }

  async countByUserId(userId: string): Promise<number> {
    const count = await prisma.checkIn.count({
      where: {
        user_id: userId,
      },
    })

    return count
  }
}
