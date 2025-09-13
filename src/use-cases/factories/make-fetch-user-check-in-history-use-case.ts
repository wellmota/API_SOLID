import { FetchUserCheckInHistoryUseCase } from '../fetch-user-check-in-history'
import { BaseUseCaseFactory, RepositoryType } from './base-factory'
import { CheckInsRepository } from '@/repositories/check-ins-repository'

export class FetchUserCheckInHistoryUseCaseFactory extends BaseUseCaseFactory {
  create(type: RepositoryType = 'prisma'): FetchUserCheckInHistoryUseCase {
    const checkInsRepository = this.createCheckInsRepository(type)
    return new FetchUserCheckInHistoryUseCase(checkInsRepository)
  }

  createWithRepository(
    checkInsRepository: CheckInsRepository,
  ): FetchUserCheckInHistoryUseCase {
    return new FetchUserCheckInHistoryUseCase(checkInsRepository)
  }
}

export function makeFetchUserCheckInHistoryUseCase(
  repositoryType: RepositoryType = 'prisma',
): FetchUserCheckInHistoryUseCase {
  const factory = new FetchUserCheckInHistoryUseCaseFactory()
  return factory.create(repositoryType)
}

export function makeFetchUserCheckInHistoryUseCaseWithRepository(
  checkInsRepository: CheckInsRepository,
): FetchUserCheckInHistoryUseCase {
  const factory = new FetchUserCheckInHistoryUseCaseFactory()
  return factory.createWithRepository(checkInsRepository)
}
