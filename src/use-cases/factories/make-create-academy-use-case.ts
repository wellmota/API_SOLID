import { CreateAcademyUseCase } from '../create-academy'
import { BaseUseCaseFactory, RepositoryType } from './base-factory'
import { GymsRepository } from '@/repositories/gym-repository'
import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-gyms-repository'

export class CreateAcademyUseCaseFactory extends BaseUseCaseFactory {
  create(type: RepositoryType = 'prisma'): CreateAcademyUseCase {
    const gymsRepository = this.createGymsRepository(type)
    return new CreateAcademyUseCase(gymsRepository)
  }

  createWithRepository(gymsRepository: GymsRepository): CreateAcademyUseCase {
    return new CreateAcademyUseCase(gymsRepository)
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

export function makeCreateAcademyUseCase(
  repositoryType: RepositoryType = 'prisma',
): CreateAcademyUseCase {
  const factory = new CreateAcademyUseCaseFactory()
  return factory.create(repositoryType)
}

export function makeCreateAcademyUseCaseWithRepository(
  gymsRepository: GymsRepository,
): CreateAcademyUseCase {
  const factory = new CreateAcademyUseCaseFactory()
  return factory.createWithRepository(gymsRepository)
}
