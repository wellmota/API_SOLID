import { Gym } from '@prisma/client'
import { GymsRepository } from '@/repositories/gym-repository'

interface SearchAcademyUseCaseRequest {
  query: string
  page?: number
  perPage?: number
  sortBy?: 'name' | 'distance' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  userLatitude?: number
  userLongitude?: number
  maxDistance?: number
}

interface SearchAcademyUseCaseResponse {
  academies: Array<{
    id: string
    title: string
    description: string | null
    phone: string | null
    latitude: number
    longitude: number
    distance?: number
  }>
  totalCount: number
  currentPage: number
  totalPages: number
  perPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  searchQuery: string
}

export class SearchAcademyUseCase {
  constructor(private gymsRepository: GymsRepository) {}

  async execute({
    query,
    page = 1,
    perPage = 20,
    sortBy = 'name',
    sortOrder = 'asc',
    userLatitude,
    userLongitude,
    maxDistance,
  }: SearchAcademyUseCaseRequest): Promise<SearchAcademyUseCaseResponse> {
    // Validate input parameters
    if (!query || query.trim() === '') {
      throw new Error('Search query is required')
    }

    if (page < 1) {
      throw new Error('Page must be greater than 0')
    }

    if (perPage < 1 || perPage > 100) {
      throw new Error('Per page must be between 1 and 100')
    }

    if (sortBy && !['name', 'distance', 'createdAt'].includes(sortBy)) {
      throw new Error('Sort by must be one of: name, distance, createdAt')
    }

    if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
      throw new Error('Sort order must be asc or desc')
    }

    // Validate coordinates if provided
    if (userLatitude !== undefined) {
      if (userLatitude < -90 || userLatitude > 90) {
        throw new Error('User latitude must be between -90 and 90 degrees')
      }
    }

    if (userLongitude !== undefined) {
      if (userLongitude < -180 || userLongitude > 180) {
        throw new Error('User longitude must be between -180 and 180 degrees')
      }
    }

    if (maxDistance !== undefined && maxDistance <= 0) {
      throw new Error('Maximum distance must be greater than 0')
    }

    if (maxDistance !== undefined && maxDistance > 50000) {
      throw new Error('Maximum distance cannot exceed 50,000 meters')
    }

    // Validate that distance sorting requires coordinates
    if (
      sortBy === 'distance' &&
      (userLatitude === undefined || userLongitude === undefined)
    ) {
      throw new Error('Distance sorting requires user coordinates')
    }

    // Clean and prepare search query
    const cleanQuery = query.trim().toLowerCase()

    // Get all academies (in a real implementation, this would be a search method in the repository)
    const allAcademies = await this.getAllAcademies()

    // Filter academies by search query
    const filteredAcademies = this.filterAcademiesByName(
      allAcademies,
      cleanQuery,
    )

    // Filter by distance if coordinates and max distance are provided
    const distanceFilteredAcademies = this.filterAcademiesByDistance(
      filteredAcademies,
      userLatitude,
      userLongitude,
      maxDistance,
    )

    // Calculate distances if coordinates are provided
    const academiesWithDistance = this.calculateDistances(
      distanceFilteredAcademies,
      userLatitude,
      userLongitude,
    )

    // Sort academies
    const sortedAcademies = this.sortAcademies(
      academiesWithDistance,
      sortBy,
      sortOrder,
    )

    // Calculate pagination
    const totalCount = sortedAcademies.length
    const totalPages = Math.ceil(totalCount / perPage)
    const skip = (page - 1) * perPage
    const paginatedAcademies = sortedAcademies.slice(skip, skip + perPage)

    // Calculate pagination info
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return {
      academies: paginatedAcademies,
      totalCount,
      currentPage: page,
      totalPages,
      perPage,
      hasNextPage,
      hasPreviousPage,
      searchQuery: query,
    }
  }

  private async getAllAcademies(): Promise<Gym[]> {
    // This would need to be implemented in the repository
    // For now, we'll return an empty array as a placeholder
    // In a real implementation, you'd add a method to the GymsRepository
    return []
  }

  private filterAcademiesByName(academies: Gym[], query: string): Gym[] {
    return academies.filter((academy) => {
      const title = academy.title.toLowerCase()
      const description = academy.description?.toLowerCase() || ''

      return title.includes(query) || description.includes(query)
    })
  }

  private filterAcademiesByDistance(
    academies: Gym[],
    userLatitude?: number,
    userLongitude?: number,
    maxDistance?: number,
  ): Gym[] {
    if (
      userLatitude === undefined ||
      userLongitude === undefined ||
      maxDistance === undefined
    ) {
      return academies
    }

    return academies.filter((academy) => {
      const distance = this.calculateDistance(
        userLatitude,
        userLongitude,
        Number(academy.latitude),
        Number(academy.longitude),
      )

      return distance <= maxDistance
    })
  }

  private calculateDistances(
    academies: Gym[],
    userLatitude?: number,
    userLongitude?: number,
  ): Array<{
    id: string
    title: string
    description: string | null
    phone: string | null
    latitude: number
    longitude: number
    distance?: number
  }> {
    return academies.map((academy) => {
      const result: {
        id: string
        title: string
        description: string | null
        phone: string | null
        latitude: number
        longitude: number
        distance?: number
      } = {
        id: academy.id,
        title: academy.title,
        description: academy.description,
        phone: academy.phone,
        latitude: Number(academy.latitude),
        longitude: Number(academy.longitude),
      }

      if (userLatitude !== undefined && userLongitude !== undefined) {
        result.distance =
          Math.round(
            this.calculateDistance(
              userLatitude,
              userLongitude,
              Number(academy.latitude),
              Number(academy.longitude),
            ) * 100,
          ) / 100 // Round to 2 decimal places
      }

      return result
    })
  }

  private sortAcademies(
    academies: Array<{
      id: string
      title: string
      description: string | null
      phone: string | null
      latitude: number
      longitude: number
      distance?: number
    }>,
    sortBy: string,
    sortOrder: string,
  ): Array<{
    id: string
    title: string
    description: string | null
    phone: string | null
    latitude: number
    longitude: number
    distance?: number
  }> {
    return academies.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title)
          break
        case 'distance':
          if (a.distance === undefined || b.distance === undefined) {
            comparison = 0
          } else {
            comparison = a.distance - b.distance
          }
          break
        case 'createdAt':
          // Note: createdAt is not available in the current Gym interface
          // This would need to be added to the interface or handled differently
          comparison = 0
          break
        default:
          comparison = 0
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })
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
