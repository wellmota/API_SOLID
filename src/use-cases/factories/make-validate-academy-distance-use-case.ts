import { ValidateAcademyDistanceUseCase } from '../validate-academy-distance'
import { BaseUseCaseFactory, RepositoryType } from './base-factory'
import { GymsRepository } from '@/repositories/gym-repository'

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
