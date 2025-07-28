# Performance Optimization Guide

## Overview

This document outlines the performance optimizations implemented in ContentSync and provides guidelines for maintaining optimal performance in production.

## Performance Features Implemented

### 1. Caching Strategy

#### Multi-Layer Caching
- **Memory Cache**: Development environment (node-cache)
- **Redis Cache**: Production environment (ioredis)
- **Cache Invalidation**: Smart invalidation on data changes
- **Cache Warming**: Pre-loading frequently accessed data

#### Cache Categories
- **User Sessions**: 1 hour TTL
- **Platform Data**: 30 minutes TTL
- **Content Lists**: 10 minutes TTL
- **Generated Content**: 1 hour TTL
- **API Responses**: 5 minutes TTL
- **Health Checks**: 1 minute TTL

#### Cache Usage Examples
```typescript
// Get cached user platforms
const platforms = await CacheManager.getUserPlatforms(userId)

// Cache API response
await CacheManager.setApiResponse(endpoint, data, params, 300)

// Invalidate user cache on data change
await CacheManager.invalidateUserData(userId)
```

### 2. Database Optimization

#### Query Optimization
- **Cursor-based Pagination**: Better performance than offset-based
- **Selective Field Loading**: Only load required fields
- **Batch Operations**: Reduce database round trips
- **Connection Pooling**: Efficient connection management

#### Optimized Queries
```typescript
// Efficient pagination
const query = DatabaseOptimizer.createPaginationQuery(cursor, take)

// Optimized user platforms with caching
const platforms = await DatabaseOptimizer.getUserPlatforms(userId, options)

// Batch content creation
await DatabaseOptimizer.batchCreateContent(contentItems)
```

#### Database Monitoring
- **Query Performance Tracking**: Monitor slow queries
- **Connection Pool Metrics**: Track active connections
- **Index Usage Analysis**: PostgreSQL-specific optimization

### 3. Performance Monitoring

#### Real-time Metrics
- **Response Times**: P95, P99 percentiles
- **Memory Usage**: Heap, RSS, external memory
- **CPU Usage**: User, system time
- **Event Loop Lag**: Detect blocking operations
- **Cache Hit Rates**: Monitor cache effectiveness

#### Performance Decorators
```typescript
// Monitor API endpoint performance
@withPerformanceMonitoring('/api/platforms')
export async function GET(request: NextRequest) { ... }

// Monitor database queries
@withDatabaseMonitoring('getUserPlatforms')
async function getUserPlatforms() { ... }
```

### 4. API Optimizations

#### Request/Response Optimization
- **Pagination**: Cursor-based with configurable page sizes
- **Filtering**: Server-side filtering to reduce data transfer
- **Compression**: Automatic response compression
- **Conditional Requests**: ETags and Last-Modified headers

#### Rate Limiting
- **Adaptive Limits**: Different limits per endpoint type
- **User-based Limiting**: Per-user rate limiting
- **Burst Protection**: Handle traffic spikes

## Performance Monitoring

### Endpoints

#### Performance Report: `/api/performance`
**Authentication**: Requires `Authorization: Bearer <CRON_SECRET>`

**Response**:
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "memory": {
    "heapUsed": 45,
    "heapTotal": 128,
    "usagePercent": 35
  },
  "metrics": {
    "api_request_duration": {
      "count": 1000,
      "avg": 150,
      "p95": 300,
      "p99": 500
    }
  },
  "cacheHitRate": 85.5,
  "slowOperations": [
    {
      "name": "db_getUserPlatforms",
      "avgDuration": 250,
      "count": 50
    }
  ],
  "recommendations": [
    "Database queries are slow. Consider adding indexes."
  ]
}
```

### Key Performance Indicators (KPIs)

#### Response Time Targets
- **API Endpoints**: < 200ms (95th percentile)
- **Database Queries**: < 100ms (average)
- **Cache Operations**: < 10ms (average)
- **Page Load**: < 2 seconds (complete)

#### Resource Usage Targets
- **Memory Usage**: < 80% of available
- **CPU Usage**: < 70% average
- **Cache Hit Rate**: > 80%
- **Error Rate**: < 1%

## Optimization Strategies

### 1. Database Performance

#### Indexing Strategy
```sql
-- User-specific queries
CREATE INDEX idx_platforms_user_id ON platforms(user_id);
CREATE INDEX idx_content_user_id ON original_content(user_id);

-- Filtering and sorting
CREATE INDEX idx_content_status_created ON generated_content(status, created_at);
CREATE INDEX idx_platforms_active ON platforms(is_active) WHERE is_active = true;

