import { SearchAcademyUseCase } from '../search-academy'
import { BaseUseCaseFactory, RepositoryType } from './base-factory'
import { GymsRepository } from '@/repositories/gym-repository'
import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-gyms-repository'

export class SearchAcademyUseCaseFactory extends BaseUseCaseFactory {
  create(type: RepositoryType = 'prisma'): SearchAcademyUseCase {
    const gymsRepository = this.createGymsRepository(type)
    return new SearchAcademyUseCase(gymsRepository)
  }

  createWithRepository(gymsRepository: GymsRepository): SearchAcademyUseCase {
    return new SearchAcademyUseCase(gymsRepository)
  }

  private createGymsRepository(type: RepositoryType): GymsRepository {
    switch (type) {
      case 'prisma':
        throw new Error('Prisma gyms repository not implemented yet')
      case 'in-memory':
        return new InMemoryGymRepository()
      default:
        throw new Error(`Unsupported repository type: ${type}`)
    }
  }
}

export function makeSearchAcademyUseCase(
  repositoryType: RepositoryType = 'prisma',
): SearchAcademyUseCase {
  const factory = new SearchAcademyUseCaseFactory()
  return factory.create(repositoryType)
}

export function makeSearchAcademyUseCaseWithRepository(
  gymsRepository: GymsRepository,
): SearchAcademyUseCase {
  const factory = new SearchAcademyUseCaseFactory()
  return factory.createWithRepository(gymsRepository)
}
