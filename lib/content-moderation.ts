import { Logger } from './logger'
import { prisma } from './db'

// Content moderation rules and filters
export class ContentModerator {
  private static readonly BLOCKED_KEYWORDS = [
    // Explicit content
    'explicit', 'nsfw', 'adult content', 'pornography',
    
    // Hate speech
    'hate speech', 'racist', 'discrimination', 'harassment',
    
    // Violence
    'violence', 'terrorism', 'extremism', 'threat',
    
    // Illegal activities
    'illegal', 'drugs', 'weapons', 'fraud', 'scam',
    
    // Spam indicators
    'get rich quick', 'make money fast', 'guaranteed income',
    'work from home scam', 'pyramid scheme', 'mlm'
  ]

  private static readonly SENSITIVE_TOPICS = [
    'politics', 'religion', 'controversial', 'sensitive',
    'medical advice', 'financial advice', 'legal advice'
  ]

  private static readonly QUALITY_INDICATORS = {
    positive: [
      'tutorial', 'guide', 'how-to', 'educational', 'informative',
      'research', 'analysis', 'review', 'case study', 'best practices'
    ],
    negative: [
      'clickbait', 'sensational', 'misleading', 'fake news',
      'unverified', 'rumor', 'gossip', 'speculation'
    ]
  }

  static async moderateContent(content: {
    title: string
    content: string
    contentUrl: string
    userId: string
    platformId: string
  }): Promise<ModerationResult> {
    Logger.debug('Starting content moderation', { 
      contentUrl: content.contentUrl,
      userId: content.userId 
    })

    const result: ModerationResult = {
      approved: true,
      confidence: 1.0,
      flags: [],
      reasons: [],
      actions: [],
      metadata: {
        moderatedAt: new Date().toISOString(),
        moderatorVersion: '1.0.0'
      }
    }

    // Check for blocked keywords
    const blockedKeywordCheck = this.checkBlockedKeywords(content.title + ' ' + content.content)
    if (blockedKeywordCheck.found) {
      result.approved = false
      result.confidence = Math.min(result.confidence, 0.2)
      result.flags.push('blocked_keywords')
      result.reasons.push(`Contains blocked keywords: ${blockedKeywordCheck.keywords.join(', ')}`)
      result.actions.push('block')
    }

    // Check for sensitive topics
    const sensitiveTopicCheck = this.checkSensitiveTopics(content.title + ' ' + content.content)
    if (sensitiveTopicCheck.found) {
      result.flags.push('sensitive_topic')
      result.reasons.push(`Contains sensitive topics: ${sensitiveTopicCheck.topics.join(', ')}`)
      result.actions.push('flag_for_review')
      result.confidence = Math.min(result.confidence, 0.7)
    }

    // Check content quality
    const qualityCheck = this.assessContentQuality(content.title + ' ' + content.content)
    if (qualityCheck.score < 0.5) {
      result.flags.push('low_quality')
      result.reasons.push('Content quality below threshold')
      result.actions.push('flag_for_review')
      result.confidence = Math.min(result.confidence, qualityCheck.score)
    }

    // Check user history
    const userHistoryCheck = await this.checkUserHistory(content.userId)
    if (userHistoryCheck.riskLevel === 'high') {
      result.flags.push('high_risk_user')
      result.reasons.push('User has history of policy violations')
      result.actions.push('manual_review')
      result.confidence = Math.min(result.confidence, 0.5)
    }

    // Check domain reputation
    const domainCheck = await this.checkDomainReputation(content.contentUrl)
    if (domainCheck.reputation === 'poor') {
      result.flags.push('poor_domain_reputation')
      result.reasons.push('Content from domain with poor reputation')
      result.actions.push('flag_for_review')
      result.confidence = Math.min(result.confidence, 0.6)
    }

    // Final approval decision
    if (result.flags.includes('blocked_keywords') || 
        result.confidence < 0.3 ||
        result.actions.includes('block')) {
      result.approved = false
    }

    // Log moderation result
    await this.logModerationResult(content, result)

    Logger.info('Content moderation completed', {
      contentUrl: content.contentUrl,
      approved: result.approved,
      confidence: result.confidence,
      flags: result.flags,
      actions: result.actions
    })

    return result
  }

  private static checkBlockedKeywords(text: string): {
    found: boolean
    keywords: string[]
  } {
    const lowerText = text.toLowerCase()
    const foundKeywords = this.BLOCKED_KEYWORDS.filter(keyword => 
      lowerText.includes(keyword.toLowerCase())
    )

    return {
      found: foundKeywords.length > 0,
      keywords: foundKeywords
    }
  }

  private static checkSensitiveTopics(text: string): {
    found: boolean
    topics: string[]
  } {
    const lowerText = text.toLowerCase()
    const foundTopics = this.SENSITIVE_TOPICS.filter(topic => 
      lowerText.includes(topic.toLowerCase())
    )

    return {
      found: foundTopics.length > 0,
      topics: foundTopics
    }
  }

