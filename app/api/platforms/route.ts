import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { contentScraper } from '@/lib/scrapers'
import { SecurityMiddleware, sanitizeContent } from '@/lib/security'
import { CacheManager } from '@/lib/cache'
import { DatabaseOptimizer } from '@/lib/database-optimization'
import { PerformanceMonitor, withPerformanceMonitoring } from '@/lib/performance'
import { Logger } from '@/lib/logger'
import { asyncHandler } from '@/lib/errors'
import { env } from '@/lib/env'
import { z } from 'zod'

const addPlatformSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
})

// Rate limiting for platform endpoints
const rateLimiter = SecurityMiddleware.rateLimit({
  max: parseInt(env.RATE_LIMIT_MAX),
  windowMs: parseInt(env.RATE_LIMIT_WINDOW),
  keyGenerator: (request) => `platforms:${SecurityMiddleware.getClientIP(request)}`
})

export const GET = asyncHandler(async (request: NextRequest) => {
  // Apply rate limiting
  const rateLimitResponse = await rateLimiter(request)
  if (rateLimitResponse) return rateLimitResponse

  // Require authentication
  const authResult = await SecurityMiddleware.requireAuth(request)
  if (authResult instanceof NextResponse) return authResult
  const { session } = authResult

  // Parse query parameters for pagination and filtering
  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor') || undefined
  const take = parseInt(searchParams.get('take') || '20')
  const includeContent = searchParams.get('includeContent') === 'true'

  Logger.userAction(session.user.id, 'platforms-list-requested', {
    cursor,
    take,
    includeContent
  })

  // Use optimized database query with caching
  const platforms = await PerformanceMonitor.monitorDatabaseQuery(
    'getUserPlatforms',
    () => DatabaseOptimizer.getUserPlatforms(session.user.id, {
      cursor,
      take,
      includeContent
    })
  )

  const response = NextResponse.json({
    platforms,
    pagination: {
      hasMore: platforms.length === take,
      nextCursor: platforms.length > 0 ? platforms[platforms.length - 1].id : null
    }
  })

  return SecurityMiddleware.addSecurityHeaders(response)
})

export const POST = asyncHandler(async (request: NextRequest) => {
  // Apply rate limiting
  const rateLimitResponse = await rateLimiter(request)
  if (rateLimitResponse) return rateLimitResponse

  // Require authentication
  const authResult = await SecurityMiddleware.requireAuth(request)
  if (authResult instanceof NextResponse) return authResult
  const { session } = authResult

  // Validate CSRF token
  const csrfResult = await SecurityMiddleware.validateCSRF(request)
  if (csrfResult) return csrfResult

  const body = await request.json()
  const { name, url } = addPlatformSchema.parse(body)

  // Sanitize input
  const sanitizedName = sanitizeContent(name)

  Logger.userAction(session.user.id, 'platform-create-requested', {
    name: sanitizedName,
    url
  })

    // Detect platform type
    const platformType = await contentScraper.detectPlatformType(url)

    // Check if platform already exists
    const existingPlatform = await prisma.platform.findUnique({
      where: {
        userId_url: {
          userId: session.user.id,
          url: url
        }
      }
    })

    if (existingPlatform) {
      return NextResponse.json(
        { error: 'Platform already added' },
        { status: 400 }
      )
    }

  // Create platform with performance monitoring
  const platform = await PerformanceMonitor.monitorDatabaseQuery(
    'createPlatform',
    () => prisma.platform.create({
      data: {
        userId: session.user.id,
        name: sanitizedName,
        url,
        type: platformType as any,
        metadata: {}
      }
    })
  )

  // Invalidate user's platform cache
  await CacheManager.invalidateUserData(session.user.id)

  // Trigger initial content scraping
  const { contentMonitorQueue } = await import('@/lib/queue')
  await contentMonitorQueue.add('monitor-platform', {
    platformId: platform.id
  })

  Logger.userAction(session.user.id, 'platform-created', {
    platformId: platform.id,
    platformType: platformType
  })

  const response = NextResponse.json(platform, { status: 201 })
  return SecurityMiddleware.addSecurityHeaders(response)
})

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const platformId = searchParams.get('id')

    if (!platformId) {
      return NextResponse.json(
        { error: 'Platform ID required' },
        { status: 400 }
      )
    }

    // Verify ownership and delete
    const deleted = await prisma.platform.deleteMany({
      where: {
        id: platformId,
        userId: session.user.id
      }
    })

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Platform not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete platform error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}