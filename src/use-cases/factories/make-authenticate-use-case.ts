import { AuthenticateUseCase } from '../authenticate'
import { BaseUseCaseFactory, RepositoryType } from './base-factory'

export class AuthenticateUseCaseFactory extends BaseUseCaseFactory {
  create(type: RepositoryType = 'prisma'): AuthenticateUseCase {
    const usersRepository = this.createRepository(type)
    return new AuthenticateUseCase(usersRepository)
  }
}

export function makeAuthenticateUseCase(
  repositoryType: RepositoryType = 'prisma'
): AuthenticateUseCase {
  const factory = new AuthenticateUseCaseFactory()
  return factory.create(repositoryType)
}