  private static assessContentQuality(text: string): {
    score: number
    indicators: string[]
  } {
    let score = 0.5 // Start with neutral score
    const indicators: string[] = []

    // Check for positive quality indicators
    const positiveMatches = this.QUALITY_INDICATORS.positive.filter(indicator =>
      text.toLowerCase().includes(indicator)
    )
    score += positiveMatches.length * 0.1
    indicators.push(...positiveMatches.map(m => `positive:${m}`))

    // Check for negative quality indicators
    const negativeMatches = this.QUALITY_INDICATORS.negative.filter(indicator =>
      text.toLowerCase().includes(indicator)
    )
    score -= negativeMatches.length * 0.2
    indicators.push(...negativeMatches.map(m => `negative:${m}`))

    // Check text length and structure
    const wordCount = text.split(/\s+/).length
    if (wordCount < 50) {
      score -= 0.2
      indicators.push('negative:too_short')
    } else if (wordCount > 200) {
      score += 0.1
      indicators.push('positive:substantial_content')
    }

    // Check for proper capitalization
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const properlyCapitalized = sentences.filter(s => 
      /^[A-Z]/.test(s.trim())
    ).length
    
    if (properlyCapitalized / sentences.length > 0.8) {
      score += 0.1
      indicators.push('positive:proper_capitalization')
    }

    return {
      score: Math.max(0, Math.min(1, score)),
      indicators
    }
  }

  private static async checkUserHistory(userId: string): Promise<{
    riskLevel: 'low' | 'medium' | 'high'
    violations: number
    recentViolations: number
  }> {
    try {
      // Check for recent moderation actions
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      
      const moderationHistory = await prisma.contentModerationLog.findMany({
        where: {
          userId,
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      })

      const violations = moderationHistory.filter(log => !log.approved).length
      const recentViolations = moderationHistory.filter(log => 
        !log.approved && log.createdAt >= thirtyDaysAgo
      ).length

      let riskLevel: 'low' | 'medium' | 'high' = 'low'
      if (recentViolations >= 5 || violations >= 10) {
        riskLevel = 'high'
      } else if (recentViolations >= 2 || violations >= 5) {
        riskLevel = 'medium'
      }

      return {
        riskLevel,
        violations,
        recentViolations
      }
    } catch (error) {
      Logger.error('Failed to check user history', error as Error, { userId })
      return {
        riskLevel: 'low',
        violations: 0,
        recentViolations: 0
      }
    }
  }

  private static async checkDomainReputation(contentUrl: string): Promise<{
    reputation: 'good' | 'neutral' | 'poor'
    reason?: string
  }> {
    try {
      const domain = new URL(contentUrl).hostname

      // Check against known problematic domains
      const problematicDomains = [
        'spam-site.com', 'fake-news.net', 'clickbait-central.org'
        // Add more as needed
      ]

      if (problematicDomains.some(bad => domain.includes(bad))) {
        return {
          reputation: 'poor',
          reason: 'Domain on blocklist'
        }
      }

      // Check domain age and other factors
      // This would typically integrate with external reputation services
      
      return {
        reputation: 'neutral'
      }
    } catch (error) {
      Logger.error('Failed to check domain reputation', error as Error, { contentUrl })
      return {
        reputation: 'neutral'
      }
    }
  }

  private static async logModerationResult(
    content: {
      title: string
      content: string
      contentUrl: string
      userId: string
      platformId: string
    },
    result: ModerationResult
  ): Promise<void> {
    try {
      await prisma.contentModerationLog.create({
        data: {
          userId: content.userId,
          platformId: content.platformId,
          contentUrl: content.contentUrl,
          contentTitle: content.title,
          approved: result.approved,
          confidence: result.confidence,
          flags: result.flags,
          reasons: result.reasons,
          actions: result.actions,
          metadata: result.metadata
        }
      })
    } catch (error) {
      Logger.error('Failed to log moderation result', error as Error, {
        contentUrl: content.contentUrl,
        userId: content.userId
      })
    }
  }

  // Batch moderation for multiple content items
  static async batchModerateContent(
    contentItems: Array<{
      title: string
      content: string
      contentUrl: string
      userId: string
      platformId: string
    }>
  ): Promise<BatchModerationResult> {
    const results: Array<{ content: any; result: ModerationResult }> = []
    let approvedCount = 0
    let rejectedCount = 0

    for (const content of contentItems) {
      try {
        const result = await this.moderateContent(content)
        results.push({ content, result })
        
        if (result.approved) {
          approvedCount++
        } else {
          rejectedCount++
        }
      } catch (error) {
        Logger.error('Batch moderation error', error as Error, {
          contentUrl: content.contentUrl
        })
        rejectedCount++
      }
    }

    return {
      totalProcessed: contentItems.length,
      approvedCount,
      rejectedCount,
      results,
      summary: {
        approvalRate: (approvedCount / contentItems.length) * 100,
        commonFlags: this.getCommonFlags(results.map(r => r.result)),
        commonReasons: this.getCommonReasons(results.map(r => r.result))
      }
    }
  }

  private static getCommonFlags(results: ModerationResult[]): string[] {
    const flagCounts = new Map<string, number>()
    
    results.forEach(result => {
      result.flags.forEach(flag => {
        flagCounts.set(flag, (flagCounts.get(flag) || 0) + 1)
      })
    })

    return Array.from(flagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([flag]) => flag)
  }

  private static getCommonReasons(results: ModerationResult[]): string[] {
    const reasonCounts = new Map<string, number>()
    
    results.forEach(result => {
      result.reasons.forEach(reason => {
        reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1)
      })
    })

    return Array.from(reasonCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([reason]) => reason)
  }
}

// Types
export interface ModerationResult {
  approved: boolean
  confidence: number
  flags: string[]
  reasons: string[]
  actions: string[]
  metadata: {
    moderatedAt: string
    moderatorVersion: string
    [key: string]: any
  }
}

export interface BatchModerationResult {
  totalProcessed: number
  approvedCount: number
  rejectedCount: number
  results: Array<{ content: any; result: ModerationResult }>
  summary: {
    approvalRate: number
    commonFlags: string[]
    commonReasons: string[]
  }
}

export default ContentModerator
