import { CheckinHistoryUseCase } from '../checkin-history'
import { BaseUseCaseFactory, RepositoryType } from './base-factory'
import { CheckInsRepository } from '@/repositories/check-ins-repository'
import { GymsRepository } from '@/repositories/gym-repository'
import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-gyms-repository'

export class CheckinHistoryUseCaseFactory extends BaseUseCaseFactory {
  create(type: RepositoryType = 'prisma'): CheckinHistoryUseCase {
    const checkInsRepository = this.createCheckInsRepository(type)
    const gymsRepository = this.createGymsRepository(type)
    return new CheckinHistoryUseCase(checkInsRepository, gymsRepository)
  }

  createWithRepositories(
    checkInsRepository: CheckInsRepository,
    gymsRepository: GymsRepository,
  ): CheckinHistoryUseCase {
    return new CheckinHistoryUseCase(checkInsRepository, gymsRepository)
  }

  private createGymsRepository(type: RepositoryType): GymsRepository {
    switch (type) {
      case 'prisma':
        throw new Error('Prisma gyms repository not implemented yet')
      case 'in-memory':
        return new InMemoryGymRepository()
      default:
        throw new Error(`Unsupported repository type: ${type}`)
    }
  }
}

export function makeCheckinHistoryUseCase(
  repositoryType: RepositoryType = 'prisma',
): CheckinHistoryUseCase {
  const factory = new CheckinHistoryUseCaseFactory()
  return factory.create(repositoryType)
}

export function makeCheckinHistoryUseCaseWithRepositories(
  checkInsRepository: CheckInsRepository,
  gymsRepository: GymsRepository,
): CheckinHistoryUseCase {
  const factory = new CheckinHistoryUseCaseFactory()
  return factory.createWithRepositories(checkInsRepository, gymsRepository)
}
