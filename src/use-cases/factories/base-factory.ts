import { UsersRepository } from '../../repositories/users-repository'
import { PrismaUsersRepository } from '../../repositories/prisma/prisma-users-repository'
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository'
import { CheckInsRepository } from '../../repositories/check-ins-repository'
import { PrismaCheckInsRepository } from '../../repositories/prisma/prisma-check-ins-repository'
import { InMemoryCheckInsRepository } from '../../repositories/in-memory/in-memory-check-ins-repository'
import { GymsRepository } from '../../repositories/gym-repository'
import { PrismaGymsRepository } from '../../repositories/prisma/prisma-gyms-repository'
import { InMemoryGymRepository } from '../../repositories/in-memory/in-memory-gyms-repository'

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
        return new PrismaCheckInsRepository()
      case 'in-memory':
        return new InMemoryCheckInsRepository()
      default:
        throw new Error(`Unsupported repository type: ${type}`)
    }
  }

  protected createGymsRepository(type: RepositoryType): GymsRepository {
    switch (type) {
      case 'prisma':
        return new PrismaGymsRepository()
      case 'in-memory':
        return new InMemoryGymRepository()
      default:
        throw new Error(`Unsupported repository type: ${type}`)
    }
  }
}