-- Composite indexes for common queries
CREATE INDEX idx_content_user_platform ON original_content(user_id, platform_id);
```

#### Query Optimization
- Use `EXPLAIN ANALYZE` to identify slow queries
- Implement proper WHERE clause ordering
- Use EXISTS instead of IN for subqueries
- Limit result sets with proper pagination

### 2. Caching Best Practices

#### Cache Key Design
```typescript
// Hierarchical cache keys
const key = CacheManager.generateKey(
  CACHE_CONFIG.PREFIXES.USER,
  userId,
  'platforms',
  filters
)
```

#### Cache Invalidation Strategy
- **Time-based**: Automatic expiration with TTL
- **Event-based**: Invalidate on data changes
- **Pattern-based**: Invalidate related cache entries

#### Cache Warming
```typescript
// Pre-load user data on login
await CacheManager.warmCache(userId)
```

### 3. Frontend Optimization

#### Bundle Optimization
- **Code Splitting**: Route-based and component-based
- **Tree Shaking**: Remove unused code
- **Dynamic Imports**: Lazy load components
- **Asset Optimization**: Compress images and fonts

#### Runtime Optimization
- **Virtual Scrolling**: Handle large lists efficiently
- **Debounced Search**: Reduce API calls
- **Optimistic Updates**: Improve perceived performance
- **Service Workers**: Cache static assets

### 4. Network Optimization

#### CDN Strategy
- **Static Assets**: Serve from CDN
- **API Responses**: Cache at edge locations
- **Image Optimization**: WebP format, responsive images
- **Compression**: Gzip/Brotli compression

#### Request Optimization
- **Batch Requests**: Combine multiple API calls
- **Prefetching**: Load data before needed
- **Connection Pooling**: Reuse HTTP connections
- **HTTP/2**: Leverage multiplexing

## Performance Testing

### Load Testing
```bash
# Install k6 for load testing
npm install -g k6

# Run load test
k6 run performance-tests/api-load-test.js
```

### Monitoring Setup
```bash
# Start performance monitoring
npm run monitor:performance

# Generate performance report
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/performance
```

### Benchmarking
- **Database Queries**: Measure query execution time
- **API Endpoints**: Test response times under load
- **Cache Performance**: Monitor hit rates and response times
- **Memory Usage**: Track memory leaks and garbage collection

## Production Optimizations

### Environment Configuration
```bash
# Node.js optimizations
NODE_ENV=production
NODE_OPTIONS="--max-old-space-size=4096"

# Database optimizations
DATABASE_POOL_SIZE=20
DATABASE_TIMEOUT=30000

# Cache optimizations
REDIS_MAX_CONNECTIONS=50
CACHE_TTL_DEFAULT=300
```

### Deployment Optimizations
- **Container Resources**: Appropriate CPU/memory limits
- **Auto-scaling**: Scale based on performance metrics
- **Health Checks**: Proper liveness and readiness probes
- **Graceful Shutdown**: Handle termination signals

### Monitoring and Alerting
- **Performance Alerts**: Response time > 500ms
- **Memory Alerts**: Usage > 80%
- **Error Rate Alerts**: > 1% error rate
- **Cache Alerts**: Hit rate < 70%

## Troubleshooting Performance Issues

### Common Issues

#### Slow Database Queries
1. Check query execution plans
2. Verify index usage
3. Optimize WHERE clauses
4. Consider query rewriting

#### High Memory Usage
1. Check for memory leaks
2. Optimize object creation
3. Review cache sizes
4. Monitor garbage collection

#### Low Cache Hit Rates
1. Review cache TTL settings
2. Check cache invalidation logic
3. Optimize cache key strategies
4. Monitor cache eviction patterns

#### High Response Times
1. Profile API endpoints
2. Check database performance
3. Review external service calls
4. Optimize serialization

### Performance Debugging

#### Enable Debug Logging
```bash
DEBUG=performance,cache,database npm start
```

#### Performance Profiling
```typescript
// Profile specific operations
const timer = PerformanceMonitor.startTimer('operation-name')
// ... operation code ...
const duration = timer.end()
```

#### Memory Profiling
```bash
# Generate heap snapshot
node --inspect app.js
# Connect Chrome DevTools for memory analysis
```

## Best Practices

### Development
- **Performance Budget**: Set and monitor performance budgets
- **Regular Profiling**: Profile during development
- **Load Testing**: Test with realistic data volumes
- **Monitoring**: Implement comprehensive monitoring

### Code Review
- **Performance Impact**: Review performance implications
- **Cache Strategy**: Verify caching implementation
- **Database Queries**: Review query efficiency
- **Resource Usage**: Check memory and CPU usage

### Deployment
- **Gradual Rollout**: Deploy performance changes gradually
- **Monitoring**: Monitor performance metrics post-deployment
- **Rollback Plan**: Have rollback strategy for performance regressions
- **Documentation**: Document performance optimizations
