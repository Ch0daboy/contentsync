import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { env } from './env'
import crypto from 'crypto'

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitOptions {
  max: number
  windowMs: number
  keyGenerator?: (request: NextRequest) => string
}

export class SecurityMiddleware {
  // Rate limiting middleware
  static rateLimit(options: RateLimitOptions) {
    return async (request: NextRequest) => {
      const key = options.keyGenerator ? options.keyGenerator(request) : this.getClientIP(request)
      const now = Date.now()
      
      const record = rateLimitStore.get(key)
      
      if (!record || now > record.resetTime) {
        rateLimitStore.set(key, {
          count: 1,
          resetTime: now + options.windowMs
        })
        return null // No rate limit hit
      }
      
      if (record.count >= options.max) {
        return NextResponse.json(
          { 
            error: 'Too many requests',
            retryAfter: Math.ceil((record.resetTime - now) / 1000)
          },
          { 
            status: 429,
            headers: {
              'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString(),
              'X-RateLimit-Limit': options.max.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
            }
          }
        )
      }
      
      record.count++
      return null // No rate limit hit
    }
  }

  // Authentication middleware
  static async requireAuth(request: NextRequest) {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    return { session }
  }

  // CSRF protection
  static async validateCSRF(request: NextRequest) {
    if (request.method === 'GET' || request.method === 'HEAD') {
      return null // Skip CSRF for safe methods
    }

    const token = request.headers.get('x-csrf-token') || 
                  request.headers.get('x-xsrf-token')
    
    if (!token) {
      return NextResponse.json(
        { error: 'CSRF token missing' },
        { status: 403 }
      )
    }

    // In production, validate against session-stored token
    // For now, basic validation
    if (!this.isValidCSRFToken(token)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }

    return null
  }

  // Input validation middleware
  static validateInput(schema: any) {
    return async (request: NextRequest) => {
      try {
        const body = await request.json()
        const validated = schema.parse(body)
        return { validatedData: validated }
      } catch (error) {
        return NextResponse.json(
          { 
            error: 'Invalid input',
            details: error instanceof Error ? error.message : 'Validation failed'
          },
          { status: 400 }
        )
      }
    }
  }

  // Webhook signature verification
  static async verifyWebhookSignature(
    request: NextRequest,
    secret: string,
    signatureHeader: string = 'x-signature-256'
  ): Promise<boolean> {
    try {
      const signature = request.headers.get(signatureHeader)
      if (!signature) return false

      const body = await request.text()
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex')

      const providedSignature = signature.replace('sha256=', '')
      
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(providedSignature, 'hex')
      )
    } catch (error) {
      console.error('Webhook signature verification error:', error)
      return false
    }
  }

  // Security headers
  static addSecurityHeaders(response: NextResponse): NextResponse {
    // Content Security Policy
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
    )

    // Other security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    
    // HSTS (only in production)
    if (env.NODE_ENV === 'production') {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      )
    }

    return response
  }

  // CORS handling
  static handleCORS(request: NextRequest, response: NextResponse): NextResponse {
    const origin = request.headers.get('origin')
    const allowedOrigins = env.ALLOWED_ORIGINS?.split(',') || [env.NEXTAUTH_URL]

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }

    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Max-Age', '86400')

    return response
  }

  // Helper methods
  static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')

    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }

    if (realIP) {
      return realIP
    }

    return 'unknown'
  }

  private static isValidCSRFToken(token: string): boolean {
    // Basic validation - in production, implement proper token validation
    return token.length >= 32 && /^[a-zA-Z0-9+/=]+$/.test(token)
  }

  // Generate CSRF token
  static generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('base64')
  }
}

// Content sanitization
export function sanitizeContent(content: string): string {
  // Remove potentially dangerous HTML tags and attributes
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
}

// Input validation schemas
export const validationSchemas = {
  platform: {
    name: (value: string) => value.length >= 1 && value.length <= 100,
    url: (value: string) => {
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    }
  },
  content: {
    title: (value: string) => value.length >= 1 && value.length <= 500,
    content: (value: string) => value.length >= 1 && value.length <= 50000,
    status: (value: string) => ['SEEN', 'SAVED', 'DISCARDED', 'PUBLISHED'].includes(value)
  }
}
