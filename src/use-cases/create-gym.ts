import { Gym } from '@prisma/client'
import { GymsRepository } from '@/repositories/gym-repository'

interface CreateGymUseCaseRequest {
  title: string
  description?: string | null
  phone?: string
  latitude: number
  longitude: number
}

interface CreateGymUseCaseResponse {
  gym: Gym
}

export class CreateGymUseCase {
  constructor(private gymsRepository: GymsRepository) {}

  async execute({
    title,
    description,
    phone,
    latitude,
    longitude,
  }: CreateGymUseCaseRequest): Promise<CreateGymUseCaseResponse> {
    // Validate required fields
    if (!title.trim()) {
      throw new Error('Title is required')
    }

    if (title.trim().length < 2) {
      throw new Error('Title must be at least 2 characters long')
    }

    // Validate latitude range (-90 to 90)
    if (latitude < -90 || latitude > 90) {
      throw new Error('Latitude must be between -90 and 90 degrees')
    }

    // Validate longitude range (-180 to 180)
    if (longitude < -180 || longitude > 180) {
      throw new Error('Longitude must be between -180 and 180 degrees')
    }

    const gym = await this.gymsRepository.create({
      title: title.trim(),
      description: description?.trim(),
      phone: phone?.trim(),
      latitude,
      longitude,
    })

    return {
      gym,
    }
  }
}
