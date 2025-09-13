import { CreateGymUseCase } from '../create-gym'
import { BaseUseCaseFactory, RepositoryType } from './base-factory'
import { GymsRepository } from '@/repositories/gym-repository'
import { UsersRepository } from '@/repositories/users-repository'
import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'

export class CreateGymUseCaseFactory extends BaseUseCaseFactory {
  create(type: RepositoryType = 'prisma'): CreateGymUseCase {
    const gymsRepository = this.createGymsRepository(type)
    const usersRepository = this.createUsersRepository(type)
    return new CreateGymUseCase(gymsRepository, usersRepository)
  }

  createWithRepositories(
    gymsRepository: GymsRepository,
    usersRepository: UsersRepository,
  ): CreateGymUseCase {
    return new CreateGymUseCase(gymsRepository, usersRepository)
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

  private createUsersRepository(type: RepositoryType): UsersRepository {
    switch (type) {
      case 'prisma':
        throw new Error('Prisma users repository not implemented yet')
      case 'in-memory':
        return new InMemoryUsersRepository()
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

export function makeCreateGymUseCaseWithRepositories(
  gymsRepository: GymsRepository,
  usersRepository: UsersRepository,
): CreateGymUseCase {
  const factory = new CreateGymUseCaseFactory()
  return factory.createWithRepositories(gymsRepository, usersRepository)
}
