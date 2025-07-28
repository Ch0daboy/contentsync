# Security Implementation Guide

## Overview

This document outlines the security measures implemented in ContentSync to ensure production-ready security.

## Security Features Implemented

### 1. Environment Variable Validation
- **File**: `lib/env.ts`
- **Purpose**: Validates all required environment variables at startup
- **Features**:
  - Type-safe environment variable access
  - Minimum length requirements for secrets
  - URL validation for database and Redis connections
  - Automatic type conversion with validation

### 2. Security Middleware
- **File**: `lib/security.ts`
- **Purpose**: Centralized security controls for API routes
- **Features**:
  - Rate limiting with configurable limits
  - CSRF protection for state-changing operations
  - Input validation and sanitization
  - Webhook signature verification
  - Security headers (CSP, HSTS, etc.)
  - CORS handling

### 3. Global Middleware
- **File**: `middleware.ts`
- **Purpose**: Apply security measures across the entire application
- **Features**:
  - Authentication protection for protected routes
  - Security headers on all responses
  - CORS handling for API routes
  - Automatic redirects for unauthenticated users

### 4. Content Sanitization
- **Function**: `sanitizeContent()`
- **Purpose**: Prevent XSS attacks through content sanitization
- **Features**:
  - Removes dangerous HTML tags (script, iframe)
  - Strips event handlers (onclick, onload, etc.)
  - Removes javascript: URLs
  - Preserves safe content formatting

## Security Headers Implemented

### Content Security Policy (CSP)
```
default-src 'self'; 
script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
style-src 'self' 'unsafe-inline'; 
img-src 'self' data: https:; 
font-src 'self' data:; 
connect-src 'self' https:; 
frame-ancestors 'none';
```

### Other Security Headers
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-XSS-Protection: 1; mode=block`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security` (production only)

## Rate Limiting

### Configuration
- **Default**: 100 requests per 15 minutes per IP
- **Configurable**: Via `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW` environment variables
- **Storage**: In-memory (development) / Redis (production recommended)

### Endpoints Protected
- `/api/platforms/*` - Platform management
- `/api/content/*` - Content operations
- `/api/webhooks/*` - Webhook endpoints (lower limit: 50 requests)

## Authentication & Authorization

### NextAuth.js Integration
- JWT-based session management
- Secure session handling
- Automatic token refresh
- Protected route middleware

### API Protection
- All API routes require authentication (except auth, webhooks, cron)
- User-scoped data access (users can only access their own data)
- CSRF protection on state-changing operations

## Input Validation

### Zod Schemas
- Platform creation: Name (1-100 chars), valid URL
- Content updates: Valid status enum, content length limits
- Webhook payloads: Platform enum, event validation

### Sanitization
- All user-provided content is sanitized before storage
- HTML tag removal for dangerous elements
- Event handler stripping
- URL scheme validation

## Webhook Security

### Signature Verification
- Platform-specific webhook secrets
- HMAC-SHA256 signature validation
- Timing-safe comparison to prevent timing attacks
- Configurable secrets per platform

### Rate Limiting
- Lower rate limits for webhook endpoints
- IP-based tracking
- Automatic blocking of excessive requests

## Environment Security

### Required Variables
- `DATABASE_URL` - Must be valid PostgreSQL URL
- `REDIS_URL` - Must be valid Redis URL
- `NEXTAUTH_SECRET` - Minimum 32 characters
- `CRON_SECRET` - Minimum 32 characters
- `GEMINI_API_KEY` - Required for AI functionality

### Optional Security Variables
- `RATE_LIMIT_MAX` - Custom rate limit
- `RATE_LIMIT_WINDOW` - Custom time window
- `ALLOWED_ORIGINS` - CORS origin whitelist
- Platform-specific webhook secrets

## Production Deployment Security

### Environment Variables
1. Generate strong secrets (32+ characters)
2. Use environment-specific URLs
3. Enable HTTPS in production
4. Set `NODE_ENV=production`

### Database Security
- Use connection pooling
- Enable SSL connections
- Regular security updates
- Backup encryption

### Redis Security
- Enable authentication
- Use SSL/TLS connections
- Network isolation
- Regular updates

## Security Monitoring

### Error Tracking
- Sentry integration for error monitoring
- Security event logging
- Failed authentication tracking
- Rate limit violation alerts

### Audit Trail
- All API requests logged
- User action tracking
- Security event recording
- Regular security audits

## Security Best Practices

### Development
1. Never commit secrets to version control
2. Use `.env.local` for local development
3. Regularly update dependencies
4. Run security audits: `npm run security:audit`

### Production
1. Use strong, unique secrets
2. Enable HTTPS everywhere
3. Regular security updates
4. Monitor security logs
5. Implement backup strategies
6. Use environment variable validation

### Code Review
1. Review all security-related changes
2. Validate input handling
3. Check authentication flows
4. Verify authorization logic
5. Test error handling

## Incident Response

### Security Incident Checklist
1. Identify and contain the threat
2. Assess the scope of impact
3. Notify relevant stakeholders
4. Implement fixes
5. Monitor for additional threats
6. Document lessons learned

### Emergency Contacts
- Security team lead
- Infrastructure team
- Legal/compliance team
- External security consultants

## Compliance Considerations

### Data Protection
- User data encryption
- Secure data transmission
- Data retention policies
- Right to deletion

### Privacy
- Minimal data collection
- Purpose limitation
- User consent management
- Privacy policy compliance

## Regular Security Tasks

### Weekly
- Review security logs
- Check for dependency updates
- Monitor rate limiting effectiveness

### Monthly
- Security audit of new features
- Review access controls
- Update security documentation
- Test incident response procedures

### Quarterly
- Comprehensive security assessment
- Penetration testing
- Security training updates
- Policy review and updates
