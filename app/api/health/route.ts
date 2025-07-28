import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Logger } from '@/lib/logger'
import { SecurityMiddleware } from '@/lib/security'
import Redis from 'ioredis'

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  version: string
  uptime: number
  checks: {
    database: HealthCheckResult
    redis: HealthCheckResult
    external_services: HealthCheckResult
    memory: HealthCheckResult
    disk: HealthCheckResult
  }
}

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded'
  responseTime?: number
  error?: string
  details?: any
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    Logger.info('Health check requested')
    
    const healthCheck: HealthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      checks: {
        database: await checkDatabase(),
        redis: await checkRedis(),
        external_services: await checkExternalServices(),
        memory: checkMemory(),
        disk: await checkDisk(),
      }
    }

    // Determine overall status
    const checkStatuses = Object.values(healthCheck.checks).map(check => check.status)
    
    if (checkStatuses.includes('unhealthy')) {
      healthCheck.status = 'unhealthy'
    } else if (checkStatuses.includes('degraded')) {
      healthCheck.status = 'degraded'
    }

    const responseTime = Date.now() - startTime
    Logger.performance('Health check completed', responseTime, { status: healthCheck.status })

    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503

    const response = NextResponse.json(healthCheck, { status: statusCode })
    return SecurityMiddleware.addSecurityHeaders(response)

  } catch (error) {
    Logger.error('Health check failed', error as Error)
    
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      uptime: process.uptime(),
    }

    const response = NextResponse.json(errorResponse, { status: 503 })
    return SecurityMiddleware.addSecurityHeaders(response)
  }
}

async function checkDatabase(): Promise<HealthCheckResult> {
  const start = Date.now()
  
  try {
    // Simple query to check database connectivity
    await prisma.$queryRaw`SELECT 1`
    
    const responseTime = Date.now() - start
    
    return {
      status: responseTime < 1000 ? 'healthy' : 'degraded',
      responseTime,
      details: {
        connected: true,
        responseTime,
      }
    }
  } catch (error) {
    Logger.error('Database health check failed', error as Error)
    
    return {
      status: 'unhealthy',
      responseTime: Date.now() - start,
      error: (error as Error).message,
      details: {
        connected: false,
      }
    }
  }
}

async function checkRedis(): Promise<HealthCheckResult> {
  const start = Date.now()
  
  try {
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
    
    // Simple ping to check Redis connectivity
    const pong = await redis.ping()
    await redis.disconnect()
    
    const responseTime = Date.now() - start
    
    return {
      status: pong === 'PONG' && responseTime < 1000 ? 'healthy' : 'degraded',
      responseTime,
      details: {
        connected: pong === 'PONG',
        responseTime,
      }
    }
  } catch (error) {
    Logger.error('Redis health check failed', error as Error)
    
    return {
      status: 'unhealthy',
      responseTime: Date.now() - start,
      error: (error as Error).message,
      details: {
        connected: false,
      }
    }
  }
}

async function checkExternalServices(): Promise<HealthCheckResult> {
  const start = Date.now()
  const services = []
  
  try {
    // Check Gemini AI API
    if (process.env.GEMINI_API_KEY) {
      try {
        // Simple check - just verify the API key format
        const isValidKey = process.env.GEMINI_API_KEY.length > 10
        services.push({
          name: 'Gemini AI',
          status: isValidKey ? 'healthy' : 'unhealthy',
          details: { configured: isValidKey }
        })
      } catch (error) {
        services.push({
          name: 'Gemini AI',
          status: 'unhealthy',
          error: (error as Error).message
        })
      }
    }

    const responseTime = Date.now() - start
    const unhealthyServices = services.filter(s => s.status === 'unhealthy')
    
    return {
      status: unhealthyServices.length === 0 ? 'healthy' : 
              unhealthyServices.length < services.length ? 'degraded' : 'unhealthy',
      responseTime,
      details: {
        services,
        total: services.length,
        healthy: services.filter(s => s.status === 'healthy').length,
        unhealthy: unhealthyServices.length,
      }
    }
  } catch (error) {
    Logger.error('External services health check failed', error as Error)
    
    return {
      status: 'unhealthy',
      responseTime: Date.now() - start,
      error: (error as Error).message,
    }
  }
}

function checkMemory(): HealthCheckResult {
  try {
    const memUsage = process.memoryUsage()
    const totalMemory = memUsage.heapTotal
    const usedMemory = memUsage.heapUsed
    const memoryUsagePercent = (usedMemory / totalMemory) * 100
    
    const status = memoryUsagePercent < 80 ? 'healthy' : 
                   memoryUsagePercent < 95 ? 'degraded' : 'unhealthy'
    
    return {
      status,
      details: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024), // MB
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
        usagePercent: Math.round(memoryUsagePercent),
      }
    }
  } catch (error) {
    Logger.error('Memory health check failed', error as Error)
    
    return {
      status: 'unhealthy',
      error: (error as Error).message,
    }
  }
}

async function checkDisk(): Promise<HealthCheckResult> {
  try {
    // For Node.js, we can check if we can write to the logs directory
    const fs = require('fs').promises
    const path = require('path')
    
    const testFile = path.join(process.cwd(), 'logs', '.health-check')
    
    try {
      await fs.mkdir(path.dirname(testFile), { recursive: true })
      await fs.writeFile(testFile, 'health-check')
      await fs.unlink(testFile)
      
      return {
        status: 'healthy',
        details: {
          writable: true,
          path: path.dirname(testFile),
        }
      }
    } catch (writeError) {
      return {
        status: 'degraded',
        error: 'Cannot write to logs directory',
        details: {
          writable: false,
          path: path.dirname(testFile),
        }
      }
    }
  } catch (error) {
    Logger.error('Disk health check failed', error as Error)
    
    return {
      status: 'unhealthy',
      error: (error as Error).message,
    }
  }
}
