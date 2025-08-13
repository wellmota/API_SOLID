import { CheckIn, Prisma } from '../../../generated/prisma'
import { CheckInsRepository } from '../check-ins-repository'

export class InMemoryCheckInsRepository implements CheckInsRepository {
  public items: CheckIn[] = []

  async create(data: Prisma.CheckInUncheckedCreateInput): Promise<CheckIn> {
    const checkIn = {
      id: `check-in-${this.items.length + 1}`,
      createdAt: new Date(),
      validatedAt: null,
      user_id: data.user_id,
      gym_id: data.gym_id,
    }

    this.items.push(checkIn)
    return checkIn
  }
}
