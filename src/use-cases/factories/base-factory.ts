import { UsersRepository } from '@/repositories/users-repository'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'

export type RepositoryType = 'prisma' | 'in-memory'

export abstract class BaseUseCaseFactory {
  protected createRepository(type: RepositoryType): UsersRepository {
    switch (type) {
      case 'prisma':
        return new PrismaUsersRepository()
      case 'in-memory':
        return new InMemoryUsersRepository()
      default:
        throw new Error(`Unsupported repository type: ${type}`)
    }
  }

  protected createRepositoryWithType<T extends UsersRepository>(
    type: RepositoryType,
    repositoryClass: new () => T
  ): T {
    if (type === 'in-memory' && repositoryClass === InMemoryUsersRepository) {
      return new InMemoryUsersRepository()
    }
    if (type === 'prisma' && repositoryClass === PrismaUsersRepository) {
      return new PrismaUsersRepository()
    }
    throw new Error(`Repository type ${type} does not match repository class`)
  }
}
