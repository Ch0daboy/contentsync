import { Logger } from './logger'
import { CacheManager } from './cache'

// Performance monitoring utilities
export class PerformanceMonitor {
  private static metrics: Map<string, PerformanceMetric> = new Map()
  
  // Start timing an operation
  static startTimer(operationName: string): PerformanceTimer {
    return new PerformanceTimer(operationName)
  }

  // Record a metric
  static recordMetric(name: string, value: number, tags?: Record<string, string>) {
    const existing = this.metrics.get(name) || {
      name,
      count: 0,
      total: 0,
      min: Infinity,
      max: -Infinity,
      avg: 0,
      p95: 0,
      p99: 0,
      values: []
    }

    existing.count++
    existing.total += value
    existing.min = Math.min(existing.min, value)
    existing.max = Math.max(existing.max, value)
    existing.avg = existing.total / existing.count
    existing.values.push(value)

    // Keep only last 1000 values for percentile calculation
    if (existing.values.length > 1000) {
      existing.values = existing.values.slice(-1000)
    }

    // Calculate percentiles
    const sorted = [...existing.values].sort((a, b) => a - b)
    existing.p95 = sorted[Math.floor(sorted.length * 0.95)] || 0
    existing.p99 = sorted[Math.floor(sorted.length * 0.99)] || 0

    this.metrics.set(name, existing)

    // Log slow operations
    if (value > 1000) {
      Logger.performance(`Slow operation: ${name}`, value, tags)
    }
  }

  // Get all metrics
  static getMetrics(): Record<string, PerformanceMetric> {
    const result: Record<string, PerformanceMetric> = {}
    for (const [name, metric] of this.metrics) {
      result[name] = { ...metric, values: [] } // Don't expose raw values
    }
    return result
  }

  // Reset metrics
  static resetMetrics(): void {
    this.metrics.clear()
  }

  // Memory usage monitoring
  static getMemoryUsage(): MemoryUsage {
    const usage = process.memoryUsage()
    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      usagePercent: Math.round((usage.heapUsed / usage.heapTotal) * 100)
    }
  }

  // CPU usage monitoring (simplified)
  static getCPUUsage(): CPUUsage {
    const usage = process.cpuUsage()
    return {
      user: usage.user / 1000, // Convert to milliseconds
      system: usage.system / 1000,
      total: (usage.user + usage.system) / 1000
    }
  }

  // Event loop lag monitoring
  static measureEventLoopLag(): Promise<number> {
    return new Promise((resolve) => {
      const start = process.hrtime.bigint()
      setImmediate(() => {
        const lag = Number(process.hrtime.bigint() - start) / 1000000 // Convert to ms
        resolve(lag)
      })
    })
  }

  // Database performance monitoring
  static async monitorDatabaseQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const timer = this.startTimer(`db_${queryName}`)
    
    try {
      const result = await queryFn()
      const duration = timer.end()
      
      this.recordMetric('database_query_duration', duration, { query: queryName })
      this.recordMetric(`database_${queryName}_duration`, duration)
      
      return result
    } catch (error) {
      timer.end()
      this.recordMetric('database_query_errors', 1, { query: queryName })
      throw error
    }
  }

  // API endpoint performance monitoring
  static async monitorApiEndpoint<T>(
    endpoint: string,
    method: string,
    handler: () => Promise<T>
  ): Promise<T> {
    const timer = this.startTimer(`api_${method}_${endpoint}`)
    
    try {
      const result = await handler()
      const duration = timer.end()
      
      this.recordMetric('api_request_duration', duration, { endpoint, method })
      this.recordMetric(`api_${endpoint}_duration`, duration)
      
      return result
    } catch (error) {
      timer.end()
      this.recordMetric('api_request_errors', 1, { endpoint, method })
      throw error
    }
  }

  // Cache performance monitoring
  static recordCacheHit(key: string): void {
    this.recordMetric('cache_hits', 1, { key })
  }

  static recordCacheMiss(key: string): void {
    this.recordMetric('cache_misses', 1, { key })
  }

  static getCacheHitRate(): number {
    const hits = this.metrics.get('cache_hits')?.count || 0
    const misses = this.metrics.get('cache_misses')?.count || 0
    const total = hits + misses
    
    return total > 0 ? (hits / total) * 100 : 0
  }

  // Performance report
  static generateReport(): PerformanceReport {
    const memoryUsage = this.getMemoryUsage()
    const metrics = this.getMetrics()
    
    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: memoryUsage,
      metrics,
      cacheHitRate: this.getCacheHitRate(),
      slowOperations: this.getSlowOperations(),
      recommendations: this.generateRecommendations()
    }
  }

  // Get slow operations
  private static getSlowOperations(): SlowOperation[] {
    const slowOps: SlowOperation[] = []
    
    for (const [name, metric] of this.metrics) {
      if (metric.avg > 500) { // Operations slower than 500ms
        slowOps.push({
          name,
          avgDuration: metric.avg,
          maxDuration: metric.max,
          count: metric.count,
          p95: metric.p95
        })
      }
    }
    
    return slowOps.sort((a, b) => b.avgDuration - a.avgDuration)
  }

  // Generate performance recommendations
  private static generateRecommendations(): string[] {
    const recommendations: string[] = []
    const memoryUsage = this.getMemoryUsage()
    const cacheHitRate = this.getCacheHitRate()
    
    if (memoryUsage.usagePercent > 80) {
      recommendations.push('High memory usage detected. Consider optimizing memory-intensive operations.')
    }
    
    if (cacheHitRate < 70) {
      recommendations.push('Low cache hit rate. Review caching strategy and TTL settings.')
    }
    
    const slowOps = this.getSlowOperations()
    if (slowOps.length > 0) {
      recommendations.push(`${slowOps.length} slow operations detected. Review: ${slowOps.slice(0, 3).map(op => op.name).join(', ')}`)
    }
    
    const dbMetrics = Array.from(this.metrics.entries()).filter(([name]) => name.startsWith('db_'))
    const avgDbTime = dbMetrics.reduce((sum, [, metric]) => sum + metric.avg, 0) / dbMetrics.length
    
    if (avgDbTime > 200) {
      recommendations.push('Database queries are slow. Consider adding indexes or optimizing queries.')
    }
    
    return recommendations
  }
}

