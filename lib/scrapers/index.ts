import Parser from 'rss-parser'
import axios from 'axios'
import * as cheerio from 'cheerio'
import crypto from 'crypto'
import { ContentValidator } from '../content-validation'
import { Logger } from '../logger'

export interface ScrapedContent {
  title: string
  description?: string
  content: string
  contentUrl: string
  imageUrl?: string
  publishedAt: Date
  contentHash: string
}

export class ContentScraper {
  private rssParser = new Parser()

  async scrapeYouTubeChannel(channelUrl: string): Promise<ScrapedContent[]> {
    try {
      // Convert channel URL to RSS feed URL
      const rssUrl = this.getYouTubeRSSUrl(channelUrl)
      const feed = await this.rssParser.parseURL(rssUrl)
      
      return feed.items.map(item => ({
        title: item.title || '',
        description: item.contentSnippet || item.content || '',
        content: item.content || item.contentSnippet || '',
        contentUrl: item.link || '',
        imageUrl: this.extractYouTubeThumbnail(item),
        publishedAt: new Date(item.pubDate || Date.now()),
        contentHash: this.generateContentHash(item.title + item.link)
      }))
    } catch (error) {
      console.error('YouTube scraping error:', error)
      return []
    }
  }

  async scrapeBlogRSS(rssUrl: string): Promise<ScrapedContent[]> {
    try {
      const feed = await this.rssParser.parseURL(rssUrl)
      
      return feed.items.map(item => ({
        title: item.title || '',
        description: item.contentSnippet || '',
        content: item.content || item.contentSnippet || '',
        contentUrl: item.link || '',
        imageUrl: this.extractImageFromContent(item.content || ''),
        publishedAt: new Date(item.pubDate || Date.now()),
        contentHash: this.generateContentHash(item.title + item.link)
      }))
    } catch (error) {
      console.error('Blog RSS scraping error:', error)
      return []
    }
  }

  async scrapeWebPage(url: string): Promise<ScrapedContent[]> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      })

      const $ = cheerio.load(response.data)
      
      // Extract basic content
      const title = $('title').text() || $('h1').first().text()
      const description = $('meta[name="description"]').attr('content') || ''
      const content = $('article, .content, .post, main').text().slice(0, 1000)
      const imageUrl = $('meta[property="og:image"]').attr('content') || 
                      $('img').first().attr('src')

      return [{
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        contentUrl: url,
        imageUrl,
        publishedAt: new Date(),
        contentHash: this.generateContentHash(title + url)
      }]
    } catch (error) {
      console.error('Web page scraping error:', error)
      return []
    }
  }

  private getYouTubeRSSUrl(channelUrl: string): string {
    // Extract channel ID from various YouTube URL formats
    const channelIdMatch = channelUrl.match(/channel\/([a-zA-Z0-9_-]+)/)
    const usernameMatch = channelUrl.match(/user\/([a-zA-Z0-9_-]+)/)
    const handleMatch = channelUrl.match(/@([a-zA-Z0-9_-]+)/)
    
    if (channelIdMatch) {
      return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelIdMatch[1]}`
    } else if (usernameMatch) {
      return `https://www.youtube.com/feeds/videos.xml?user=${usernameMatch[1]}`
    } else if (handleMatch) {
      // For @handle format, we'd need to resolve to channel ID
      // For MVP, return a placeholder that will fail gracefully
      return `https://www.youtube.com/feeds/videos.xml?channel_id=${handleMatch[1]}`
    }
    
    throw new Error('Invalid YouTube channel URL format')
  }

  private extractYouTubeThumbnail(item: any): string | undefined {
    // Extract thumbnail from RSS item
    const mediaGroup = item['media:group']
    if (mediaGroup && mediaGroup['media:thumbnail']) {
      return mediaGroup['media:thumbnail'][0]['$'].url
    }
    return undefined
  }

  private extractImageFromContent(content: string): string | undefined {
    const $ = cheerio.load(content)
    return $('img').first().attr('src')
  }

  private generateContentHash(input: string): string {
    return crypto.createHash('md5').update(input).digest('hex')
  }

  async detectPlatformType(url: string): Promise<string> {
    const hostname = new URL(url).hostname.toLowerCase()

    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return 'YOUTUBE'
    } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      return 'TWITTER'
    } else if (hostname.includes('instagram.com')) {
      return 'INSTAGRAM'
    } else if (hostname.includes('linkedin.com')) {
      return 'LINKEDIN'
    } else if (hostname.includes('facebook.com')) {
      return 'FACEBOOK'
    } else if (hostname.includes('tiktok.com')) {
      return 'TIKTOK'
    } else {
      // Try to detect if it's a blog with RSS
      try {
        await this.rssParser.parseURL(url)
        return 'BLOG_RSS'
      } catch {
        return 'MANUAL'
      }
    }
  }

  async validateAndFilterContent(
    content: ScrapedContent[],
    platformType: string
  ): Promise<ScrapedContent[]> {
    Logger.info('Validating scraped content', {
      count: content.length,
      platformType
    })

    const validatedContent: ScrapedContent[] = []

    for (const item of content) {
      try {
        const validationResult = await ContentValidator.validateScrapedContent(
          {
            title: item.title,
            content: item.content,
            contentUrl: item.contentUrl,
            publishedAt: item.publishedAt,
            author: item.description, // Use description as author for now
            metadata: {
              imageUrl: item.imageUrl,
              contentHash: item.contentHash
            }
          },
          platformType.toLowerCase()
        )

        if (validationResult.isValid) {
          // Update the content with validated data
          validatedContent.push({
            ...item,
            title: validationResult.validatedContent.title,
            content: validationResult.validatedContent.content,
            description: validationResult.validatedContent.excerpt || item.description
          })

          Logger.debug('Content validation passed', {
            contentUrl: item.contentUrl,
            quality: validationResult.quality.quality,
            score: validationResult.quality.score
          })
        } else {
          Logger.warn('Content validation failed', {
            contentUrl: item.contentUrl,
            errors: validationResult.errors,
            warnings: validationResult.warnings,
            quality: validationResult.quality.quality,
            riskLevel: validationResult.security.riskLevel
          })
        }
      } catch (error) {
        Logger.error('Content validation error', error as Error, {
          contentUrl: item.contentUrl
        })
      }
    }

    Logger.info('Content validation completed', {
      originalCount: content.length,
      validCount: validatedContent.length,
      filteredCount: content.length - validatedContent.length,
      platformType
    })

    return validatedContent
  }
}

export const contentScraper = new ContentScraper()