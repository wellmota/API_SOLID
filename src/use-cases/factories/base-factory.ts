import { UsersRepository } from '../../repositories/users-repository'
import { PrismaUsersRepository } from '../../repositories/prisma/prisma-users-repository'
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository'
import { CheckInsRepository } from '../../repositories/check-ins-repository'
import { InMemoryCheckInsRepository } from '../../repositories/in-memory/in-memory-check-ins-repository'

export type RepositoryType = 'prisma' | 'in-memory'

export abstract class BaseUseCaseFactory {
  protected createUsersRepository(type: RepositoryType): UsersRepository {
    switch (type) {
      case 'prisma':
        return new PrismaUsersRepository()
      case 'in-memory':
        return new InMemoryUsersRepository()
      default:
        throw new Error(`Unsupported repository type: ${type}`)
    }
  }

  protected createCheckInsRepository(type: RepositoryType): CheckInsRepository {
    switch (type) {
      case 'prisma':
        throw new Error('Prisma check-ins repository not implemented yet')
      case 'in-memory':
        return new InMemoryCheckInsRepository()
      default:
        throw new Error(`Unsupported repository type: ${type}`)
    }
  }
}
