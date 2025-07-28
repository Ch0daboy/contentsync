import { z } from 'zod'
import { Logger } from './logger'
import { sanitizeContent } from './security'
import { ValidationError } from './errors'

// Content validation schemas
export const ContentValidationSchemas = {
  // Basic content structure
  basicContent: z.object({
    title: z.string()
      .min(1, 'Title is required')
      .max(500, 'Title must be less than 500 characters')
      .transform(sanitizeContent),
    
    content: z.string()
      .min(1, 'Content is required')
      .max(50000, 'Content must be less than 50,000 characters')
      .transform(sanitizeContent),
    
    contentUrl: z.string()
      .url('Content URL must be a valid URL')
      .max(2000, 'Content URL must be less than 2000 characters'),
    
    publishedAt: z.coerce.date()
      .refine(date => date <= new Date(), 'Published date cannot be in the future')
      .refine(date => date >= new Date('2000-01-01'), 'Published date must be after 2000'),
    
    author: z.string()
      .max(200, 'Author name must be less than 200 characters')
      .optional()
      .transform(val => val ? sanitizeContent(val) : undefined),
    
    excerpt: z.string()
      .max(1000, 'Excerpt must be less than 1000 characters')
      .optional()
      .transform(val => val ? sanitizeContent(val) : undefined),
    
    tags: z.array(z.string().max(50))
      .max(20, 'Maximum 20 tags allowed')
      .optional()
      .transform(tags => tags?.map(tag => sanitizeContent(tag))),
    
    metadata: z.record(z.any()).optional()
  }),

  // Platform-specific validation
  youtube: z.object({
    videoId: z.string().regex(/^[a-zA-Z0-9_-]{11}$/, 'Invalid YouTube video ID'),
    duration: z.number().positive().optional(),
    viewCount: z.number().nonnegative().optional(),
    likeCount: z.number().nonnegative().optional(),
    commentCount: z.number().nonnegative().optional(),
    channelId: z.string().optional(),
    channelName: z.string().max(100).optional(),
    thumbnailUrl: z.string().url().optional(),
    category: z.string().max(50).optional(),
    language: z.string().length(2).optional()
  }),

  twitter: z.object({
    tweetId: z.string().regex(/^\d+$/, 'Invalid Twitter tweet ID'),
    retweetCount: z.number().nonnegative().optional(),
    likeCount: z.number().nonnegative().optional(),
    replyCount: z.number().nonnegative().optional(),
    username: z.string().max(15).optional(),
    isRetweet: z.boolean().optional(),
    inReplyToTweetId: z.string().optional(),
    hashtags: z.array(z.string().max(100)).optional(),
    mentions: z.array(z.string().max(15)).optional()
  }),

  instagram: z.object({
    postId: z.string().min(1),
    mediaType: z.enum(['image', 'video', 'carousel']).optional(),
    likeCount: z.number().nonnegative().optional(),
    commentCount: z.number().nonnegative().optional(),
    username: z.string().max(30).optional(),
    hashtags: z.array(z.string().max(100)).optional(),
    location: z.string().max(100).optional(),
    mediaUrls: z.array(z.string().url()).optional()
  }),

  blog: z.object({
    slug: z.string().max(200).optional(),
    categories: z.array(z.string().max(50)).optional(),
    readingTime: z.number().positive().optional(),
    wordCount: z.number().positive().optional(),
    featuredImage: z.string().url().optional(),
    seoTitle: z.string().max(60).optional(),
    seoDescription: z.string().max(160).optional()
  }),

  rss: z.object({
    guid: z.string().max(500).optional(),
    feedTitle: z.string().max(200).optional(),
    feedDescription: z.string().max(500).optional(),
    feedUrl: z.string().url().optional(),
    enclosureUrl: z.string().url().optional(),
    enclosureType: z.string().max(50).optional(),
    enclosureLength: z.number().positive().optional()
  })
}

// Content quality validation
export class ContentQualityValidator {
  private static readonly MIN_CONTENT_LENGTH = 50
  private static readonly MAX_DUPLICATE_THRESHOLD = 0.8
  private static readonly SPAM_KEYWORDS = [
    'click here', 'buy now', 'limited time', 'act fast', 'guaranteed',
    'make money fast', 'work from home', 'free money', 'get rich quick'
  ]

