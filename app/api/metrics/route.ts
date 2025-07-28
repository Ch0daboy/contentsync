import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Logger } from '@/lib/logger'
import { SecurityMiddleware } from '@/lib/security'
import { env } from '@/lib/env'

interface Metrics {
  timestamp: string
  uptime: number
  version: string
  environment: string
  system: {
    memory: {
      heapUsed: number
      heapTotal: number
      external: number
      rss: number
      usagePercent: number
    }
    cpu: {
      loadAverage: number[]
    }
    process: {
      pid: number
      uptime: number
      version: string
    }
  }
  application: {
    users: {
      total: number
      active: number
    }
    platforms: {
      total: number
      active: number
      byType: Record<string, number>
    }
    content: {
      original: number
      generated: number
      recentlyCreated: number
    }
    errors: {
      last24h: number
      last1h: number
    }
  }
  performance: {
    averageResponseTime: number
    requestsPerMinute: number
    errorRate: number
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authorization for metrics endpoint
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      return SecurityMiddleware.addSecurityHeaders(response)
    }

    Logger.debug('Metrics requested')
    
    const metrics: Metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: env.NODE_ENV,
      system: getSystemMetrics(),
      application: await getApplicationMetrics(),
      performance: getPerformanceMetrics(),
    }

    Logger.debug('Metrics collected successfully')

    const response = NextResponse.json(metrics)
    return SecurityMiddleware.addSecurityHeaders(response)

  } catch (error) {
    Logger.error('Metrics collection failed', error as Error)
    
    const errorResponse = {
      error: 'Metrics collection failed',
      timestamp: new Date().toISOString(),
      message: (error as Error).message,
    }

    const response = NextResponse.json(errorResponse, { status: 500 })
    return SecurityMiddleware.addSecurityHeaders(response)
  }
}

function getSystemMetrics() {
  const memUsage = process.memoryUsage()
  const totalMemory = memUsage.heapTotal
  const usedMemory = memUsage.heapUsed
  const memoryUsagePercent = (usedMemory / totalMemory) * 100

  return {
    memory: {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      usagePercent: Math.round(memoryUsagePercent),
    },
    cpu: {
      loadAverage: process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0],
    },
    process: {
      pid: process.pid,
      uptime: process.uptime(),
      version: process.version,
    },
  }
}

async function getApplicationMetrics() {
  try {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    // User metrics
    const totalUsers = await prisma.user.count()
    const activeUsers = await prisma.user.count({
      where: {
        updatedAt: {
          gte: oneDayAgo,
        },
      },
    })

    // Platform metrics
    const totalPlatforms = await prisma.platform.count()
    const activePlatforms = await prisma.platform.count({
      where: {
        isActive: true,
      },
    })

    const platformsByType = await prisma.platform.groupBy({
      by: ['type'],
      _count: {
        id: true,
      },
    })

    const platformTypeCount = platformsByType.reduce((acc, item) => {
      acc[item.type] = item._count.id
      return acc
    }, {} as Record<string, number>)

    // Content metrics
    const originalContentCount = await prisma.originalContent.count()
    const generatedContentCount = await prisma.generatedContent.count()
    const recentlyCreatedContent = await prisma.originalContent.count({
      where: {
        createdAt: {
          gte: oneDayAgo,
        },
      },
    })

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      platforms: {
        total: totalPlatforms,
        active: activePlatforms,
        byType: platformTypeCount,
      },
      content: {
        original: originalContentCount,
        generated: generatedContentCount,
        recentlyCreated: recentlyCreatedContent,
      },
      errors: {
        last24h: 0, // Would need to implement error tracking
        last1h: 0,  // Would need to implement error tracking
      },
    }
  } catch (error) {
    Logger.error('Failed to collect application metrics', error as Error)
    return {
      users: { total: 0, active: 0 },
      platforms: { total: 0, active: 0, byType: {} },
      content: { original: 0, generated: 0, recentlyCreated: 0 },
      errors: { last24h: 0, last1h: 0 },
    }
  }
}

function getPerformanceMetrics() {
  // In a real implementation, these would be collected from actual metrics
  // For now, return placeholder values
  return {
    averageResponseTime: 0, // Would need to implement request tracking
    requestsPerMinute: 0,   // Would need to implement request tracking
    errorRate: 0,           // Would need to implement error tracking
  }
}

// Helper function to export metrics in Prometheus format
export async function getPrometheusMetrics(): Promise<string> {
  try {
    const metrics = await getApplicationMetrics()
    const systemMetrics = getSystemMetrics()
    
    const prometheusMetrics = [
      `# HELP contentsync_users_total Total number of users`,
      `# TYPE contentsync_users_total gauge`,
      `contentsync_users_total ${metrics.users.total}`,
      ``,
      `# HELP contentsync_users_active Active users in last 24h`,
      `# TYPE contentsync_users_active gauge`,
      `contentsync_users_active ${metrics.users.active}`,
      ``,
      `# HELP contentsync_platforms_total Total number of platforms`,
      `# TYPE contentsync_platforms_total gauge`,
      `contentsync_platforms_total ${metrics.platforms.total}`,
      ``,
      `# HELP contentsync_platforms_active Active platforms`,
      `# TYPE contentsync_platforms_active gauge`,
      `contentsync_platforms_active ${metrics.platforms.active}`,
      ``,
      `# HELP contentsync_content_original Original content count`,
      `# TYPE contentsync_content_original gauge`,
      `contentsync_content_original ${metrics.content.original}`,
      ``,
      `# HELP contentsync_content_generated Generated content count`,
      `# TYPE contentsync_content_generated gauge`,
      `contentsync_content_generated ${metrics.content.generated}`,
      ``,
      `# HELP contentsync_memory_usage_bytes Memory usage in bytes`,
      `# TYPE contentsync_memory_usage_bytes gauge`,
      `contentsync_memory_usage_bytes ${systemMetrics.memory.heapUsed * 1024 * 1024}`,
      ``,
      `# HELP contentsync_uptime_seconds Process uptime in seconds`,
      `# TYPE contentsync_uptime_seconds gauge`,
      `contentsync_uptime_seconds ${process.uptime()}`,
    ]

    return prometheusMetrics.join('\n')
  } catch (error) {
    Logger.error('Failed to generate Prometheus metrics', error as Error)
    return '# Error generating metrics\n'
  }
}
