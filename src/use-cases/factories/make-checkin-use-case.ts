import { CheckInUseCase } from '../checkin'
import { BaseUseCaseFactory, RepositoryType } from './base-factory'
import { CheckInsRepository } from '@/repositories/check-ins-repository'
import { GymsRepository } from '@/repositories/gym-repository'

export class CheckInUseCaseFactory extends BaseUseCaseFactory {
  create(type: RepositoryType = 'prisma'): CheckInUseCase {
    const checkInsRepository = this.createCheckInsRepository(type)
    const gymsRepository = this.createGymsRepository(type)
    return new CheckInUseCase(checkInsRepository, gymsRepository)
  }

  createWithRepository(repository: CheckInsRepository): CheckInUseCase {
    const gymsRepository = this.createGymsRepository('in-memory')
    return new CheckInUseCase(repository, gymsRepository)
  }

  createWithRepositories(
    checkInsRepository: CheckInsRepository,
    gymsRepository: GymsRepository,
  ): CheckInUseCase {
    return new CheckInUseCase(checkInsRepository, gymsRepository)
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

export function makeCheckInUseCaseWithRepositories(
  checkInsRepository: CheckInsRepository,
  gymsRepository: GymsRepository,
): CheckInUseCase {
  const factory = new CheckInUseCaseFactory()
  return factory.createWithRepositories(checkInsRepository, gymsRepository)
}