  static validateContentQuality(content: {
    title: string
    content: string
    contentUrl: string
  }): ContentQualityResult {
    const issues: string[] = []
    const warnings: string[] = []
    let score = 100

    // Check content length
    if (content.content.length < this.MIN_CONTENT_LENGTH) {
      issues.push('Content is too short')
      score -= 30
    }

    // Check for spam indicators
    const spamScore = this.calculateSpamScore(content.title + ' ' + content.content)
    if (spamScore > 0.7) {
      issues.push('Content appears to be spam')
      score -= 50
    } else if (spamScore > 0.4) {
      warnings.push('Content may contain promotional language')
      score -= 10
    }

    // Check for duplicate content patterns
    const duplicateScore = this.checkDuplicatePatterns(content.content)
    if (duplicateScore > this.MAX_DUPLICATE_THRESHOLD) {
      issues.push('Content appears to be duplicate or low-quality')
      score -= 40
    }

    // Check title quality
    if (content.title.length < 10) {
      warnings.push('Title is very short')
      score -= 5
    }

    if (content.title.length > 100) {
      warnings.push('Title is very long')
      score -= 5
    }

    // Check for proper sentence structure
    const sentenceCount = content.content.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    const wordCount = content.content.split(/\s+/).length
    const avgWordsPerSentence = wordCount / sentenceCount

    if (avgWordsPerSentence < 5) {
      warnings.push('Content has very short sentences')
      score -= 5
    }

    if (avgWordsPerSentence > 50) {
      warnings.push('Content has very long sentences')
      score -= 5
    }

    // Check for HTML/markup remnants
    if (/<[^>]+>/.test(content.content)) {
      warnings.push('Content contains HTML markup')
      score -= 10
    }

    // Determine overall quality
    let quality: 'high' | 'medium' | 'low'
    if (score >= 80) quality = 'high'
    else if (score >= 60) quality = 'medium'
    else quality = 'low'

    return {
      quality,
      score: Math.max(0, score),
      issues,
      warnings,
      metrics: {
        contentLength: content.content.length,
        wordCount,
        sentenceCount,
        avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
        spamScore: Math.round(spamScore * 100) / 100,
        duplicateScore: Math.round(duplicateScore * 100) / 100
      }
    }
  }

  private static calculateSpamScore(text: string): number {
    const lowerText = text.toLowerCase()
    let spamIndicators = 0

    // Check for spam keywords
    this.SPAM_KEYWORDS.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        spamIndicators += 1
      }
    })

    // Check for excessive capitalization
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length
    if (capsRatio > 0.3) spamIndicators += 2

    // Check for excessive punctuation
    const punctRatio = (text.match(/[!?]{2,}/g) || []).length
    if (punctRatio > 3) spamIndicators += 1

    // Check for excessive numbers
    const numberRatio = (text.match(/\d/g) || []).length / text.length
    if (numberRatio > 0.2) spamIndicators += 1

    return Math.min(spamIndicators / 10, 1)
  }

  private static checkDuplicatePatterns(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10)
    if (sentences.length < 2) return 0

    let duplicateCount = 0
    const sentenceMap = new Map<string, number>()

    sentences.forEach(sentence => {
      const normalized = sentence.trim().toLowerCase()
      const count = sentenceMap.get(normalized) || 0
      sentenceMap.set(normalized, count + 1)
      if (count > 0) duplicateCount++
    })

    return duplicateCount / sentences.length
  }
}

// Content sanitization and security
export class ContentSecurityValidator {
  private static readonly DANGEROUS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /on\w+\s*=/gi
  ]

  private static readonly SUSPICIOUS_DOMAINS = [
    'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly',
    'adf.ly', 'short.link', 'tiny.cc'
  ]

  static validateContentSecurity(content: {
    title: string
    content: string
    contentUrl: string
    author?: string
  }): ContentSecurityResult {
    const threats: string[] = []
    const warnings: string[] = []

    // Check for dangerous patterns
    this.DANGEROUS_PATTERNS.forEach(pattern => {
      if (pattern.test(content.content) || pattern.test(content.title)) {
        threats.push('Potentially malicious code detected')
      }
    })

    // Check for suspicious URLs
    const urlMatches = content.content.match(/https?:\/\/[^\s]+/g) || []
    urlMatches.forEach(url => {
      try {
        const domain = new URL(url).hostname
        if (this.SUSPICIOUS_DOMAINS.some(suspicious => domain.includes(suspicious))) {
          warnings.push('Content contains shortened or suspicious URLs')
        }
      } catch {
        warnings.push('Content contains malformed URLs')
      }
    })

    // Check content URL domain
    try {
      const contentDomain = new URL(content.contentUrl).hostname
      if (this.SUSPICIOUS_DOMAINS.some(suspicious => contentDomain.includes(suspicious))) {
        warnings.push('Content source uses URL shortener')
      }
    } catch {
      threats.push('Invalid content URL')
    }

    // Check for potential phishing indicators
    const phishingKeywords = ['verify account', 'suspended account', 'click immediately', 'urgent action required']
    const lowerContent = (content.title + ' ' + content.content).toLowerCase()
    
    phishingKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        warnings.push('Content may contain phishing language')
      }
    })

    const riskLevel: 'low' | 'medium' | 'high' = 
      threats.length > 0 ? 'high' :
      warnings.length > 2 ? 'medium' : 'low'

    return {
      riskLevel,
      threats,
      warnings,
      safe: threats.length === 0
    }
  }
}

