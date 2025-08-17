import { Gym } from '../../generated/prisma'

export interface GymsRepository {
  findById(id: string): Promise<Gym | null>
  create(data: {
    title: string
    description?: string
    phone?: string
    latitude: number
    longitude: number
  }): Promise<Gym>
}
