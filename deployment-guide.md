# ContentSync Deployment Guide

## Quick Deploy to Vercel (Recommended)

### 1. Prerequisites
- GitHub account
- Vercel account
- Supabase account (for PostgreSQL)
- Upstash account (for Redis)
- Google AI Studio account (for Gemini API)

### 2. Database Setup (Supabase)
1. Create new project at https://supabase.com
2. Go to Settings > Database
3. Copy connection string
4. Replace `[YOUR-PASSWORD]` with your database password

### 3. Redis Setup (Upstash)
1. Create account at https://upstash.com
2. Create new Redis database
3. Copy Redis URL from console

### 4. AI API Setup
1. Go to https://makersuite.google.com/app/apikey
2. Create new API key
3. Copy the key

### 5. Deploy to Vercel
1. Fork this repository
2. Connect to Vercel
3. Add environment variables:
   ```
   DATABASE_URL=your-supabase-connection-string
   REDIS_URL=your-upstash-redis-url
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=generate-random-secret
   GEMINI_API_KEY=your-gemini-api-key
   CRON_SECRET=generate-random-secret
   ```
4. Deploy

### 6. Database Migration
1. After deployment, run:
   ```bash
   npx prisma db push
   ```

### 7. Setup Cron Jobs
1. In Vercel dashboard, go to Functions
2. Add cron job for `/api/cron/monitor`
3. Set to run every 30 minutes: `*/30 * * * *`

## Alternative: Docker Deployment

### 1. Clone and Setup
```bash
git clone <repository>
cd contentsync
cp .env.example .env
# Edit .env with your values
```

### 2. Run with Docker Compose
```bash
docker-compose up -d
```

### 3. Initialize Database
```bash
docker-compose exec app npx prisma db push
```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | Yes |
| REDIS_URL | Redis connection string | Yes |
| NEXTAUTH_URL | Your app URL | Yes |
| NEXTAUTH_SECRET | Random secret for auth | Yes |
| GEMINI_API_KEY | Google Gemini API key | Yes |
| CRON_SECRET | Secret for cron endpoints | Yes |
| SENTRY_DSN | Error tracking (optional) | No |

## Cost Optimization

### 1. Gemini API Usage
- Monitor API usage in Google AI Studio
- Set daily limits to control costs
- Implement rate limiting in production

### 2. Database Optimization
- Use Supabase free tier (500MB)
- Implement data retention policies
- Archive old content regularly

### 3. Redis Optimization
- Use Upstash free tier (10K requests/day)
- Implement efficient caching strategies
- Clean up old job data

## Monitoring and Maintenance

### 1. Error Tracking
- Setup Sentry for error monitoring
- Monitor API rate limits
- Track user engagement

### 2. Performance Monitoring
- Monitor database query performance
- Track API response times
- Monitor background job success rates

### 3. Regular Maintenance
- Clean up old content (90+ days)
- Monitor storage usage
- Update dependencies regularly

## Security Considerations

### 1. API Security
- Use strong secrets for NEXTAUTH_SECRET and CRON_SECRET
- Implement rate limiting for public endpoints
- Validate all user inputs

### 2. Database Security
- Use connection pooling
- Implement proper indexing
- Regular security updates

### 3. Content Security
- Sanitize scraped content
- Implement content validation
- Monitor for malicious content

## Scaling Considerations

### 1. Database Scaling
- Implement read replicas for heavy read workloads
- Use database connection pooling
- Consider sharding for large datasets

### 2. Background Job Scaling
- Use multiple Redis instances for job queues
- Implement job prioritization
- Monitor job queue health

### 3. API Scaling
- Implement caching for frequently accessed data
- Use CDN for static assets
- Consider serverless functions for peak loads