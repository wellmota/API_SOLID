import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest'

describe('Environment Variables', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should load valid environment variables', async () => {
    process.env.NODE_ENV = 'dev'
    process.env.PORT = '3333'

    const { env } = await import('./index')

    expect(env.NODE_ENV).toBe('dev')
    expect(env.PORT).toBe(3333)
  })

  it('should use default PORT when not provided', async () => {
    process.env.NODE_ENV = 'production'
    delete process.env.PORT

    const { env } = await import('./index')

    expect(env.NODE_ENV).toBe('production')
    expect(env.PORT).toBe(3333)
  })

  it('should throw error for invalid NODE_ENV', async () => {
    process.env.NODE_ENV = 'invalid'
    process.env.PORT = '3333'

    await expect(import('./index')).rejects.toThrow(
      'Invalid environment variables'
    )
  })

  it('should throw error for missing NODE_ENV', async () => {
    delete process.env.NODE_ENV
    process.env.PORT = '3333'

    await expect(import('./index')).rejects.toThrow(
      'Invalid environment variables'
    )
  })

  it('should accept all valid NODE_ENV values', async () => {
    const validEnvs = ['dev', 'test', 'production']

    for (const envValue of validEnvs) {
      process.env.NODE_ENV = envValue
      process.env.PORT = '3333'

      const { env } = await import('./index')
      expect(env.NODE_ENV).toBe(envValue)

      // Reset modules for next iteration
      vi.resetModules()
    }
  })

  it('should coerce PORT to number', async () => {
    process.env.NODE_ENV = 'dev'
    process.env.PORT = '8080'

    const { env } = await import('./index')

    expect(env.PORT).toBe(8080)
    expect(typeof env.PORT).toBe('number')
  })
})
