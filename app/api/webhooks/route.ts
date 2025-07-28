import { NextRequest, NextResponse } from 'next/server'
import { SecurityMiddleware, sanitizeContent } from '@/lib/security'
import { env } from '@/lib/env'
import { z } from 'zod'

const webhookSchema = z.object({
  platform: z.enum(['youtube', 'twitter', 'instagram', 'facebook', 'linkedin', 'tiktok']),
  event: z.string().min(1).max(100),
  data: z.record(z.any())
})

// Rate limiting for webhooks
const rateLimiter = SecurityMiddleware.rateLimit({
  max: 50, // Lower limit for webhooks
  windowMs: parseInt(env.RATE_LIMIT_WINDOW),
  keyGenerator: (request) => `webhook:${SecurityMiddleware.getClientIP(request)}`
})

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await rateLimiter(request)
    if (rateLimitResponse) return rateLimitResponse

    const body = await request.json()
    const { platform, event, data } = webhookSchema.parse(body)

    // Verify webhook signature with platform-specific secret
    const webhookSecret = process.env[`${platform.toUpperCase()}_WEBHOOK_SECRET`] || env.CRON_SECRET
    const isValid = await SecurityMiddleware.verifyWebhookSignature(request, webhookSecret)
    if (!isValid) {
      const response = NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      return SecurityMiddleware.addSecurityHeaders(response)
    }

    // Process webhook based on platform and event type
    let result: NextResponse
    switch (platform) {
      case 'youtube':
        result = await handleYouTubeWebhook(event, data)
        break
      case 'twitter':
        result = await handleTwitterWebhook(event, data)
        break
      case 'instagram':
        result = await handleInstagramWebhook(event, data)
        break
      default:
        result = await handleGenericWebhook(platform, event, data)
    }

    return SecurityMiddleware.addSecurityHeaders(result)
  } catch (error) {
    console.error('Webhook processing error:', error)

    if (error instanceof z.ZodError) {
      const response = NextResponse.json(
        { error: 'Invalid webhook payload', details: error.errors },
        { status: 400 }
      )
      return SecurityMiddleware.addSecurityHeaders(response)
    }

    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    return SecurityMiddleware.addSecurityHeaders(response)
  }
}

async function handleYouTubeWebhook(event: string, data: any): Promise<NextResponse> {
  // Sanitize event data
  const sanitizedData = {
    ...data,
    title: data.title ? sanitizeContent(data.title) : undefined,
    description: data.description ? sanitizeContent(data.description) : undefined
  }

  switch (event) {
    case 'video.published':
      console.log('New YouTube video published:', sanitizedData)
      // Trigger content gap analysis
      break
    case 'video.updated':
      console.log('YouTube video updated:', sanitizedData)
      // Update content metadata
      break
    default:
      console.log('Unknown YouTube event:', event)
  }

  return NextResponse.json({ status: 'processed' })
}

async function handleTwitterWebhook(event: string, data: any): Promise<NextResponse> {
  const sanitizedData = {
    ...data,
    text: data.text ? sanitizeContent(data.text) : undefined
  }

  switch (event) {
    case 'tweet.created':
      console.log('New tweet created:', sanitizedData)
      // Trigger content gap analysis
      break
    case 'tweet.updated':
      console.log('Tweet updated:', sanitizedData)
      // Update content metadata
      break
  }

  return NextResponse.json({ status: 'processed' })
}

async function handleInstagramWebhook(event: string, data: any): Promise<NextResponse> {
  const sanitizedData = {
    ...data,
    caption: data.caption ? sanitizeContent(data.caption) : undefined
  }

  switch (event) {
    case 'post.created':
      console.log('New Instagram post:', sanitizedData)
      // Trigger content gap analysis
      break
  }

  return NextResponse.json({ status: 'processed' })
}

async function handleGenericWebhook(platform: string, event: string, data: any): Promise<NextResponse> {
  // Basic sanitization for generic webhooks
  const sanitizedData = Object.keys(data).reduce((acc, key) => {
    if (typeof data[key] === 'string') {
      acc[key] = sanitizeContent(data[key])
    } else {
      acc[key] = data[key]
    }
    return acc
  }, {} as any)

  console.log(`Generic webhook from ${platform}:`, event, sanitizedData)
  // Handle unknown platform webhooks
  return NextResponse.json({ status: 'processed' })
}