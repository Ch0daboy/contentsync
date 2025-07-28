import { Prisma } from '@prisma/client'
import { prisma } from './db'
import { Logger } from './logger'
import { CacheManager } from './cache'

// Database query optimization utilities
export class DatabaseOptimizer {
  // Pagination helper with cursor-based pagination for better performance
  static createPaginationQuery<T>(
    cursor?: string,
    take: number = 20,
    orderBy: any = { createdAt: 'desc' }
  ): {
    take: number
    skip?: number
    cursor?: any
    orderBy: any
  } {
    const query: any = {
      take: Math.min(take, 100), // Limit max items per page
      orderBy,
    }

    if (cursor) {
      query.cursor = { id: cursor }
      query.skip = 1 // Skip the cursor item
    }

    return query
  }

  // Optimized user platforms query with caching
  static async getUserPlatforms(userId: string, options: {
    includeContent?: boolean
    cursor?: string
    take?: number
  } = {}) {
    const cacheKey = `user_platforms:${userId}:${JSON.stringify(options)}`
    
    // Try cache first
    const cached = await CacheManager.getPlatformData(cacheKey)
    if (cached) {
      Logger.debug('Cache hit for user platforms', { userId })
      return cached
    }

    const { includeContent = false, cursor, take = 20 } = options
    
    const query = this.createPaginationQuery(cursor, take)
    
    const platforms = await prisma.platform.findMany({
      where: { userId },
      include: {
        _count: {
          select: { 
            originalContent: true,
            ...(includeContent && {
              generatedContent: {
                where: { status: 'UNSEEN' }
              }
            })
          }
        },
        ...(includeContent && {
          originalContent: {
            take: 5,
            orderBy: { publishedAt: 'desc' },
            include: {
              generatedContent: {
                where: { status: 'UNSEEN' },
                take: 1
              }
            }
          }
        })
      },
      ...query
    })

    // Cache the result
    await CacheManager.setPlatformData(cacheKey, platforms, 600) // 10 minutes
    
    Logger.database('getUserPlatforms', 'platform', Date.now(), { 
      userId, 
      count: platforms.length 
    })

    return platforms
  }

