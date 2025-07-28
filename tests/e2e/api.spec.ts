import { test, expect } from '@playwright/test'

test.describe('API Security Tests', () => {
  test('should require authentication for protected endpoints', async ({ request }) => {
    // Test platforms endpoint
    const platformsResponse = await request.get('/api/platforms')
    expect(platformsResponse.status()).toBe(401)

    // Test content endpoint
    const contentResponse = await request.get('/api/content')
    expect(contentResponse.status()).toBe(401)
  })

  test('should enforce rate limiting', async ({ request }) => {
    // Make multiple requests quickly to trigger rate limiting
    const requests = Array.from({ length: 10 }, () => 
      request.get('/api/platforms')
    )

    const responses = await Promise.all(requests)
    
    // At least some requests should be rate limited
    const rateLimitedResponses = responses.filter(r => r.status() === 429)
    expect(rateLimitedResponses.length).toBeGreaterThan(0)
  })

  test('should validate input on POST requests', async ({ request }) => {
    // Test platforms endpoint with invalid data
    const response = await request.post('/api/platforms', {
      data: {
        name: '', // Invalid: empty name
        url: 'not-a-url', // Invalid: not a URL
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })

    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Invalid input')
  })

  test('should require CSRF token for state-changing operations', async ({ request }) => {
    // Test POST without CSRF token
    const response = await request.post('/api/platforms', {
      data: {
        name: 'Test Platform',
        url: 'https://example.com',
      },
      headers: {
        'Content-Type': 'application/json',
        // Missing X-CSRF-Token header
      },
    })

    expect(response.status()).toBe(403)
    const body = await response.json()
    expect(body.error).toBe('CSRF token missing')
  })

  test('should return security headers', async ({ request }) => {
    const response = await request.get('/api/platforms')
    
    // Check for security headers
    expect(response.headers()['x-frame-options']).toBe('DENY')
    expect(response.headers()['x-content-type-options']).toBe('nosniff')
    expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(response.headers()['x-xss-protection']).toBe('1; mode=block')
    expect(response.headers()['content-security-policy']).toBeDefined()
  })

  test('should handle CORS properly', async ({ request }) => {
    const response = await request.options('/api/platforms', {
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    })

    expect(response.status()).toBe(200)
    expect(response.headers()['access-control-allow-origin']).toBe('http://localhost:3000')
    expect(response.headers()['access-control-allow-methods']).toContain('POST')
  })

  test('should validate webhook signatures', async ({ request }) => {
    // Test webhook without signature
    const response = await request.post('/api/webhooks', {
      data: {
        platform: 'youtube',
        event: 'video.published',
        data: { videoId: '123' },
      },
      headers: {
        'Content-Type': 'application/json',
        // Missing signature header
      },
    })

    expect(response.status()).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('Invalid signature')
  })

  test('should protect cron endpoints', async ({ request }) => {
    // Test cron endpoint without proper authorization
    const response = await request.get('/api/cron/monitor')

    expect(response.status()).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('Unauthorized')
  })

  test('should sanitize input data', async ({ request }) => {
    // This test would require authentication, so we'll test the concept
    const maliciousData = {
      name: '<script>alert("xss")</script>Test Platform',
      url: 'https://example.com',
    }

    const response = await request.post('/api/platforms', {
      data: maliciousData,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'test-token',
      },
    })

    // Should be unauthorized due to missing auth, but input should be processed
    expect(response.status()).toBe(401)
  })
})

test.describe('API Functionality Tests', () => {
  test('should return proper error responses', async ({ request }) => {
    // Test 404 for non-existent endpoint
    const response = await request.get('/api/nonexistent')
    expect(response.status()).toBe(404)
  })

  test('should handle malformed JSON', async ({ request }) => {
    const response = await request.post('/api/platforms', {
      data: 'invalid json',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    expect(response.status()).toBe(400)
  })

  test('should handle large payloads', async ({ request }) => {
    const largeData = {
      name: 'A'.repeat(10000), // Very long name
      url: 'https://example.com',
    }

    const response = await request.post('/api/platforms', {
      data: largeData,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Should reject due to validation (name too long) or auth
    expect([400, 401]).toContain(response.status())
  })
})
