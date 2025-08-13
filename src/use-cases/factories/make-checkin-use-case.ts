import { CheckInUseCase } from '../checkin'
import { BaseUseCaseFactory, RepositoryType } from './base-factory'
import { CheckInsRepository } from '@/repositories/check-ins-repository'

export class CheckInUseCaseFactory extends BaseUseCaseFactory {
  create(type: RepositoryType = 'prisma'): CheckInUseCase {
    const checkInsRepository = this.createCheckInsRepository(type)
    return new CheckInUseCase(checkInsRepository)
  }

  createWithRepository(repository: CheckInsRepository): CheckInUseCase {
    return new CheckInUseCase(repository)
  }
}

export function makeCheckInUseCase(
  repositoryType: RepositoryType = 'prisma',
): CheckInUseCase {
  const factory = new CheckInUseCaseFactory()
  return factory.create(repositoryType)
}

export function makeCheckInUseCaseWithRepository(
  repository: CheckInsRepository,
): CheckInUseCase {
  const factory = new CheckInUseCaseFactory()
  return factory.createWithRepository(repository)
}
