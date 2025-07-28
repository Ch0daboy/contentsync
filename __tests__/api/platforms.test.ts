import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/platforms/route'
import { getServerSession } from 'next-auth'

// Mock dependencies
jest.mock('next-auth')
jest.mock('@/lib/db', () => ({
  prisma: {
    platform: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}))
jest.mock('@/lib/scrapers', () => ({
  contentScraper: {
    detectPlatformType: jest.fn(),
  },
}))
jest.mock('@/lib/queue', () => ({
  contentMonitorQueue: {
    add: jest.fn(),
  },
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
const mockPrisma = require('@/lib/db').prisma
const mockContentScraper = require('@/lib/scrapers').contentScraper

describe('/api/platforms', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/platforms', () => {
    it('should return platforms for authenticated user', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      }
      mockGetServerSession.mockResolvedValue(mockSession)

      const mockPlatforms = [
        {
          id: 'platform-1',
          name: 'Test Platform',
          url: 'https://example.com',
          type: 'BLOG_RSS',
          _count: { originalContent: 5 },
        },
      ]
      mockPrisma.platform.findMany.mockResolvedValue(mockPlatforms)

      const request = new NextRequest('http://localhost:3000/api/platforms')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockPlatforms)
      expect(mockPrisma.platform.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        include: {
          _count: {
            select: { originalContent: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    })

    it('should return 401 for unauthenticated user', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/platforms')
      const response = await GET(request)

      expect(response.status).toBe(401)
      expect(mockPrisma.platform.findMany).not.toHaveBeenCalled()
    })

    it('should handle database errors', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      }
      mockGetServerSession.mockResolvedValue(mockSession)
      mockPrisma.platform.findMany.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/platforms')
      const response = await GET(request)

      expect(response.status).toBe(500)
    })
  })

  describe('POST /api/platforms', () => {
    it('should create platform for authenticated user', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      }
      mockGetServerSession.mockResolvedValue(mockSession)
      mockContentScraper.detectPlatformType.mockResolvedValue('BLOG_RSS')
      mockPrisma.platform.findUnique.mockResolvedValue(null) // Platform doesn't exist

      const mockPlatform = {
        id: 'platform-1',
        name: 'Test Blog',
        url: 'https://example.com/rss',
        type: 'BLOG_RSS',
        userId: 'user-123',
      }
      mockPrisma.platform.create.mockResolvedValue(mockPlatform)

      const request = new NextRequest('http://localhost:3000/api/platforms', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': 'valid-csrf-token',
        },
        body: JSON.stringify({
          name: 'Test Blog',
          url: 'https://example.com/rss',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(mockPlatform)
      expect(mockPrisma.platform.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          name: 'Test Blog',
          url: 'https://example.com/rss',
          type: 'BLOG_RSS',
          metadata: {},
        },
      })
    })

    it('should return 401 for unauthenticated user', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/platforms', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Blog',
          url: 'https://example.com/rss',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
      expect(mockPrisma.platform.create).not.toHaveBeenCalled()
    })

    it('should return 400 for invalid input', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      }
      mockGetServerSession.mockResolvedValue(mockSession)

      const request = new NextRequest('http://localhost:3000/api/platforms', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': 'valid-csrf-token',
        },
        body: JSON.stringify({
          name: '', // Invalid: empty name
          url: 'invalid-url', // Invalid: not a URL
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(mockPrisma.platform.create).not.toHaveBeenCalled()
    })

    it('should return 400 for duplicate platform', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
      }
      mockGetServerSession.mockResolvedValue(mockSession)
      mockContentScraper.detectPlatformType.mockResolvedValue('BLOG_RSS')
      
      // Platform already exists
      mockPrisma.platform.findUnique.mockResolvedValue({
        id: 'existing-platform',
        name: 'Existing Platform',
        url: 'https://example.com/rss',
      })

      const request = new NextRequest('http://localhost:3000/api/platforms', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-csrf-token': 'valid-csrf-token',
        },
        body: JSON.stringify({
          name: 'Test Blog',
          url: 'https://example.com/rss',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      expect(mockPrisma.platform.create).not.toHaveBeenCalled()
    })
  })
})
