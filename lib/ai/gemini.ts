import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface ContentAdaptation {
  targetPlatform: string
  title: string
  content: string
  hashtags: string[]
}

export class AIContentGenerator {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  async generateAdaptations(
    originalContent: {
      title: string
      description?: string
      content: string
      platform: string
    }
  ): Promise<ContentAdaptation[]> {
    const adaptations: ContentAdaptation[] = []
    
    // Define target platforms and their requirements
    const targetPlatforms = [
      {
        name: 'TWITTER',
        maxLength: 280,
        style: 'concise, engaging, with relevant hashtags',
        format: 'thread if needed'
      },
      {
        name: 'LINKEDIN',
        maxLength: 3000,
        style: 'professional, thought-leadership',
        format: 'article-style with insights'
      },
      {
        name: 'INSTAGRAM',
        maxLength: 2200,
        style: 'visual-focused, engaging, lifestyle',
        format: 'caption with story elements'
      },
      {
        name: 'FACEBOOK',
        maxLength: 63206,
        style: 'conversational, community-focused',
        format: 'engaging post with discussion starters'
      }
    ]

    for (const platform of targetPlatforms) {
      try {
        const adaptation = await this.generateSingleAdaptation(
          originalContent,
          platform
        )
        if (adaptation) {
          adaptations.push(adaptation)
        }
      } catch (error) {
        console.error(`Failed to generate ${platform.name} adaptation:`, error)
      }
    }

    return adaptations
  }

  private async generateSingleAdaptation(
    originalContent: {
      title: string
      description?: string
      content: string
      platform: string
    },
    targetPlatform: {
      name: string
      maxLength: number
      style: string
      format: string
    }
  ): Promise<ContentAdaptation | null> {
    const prompt = `
You are a content adaptation expert. Adapt the following content for ${targetPlatform.name}:

Original Content:
Title: ${originalContent.title}
Description: ${originalContent.description || 'N/A'}
Content: ${originalContent.content.slice(0, 1000)}...
Source Platform: ${originalContent.platform}

Target Platform: ${targetPlatform.name}
Style Requirements: ${targetPlatform.style}
Format: ${targetPlatform.format}
Max Length: ${targetPlatform.maxLength} characters

Please provide:
1. An adapted title (if needed)
2. The main content adapted for the platform
3. 3-5 relevant hashtags

Format your response as JSON:
{
  "title": "adapted title",
  "content": "adapted content",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}

Make sure the content is engaging, platform-appropriate, and under the character limit.
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response')
      }
      
      const parsed = JSON.parse(jsonMatch[0])
      
      return {
        targetPlatform: targetPlatform.name,
        title: parsed.title || originalContent.title,
        content: parsed.content,
        hashtags: parsed.hashtags || []
      }
    } catch (error) {
      console.error('AI generation error:', error)
      return null
    }
  }

  async generateQuickAdaptation(
    content: string,
    targetPlatform: string
  ): Promise<string> {
    const prompt = `
Quickly adapt this content for ${targetPlatform}:

"${content}"

Make it platform-appropriate and engaging. Keep it concise.
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Quick adaptation error:', error)
      return content // Fallback to original
    }
  }
}

export const aiGenerator = new AIContentGenerator()