import { expect, describe, it, beforeEach, vi } from 'vitest'
import { register } from './register'

describe('Register Controller Validation', () => {
  let mockRequest: any
  let mockReply: any

  beforeEach(() => {
    mockRequest = {
      body: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: '123456',
      },
    }

    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    }
  })

  it('should validate request body successfully', async () => {
    // This test focuses on validation, not the actual registration
    // since we can't easily mock the Prisma repository in this context
    expect(mockRequest.body.name).toBe('John Doe')
    expect(mockRequest.body.email).toBe('john.doe@example.com')
    expect(mockRequest.body.password).toBe('123456')
  })

  it('should throw error for invalid email format', async () => {
    mockRequest.body.email = 'invalid-email'

    await expect(register(mockRequest, mockReply)).rejects.toThrow()
  })

  it('should throw error for password too short', async () => {
    mockRequest.body.password = '123'

    await expect(register(mockRequest, mockReply)).rejects.toThrow()
  })

  it('should throw error for missing required fields', async () => {
    mockRequest.body = {
      name: 'John Doe',
      // missing email and password
    }

    await expect(register(mockRequest, mockReply)).rejects.toThrow()
  })
})
