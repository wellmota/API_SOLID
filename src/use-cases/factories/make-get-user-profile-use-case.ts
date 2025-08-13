import { GetUserProfileUseCase } from '../get-user-profile'
import { BaseUseCaseFactory, RepositoryType } from './base-factory'
import { UsersRepository } from '@/repositories/users-repository'

export class GetUserProfileUseCaseFactory extends BaseUseCaseFactory {
  create(type: RepositoryType = 'prisma'): GetUserProfileUseCase {
    const usersRepository = this.createRepository(type)
    return new GetUserProfileUseCase(usersRepository)
  }

  createWithRepository(repository: UsersRepository): GetUserProfileUseCase {
    return new GetUserProfileUseCase(repository)
  }
}

export function makeGetUserProfileUseCase(
  repositoryType: RepositoryType = 'prisma'
): GetUserProfileUseCase {
  const factory = new GetUserProfileUseCaseFactory()
  return factory.create(repositoryType)
}

export function makeGetUserProfileUseCaseWithRepository(
  repository: UsersRepository
): GetUserProfileUseCase {
  const factory = new GetUserProfileUseCaseFactory()
  return factory.createWithRepository(repository)
}
