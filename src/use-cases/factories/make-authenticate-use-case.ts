import { AuthenticateUseCase } from '../authenticate'
import { BaseUseCaseFactory, RepositoryType } from './base-factory'
import { UsersRepository } from '@/repositories/users-repository'

export class AuthenticateUseCaseFactory extends BaseUseCaseFactory {
  create(type: RepositoryType = 'prisma'): AuthenticateUseCase {
    const usersRepository = this.createUsersRepository(type)
    return new AuthenticateUseCase(usersRepository)
  }

  createWithRepository(repository: UsersRepository): AuthenticateUseCase {
    return new AuthenticateUseCase(repository)
  }
}

export function makeAuthenticateUseCase(
  repositoryType: RepositoryType = 'prisma',
): AuthenticateUseCase {
  const factory = new AuthenticateUseCaseFactory()
  return factory.create(repositoryType)
}

export function makeAuthenticateUseCaseWithRepository(
  repository: UsersRepository,
): AuthenticateUseCase {
  const factory = new AuthenticateUseCaseFactory()
  return factory.createWithRepository(repository)
}
