import { Gym } from '@prisma/client'
import { GymsRepository } from '../gym-repository'
import { prisma } from '@/lib/prisma'

export class PrismaGymsRepository implements GymsRepository {
  async findById(id: string): Promise<Gym | null> {
    const gym = await prisma.gym.findUnique({
      where: {
        id,
      },
    })

    return gym
  }

  async create(data: {
    title: string
    description?: string
    phone?: string
    latitude: number
    longitude: number
  }): Promise<Gym> {
    const gym = await prisma.gym.create({
      data: {
        title: data.title,
        description: data.description,
        phone: data.phone,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    })

    return gym
  }
}
