import { expect, describe, it, beforeEach } from 'vitest'
import { InMemoryUsersRepository } from './in-memory-users-repository'

describe('InMemoryUsersRepository', () => {
  let repository: InMemoryUsersRepository

  beforeEach(() => {
    repository = new InMemoryUsersRepository()
  })

  it('should create a new user', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: 'hashed_password',
    }

    const user = await repository.create(userData)

    expect(user).toEqual({
      id: 'user-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: 'hashed_password',
      createdAt: expect.any(Date),
    })
  })

  it('should find user by email', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: 'hashed_password',
    }

    await repository.create(userData)
    const foundUser = await repository.findByEmail('john.doe@example.com')

    expect(foundUser).toEqual({
      id: 'user-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: 'hashed_password',
      createdAt: expect.any(Date),
    })
  })

  it('should return null when user not found by email', async () => {
    const foundUser = await repository.findByEmail('nonexistent@example.com')

    expect(foundUser).toBeNull()
  })

  it('should handle multiple users', async () => {
    const user1Data = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: 'hashed_password_1',
    }

    const user2Data = {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      password_hash: 'hashed_password_2',
    }

    await repository.create(user1Data)
    await repository.create(user2Data)

    const foundUser1 = await repository.findByEmail('john.doe@example.com')
    const foundUser2 = await repository.findByEmail('jane.smith@example.com')

    expect(foundUser1?.name).toBe('John Doe')
    expect(foundUser2?.name).toBe('Jane Smith')
  })

  it('should handle empty password_hash with fallback', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: undefined,
    }

    const user = await repository.create(userData)

    expect(user.password_hash).toBe('')
  })
})
