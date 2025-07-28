# ContentSync

> AI-powered content aggregation and generation platform that monitors multiple platforms and creates engaging content automatically.

[![CI/CD](https://github.com/yourusername/contentsync/workflows/CI/badge.svg)](https://github.com/yourusername/contentsync/actions)
[![Security](https://img.shields.io/badge/security-hardened-green.svg)](./SECURITY.md)
[![Performance](https://img.shields.io/badge/performance-optimized-blue.svg)](./PERFORMANCE.md)

## 🚀 Features

- **Multi-Platform Monitoring**: Track content from YouTube, Twitter, Instagram, LinkedIn, TikTok, and RSS feeds
- **AI Content Generation**: Automatically generate engaging content using Google Gemini AI
- **Smart Content Validation**: Multi-layer validation and quality assessment
- **Content Moderation**: Automated content filtering and security checks
- **Real-time Processing**: Background job processing with Redis queues
- **Performance Optimized**: Caching, database optimization, and monitoring
- **Production Ready**: Comprehensive security, testing, and deployment pipeline

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Scrapers  │    │  Content Queue  │    │  AI Generation  │
│                 │───▶│                 │───▶│                 │
│ • YouTube       │    │ • Redis         │    │ • Gemini AI     │
│ • Twitter       │    │ • Bull Queue    │    │ • Templates     │
│ • Instagram     │    │ • Cron Jobs     │    │ • Validation    │
│ • RSS Feeds     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Validation    │    │    Database     │    │   Monitoring    │
│                 │    │                 │    │                 │
│ • Quality Check │    │ • PostgreSQL    │    │ • Health Checks │
│ • Security Scan │    │ • Prisma ORM    │    │ • Metrics       │
│ • Moderation    │    │ • Migrations    │    │ • Logging       │
│ • Sanitization  │    │                 │    │ • Alerts        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for caching and job queues
- **AI**: Google Gemini AI for content generation
- **Authentication**: NextAuth.js
- **Testing**: Jest, Playwright, React Testing Library
- **Deployment**: Docker, Vercel, PM2
- **Monitoring**: Winston logging, Sentry, Prometheus/Grafana

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- Redis 7+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/contentsync.git
   cd contentsync
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📋 Environment Variables

### Required Variables
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/contentsync"
REDIS_URL="redis://localhost:6379"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-at-least-32-characters-long"
GEMINI_API_KEY="your-gemini-api-key"
CRON_SECRET="your-cron-secret-at-least-32-characters-long"
```

### Optional Variables
```bash
SENTRY_DSN="your-sentry-dsn"
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW="900000"
ALLOWED_ORIGINS="http://localhost:3000"
```

See [.env.example](./.env.example) for a complete list.

## 🧪 Testing

```bash
# Run all tests
npm run test:all

# Unit tests
npm run test:unit

# Integration tests  
npm run test:integration

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 🚢 Deployment

### Docker Deployment (Recommended)

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### PM2 Deployment

```bash
# Install PM2
npm i -g pm2

# Start application
pm2 start ecosystem.config.js --env production
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📊 Monitoring

### Health Checks
- **Health**: `GET /api/health` - Application health status
- **Readiness**: `GET /api/ready` - Deployment readiness check
- **Metrics**: `GET /api/metrics` - Application metrics (requires auth)

### Performance Monitoring
- **Logs**: Structured logging with Winston
- **Metrics**: Performance metrics and monitoring
- **Alerts**: Configurable alerting for critical issues

See [MONITORING.md](./MONITORING.md) for monitoring setup.

## 🔒 Security

ContentSync implements comprehensive security measures:

- **Input Validation**: Multi-layer content validation and sanitization
- **Authentication**: Secure user authentication with NextAuth.js
- **Rate Limiting**: Configurable rate limiting per endpoint
- **CSRF Protection**: Cross-site request forgery protection
- **Content Moderation**: Automated content filtering and security checks
- **Security Headers**: Comprehensive security headers
- **Webhook Security**: Signature verification for webhooks

See [SECURITY.md](./SECURITY.md) for detailed security information.

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment instructions
- [Security Guide](./SECURITY.md) - Security implementation details
- [Performance Guide](./PERFORMANCE.md) - Performance optimization
- [Testing Guide](./TESTING.md) - Testing strategies and setup
- [Monitoring Guide](./MONITORING.md) - Monitoring and observability
- [Content Security Guide](./CONTENT_SECURITY.md) - Content validation and moderation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the guides in the `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/yourusername/contentsync/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/contentsync/discussions)

## 🗺️ Roadmap

- [ ] Advanced AI content personalization
- [ ] Team collaboration features
- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Marketplace for content templates
- [ ] Enterprise features and white-labeling

---

**Built with ❤️ by [Your Name](https://github.com/yourusername)**
