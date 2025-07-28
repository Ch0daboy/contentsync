# Monitoring and Observability Guide

## Overview

This document outlines the monitoring, logging, and observability setup for ContentSync to ensure production reliability and performance.

## Monitoring Stack

- **Logging**: Winston with structured logging
- **Error Tracking**: Sentry integration
- **Health Checks**: Custom health and readiness endpoints
- **Metrics**: Custom metrics endpoint with Prometheus format
- **Performance**: Request timing and performance monitoring
- **Security**: Security event logging and monitoring

## Health Checks

### Health Endpoint: `/api/health`

Comprehensive health check that monitors:
- Database connectivity and performance
- Redis connectivity and performance
- External service availability
- Memory usage
- Disk space and write permissions

**Response Format**:
```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "uptime": 3600,
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 45,
      "details": { "connected": true }
    },
    "redis": {
      "status": "healthy", 
      "responseTime": 12,
      "details": { "connected": true }
    },
    "external_services": {
      "status": "healthy",
      "details": {
        "services": [
          { "name": "Gemini AI", "status": "healthy" }
        ]
      }
    },
    "memory": {
      "status": "healthy",
      "details": {
        "heapUsed": 45,
        "heapTotal": 128,
        "usagePercent": 35
      }
    },
    "disk": {
      "status": "healthy",
      "details": { "writable": true }
    }
  }
}
```

### Readiness Endpoint: `/api/ready`

Kubernetes-style readiness check that verifies:
- Database connection
- Required environment variables
- Database migrations

**Response Format**:
```json
{
  "ready": true,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "checks": {
    "database": true,
    "environment": true,
    "migrations": true
  }
}
```

### Metrics Endpoint: `/api/metrics`

Application metrics for monitoring and alerting:
- System metrics (memory, CPU, uptime)
- Application metrics (users, platforms, content)
- Performance metrics (response times, error rates)

**Authentication**: Requires `Authorization: Bearer <CRON_SECRET>` header

## Logging

### Log Levels

- **error**: Application errors, exceptions
- **warn**: Warning conditions, security events
- **info**: General application flow, user actions
- **http**: HTTP request/response logging
- **debug**: Detailed debugging information

### Log Categories

#### Security Logging
```typescript
Logger.security('Failed login attempt', { 
  email: 'user@example.com',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...'
})
```

#### Performance Logging
```typescript
Logger.performance('Database query', 150, {
  operation: 'findMany',
  table: 'users'
})
```

#### API Request Logging
```typescript
Logger.apiRequest('GET', '/api/platforms', 200, 45, {
  userId: 'user-123',
  ip: '192.168.1.1'
})
```

#### Background Job Logging
```typescript
Logger.job('content-monitoring', 'completed', {
  platformsProcessed: 5,
  contentFound: 12
})
```

#### User Action Logging
```typescript
Logger.userAction('user-123', 'platform-created', {
  platformType: 'YOUTUBE',
  platformUrl: 'https://youtube.com/...'
})
```

### Log Storage

#### Development
- Console output with colors
- Debug level logging

#### Production
- Daily rotating log files in `/logs` directory
- JSON format for structured logging
- Error logs: `logs/error-YYYY-MM-DD.log`
- Combined logs: `logs/combined-YYYY-MM-DD.log`
- 14-day retention, 20MB max file size

## Error Handling

### Error Classes

- **AppError**: Base application error class
- **ValidationError**: Input validation errors (400)
- **AuthenticationError**: Authentication failures (401)
- **AuthorizationError**: Permission denied (403)
- **NotFoundError**: Resource not found (404)
- **ConflictError**: Resource conflicts (409)
- **RateLimitError**: Rate limit exceeded (429)
- **ExternalServiceError**: External API failures (502)
- **DatabaseError**: Database operation failures (500)

### Error Response Format

```json
{
  "error": "ValidationError",
  "message": "Invalid input data",
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/platforms",
  "details": {
    "field": "url",
    "reason": "Invalid URL format"
  }
}
```

### Async Error Handling

All API routes use the `asyncHandler` wrapper for consistent error handling:

