import Redis from 'ioredis'
import NodeCache from 'node-cache'
import { Logger } from './logger'
import { env, isProduction } from './env'

// Cache configuration
const CACHE_CONFIG = {
  // Default TTL in seconds
  DEFAULT_TTL: 300, // 5 minutes
  
  // Specific TTLs for different data types
  USER_SESSION: 3600, // 1 hour
  PLATFORM_DATA: 1800, // 30 minutes
  CONTENT_LIST: 600, // 10 minutes
  GENERATED_CONTENT: 3600, // 1 hour
  API_RESPONSE: 300, // 5 minutes
  HEALTH_CHECK: 60, // 1 minute
  
  // Cache key prefixes
  PREFIXES: {
    USER: 'user:',
    PLATFORM: 'platform:',
    CONTENT: 'content:',
    API: 'api:',
    HEALTH: 'health:',
    RATE_LIMIT: 'rate_limit:',
  }
}

// Redis client for production
let redisClient: Redis | null = null

// In-memory cache for development
const memoryCache = new NodeCache({
  stdTTL: CACHE_CONFIG.DEFAULT_TTL,
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false, // Better performance
})

// Initialize Redis client
function initRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
    })

    redisClient.on('connect', () => {
      Logger.info('Redis connected successfully')
    })

    redisClient.on('error', (error) => {
      Logger.error('Redis connection error', error)
    })

    redisClient.on('close', () => {
      Logger.warn('Redis connection closed')
    })
  }
  
  return redisClient
}

// Cache interface
export interface CacheInterface {
  get<T>(key: string): Promise<T | null>
  set(key: string, value: any, ttl?: number): Promise<void>
  del(key: string): Promise<void>
  exists(key: string): Promise<boolean>
  flush(): Promise<void>
  keys(pattern: string): Promise<string[]>
}

// Redis cache implementation
class RedisCache implements CacheInterface {
  private client: Redis

  constructor() {
    this.client = initRedisClient()
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key)
      if (value === null) return null
      
      return JSON.parse(value) as T
    } catch (error) {
      Logger.error('Redis get error', error as Error, { key })
      return null
    }
  }

  async set(key: string, value: any, ttl: number = CACHE_CONFIG.DEFAULT_TTL): Promise<void> {
    try {
      const serialized = JSON.stringify(value)
      await this.client.setex(key, ttl, serialized)
    } catch (error) {
      Logger.error('Redis set error', error as Error, { key, ttl })
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key)
    } catch (error) {
      Logger.error('Redis del error', error as Error, { key })
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key)
      return result === 1
    } catch (error) {
      Logger.error('Redis exists error', error as Error, { key })
      return false
    }
  }

  async flush(): Promise<void> {
    try {
      await this.client.flushdb()
    } catch (error) {
      Logger.error('Redis flush error', error as Error)
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern)
    } catch (error) {
      Logger.error('Redis keys error', error as Error, { pattern })
      return []
    }
  }
}

// Memory cache implementation
class MemoryCache implements CacheInterface {
  private cache: NodeCache

  constructor() {
    this.cache = memoryCache
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = this.cache.get<T>(key)
      return value || null
    } catch (error) {
      Logger.error('Memory cache get error', error as Error, { key })
      return null
    }
  }

  async set(key: string, value: any, ttl: number = CACHE_CONFIG.DEFAULT_TTL): Promise<void> {
    try {
      this.cache.set(key, value, ttl)
    } catch (error) {
      Logger.error('Memory cache set error', error as Error, { key, ttl })
    }
  }

  async del(key: string): Promise<void> {
    try {
      this.cache.del(key)
    } catch (error) {
      Logger.error('Memory cache del error', error as Error, { key })
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      return this.cache.has(key)
    } catch (error) {
      Logger.error('Memory cache exists error', error as Error, { key })
      return false
    }
  }

  async flush(): Promise<void> {
    try {
      this.cache.flushAll()
    } catch (error) {
      Logger.error('Memory cache flush error', error as Error)
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      const allKeys = this.cache.keys()
      // Simple pattern matching (only supports * wildcard)
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'))
        return allKeys.filter(key => regex.test(key))
      }
      return allKeys.filter(key => key === pattern)
    } catch (error) {
      Logger.error('Memory cache keys error', error as Error, { pattern })
      return []
    }
  }
}

// Cache instance
export const cache: CacheInterface = isProduction ? new RedisCache() : new MemoryCache()

// Cache helper functions
export class CacheManager {
  // Generate cache keys
  static generateKey(prefix: string, ...parts: string[]): string {
    return `${prefix}${parts.join(':')}`
  }

  // User-related caching
  static async getUserData<T>(userId: string): Promise<T | null> {
    const key = this.generateKey(CACHE_CONFIG.PREFIXES.USER, userId)
    return cache.get<T>(key)
  }

