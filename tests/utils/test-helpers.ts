import { Page } from '@playwright/test'
import { PrismaClient } from '@prisma/client'

// Test database utilities
export class TestDatabase {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
        },
      },
    })
  }

  async cleanup() {
    // Clean up test data in reverse order of dependencies
    await this.prisma.generatedContent.deleteMany()
    await this.prisma.originalContent.deleteMany()
    await this.prisma.platform.deleteMany()
    await this.prisma.userSettings.deleteMany()
    await this.prisma.user.deleteMany()
  }

  async createTestUser(data: {
    email: string
    password: string
    name?: string
  }) {
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(data.password, 10)

    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name || 'Test User',
      },
    })
  }

  async createTestPlatform(userId: string, data: {
    name: string
    url: string
    type?: string
  }) {
    return this.prisma.platform.create({
      data: {
        userId,
        name: data.name,
        url: data.url,
        type: data.type || 'BLOG_RSS',
        metadata: {},
      },
    })
  }

  async createTestContent(userId: string, platformId: string, data: {
    title: string
    content: string
    contentUrl: string
  }) {
    const crypto = require('crypto')
    const contentHash = crypto.createHash('md5').update(data.title + data.contentUrl).digest('hex')

    return this.prisma.originalContent.create({
      data: {
        userId,
        platformId,
        title: data.title,
        content: data.content,
        contentUrl: data.contentUrl,
        contentHash,
        publishedAt: new Date(),
      },
    })
  }

  async disconnect() {
    await this.prisma.$disconnect()
  }
}

// Authentication helpers for E2E tests
export class AuthHelper {
  static async login(page: Page, email: string, password: string) {
    await page.goto('/login')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    await page.click('button[type="submit"]')
    
    // Wait for redirect to dashboard
    await page.waitForURL(/.*\/dashboard/, { timeout: 10000 })
  }

  static async register(page: Page, userData: {
    name: string
    email: string
    password: string
  }) {
    await page.goto('/register')
    await page.fill('input[name="name"]', userData.name)
    await page.fill('input[type="email"]', userData.email)
    await page.fill('input[type="password"]', userData.password)
    await page.click('button[type="submit"]')
    
    // Wait for redirect
    await page.waitForURL(/.*\/(login|dashboard)/, { timeout: 10000 })
  }

  static async logout(page: Page) {
    // Look for logout button/link and click it
    await page.click('[data-testid="logout-button"], button:has-text("Logout"), a:has-text("Sign out")')
    
    // Wait for redirect to login
    await page.waitForURL(/.*\/login/, { timeout: 10000 })
  }
}

// API testing helpers
export class APIHelper {
  static async makeAuthenticatedRequest(
    page: Page,
    method: string,
    url: string,
    data?: any
  ) {
    // Get CSRF token from the page
    const csrfToken = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="csrf-token"]')
      return meta?.getAttribute('content') || 'test-csrf-token'
    })

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    }

    const options: RequestInit = {
      method,
      headers,
      credentials: 'include', // Include cookies for session
    }

    if (data) {
      options.body = JSON.stringify(data)
    }

    return fetch(url, options)
  }

  static generateWebhookSignature(payload: string, secret: string): string {
    const crypto = require('crypto')
    return crypto.createHmac('sha256', secret).update(payload).digest('hex')
  }
}

// Mock data generators
export class MockDataGenerator {
  static generateUser(overrides: Partial<{
    email: string
    name: string
    password: string
  }> = {}) {
    const timestamp = Date.now()
    return {
      email: `test${timestamp}@example.com`,
      name: 'Test User',
      password: 'password123',
      ...overrides,
    }
  }

  static generatePlatform(overrides: Partial<{
    name: string
    url: string
    type: string
  }> = {}) {
    const timestamp = Date.now()
    return {
      name: `Test Platform ${timestamp}`,
      url: `https://example${timestamp}.com/rss`,
      type: 'BLOG_RSS',
      ...overrides,
    }
  }

  static generateContent(overrides: Partial<{
    title: string
    content: string
    contentUrl: string
  }> = {}) {
    const timestamp = Date.now()
    return {
      title: `Test Content ${timestamp}`,
      content: `This is test content created at ${timestamp}`,
      contentUrl: `https://example.com/content/${timestamp}`,
      ...overrides,
    }
  }

  static generateWebhookPayload(platform: string, event: string, data: any = {}) {
    return {
      platform,
      event,
      data: {
        timestamp: Date.now(),
        ...data,
      },
    }
  }
}

// Performance testing helpers
export class PerformanceHelper {
  static async measurePageLoad(page: Page, url: string) {
    const startTime = Date.now()
    await page.goto(url)
    await page.waitForLoadState('networkidle')
    const endTime = Date.now()
    
    return endTime - startTime
  }

  static async measureAPIResponse(url: string, options: RequestInit = {}) {
    const startTime = Date.now()
    const response = await fetch(url, options)
    const endTime = Date.now()
    
    return {
      responseTime: endTime - startTime,
      status: response.status,
      response,
    }
  }
}

// Screenshot helpers for visual testing
export class VisualHelper {
  static async takeScreenshot(page: Page, name: string) {
    await page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    })
  }

  static async compareScreenshot(page: Page, name: string) {
    await page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    })
    
    // In a real implementation, you would compare with a baseline image
    // For now, just take the screenshot
  }
}

// Environment setup helpers
export class TestEnvironment {
  static async setup() {
    // Set up test environment
    process.env.NODE_ENV = 'test'
    process.env.NEXTAUTH_SECRET = 'test-secret-for-testing-only'
    process.env.CRON_SECRET = 'test-cron-secret-for-testing-only'
  }

  static async teardown() {
    // Clean up test environment
    const testDb = new TestDatabase()
    await testDb.cleanup()
    await testDb.disconnect()
  }
}
