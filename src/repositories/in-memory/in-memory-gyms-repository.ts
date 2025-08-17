import { Gym, Prisma } from '../../../generated/prisma'
import { GymsRepository } from '../gym-repository'
import { randomUUID } from 'crypto'

export class InMemoryGymRepository implements GymsRepository {
  public items: Gym[] = []

  async findById(id: string) {
    const gym = this.items.find((item) => item.id === id)
    if (!gym) {
      return null
    }
    return gym
  }

  async create(data: {
    title: string
    description?: string
    phone?: string
    latitude: number
    longitude: number
  }): Promise<Gym> {
    const gym: Gym = {
      id: randomUUID(),
      title: data.title,
      description: data.description || null,
      phone: data.phone || null,
      latitude: new Prisma.Decimal(data.latitude.toString()),
      longitude: new Prisma.Decimal(data.longitude.toString()),
    } as any

    this.items.push(gym)
    return gym
  }
}
