import Redis from 'ioredis'
import Queue from 'bull'

// Initialize Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

// Create job queues
export const contentMonitorQueue = new Queue('content monitoring', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
})

export const aiGenerationQueue = new Queue('ai generation', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
})

// Job processors
contentMonitorQueue.process('monitor-platform', async (job) => {
  const { platformId } = job.data
  
  // Import here to avoid circular dependencies
  const { monitorPlatform } = await import('./services/monitoring')
  await monitorPlatform(platformId)
})

aiGenerationQueue.process('generate-content', async (job) => {
  const { originalContentId } = job.data
  
  const { generateContentAdaptations } = await import('./services/ai-generation')
  await generateContentAdaptations(originalContentId)
})

// Schedule recurring jobs
export async function scheduleMonitoring() {
  // Monitor all active platforms every 30 minutes
  await contentMonitorQueue.add(
    'monitor-all-platforms',
    {},
    {
      repeat: { cron: '*/30 * * * *' }, // Every 30 minutes
      removeOnComplete: 10,
      removeOnFail: 5,
    }
  )
}

// Initialize queues
if (process.env.NODE_ENV !== 'test') {
  scheduleMonitoring()
}