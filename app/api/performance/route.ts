import { NextRequest, NextResponse } from 'next/server'
import { SecurityMiddleware } from '@/lib/security'
import { PerformanceMonitor } from '@/lib/performance'
import { CacheManager } from '@/lib/cache'
import { DatabaseOptimizer } from '@/lib/database-optimization'
import { Logger } from '@/lib/logger'
import { env } from '@/lib/env'

export async function GET(request: NextRequest) {
  try {
    // Verify authorization for performance endpoint
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
      Logger.security('Unauthorized performance endpoint access', { 
        ip: SecurityMiddleware.getClientIP(request),
        userAgent: request.headers.get('user-agent')
      })
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      return SecurityMiddleware.addSecurityHeaders(response)
    }

    Logger.debug('Performance report requested')
    
    // Generate comprehensive performance report
    const [
      performanceReport,
      cacheStats,
      connectionPoolStats,
      eventLoopLag
    ] = await Promise.all([
      PerformanceMonitor.generateReport(),
      CacheManager.getCacheStats(),
      DatabaseOptimizer.getConnectionPoolStats(),
      PerformanceMonitor.measureEventLoopLag()
    ])

    const report = {
      ...performanceReport,
      cache: cacheStats,
      database: {
        connectionPool: connectionPoolStats,
      },
      eventLoop: {
        lag: eventLoopLag
      },
      recommendations: [
        ...performanceReport.recommendations,
        ...(eventLoopLag > 10 ? ['High event loop lag detected. Check for blocking operations.'] : []),
        ...(cacheStats.type === 'memory' ? ['Consider using Redis for production caching.'] : [])
      ]
    }

    Logger.debug('Performance report generated successfully')

    const response = NextResponse.json(report)
    return SecurityMiddleware.addSecurityHeaders(response)

  } catch (error) {
    Logger.error('Performance report generation failed', error as Error)
    
    const errorResponse = {
      error: 'Performance report generation failed',
      timestamp: new Date().toISOString(),
      message: (error as Error).message,
    }

    const response = NextResponse.json(errorResponse, { status: 500 })
    return SecurityMiddleware.addSecurityHeaders(response)
  }
}

// Reset performance metrics (useful for testing)
export async function DELETE(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      return SecurityMiddleware.addSecurityHeaders(response)
    }

    PerformanceMonitor.resetMetrics()
    Logger.info('Performance metrics reset')

    const response = NextResponse.json({ success: true, message: 'Metrics reset' })
    return SecurityMiddleware.addSecurityHeaders(response)

  } catch (error) {
    Logger.error('Failed to reset performance metrics', error as Error)
    
    const response = NextResponse.json(
      { error: 'Failed to reset metrics' },
      { status: 500 }
    )
    return SecurityMiddleware.addSecurityHeaders(response)
  }
}
