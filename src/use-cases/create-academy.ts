import { Gym } from '@prisma/client'
import { GymsRepository } from '@/repositories/gym-repository'

interface CreateAcademyUseCaseRequest {
  title: string
  description: string | null
  phone: string | null
  latitude: number
  longitude: number
  address?: string
  website?: string
  email?: string
  openingHours?: string
  facilities?: string[]
}

interface CreateAcademyUseCaseResponse {
  academy: Gym
}

export class CreateAcademyUseCase {
  constructor(private gymsRepository: GymsRepository) {}

  async execute({
    title,
    description,
    phone,
    latitude,
    longitude,
    address,
    website,
    email,
    openingHours,
    facilities,
  }: CreateAcademyUseCaseRequest): Promise<CreateAcademyUseCaseResponse> {
    // Validate required fields
    if (!title || !title.trim()) {
      throw new Error('Title is required')
    }

    if (title.trim().length < 2) {
      throw new Error('Title must be at least 2 characters long')
    }

    if (title.trim().length > 100) {
      throw new Error('Title must be at most 100 characters long')
    }

    // Validate description length if provided
    if (description && description.trim().length > 500) {
      throw new Error('Description must be at most 500 characters long')
    }

    // Validate phone format if provided
    if (phone && !this.isValidPhoneNumber(phone)) {
      throw new Error('Invalid phone number format')
    }

    // Validate latitude range (-90 to 90)
    if (latitude < -90 || latitude > 90) {
      throw new Error('Latitude must be between -90 and 90 degrees')
    }

    // Validate longitude range (-180 to 180)
    if (longitude < -180 || longitude > 180) {
      throw new Error('Longitude must be between -180 and 180 degrees')
    }

    // Validate email format if provided
    if (email && !this.isValidEmail(email)) {
      throw new Error('Invalid email format')
    }

    // Validate website URL format if provided
    if (website && !this.isValidUrl(website)) {
      throw new Error('Invalid website URL format')
    }

    // Validate address length if provided
    if (address && address.trim().length > 200) {
      throw new Error('Address must be at most 200 characters long')
    }

    // Validate opening hours format if provided
    if (openingHours && !this.isValidOpeningHours(openingHours)) {
      throw new Error('Invalid opening hours format. Use format: "HH:MM-HH:MM"')
    }

    // Validate facilities array if provided
    if (facilities && (!Array.isArray(facilities) || facilities.length > 20)) {
      throw new Error('Facilities must be an array with at most 20 items')
    }

    // Check if academy with same coordinates already exists
    const existingAcademy = await this.checkForNearbyAcademy(
      latitude,
      longitude,
    )
    if (existingAcademy) {
      throw new Error('An academy already exists at these coordinates')
    }

    const academy = await this.gymsRepository.create({
      title: title.trim(),
      description: description?.trim() || null,
      phone: phone?.trim() || null,
      latitude,
      longitude,
    })

    return {
      academy,
    }
  }

  private isValidPhoneNumber(phone: string): boolean {
    // Basic phone number validation - can be enhanced based on requirements
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  private isValidOpeningHours(hours: string): boolean {
    // Validate format like "09:00-18:00" or "09:00-18:00,19:00-22:00"
    const timeRangeRegex =
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9](,([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9])*$/
    return timeRangeRegex.test(hours)
  }

  private async checkForNearbyAcademy(
    latitude: number,
    longitude: number,
  ): Promise<Gym | null> {
    // This would need to be implemented in the repository
    // For now, we'll return null as a placeholder
    // In a real implementation, you'd add a method to find academies within a certain radius
    return null
  }
}
