import { MetricsUseCase } from '../metrics'
import { BaseUseCaseFactory, RepositoryType } from './base-factory'
import { CheckInsRepository } from '@/repositories/check-ins-repository'
import { GymsRepository } from '@/repositories/gym-repository'
import { UsersRepository } from '@/repositories/users-repository'

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
