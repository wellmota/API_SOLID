import { expect, describe, it } from 'vitest'
import { makeRegisterUseCase } from './factories'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'
import { compare } from 'bcryptjs'

describe('Register Integration', () => {
  it('should register multiple users successfully', async () => {
    const registerUseCase = makeRegisterUseCase('in-memory')

    const user1Data = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: '123456',
    }

    const user2Data = {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      password: '654321',
    }

    const { user: user1 } = await registerUseCase.execute(user1Data)
    const { user: user2 } = await registerUseCase.execute(user2Data)

    expect(user1.email).toBe('john.doe@example.com')
    expect(user2.email).toBe('jane.smith@example.com')
    // Note: InMemoryUsersRepository now returns random UUIDs as IDs
    // In a real implementation, this would be different
    expect(user1.id).toBeDefined()
    expect(user2.id).toBeDefined()
    expect(user1.id).not.toBe(user2.id)
    expect(user1.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    )
    expect(user2.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    )

    // Verify passwords are hashed
    const isUser1PasswordCorrect = await compare('123456', user1.password_hash)
    const isUser2PasswordCorrect = await compare('654321', user2.password_hash)

    expect(isUser1PasswordCorrect).toBe(true)
    expect(isUser2PasswordCorrect).toBe(true)
  })

  it('should throw error when trying to register same email twice', async () => {
    const registerUseCase = makeRegisterUseCase('in-memory')

    const userData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: '123456',
    }

    // First registration should succeed
    await registerUseCase.execute(userData)

    // Second registration with same email should fail
    await expect(registerUseCase.execute(userData)).rejects.toBeInstanceOf(
      UserAlreadyExistsError,
    )
  })

  it('should handle edge case with empty password', async () => {
    const registerUseCase = makeRegisterUseCase('in-memory')

    const userData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: '',
    }

    const { user } = await registerUseCase.execute(userData)

    expect(user.password_hash).toBeDefined()
    expect(user.password_hash).not.toBe('')
  })

  it('should handle edge case with very long password', async () => {
    const registerUseCase = makeRegisterUseCase('in-memory')

    const longPassword = 'a'.repeat(1000)
    const userData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: longPassword,
    }

    const { user } = await registerUseCase.execute(userData)

    expect(user.password_hash).toBeDefined()
    expect(user.password_hash).not.toBe(longPassword)

    const isPasswordCorrect = await compare(longPassword, user.password_hash)
    expect(isPasswordCorrect).toBe(true)
  })

  it('should handle special characters in name and email', async () => {
    const registerUseCase = makeRegisterUseCase('in-memory')

    const userData = {
      name: 'João Silva & Co.',
      email: 'joão.silva+test@example.com',
      password: '123456',
    }

    const { user } = await registerUseCase.execute(userData)

    expect(user.name).toBe('João Silva & Co.')
    expect(user.email).toBe('joão.silva+test@example.com')
  })
})