  static async setUserData(userId: string, data: any, ttl: number = CACHE_CONFIG.USER_SESSION): Promise<void> {
    const key = this.generateKey(CACHE_CONFIG.PREFIXES.USER, userId)
    await cache.set(key, data, ttl)
  }

  static async invalidateUserData(userId: string): Promise<void> {
    const key = this.generateKey(CACHE_CONFIG.PREFIXES.USER, userId)
    await cache.del(key)
  }

  // Platform-related caching
  static async getPlatformData<T>(platformId: string): Promise<T | null> {
    const key = this.generateKey(CACHE_CONFIG.PREFIXES.PLATFORM, platformId)
    return cache.get<T>(key)
  }

  static async setPlatformData(platformId: string, data: any, ttl: number = CACHE_CONFIG.PLATFORM_DATA): Promise<void> {
    const key = this.generateKey(CACHE_CONFIG.PREFIXES.PLATFORM, platformId)
    await cache.set(key, data, ttl)
  }

  static async invalidatePlatformData(platformId: string): Promise<void> {
    const key = this.generateKey(CACHE_CONFIG.PREFIXES.PLATFORM, platformId)
    await cache.del(key)
  }

  // Content-related caching
  static async getContentList<T>(userId: string, filters?: string): Promise<T | null> {
    const key = this.generateKey(CACHE_CONFIG.PREFIXES.CONTENT, userId, filters || 'default')
    return cache.get<T>(key)
  }

  static async setContentList(userId: string, data: any, filters?: string, ttl: number = CACHE_CONFIG.CONTENT_LIST): Promise<void> {
    const key = this.generateKey(CACHE_CONFIG.PREFIXES.CONTENT, userId, filters || 'default')
    await cache.set(key, data, ttl)
  }

  static async invalidateContentList(userId: string): Promise<void> {
    const pattern = this.generateKey(CACHE_CONFIG.PREFIXES.CONTENT, userId, '*')
    const keys = await cache.keys(pattern)
    for (const key of keys) {
      await cache.del(key)
    }
  }

  // API response caching
  static async getApiResponse<T>(endpoint: string, params?: string): Promise<T | null> {
    const key = this.generateKey(CACHE_CONFIG.PREFIXES.API, endpoint, params || '')
    return cache.get<T>(key)
  }

  static async setApiResponse(endpoint: string, data: any, params?: string, ttl: number = CACHE_CONFIG.API_RESPONSE): Promise<void> {
    const key = this.generateKey(CACHE_CONFIG.PREFIXES.API, endpoint, params || '')
    await cache.set(key, data, ttl)
  }

  // Health check caching
  static async getHealthCheck<T>(): Promise<T | null> {
    const key = this.generateKey(CACHE_CONFIG.PREFIXES.HEALTH, 'status')
    return cache.get<T>(key)
  }

  static async setHealthCheck(data: any, ttl: number = CACHE_CONFIG.HEALTH_CHECK): Promise<void> {
    const key = this.generateKey(CACHE_CONFIG.PREFIXES.HEALTH, 'status')
    await cache.set(key, data, ttl)
  }

  // Cache warming
  static async warmCache(userId: string): Promise<void> {
    try {
      Logger.info('Warming cache for user', { userId })
      
      // Pre-load user's platforms
      // This would be implemented based on your specific needs
      
      Logger.info('Cache warmed successfully', { userId })
    } catch (error) {
      Logger.error('Cache warming failed', error as Error, { userId })
    }
  }

  // Cache statistics
  static async getCacheStats(): Promise<any> {
    try {
      if (isProduction && redisClient) {
        const info = await redisClient.info('memory')
        return {
          type: 'redis',
          info: info.split('\r\n').reduce((acc, line) => {
            const [key, value] = line.split(':')
            if (key && value) acc[key] = value
            return acc
          }, {} as any)
        }
      } else {
        return {
          type: 'memory',
          stats: memoryCache.getStats()
        }
      }
    } catch (error) {
      Logger.error('Failed to get cache stats', error as Error)
      return { type: 'unknown', error: (error as Error).message }
    }
  }
}

// Cache middleware for API routes
export function withCache(ttl: number = CACHE_CONFIG.DEFAULT_TTL) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function(...args: any[]) {
      const request = args[0]
      const cacheKey = CacheManager.generateKey(
        CACHE_CONFIG.PREFIXES.API,
        request.method,
        request.url
      )

      // Try to get from cache first
      const cached = await cache.get(cacheKey)
      if (cached) {
        Logger.debug('Cache hit', { key: cacheKey })
        return cached
      }

      // Execute original method
      const result = await method.apply(this, args)
      
      // Cache the result
      await cache.set(cacheKey, result, ttl)
      Logger.debug('Cache set', { key: cacheKey, ttl })

      return result
    }
  }
}

export default cache
