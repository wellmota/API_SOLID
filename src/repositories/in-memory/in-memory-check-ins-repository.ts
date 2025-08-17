import dayjs from 'dayjs'
import { CheckIn } from '../../../generated/prisma'
import { CheckInsRepository } from '../check-ins-repository'
import { randomUUID } from 'crypto'

export class InMemoryCheckInsRepository implements CheckInsRepository {
  public items: CheckIn[] = []

  async findByUserIdOnDate(userId: string, date: Date) {
    const startOfTheDay = dayjs(date).startOf('date')
    const endOfTheDay = dayjs(date).endOf('date')

    const checkInOnSameDate = this.items.find((checkIn) => {
      const checkInDate = dayjs(checkIn.createdAt)
      const isOnSameDate =
        checkInDate.isAfter(startOfTheDay) && checkInDate.isBefore(endOfTheDay)

      return checkIn.user_id === userId && isOnSameDate
    })

    if (!checkInOnSameDate) {
      return null
    }

    return checkInOnSameDate
  }

  async findById(id: string) {
    const checkIn = this.items.find((item) => item.id === id)
    if (!checkIn) {
      return null
    }
    return checkIn
  }

  async create(data: {
    gym_id: string
    user_id: string
  }): Promise<CheckIn> {
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
