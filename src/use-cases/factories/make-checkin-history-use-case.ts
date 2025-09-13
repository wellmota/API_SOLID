import { CheckinHistoryUseCase } from '../checkin-history'
import { BaseUseCaseFactory, RepositoryType } from './base-factory'
import { CheckInsRepository } from '@/repositories/check-ins-repository'
import { GymsRepository } from '@/repositories/gym-repository'

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
