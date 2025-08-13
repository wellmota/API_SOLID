import { expect, describe, it, beforeEach } from 'vitest'
import { makeGetUserProfileUseCaseWithRepository } from './factories/make-get-user-profile-use-case'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'

describe('Get User Profile Use Case', () => {
  let inMemoryUsersRepository: InMemoryUsersRepository

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
  })

  it('should be able to get user profile', async () => {
    // Create a test user in the repository
    const testUser = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: 'hashed-password',
      createdAt: new Date(),
    }

    inMemoryUsersRepository.items.push(testUser)

    const getUserProfileUseCase = makeGetUserProfileUseCaseWithRepository(
      inMemoryUsersRepository,
    )

    const { user } = await getUserProfileUseCase.execute({
      userId: 'user-1',
    })

    expect(user.id).toBe('user-1')
    expect(user.name).toBe('John Doe')
    expect(user.email).toBe('john.doe@example.com')
    expect(user.password_hash).toBe('hashed-password')
    expect(user.createdAt).toBeInstanceOf(Date)
  })

  it('should not be able to get user profile with wrong id', async () => {
    const getUserProfileUseCase = makeGetUserProfileUseCaseWithRepository(
      inMemoryUsersRepository,
    )

    await expect(() =>
      getUserProfileUseCase.execute({
        userId: 'non-existing-id',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to get user profile with empty id', async () => {
    const getUserProfileUseCase = makeGetUserProfileUseCaseWithRepository(
      inMemoryUsersRepository,
    )

    await expect(() =>
      getUserProfileUseCase.execute({
        userId: '',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return the correct user when multiple users exist', async () => {
    // Create multiple test users
    const user1 = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: 'hashed-password-1',
      createdAt: new Date(),
    }

    const user2 = {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      password_hash: 'hashed-password-2',
      createdAt: new Date(),
    }

    inMemoryUsersRepository.items.push(user1, user2)

    const getUserProfileUseCase = makeGetUserProfileUseCaseWithRepository(
      inMemoryUsersRepository,
    )

    const { user } = await getUserProfileUseCase.execute({
      userId: 'user-2',
    })

    expect(user.id).toBe('user-2')
    expect(user.name).toBe('Jane Smith')
    expect(user.email).toBe('jane.smith@example.com')
  })
})
