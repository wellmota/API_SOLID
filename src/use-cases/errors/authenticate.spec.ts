import { expect, describe, it } from 'vitest'
import { makeAuthenticateUseCase } from '../factories'
import { hash } from 'bcryptjs'
import { InvalidCredentialsError } from './invalid-credentials-error'

describe('Authenticate Use Case', () => {
  it('should be able to authenticate', async () => {
    const authenticateUseCase = makeAuthenticateUseCase('in-memory')
    const usersRepository = authenticateUseCase['usersRepository']
    
    await usersRepository.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: await hash('123456', 6),
    })

    const { user } = await authenticateUseCase.execute({
      email: 'john.doe@example.com',
      password: '123456',
    })

    expect(user.id).toEqual(expect.any(String))
  })

  it('should not be able to authenticate with wrong email', async () => {
    const authenticateUseCase = makeAuthenticateUseCase('in-memory')
    
    await expect(
      authenticateUseCase.execute({
        email: 'wrong.email@example.com',
        password: '123456',
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should not be able to authenticate with wrong password', async () => {
    const authenticateUseCase = makeAuthenticateUseCase('in-memory')
    const usersRepository = authenticateUseCase['usersRepository']
    
    await usersRepository.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password_hash: await hash('123456', 6),
    })

    await expect(
      authenticateUseCase.execute({
        email: 'john.doe@example.com',
        password: '03939393',
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })
})
