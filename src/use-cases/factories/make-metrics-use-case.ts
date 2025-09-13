import { MetricsUseCase } from '../metrics'
import { BaseUseCaseFactory, RepositoryType } from './base-factory'
import { CheckInsRepository } from '@/repositories/check-ins-repository'
import { GymsRepository } from '@/repositories/gym-repository'
import { UsersRepository } from '@/repositories/users-repository'
import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'

export class MetricsUseCaseFactory extends BaseUseCaseFactory {
  create(type: RepositoryType = 'prisma'): MetricsUseCase {
    const checkInsRepository = this.createCheckInsRepository(type)
    const gymsRepository = this.createGymsRepository(type)
    const usersRepository = this.createUsersRepository(type)
    return new MetricsUseCase(
      checkInsRepository,
      gymsRepository,
      usersRepository,
    )
  }

  createWithRepositories(
    checkInsRepository: CheckInsRepository,
    gymsRepository: GymsRepository,
    usersRepository: UsersRepository,
  ): MetricsUseCase {
    return new MetricsUseCase(
      checkInsRepository,
      gymsRepository,
      usersRepository,
    )
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

export function makeMetricsUseCase(
  repositoryType: RepositoryType = 'prisma',
): MetricsUseCase {
  const factory = new MetricsUseCaseFactory()
  return factory.create(repositoryType)
}

export function makeMetricsUseCaseWithRepositories(
  checkInsRepository: CheckInsRepository,
  gymsRepository: GymsRepository,
  usersRepository: UsersRepository,
): MetricsUseCase {
  const factory = new MetricsUseCaseFactory()
  return factory.createWithRepositories(
    checkInsRepository,
    gymsRepository,
    usersRepository,
  )
}
