import { z } from 'zod'

// Mock environment variables for testing
const originalEnv = process.env

beforeEach(() => {
  jest.resetModules()
  process.env = { ...originalEnv }
})

afterEach(() => {
  process.env = originalEnv
})

describe('Environment Validation', () => {
  it('should validate valid environment variables', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
    process.env.REDIS_URL = 'redis://localhost:6379'
    process.env.NEXTAUTH_URL = 'http://localhost:3000'
    process.env.NEXTAUTH_SECRET = 'a'.repeat(32)
    process.env.GEMINI_API_KEY = 'test-key'
    process.env.CRON_SECRET = 'b'.repeat(32)
    process.env.NODE_ENV = 'test'

    expect(() => {
      const { env } = require('@/lib/env')
      expect(env.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/db')
      expect(env.NODE_ENV).toBe('test')
    }).not.toThrow()
  })

  it('should reject invalid DATABASE_URL', () => {
    process.env.DATABASE_URL = 'invalid-url'
    process.env.REDIS_URL = 'redis://localhost:6379'
    process.env.NEXTAUTH_URL = 'http://localhost:3000'
    process.env.NEXTAUTH_SECRET = 'a'.repeat(32)
    process.env.GEMINI_API_KEY = 'test-key'
    process.env.CRON_SECRET = 'b'.repeat(32)

    expect(() => {
      require('@/lib/env')
    }).toThrow(/DATABASE_URL must be a valid URL/)
  })

  it('should reject short NEXTAUTH_SECRET', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
    process.env.REDIS_URL = 'redis://localhost:6379'
    process.env.NEXTAUTH_URL = 'http://localhost:3000'
    process.env.NEXTAUTH_SECRET = 'short'
    process.env.GEMINI_API_KEY = 'test-key'
    process.env.CRON_SECRET = 'b'.repeat(32)

    expect(() => {
      require('@/lib/env')
    }).toThrow(/NEXTAUTH_SECRET must be at least 32 characters/)
  })

  it('should reject missing required variables', () => {
    // Missing DATABASE_URL
    process.env.REDIS_URL = 'redis://localhost:6379'
    process.env.NEXTAUTH_URL = 'http://localhost:3000'
    process.env.NEXTAUTH_SECRET = 'a'.repeat(32)
    process.env.GEMINI_API_KEY = 'test-key'
    process.env.CRON_SECRET = 'b'.repeat(32)

    expect(() => {
      require('@/lib/env')
    }).toThrow(/Environment validation failed/)
  })

  it('should use default values for optional variables', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
    process.env.REDIS_URL = 'redis://localhost:6379'
    process.env.NEXTAUTH_URL = 'http://localhost:3000'
    process.env.NEXTAUTH_SECRET = 'a'.repeat(32)
    process.env.GEMINI_API_KEY = 'test-key'
    process.env.CRON_SECRET = 'b'.repeat(32)
    // Don't set NODE_ENV to test default

    const { env } = require('@/lib/env')
    expect(env.NODE_ENV).toBe('development')
    expect(env.RATE_LIMIT_MAX).toBe('100')
    expect(env.RATE_LIMIT_WINDOW).toBe('900000')
  })

  it('should validate SENTRY_DSN when provided', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
    process.env.REDIS_URL = 'redis://localhost:6379'
    process.env.NEXTAUTH_URL = 'http://localhost:3000'
    process.env.NEXTAUTH_SECRET = 'a'.repeat(32)
    process.env.GEMINI_API_KEY = 'test-key'
    process.env.CRON_SECRET = 'b'.repeat(32)
    process.env.SENTRY_DSN = 'invalid-url'

    expect(() => {
      require('@/lib/env')
    }).toThrow()
  })

  it('should accept valid SENTRY_DSN', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
    process.env.REDIS_URL = 'redis://localhost:6379'
    process.env.NEXTAUTH_URL = 'http://localhost:3000'
    process.env.NEXTAUTH_SECRET = 'a'.repeat(32)
    process.env.GEMINI_API_KEY = 'test-key'
    process.env.CRON_SECRET = 'b'.repeat(32)
    process.env.SENTRY_DSN = 'https://example@sentry.io/123'

    expect(() => {
      const { env } = require('@/lib/env')
      expect(env.SENTRY_DSN).toBe('https://example@sentry.io/123')
    }).not.toThrow()
  })
})
