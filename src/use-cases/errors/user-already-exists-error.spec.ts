import { expect, describe, it } from 'vitest'
import { UserAlreadyExistsError } from './user-already-exists-error'

describe('UserAlreadyExistsError', () => {
  it('should create error with default message', () => {
    const error = new UserAlreadyExistsError()

    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('Email already exists')
    // Note: The error name is inherited from Error class
    expect(error.name).toBe('Error')
  })

  it('should be throwable', () => {
    expect(() => {
      throw new UserAlreadyExistsError()
    }).toThrow('Email already exists')
  })

  it('should maintain error stack trace', () => {
    const error = new UserAlreadyExistsError()

    expect(error.stack).toBeDefined()
    expect(typeof error.stack).toBe('string')
  })
})
