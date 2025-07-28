import { SecurityMiddleware, sanitizeContent, validationSchemas } from '@/lib/security'
import { NextRequest } from 'next/server'

describe('SecurityMiddleware', () => {
  describe('getClientIP', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      })

      const ip = SecurityMiddleware.getClientIP(request)
      expect(ip).toBe('192.168.1.1')
    })

    it('should extract IP from x-real-ip header', () => {
      const request = new NextRequest('http://localhost:3000', {
        headers: {
          'x-real-ip': '192.168.1.2',
        },
      })

      const ip = SecurityMiddleware.getClientIP(request)
      expect(ip).toBe('192.168.1.2')
    })

    it('should return unknown when no IP headers present', () => {
      const request = new NextRequest('http://localhost:3000')

      const ip = SecurityMiddleware.getClientIP(request)
      expect(ip).toBe('unknown')
    })
  })

  describe('generateCSRFToken', () => {
    it('should generate a valid CSRF token', () => {
      const token = SecurityMiddleware.generateCSRFToken()
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(32)
      expect(/^[a-zA-Z0-9+/=]+$/.test(token)).toBe(true)
    })

    it('should generate unique tokens', () => {
      const token1 = SecurityMiddleware.generateCSRFToken()
      const token2 = SecurityMiddleware.generateCSRFToken()
      
      expect(token1).not.toBe(token2)
    })
  })

  describe('verifyWebhookSignature', () => {
    it('should verify valid webhook signature', async () => {
      const secret = 'test-secret'
      const body = JSON.stringify({ test: 'data' })
      const crypto = require('crypto')
      const signature = crypto.createHmac('sha256', secret).update(body).digest('hex')

      const request = new NextRequest('http://localhost:3000', {
        method: 'POST',
        headers: {
          'x-signature-256': `sha256=${signature}`,
          'content-type': 'application/json',
        },
        body,
      })

      const isValid = await SecurityMiddleware.verifyWebhookSignature(request, secret)
      expect(isValid).toBe(true)
    })

    it('should reject invalid webhook signature', async () => {
      const secret = 'test-secret'
      const body = JSON.stringify({ test: 'data' })

      const request = new NextRequest('http://localhost:3000', {
        method: 'POST',
        headers: {
          'x-signature-256': 'sha256=invalid-signature',
          'content-type': 'application/json',
        },
        body,
      })

      const isValid = await SecurityMiddleware.verifyWebhookSignature(request, secret)
      expect(isValid).toBe(false)
    })
  })
})

describe('sanitizeContent', () => {
  it('should remove script tags', () => {
    const input = 'Hello <script>alert("xss")</script> World'
    const output = sanitizeContent(input)
    expect(output).toBe('Hello  World')
  })

  it('should remove iframe tags', () => {
    const input = 'Content <iframe src="evil.com"></iframe> here'
    const output = sanitizeContent(input)
    expect(output).toBe('Content  here')
  })

  it('should remove event handlers', () => {
    const input = '<div onclick="alert(1)">Click me</div>'
    const output = sanitizeContent(input)
    expect(output).toBe('<div >Click me</div>')
  })

  it('should remove javascript: URLs', () => {
    const input = '<a href="javascript:alert(1)">Link</a>'
    const output = sanitizeContent(input)
    expect(output).toBe('<a href="">Link</a>')
  })

  it('should preserve safe content', () => {
    const input = '<p>This is <strong>safe</strong> content</p>'
    const output = sanitizeContent(input)
    expect(output).toBe('<p>This is <strong>safe</strong> content</p>')
  })

  it('should handle empty input', () => {
    const output = sanitizeContent('')
    expect(output).toBe('')
  })
})

describe('validationSchemas', () => {
  describe('platform validation', () => {
    it('should validate platform name', () => {
      expect(validationSchemas.platform.name('Valid Name')).toBe(true)
      expect(validationSchemas.platform.name('')).toBe(false)
      expect(validationSchemas.platform.name('a'.repeat(101))).toBe(false)
    })

    it('should validate platform URL', () => {
      expect(validationSchemas.platform.url('https://example.com')).toBe(true)
      expect(validationSchemas.platform.url('http://localhost:3000')).toBe(true)
      expect(validationSchemas.platform.url('invalid-url')).toBe(false)
      expect(validationSchemas.platform.url('')).toBe(false)
    })
  })

  describe('content validation', () => {
    it('should validate content title', () => {
      expect(validationSchemas.content.title('Valid Title')).toBe(true)
      expect(validationSchemas.content.title('')).toBe(false)
      expect(validationSchemas.content.title('a'.repeat(501))).toBe(false)
    })

    it('should validate content body', () => {
      expect(validationSchemas.content.content('Valid content')).toBe(true)
      expect(validationSchemas.content.content('')).toBe(false)
      expect(validationSchemas.content.content('a'.repeat(50001))).toBe(false)
    })

    it('should validate content status', () => {
      expect(validationSchemas.content.status('SEEN')).toBe(true)
      expect(validationSchemas.content.status('SAVED')).toBe(true)
      expect(validationSchemas.content.status('DISCARDED')).toBe(true)
      expect(validationSchemas.content.status('PUBLISHED')).toBe(true)
      expect(validationSchemas.content.status('INVALID')).toBe(false)
    })
  })
})
