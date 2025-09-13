import { Gym } from '@prisma/client'
import { GymsRepository } from '@/repositories/gym-repository'
import { UsersRepository } from '@/repositories/users-repository'
import { UnauthorizedError } from './errors/unauthorized-error'

interface CreateGymUseCaseRequest {
  title: string
  description: string | null
  phone: string | null
  latitude: number
  longitude: number
  adminUserId: string
}

interface CreateGymUseCaseResponse {
  gym: Gym
}

export class CreateGymUseCase {
  constructor(
    private gymsRepository: GymsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    title,
    description,
    phone,
    latitude,
    longitude,
    adminUserId,
  }: CreateGymUseCaseRequest): Promise<CreateGymUseCaseResponse> {
    // Validate admin user
    if (!adminUserId || adminUserId.trim() === '') {
      throw new Error('Admin user ID is required')
    }

    const adminUser = await this.usersRepository.findById(adminUserId)

    if (!adminUser) {
      throw new Error('Admin user not found')
    }

    // Check if user is admin
    if (!this.isAdmin(adminUser)) {
      throw new UnauthorizedError()
    }
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

  private isAdmin(user: any): boolean {
    // This would need to be implemented based on your user model
    // For now, we'll assume there's a role field or isAdmin field
    return user.role === 'ADMIN' || user.isAdmin === true
  }
}