  // Optimized content query with filtering and caching
  static async getContentWithFilters(userId: string, filters: {
    type?: 'original' | 'generated'
    status?: string
    platformId?: string
    cursor?: string
    take?: number
    search?: string
  } = {}) {
    const cacheKey = `user_content:${userId}:${JSON.stringify(filters)}`
    
    // Try cache first
    const cached = await CacheManager.getContentList(cacheKey)
    if (cached) {
      Logger.debug('Cache hit for user content', { userId })
      return cached
    }

    const { 
      type = 'generated', 
      status, 
      platformId, 
      cursor, 
      take = 20,
      search 
    } = filters

    const query = this.createPaginationQuery(cursor, take)
    
    let result

    if (type === 'generated') {
      const where: Prisma.GeneratedContentWhereInput = {
        userId,
        ...(status && { status: status as any }),
        ...(platformId && { 
          originalContent: { platformId } 
        }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } }
          ]
        })
      }

      result = await prisma.generatedContent.findMany({
        where,
        include: {
          originalContent: {
            include: {
              platform: {
                select: { id: true, name: true, type: true }
              }
            }
          }
        },
        ...query
      })
    } else {
      const where: Prisma.OriginalContentWhereInput = {
        userId,
        ...(platformId && { platformId }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } }
          ]
        })
      }

      result = await prisma.originalContent.findMany({
        where,
        include: {
          platform: {
            select: { id: true, name: true, type: true }
          },
          generatedContent: {
            where: { status: 'UNSEEN' },
            take: 3
          }
        },
        ...query
      })
    }

    // Cache the result
    await CacheManager.setContentList(userId, result, JSON.stringify(filters), 300) // 5 minutes
    
    Logger.database('getContentWithFilters', type === 'generated' ? 'generatedContent' : 'originalContent', Date.now(), { 
      userId, 
      type,
      count: result.length 
    })

    return result
  }

  // Batch operations for better performance
  static async batchCreateContent(contentItems: Array<{
    userId: string
    platformId: string
    title: string
    content: string
    contentUrl: string
    contentHash: string
    publishedAt: Date
  }>) {
    if (contentItems.length === 0) return []

    try {
      const result = await prisma.originalContent.createMany({
        data: contentItems,
        skipDuplicates: true
      })

      // Invalidate related caches
      const userIds = [...new Set(contentItems.map(item => item.userId))]
      for (const userId of userIds) {
        await CacheManager.invalidateContentList(userId)
      }

      Logger.database('batchCreateContent', 'originalContent', Date.now(), { 
        count: result.count,
        userIds: userIds.length
      })

      return result
    } catch (error) {
      Logger.error('Batch create content failed', error as Error, { 
        count: contentItems.length 
      })
      throw error
    }
  }

  // Optimized content statistics
  static async getContentStatistics(userId: string) {
    const cacheKey = `content_stats:${userId}`
    
    // Try cache first
    const cached = await CacheManager.getUserData(cacheKey)
    if (cached) {
      Logger.debug('Cache hit for content statistics', { userId })
      return cached
    }

    const [
      totalPlatforms,
      activePlatforms,
      totalOriginalContent,
      totalGeneratedContent,
      unseenGeneratedContent,
      recentContent
    ] = await Promise.all([
      prisma.platform.count({ where: { userId } }),
      prisma.platform.count({ where: { userId, isActive: true } }),
      prisma.originalContent.count({ where: { userId } }),
      prisma.generatedContent.count({ where: { userId } }),
      prisma.generatedContent.count({ where: { userId, status: 'UNSEEN' } }),
      prisma.originalContent.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ])

    const stats = {
      platforms: {
        total: totalPlatforms,
        active: activePlatforms
      },
      content: {
        original: totalOriginalContent,
        generated: totalGeneratedContent,
        unseen: unseenGeneratedContent,
        recent: recentContent
      }
    }

    // Cache for 5 minutes
    await CacheManager.setUserData(cacheKey, stats, 300)
    
    Logger.database('getContentStatistics', 'multiple', Date.now(), { userId })

    return stats
  }

  // Database connection pool monitoring
  static async getConnectionPoolStats() {
    try {
      // Get active connections (this is Prisma-specific)
      const metrics = await prisma.$metrics.json()
      
      return {
        activeConnections: metrics.counters.find((c: any) => c.key === 'prisma_client_queries_active')?.value || 0,
        totalConnections: metrics.counters.find((c: any) => c.key === 'prisma_client_queries_total')?.value || 0,
        poolTimeouts: metrics.counters.find((c: any) => c.key === 'prisma_pool_connections_busy')?.value || 0
      }
    } catch (error) {
      Logger.error('Failed to get connection pool stats', error as Error)
      return {
        activeConnections: 0,
        totalConnections: 0,
        poolTimeouts: 0
      }
    }
  }

  // Query performance monitoring
  static async monitorQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now()
    
    try {
      const result = await queryFn()
      const duration = Date.now() - start
      
      Logger.database(queryName, 'query', duration)
      
      // Log slow queries
      if (duration > 1000) {
        Logger.warn(`Slow query detected: ${queryName}`, { duration })
      }
      
      return result
    } catch (error) {
      const duration = Date.now() - start
      Logger.error(`Query failed: ${queryName}`, error as Error, { duration })
      throw error
    }
  }

  // Cleanup old data
  static async cleanupOldData() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    try {
      // Delete old generated content that's been discarded
      const deletedGenerated = await prisma.generatedContent.deleteMany({
        where: {
          status: 'DISCARDED',
          updatedAt: {
            lt: thirtyDaysAgo
          }
        }
      })

      // Delete old original content that has no generated content
      const deletedOriginal = await prisma.originalContent.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          },
          generatedContent: {
            none: {}
          }
        }
      })

      Logger.info('Data cleanup completed', {
        deletedGenerated: deletedGenerated.count,
        deletedOriginal: deletedOriginal.count
      })

      return {
        deletedGenerated: deletedGenerated.count,
        deletedOriginal: deletedOriginal.count
      }
    } catch (error) {
      Logger.error('Data cleanup failed', error as Error)
      throw error
    }
  }

  // Index usage analysis (PostgreSQL specific)
  static async analyzeIndexUsage() {
    try {
      const indexUsage = await prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_tup_read,
          idx_tup_fetch,
          idx_scan
        FROM pg_stat_user_indexes 
        ORDER BY idx_scan DESC
      `

      Logger.info('Index usage analysis completed', { 
        indexCount: (indexUsage as any[]).length 
      })

      return indexUsage
    } catch (error) {
      Logger.error('Index usage analysis failed', error as Error)
      return []
    }
  }
}

// Query builder helpers
export class QueryBuilder {
  static buildContentFilters(filters: {
    status?: string
    platformId?: string
    search?: string
    dateFrom?: Date
    dateTo?: Date
  }) {
    const where: any = {}

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.platformId) {
      where.originalContent = { platformId: filters.platformId }
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {}
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom
      if (filters.dateTo) where.createdAt.lte = filters.dateTo
    }

    return where
  }

  static buildPlatformFilters(filters: {
    type?: string
    isActive?: boolean
    search?: string
  }) {
    const where: any = {}

    if (filters.type) {
      where.type = filters.type
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { url: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    return where
  }
}
