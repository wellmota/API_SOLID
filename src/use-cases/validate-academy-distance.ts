import { GymsRepository } from '@/repositories/gym-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { MaxDistanceError } from './errors/max-distance-error'

interface ValidateAcademyDistanceUseCaseRequest {
  academyId: string
  userLatitude: number
  userLongitude: number
  maxDistanceInMeters?: number
}

interface ValidateAcademyDistanceUseCaseResponse {
  isValid: boolean
  distanceInMeters: number
  academy: {
    id: string
    title: string
    latitude: number
    longitude: number
  }
}

export class ValidateAcademyDistanceUseCase {
  constructor(private gymsRepository: GymsRepository) {}

  async execute({
    academyId,
    userLatitude,
    userLongitude,
    maxDistanceInMeters = 100,
  }: ValidateAcademyDistanceUseCaseRequest): Promise<ValidateAcademyDistanceUseCaseResponse> {
    // Validate input parameters
    if (!academyId || academyId.trim() === '') {
      throw new Error('Academy ID is required')
    }

    if (maxDistanceInMeters <= 0) {
      throw new Error('Maximum distance must be greater than 0')
    }

    if (maxDistanceInMeters > 10000) {
      throw new Error('Maximum distance cannot exceed 10,000 meters')
    }

    // Validate latitude range (-90 to 90)
    if (userLatitude < -90 || userLatitude > 90) {
      throw new Error('User latitude must be between -90 and 90 degrees')
    }

    // Validate longitude range (-180 to 180)
    if (userLongitude < -180 || userLongitude > 180) {
      throw new Error('User longitude must be between -180 and 180 degrees')
    }

    // Find the academy
    const academy = await this.gymsRepository.findById(academyId)

    if (!academy) {
      throw new ResourceNotFoundError()
    }

    // Calculate distance between user and academy
    const distanceInMeters = this.calculateDistance(
      userLatitude,
      userLongitude,
      Number(academy.latitude),
      Number(academy.longitude),
    )

    // Check if distance is within allowed range
    const isValid = distanceInMeters <= maxDistanceInMeters

    if (!isValid) {
      throw new MaxDistanceError()
    }

    return {
      isValid,
      distanceInMeters: Math.round(distanceInMeters * 100) / 100, // Round to 2 decimal places
      academy: {
        id: academy.id,
        title: academy.title,
        latitude: Number(academy.latitude),
        longitude: Number(academy.longitude),
      },
    }
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }
}
