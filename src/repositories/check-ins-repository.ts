import { CheckIn } from '@prisma/client'

export interface CheckInsRepository {
  findById(id: string): Promise<CheckIn | null>
  create(data: { gym_id: string; user_id: string }): Promise<CheckIn>
  validate(id: string): Promise<CheckIn>
  findByUserIdOnDate(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<CheckIn | null>
  findManyByUserId(
    userId: string,
    options: {
      skip: number
      take: number
      orderBy: { createdAt: 'desc' | 'asc' }
    },
  ): Promise<CheckIn[]>
  countByUserId(userId: string): Promise<number>
}
