import { ValidateCheckInUseCase } from '../validate-checkin'
import { BaseUseCaseFactory, RepositoryType } from './base-factory'
import { CheckInsRepository } from '@/repositories/check-ins-repository'
import { UsersRepository } from '@/repositories/users-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'

export class ValidateCheckInUseCaseFactory extends BaseUseCaseFactory {
  create(type: RepositoryType = 'prisma'): ValidateCheckInUseCase {
    const checkInsRepository = this.createCheckInsRepository(type)
    const usersRepository = this.createUsersRepository(type)
    return new ValidateCheckInUseCase(checkInsRepository, usersRepository)
  }

  createWithRepositories(
    checkInsRepository: CheckInsRepository,
    usersRepository: UsersRepository,
  ): ValidateCheckInUseCase {
    return new ValidateCheckInUseCase(checkInsRepository, usersRepository)
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

export function makeValidateCheckInUseCase(
  repositoryType: RepositoryType = 'prisma',
): ValidateCheckInUseCase {
  const factory = new ValidateCheckInUseCaseFactory()
  return factory.create(repositoryType)
}

export function makeValidateCheckInUseCaseWithRepositories(
  checkInsRepository: CheckInsRepository,
  usersRepository: UsersRepository,
): ValidateCheckInUseCase {
  const factory = new ValidateCheckInUseCaseFactory()
  return factory.createWithRepositories(checkInsRepository, usersRepository)
}
