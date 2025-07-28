import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Logger } from '@/lib/logger'
import { SecurityMiddleware } from '@/lib/security'

interface ReadinessCheck {
  ready: boolean
  timestamp: string
  checks: {
    database: boolean
    environment: boolean
    migrations: boolean
  }
  details?: any
}

export async function GET(request: NextRequest) {
  try {
    Logger.debug('Readiness check requested')
    
    const checks = {
      database: await checkDatabaseConnection(),
      environment: checkEnvironmentVariables(),
      migrations: await checkDatabaseMigrations(),
    }

    const ready = Object.values(checks).every(check => check === true)

    const readinessCheck: ReadinessCheck = {
      ready,
      timestamp: new Date().toISOString(),
      checks,
    }

    if (!ready) {
      readinessCheck.details = {
        message: 'Service not ready',
        failedChecks: Object.entries(checks)
          .filter(([_, status]) => !status)
          .map(([check, _]) => check)
      }
    }

    Logger.info('Readiness check completed', { ready, checks })

    const statusCode = ready ? 200 : 503
    const response = NextResponse.json(readinessCheck, { status: statusCode })
    return SecurityMiddleware.addSecurityHeaders(response)

  } catch (error) {
    Logger.error('Readiness check failed', error as Error)
    
    const errorResponse: ReadinessCheck = {
      ready: false,
      timestamp: new Date().toISOString(),
      checks: {
        database: false,
        environment: false,
        migrations: false,
      },
      details: {
        error: 'Readiness check failed',
        message: (error as Error).message,
      }
    }

    const response = NextResponse.json(errorResponse, { status: 503 })
    return SecurityMiddleware.addSecurityHeaders(response)
  }
}

async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    Logger.error('Database connection check failed', error as Error)
    return false
  }
}

function checkEnvironmentVariables(): boolean {
  const requiredVars = [
    'DATABASE_URL',
    'REDIS_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'GEMINI_API_KEY',
    'CRON_SECRET',
  ]

  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    Logger.warn('Missing environment variables', { missingVars })
    return false
  }

  return true
}

async function checkDatabaseMigrations(): Promise<boolean> {
  try {
    // Check if we can query the main tables
    await prisma.user.findFirst()
    await prisma.platform.findFirst()
    return true
  } catch (error) {
    Logger.error('Database migration check failed', error as Error)
    return false
  }
}
