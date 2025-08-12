import { RegisterUseCase } from '../register'
import { BaseUseCaseFactory, RepositoryType } from './base-factory'

export class RegisterUseCaseFactory extends BaseUseCaseFactory {
  create(type: RepositoryType = 'prisma'): RegisterUseCase {
    const usersRepository = this.createRepository(type)
    return new RegisterUseCase(usersRepository)
  }
}

export function makeRegisterUseCase(
  repositoryType: RepositoryType = 'prisma'
): RegisterUseCase {
  const factory = new RegisterUseCaseFactory()
  return factory.create(repositoryType)
}
