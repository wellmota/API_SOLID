import { ValidateAcademyDistanceUseCase } from '../validate-academy-distance'
import { BaseUseCaseFactory, RepositoryType } from './base-factory'
import { GymsRepository } from '@/repositories/gym-repository'
import { InMemoryGymRepository } from '@/repositories/in-memory/in-memory-gyms-repository'

export class ValidateAcademyDistanceUseCaseFactory extends BaseUseCaseFactory {
  create(type: RepositoryType = 'prisma'): ValidateAcademyDistanceUseCase {
    const gymsRepository = this.createGymsRepository(type)
    return new ValidateAcademyDistanceUseCase(gymsRepository)
  }

  createWithRepository(
    gymsRepository: GymsRepository,
  ): ValidateAcademyDistanceUseCase {
    return new ValidateAcademyDistanceUseCase(gymsRepository)
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

export function makeValidateAcademyDistanceUseCase(
  repositoryType: RepositoryType = 'prisma',
): ValidateAcademyDistanceUseCase {
  const factory = new ValidateAcademyDistanceUseCaseFactory()
  return factory.create(repositoryType)
}

export function makeValidateAcademyDistanceUseCaseWithRepository(
  gymsRepository: GymsRepository,
): ValidateAcademyDistanceUseCase {
  const factory = new ValidateAcademyDistanceUseCaseFactory()
  return factory.createWithRepository(gymsRepository)
}
