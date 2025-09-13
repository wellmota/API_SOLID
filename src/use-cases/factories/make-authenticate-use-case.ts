import { AuthenticateUseCase } from '../authenticate'
import { BaseUseCaseFactory, RepositoryType } from './base-factory'
import { UsersRepository } from '@/repositories/users-repository'
import { JWTService } from '@/lib/jwt'

export class AuthenticateUseCaseFactory extends BaseUseCaseFactory {
  create(type: RepositoryType = 'prisma'): AuthenticateUseCase {
    const usersRepository = this.createUsersRepository(type)
    const jwtService = new JWTService(process.env.JWT_SECRET || 'default-secret')
    return new AuthenticateUseCase(usersRepository, jwtService)
  }

  createWithRepository(repository: UsersRepository): AuthenticateUseCase {
    const jwtService = new JWTService(process.env.JWT_SECRET || 'default-secret')
    return new AuthenticateUseCase(repository, jwtService)
  }

  createWithRepositories(
    repository: UsersRepository,
    jwtService: JWTService,
  ): AuthenticateUseCase {
    return new AuthenticateUseCase(repository, jwtService)
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

export function makeAuthenticateUseCaseWithRepositories(
  repository: UsersRepository,
  jwtService: JWTService,
): AuthenticateUseCase {
  const factory = new AuthenticateUseCaseFactory()
  return factory.createWithRepositories(repository, jwtService)
}