// Performance timer class
export class PerformanceTimer {
  private startTime: bigint
  private operationName: string

  constructor(operationName: string) {
    this.operationName = operationName
    this.startTime = process.hrtime.bigint()
  }

  end(): number {
    const endTime = process.hrtime.bigint()
    const duration = Number(endTime - this.startTime) / 1000000 // Convert to milliseconds
    
    PerformanceMonitor.recordMetric(this.operationName, duration)
    
    return duration
  }
}

// Bundle size optimization utilities
export class BundleOptimizer {
  // Analyze bundle size (would need webpack-bundle-analyzer in real implementation)
  static analyzeBundleSize(): BundleAnalysis {
    // Placeholder implementation
    return {
      totalSize: 0,
      gzippedSize: 0,
      chunks: [],
      recommendations: [
        'Enable tree shaking for unused code elimination',
        'Use dynamic imports for code splitting',
        'Optimize images and assets',
        'Consider using a CDN for static assets'
      ]
    }
  }

  // Code splitting recommendations
  static getCodeSplittingRecommendations(): string[] {
    return [
      'Split vendor libraries into separate chunks',
      'Use route-based code splitting',
      'Lazy load non-critical components',
      'Implement progressive loading for large datasets'
    ]
  }
}

// Types
interface PerformanceMetric {
  name: string
  count: number
  total: number
  min: number
  max: number
  avg: number
  p95: number
  p99: number
  values: number[]
}

interface MemoryUsage {
  heapUsed: number
  heapTotal: number
  external: number
  rss: number
  usagePercent: number
}

interface CPUUsage {
  user: number
  system: number
  total: number
}

interface SlowOperation {
  name: string
  avgDuration: number
  maxDuration: number
  count: number
  p95: number
}

interface PerformanceReport {
  timestamp: string
  uptime: number
  memory: MemoryUsage
  metrics: Record<string, PerformanceMetric>
  cacheHitRate: number
  slowOperations: SlowOperation[]
  recommendations: string[]
}

interface BundleAnalysis {
  totalSize: number
  gzippedSize: number
  chunks: any[]
  recommendations: string[]
}

// Performance middleware for API routes
export function withPerformanceMonitoring(endpoint: string) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function(...args: any[]) {
      const request = args[0]
      const httpMethod = request.method || 'GET'
      
      return PerformanceMonitor.monitorApiEndpoint(
        endpoint,
        httpMethod,
        () => method.apply(this, args)
      )
    }
  }
}

// Database query performance decorator
export function withDatabaseMonitoring(queryName: string) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function(...args: any[]) {
      return PerformanceMonitor.monitorDatabaseQuery(
        queryName,
        () => method.apply(this, args)
      )
    }
  }
}

export default PerformanceMonitor
