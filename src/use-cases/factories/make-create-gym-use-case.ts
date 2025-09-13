import { CreateGymUseCase } from '../create-gym'
import { BaseUseCaseFactory, RepositoryType } from './base-factory'
import { GymsRepository } from '@/repositories/gym-repository'
import { UsersRepository } from '@/repositories/users-repository'

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
