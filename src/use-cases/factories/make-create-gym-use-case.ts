import { CreateGymUseCase } from '../create-gym'
import { BaseUseCaseFactory, RepositoryType } from './base-factory'
import { GymsRepository } from '@/repositories/gym-repository'
import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-gyms-repository'

export class CreateGymUseCaseFactory extends BaseUseCaseFactory {
  create(type: RepositoryType = 'prisma'): CreateGymUseCase {
    const gymsRepository = this.createGymsRepository(type)
    return new CreateGymUseCase(gymsRepository)
  }

  createWithRepository(repository: GymsRepository): CreateGymUseCase {
    return new CreateGymUseCase(repository)
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

export function makeCreateGymUseCase(
  repositoryType: RepositoryType = 'prisma',
): CreateGymUseCase {
  const factory = new CreateGymUseCaseFactory()
  return factory.create(repositoryType)
}

export function makeCreateGymUseCaseWithRepository(
  repository: GymsRepository,
): CreateGymUseCase {
  const factory = new CreateGymUseCaseFactory()
  return factory.createWithRepository(repository)
}
