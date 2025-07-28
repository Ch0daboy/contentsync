import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SecurityMiddleware, sanitizeContent } from '@/lib/security'
import { CacheManager } from '@/lib/cache'
import { DatabaseOptimizer } from '@/lib/database-optimization'
import { PerformanceMonitor } from '@/lib/performance'
import { Logger } from '@/lib/logger'
import { asyncHandler } from '@/lib/errors'
import { env } from '@/lib/env'
import { z } from 'zod'

const updateContentSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(['SEEN', 'SAVED', 'DISCARDED']),
  content: z.string().max(50000).optional(),
  title: z.string().max(500).optional(),
})

// Rate limiting for content endpoints
const rateLimiter = SecurityMiddleware.rateLimit({
  max: parseInt(env.RATE_LIMIT_MAX),
  windowMs: parseInt(env.RATE_LIMIT_WINDOW),
  keyGenerator: (request) => `content:${SecurityMiddleware.getClientIP(request)}`
})

export const GET = asyncHandler(async (request: NextRequest) => {
  // Apply rate limiting
  const rateLimitResponse = await rateLimiter(request)
  if (rateLimitResponse) return rateLimitResponse

  // Require authentication
  const authResult = await SecurityMiddleware.requireAuth(request)
  if (authResult instanceof NextResponse) return authResult
  const { session } = authResult

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') // 'original' or 'generated'
  const status = searchParams.get('status')
  const platformId = searchParams.get('platformId')
  const cursor = searchParams.get('cursor') || undefined
  const take = parseInt(searchParams.get('take') || '20')
  const search = searchParams.get('search') || undefined

  // Validate query parameters
  if (status && !['UNSEEN', 'SEEN', 'SAVED', 'DISCARDED', 'PUBLISHED'].includes(status)) {
    const response = NextResponse.json({ error: 'Invalid status parameter' }, { status: 400 })
    return SecurityMiddleware.addSecurityHeaders(response)
  }

  Logger.userAction(session.user.id, 'content-list-requested', {
    type,
    status,
    platformId,
    search
  })

  // Use optimized database query with caching
  const content = await PerformanceMonitor.monitorDatabaseQuery(
    'getContentWithFilters',
    () => DatabaseOptimizer.getContentWithFilters(session.user.id, {
      type: type as 'original' | 'generated',
      status,
      platformId: platformId || undefined,
      cursor,
      take,
      search
    })
  )

  const response = NextResponse.json({
    content,
    pagination: {
      hasMore: content.length === take,
      nextCursor: content.length > 0 ? content[content.length - 1].id : null
    },
    filters: {
      type,
      status,
      platformId,
      search
    }
  })

  return SecurityMiddleware.addSecurityHeaders(response)
})

export const PATCH = asyncHandler(async (request: NextRequest) => {
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
  const { id, status, content, title } = updateContentSchema.parse(body)

  // Sanitize input
  const sanitizedContent = content ? sanitizeContent(content) : undefined
  const sanitizedTitle = title ? sanitizeContent(title) : undefined

  Logger.userAction(session.user.id, 'content-update-requested', {
    contentId: id,
    status,
    hasContent: !!sanitizedContent,
    hasTitle: !!sanitizedTitle
  })

  // Update generated content with performance monitoring
  const updated = await PerformanceMonitor.monitorDatabaseQuery(
    'updateGeneratedContent',
    () => prisma.generatedContent.updateMany({
      where: {
        id,
        userId: session.user.id
      },
      data: {
        status,
        ...(sanitizedContent && { content: sanitizedContent }),
        ...(sanitizedTitle && { title: sanitizedTitle }),
        updatedAt: new Date()
      }
    })
  )

  if (updated.count === 0) {
    const response = NextResponse.json(
      { error: 'Content not found' },
      { status: 404 }
    )
    return SecurityMiddleware.addSecurityHeaders(response)
  }

  // Invalidate user's content cache
  await CacheManager.invalidateContentList(session.user.id)

  Logger.userAction(session.user.id, 'content-updated', {
    contentId: id,
    status,
    updatedFields: {
      content: !!sanitizedContent,
      title: !!sanitizedTitle
    }
  })

  const response = NextResponse.json({ success: true })
  return SecurityMiddleware.addSecurityHeaders(response)
})