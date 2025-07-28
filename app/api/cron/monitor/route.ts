import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { contentScraper } from '@/lib/scrapers'
import { aiGenerator } from '@/lib/ai/gemini'
import { SecurityMiddleware, sanitizeContent } from '@/lib/security'
import { Logger, measurePerformance } from '@/lib/logger'
import { asyncHandler, handleDatabaseError, handleExternalServiceError } from '@/lib/errors'
import { env } from '@/lib/env'

export const GET = asyncHandler(async (request: NextRequest) => {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    Logger.security('Unauthorized cron access attempt', {
      ip: SecurityMiddleware.getClientIP(request),
      userAgent: request.headers.get('user-agent')
    })
    const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return SecurityMiddleware.addSecurityHeaders(response)
  }

  return await measurePerformance('content-monitoring-job', async () => {
    Logger.job('content-monitoring', 'started')
    Logger.info('Starting content monitoring job...')

    // Get all active platforms that need checking
    const platforms = await prisma.platform.findMany({
      where: {
        isActive: true,
        OR: [
          { lastChecked: null },
          {
            lastChecked: {
              lt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
            }
          }
        ]
      },
      include: {
        user: {
          include: {
            settings: true
          }
        }
      }
    })

    console.log(`Found ${platforms.length} platforms to monitor`)

    let totalNewContent = 0

    for (const platform of platforms) {
      try {
        console.log(`Monitoring platform: ${platform.name} (${platform.type})`)

        let scrapedContent: any[] = []

        // Scrape content based on platform type
        switch (platform.type) {
          case 'YOUTUBE':
            scrapedContent = await contentScraper.scrapeYouTubeChannel(platform.url)
            break
          case 'BLOG_RSS':
            scrapedContent = await contentScraper.scrapeBlogRSS(platform.url)
            break
          default:
            scrapedContent = await contentScraper.scrapeWebPage(platform.url)
        }

        console.log(`Found ${scrapedContent.length} items for ${platform.name}`)

        // Process each piece of content
        for (const content of scrapedContent) {
          try {
            // Check if content already exists
            const existing = await prisma.originalContent.findUnique({
              where: { contentHash: content.contentHash }
            })

            if (existing) {
              continue // Skip duplicate content
            }

            // Save original content
            const originalContent = await prisma.originalContent.create({
              data: {
                userId: platform.userId,
                platformId: platform.id,
                title: content.title,
                description: content.description,
                content: content.content,
                contentUrl: content.contentUrl,
                imageUrl: content.imageUrl,
                publishedAt: content.publishedAt,
                contentHash: content.contentHash
              }
            })

            totalNewContent++

            // Generate AI adaptations if user has auto-generation enabled
            const userSettings = platform.user.settings
            if (userSettings?.autoGenerateContent) {
              try {
                const adaptations = await aiGenerator.generateAdaptations({
                  title: content.title,
                  description: content.description,
                  content: content.content,
                  platform: platform.type
                })

                // Save generated adaptations
                for (const adaptation of adaptations) {
                  await prisma.generatedContent.create({
                    data: {
                      userId: platform.userId,
                      originalContentId: originalContent.id,
                      targetPlatform: adaptation.targetPlatform as any,
                      title: adaptation.title,
                      content: adaptation.content,
                      hashtags: adaptation.hashtags,
                      status: 'UNSEEN'
                    }
                  })
                }

                console.log(`Generated ${adaptations.length} adaptations for: ${content.title}`)
              } catch (aiError) {
                console.error('AI generation error:', aiError)
                // Continue processing even if AI fails
              }
            }
          } catch (contentError) {
            console.error('Content processing error:', contentError)
            // Continue with next content item
          }
        }

        // Update platform last checked timestamp
        await prisma.platform.update({
          where: { id: platform.id },
          data: { lastChecked: new Date() }
        })

      } catch (platformError) {
        console.error(`Platform monitoring error for ${platform.name}:`, platformError)
        // Continue with next platform
      }
    }

    console.log(`Content monitoring completed. Found ${totalNewContent} new items.`)

    return NextResponse.json({
      success: true,
      platformsChecked: platforms.length,
      newContentFound: totalNewContent
    })

  } catch (error) {
    console.error('Monitoring job error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}