# Production Deployment Guide

## Overview

This guide covers the complete production deployment process for ContentSync, including environment setup, database migrations, and deployment verification.

## Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **PostgreSQL**: 15.x or higher
- **Redis**: 7.x or higher
- **Docker**: 20.x or higher (for containerized deployment)
- **Git**: Latest version

### Server Requirements
- **CPU**: Minimum 2 cores, recommended 4+ cores
- **Memory**: Minimum 4GB RAM, recommended 8GB+ RAM
- **Storage**: Minimum 20GB SSD, recommended 50GB+ SSD
- **Network**: Stable internet connection with SSL certificate

## Environment Configuration

### 1. Environment Variables

Copy the production environment template:
```bash
cp .env.production .env.local
```

Update the following critical variables:

#### Required Variables
```bash
# Database
DATABASE_URL="postgresql://username:password@host:5432/contentsync_prod"

# Redis
REDIS_URL="redis://username:password@host:6379"

# Authentication
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-super-secure-secret-key-at-least-32-characters-long"

# AI Services
GEMINI_API_KEY="your-production-gemini-api-key"

# Security
CRON_SECRET="your-super-secure-cron-secret-at-least-32-characters-long"
```

#### Security Configuration
```bash
# Rate Limiting
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW=900000

# CORS
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"

# Monitoring
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
```

### 2. SSL Certificate Setup

For HTTPS deployment, ensure you have:
- Valid SSL certificate
- Certificate chain file
- Private key file

## Deployment Methods

### Method 1: Docker Deployment (Recommended)

#### Step 1: Prepare Environment
```bash
# Clone repository
git clone https://github.com/yourusername/contentsync.git
cd contentsync

# Set up environment
cp .env.production .env.local
# Edit .env.local with your production values
```

#### Step 2: Build and Deploy
```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f app
```

#### Step 3: Run Database Migrations
```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec app node scripts/migrate-production.js

# Verify migration
docker-compose -f docker-compose.prod.yml exec app npx prisma db seed
```

### Method 2: PM2 Deployment

#### Step 1: Install Dependencies
```bash
# Install Node.js dependencies
npm ci --only=production

# Install PM2 globally
npm install -g pm2

# Install PostgreSQL and Redis
# (Installation varies by OS)
```

#### Step 2: Build Application
```bash
# Generate Prisma client
npx prisma generate

# Build the application
npm run build
```

#### Step 3: Run Migrations
```bash
# Run database migrations
node scripts/migrate-production.js
```

#### Step 4: Start with PM2
```bash
# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### Method 3: Automated Deployment Script

#### Using the Deployment Script
```bash
# Make script executable (Linux/Mac)
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh

# With options
./scripts/deploy.sh --skip-tests --deployment-method=docker
```

#### Windows PowerShell
```powershell
# Run deployment script
node scripts/deploy.js
```

## Database Setup

### 1. PostgreSQL Configuration

#### Production Settings
```sql
-- Optimize for production
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET work_mem = '4MB';

-- Reload configuration
SELECT pg_reload_conf();
```

#### Create Production Database
```sql
-- Create database
CREATE DATABASE contentsync_prod;

-- Create user
CREATE USER contentsync_user WITH PASSWORD 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE contentsync_prod TO contentsync_user;
```

### 2. Redis Configuration

#### Production Redis Config
```bash
# /etc/redis/redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec
```

## Monitoring and Health Checks

### 1. Health Check Endpoints

#### Application Health
```bash
curl https://yourdomain.com/api/health
```

#### Readiness Check
```bash
curl https://yourdomain.com/api/ready
```

#### Metrics
```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://yourdomain.com/api/metrics
```

### 2. Monitoring Setup

#### Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'contentsync'
    static_configs:
      - targets: ['app:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s
```

#### Grafana Dashboards
- Application metrics dashboard
- Database performance dashboard
- System resource dashboard
- Error tracking dashboard

## Security Checklist

### Pre-Deployment Security
- [ ] All secrets are properly configured
- [ ] SSL certificates are valid and installed
- [ ] Firewall rules are configured
- [ ] Database access is restricted
- [ ] Redis is password protected
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured

### Post-Deployment Security
- [ ] Security headers are present
- [ ] HTTPS is enforced
- [ ] Authentication is working
- [ ] API endpoints are protected
- [ ] Webhook signatures are verified
- [ ] Logs are being collected
- [ ] Monitoring alerts are configured

## Performance Optimization

### 1. Application Optimization
```bash
# Enable production optimizations
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Configure caching
CACHE_TTL_DEFAULT=300
CACHE_TTL_USER_SESSION=3600
CACHE_TTL_PLATFORM_DATA=1800
```

### 2. Database Optimization
```sql
-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_platforms_user_id ON platforms(user_id);
CREATE INDEX CONCURRENTLY idx_content_user_id ON original_content(user_id);
CREATE INDEX CONCURRENTLY idx_content_status_created ON generated_content(status, created_at);
```

### 3. CDN Configuration
```bash
# Configure CDN for static assets
CDN_URL="https://cdn.yourdomain.com"
STATIC_ASSETS_URL="https://static.yourdomain.com"
```

## Backup and Recovery

### 1. Database Backup
```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > "$BACKUP_DIR/backup_$DATE.sql"

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
```

### 2. Application Backup
```bash
# Backup application files
tar -czf app_backup_$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=logs \
  .
```

## Troubleshooting

### Common Issues

#### Application Won't Start
1. Check environment variables
2. Verify database connection
3. Check Redis connection
4. Review application logs

#### Database Connection Issues
1. Verify DATABASE_URL format
2. Check network connectivity
3. Verify user permissions
4. Check PostgreSQL service status

#### Performance Issues
1. Monitor resource usage
2. Check database query performance
3. Review cache hit rates
4. Analyze application metrics

### Log Analysis
```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs -f app

# Database logs
docker-compose -f docker-compose.prod.yml logs -f db

# Redis logs
docker-compose -f docker-compose.prod.yml logs -f redis

# System logs
journalctl -u docker -f
```

## Maintenance

### Regular Maintenance Tasks

#### Daily
- [ ] Check application health
- [ ] Monitor error rates
- [ ] Review security logs
- [ ] Verify backup completion

#### Weekly
- [ ] Update dependencies
- [ ] Review performance metrics
- [ ] Clean up old logs
- [ ] Test backup restoration

#### Monthly
- [ ] Security audit
- [ ] Performance optimization review
- [ ] Capacity planning review
- [ ] Documentation updates

### Update Process
```bash
# 1. Backup current deployment
./scripts/backup.sh

# 2. Pull latest changes
git pull origin main

# 3. Run deployment script
./scripts/deploy.sh

# 4. Verify deployment
curl https://yourdomain.com/api/health
```

## Support and Documentation

### Getting Help
- Check application logs first
- Review this deployment guide
- Check GitHub issues
- Contact support team

### Additional Resources
- [Security Guide](SECURITY.md)
- [Performance Guide](PERFORMANCE.md)
- [Monitoring Guide](MONITORING.md)
- [Testing Guide](TESTING.md)