```typescript
export const POST = asyncHandler(async (request: NextRequest) => {
  // Route logic here
  // Errors are automatically caught and formatted
})
```

## Performance Monitoring

### Response Time Tracking

All API requests are automatically timed and logged:
- Request method, URL, status code
- Response time in milliseconds
- User ID (if authenticated)
- IP address and user agent

### Performance Measurement

Use the `measurePerformance` helper for timing operations:

```typescript
const result = await measurePerformance('database-query', async () => {
  return await prisma.user.findMany()
})
```

### Performance Thresholds

- **Healthy**: < 200ms response time
- **Degraded**: 200ms - 1000ms response time
- **Unhealthy**: > 1000ms response time

## Alerting

### Critical Alerts

1. **Service Down**: Health check returns unhealthy status
2. **Database Unavailable**: Database connection failures
3. **High Error Rate**: > 5% error rate over 5 minutes
4. **Memory Usage**: > 90% memory usage
5. **Response Time**: > 2 seconds average response time

### Warning Alerts

1. **Degraded Performance**: Response times > 500ms
2. **High Memory Usage**: > 80% memory usage
3. **External Service Issues**: External API failures
4. **Security Events**: Multiple failed login attempts

### Alert Channels

- **Email**: Critical alerts to operations team
- **Slack**: All alerts to monitoring channel
- **PagerDuty**: Critical alerts for on-call rotation

## Monitoring Setup

### Prometheus Integration

The `/api/metrics` endpoint provides Prometheus-compatible metrics:

```
# HELP contentsync_users_total Total number of users
# TYPE contentsync_users_total gauge
contentsync_users_total 150

# HELP contentsync_memory_usage_bytes Memory usage in bytes
# TYPE contentsync_memory_usage_bytes gauge
contentsync_memory_usage_bytes 47185920
```

### Grafana Dashboards

Recommended dashboard panels:
1. **System Overview**: CPU, memory, disk usage
2. **Application Metrics**: Users, platforms, content counts
3. **Performance**: Response times, error rates
4. **Security**: Failed logins, rate limit violations
5. **Background Jobs**: Job success/failure rates

### Uptime Monitoring

External monitoring services should check:
- `/api/health` endpoint every 1 minute
- `/api/ready` endpoint every 30 seconds
- Main application pages every 5 minutes

## Log Analysis

### Common Log Queries

#### Find Security Events
```bash
grep "SECURITY" logs/combined-*.log | jq '.timestamp, .message, .meta'
```

#### Performance Issues
```bash
grep "PERFORMANCE" logs/combined-*.log | jq 'select(.meta.duration > 1000)'
```

#### Error Analysis
```bash
grep "ERROR" logs/error-*.log | jq '.timestamp, .message, .meta.error'
```

#### User Activity
```bash
grep "USER" logs/combined-*.log | jq 'select(.meta.userId == "user-123")'
```

## Troubleshooting

### High Memory Usage

1. Check memory metrics in `/api/metrics`
2. Review memory-intensive operations in logs
3. Monitor garbage collection patterns
4. Consider increasing memory limits

### Slow Response Times

1. Check performance logs for slow operations
2. Review database query performance
3. Monitor external service response times
4. Check for memory pressure

### Database Issues

1. Check database health in `/api/health`
2. Review database error logs
3. Monitor connection pool usage
4. Check for long-running queries

### External Service Failures

1. Check external service status in health checks
2. Review external service error logs
3. Implement circuit breaker patterns
4. Add retry logic with exponential backoff

## Production Checklist

### Before Deployment

- [ ] Configure log rotation
- [ ] Set up monitoring dashboards
- [ ] Configure alerting rules
- [ ] Test health check endpoints
- [ ] Verify error tracking setup

### After Deployment

- [ ] Verify logs are being written
- [ ] Check health check responses
- [ ] Confirm metrics collection
- [ ] Test alert notifications
- [ ] Monitor performance baselines

### Regular Maintenance

- [ ] Review log retention policies
- [ ] Clean up old log files
- [ ] Update monitoring thresholds
- [ ] Review alert effectiveness
- [ ] Analyze performance trends