// Main content validator
export class ContentValidator {
  static async validateScrapedContent(
    content: any,
    platformType: string
  ): Promise<ContentValidationResult> {
    try {
      Logger.debug('Validating scraped content', { platformType, contentUrl: content.contentUrl })

      // Basic structure validation
      const basicValidation = ContentValidationSchemas.basicContent.parse(content)

      // Platform-specific validation
      let platformValidation = {}
      if (platformType in ContentValidationSchemas) {
        const schema = ContentValidationSchemas[platformType as keyof typeof ContentValidationSchemas]
        platformValidation = schema.parse(content.metadata || {})
      }

      // Quality validation
      const qualityResult = ContentQualityValidator.validateContentQuality({
        title: basicValidation.title,
        content: basicValidation.content,
        contentUrl: basicValidation.contentUrl
      })

      // Security validation
      const securityResult = ContentSecurityValidator.validateContentSecurity({
        title: basicValidation.title,
        content: basicValidation.content,
        contentUrl: basicValidation.contentUrl,
        author: basicValidation.author
      })

      const isValid = qualityResult.quality !== 'low' && 
                     securityResult.riskLevel !== 'high' &&
                     qualityResult.issues.length === 0

      const result: ContentValidationResult = {
        isValid,
        validatedContent: {
          ...basicValidation,
          metadata: {
            ...content.metadata,
            ...platformValidation,
            validation: {
              quality: qualityResult,
              security: securityResult,
              validatedAt: new Date().toISOString()
            }
          }
        },
        quality: qualityResult,
        security: securityResult,
        errors: qualityResult.issues,
        warnings: [...qualityResult.warnings, ...securityResult.warnings]
      }

      Logger.info('Content validation completed', {
        contentUrl: content.contentUrl,
        isValid,
        quality: qualityResult.quality,
        riskLevel: securityResult.riskLevel,
        score: qualityResult.score
      })

      return result

    } catch (error) {
      Logger.error('Content validation failed', error as Error, { 
        platformType, 
        contentUrl: content.contentUrl 
      })

      if (error instanceof z.ZodError) {
        throw new ValidationError('Content validation failed', error.errors)
      }

      throw error
    }
  }

  static async batchValidateContent(
    contentItems: any[],
    platformType: string
  ): Promise<BatchValidationResult> {
    const results: ContentValidationResult[] = []
    const errors: Array<{ index: number; error: string }> = []

    for (let i = 0; i < contentItems.length; i++) {
      try {
        const result = await this.validateScrapedContent(contentItems[i], platformType)
        results.push(result)
      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const validCount = results.filter(r => r.isValid).length
    const invalidCount = results.length - validCount

    return {
      totalProcessed: contentItems.length,
      validCount,
      invalidCount,
      errorCount: errors.length,
      results,
      errors,
      summary: {
        successRate: (validCount / contentItems.length) * 100,
        qualityDistribution: {
          high: results.filter(r => r.quality.quality === 'high').length,
          medium: results.filter(r => r.quality.quality === 'medium').length,
          low: results.filter(r => r.quality.quality === 'low').length
        },
        securityDistribution: {
          low: results.filter(r => r.security.riskLevel === 'low').length,
          medium: results.filter(r => r.security.riskLevel === 'medium').length,
          high: results.filter(r => r.security.riskLevel === 'high').length
        }
      }
    }
  }
}

// Types
export interface ContentQualityResult {
  quality: 'high' | 'medium' | 'low'
  score: number
  issues: string[]
  warnings: string[]
  metrics: {
    contentLength: number
    wordCount: number
    sentenceCount: number
    avgWordsPerSentence: number
    spamScore: number
    duplicateScore: number
  }
}

export interface ContentSecurityResult {
  riskLevel: 'low' | 'medium' | 'high'
  threats: string[]
  warnings: string[]
  safe: boolean
}

export interface ContentValidationResult {
  isValid: boolean
  validatedContent: any
  quality: ContentQualityResult
  security: ContentSecurityResult
  errors: string[]
  warnings: string[]
}

export interface BatchValidationResult {
  totalProcessed: number
  validCount: number
  invalidCount: number
  errorCount: number
  results: ContentValidationResult[]
  errors: Array<{ index: number; error: string }>
  summary: {
    successRate: number
    qualityDistribution: {
      high: number
      medium: number
      low: number
    }
    securityDistribution: {
      low: number
      medium: number
      high: number
    }
  }
}

export default ContentValidator
