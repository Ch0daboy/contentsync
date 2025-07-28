module.exports = {
  apps: [
    {
      name: 'contentsync-prod',
      script: 'npm',
      args: 'start',
      cwd: './',
      instances: 'max', // Use all available CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Database
        DATABASE_URL: process.env.DATABASE_URL,
        DATABASE_POOL_SIZE: process.env.DATABASE_POOL_SIZE || '20',
        DATABASE_TIMEOUT: process.env.DATABASE_TIMEOUT || '30000',
        
        // Redis
        REDIS_URL: process.env.REDIS_URL,
        REDIS_MAX_CONNECTIONS: process.env.REDIS_MAX_CONNECTIONS || '50',
        
        // Authentication
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        
        // AI Services
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        
        // Security
        CRON_SECRET: process.env.CRON_SECRET,
        
        // Rate Limiting
        RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || '1000',
        RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || '900000',
        
        // CORS
        ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
        
        // Monitoring
        SENTRY_DSN: process.env.SENTRY_DSN,
        LOG_LEVEL: process.env.LOG_LEVEL || 'info',
        
        // Performance
        CACHE_TTL_DEFAULT: process.env.CACHE_TTL_DEFAULT || '300',
        CACHE_TTL_USER_SESSION: process.env.CACHE_TTL_USER_SESSION || '3600',
        CACHE_TTL_PLATFORM_DATA: process.env.CACHE_TTL_PLATFORM_DATA || '1800',
        
        // Webhook secrets
        YOUTUBE_WEBHOOK_SECRET: process.env.YOUTUBE_WEBHOOK_SECRET,
        TWITTER_WEBHOOK_SECRET: process.env.TWITTER_WEBHOOK_SECRET,
        INSTAGRAM_WEBHOOK_SECRET: process.env.INSTAGRAM_WEBHOOK_SECRET,
        FACEBOOK_WEBHOOK_SECRET: process.env.FACEBOOK_WEBHOOK_SECRET,
        LINKEDIN_WEBHOOK_SECRET: process.env.LINKEDIN_WEBHOOK_SECRET,
        TIKTOK_WEBHOOK_SECRET: process.env.TIKTOK_WEBHOOK_SECRET,
      },
      
      // Logging
      log_file: './logs/pm2-combined.log',
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Process management
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Memory management
      max_memory_restart: '1G',
      
      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      
      // Auto restart on file changes (disable in production)
      watch: false,
      ignore_watch: [
        'node_modules',
        'logs',
        'backups',
        '.git',
        '.next',
        'coverage',
        'test-results'
      ],
      
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Source map support
      source_map_support: true,
      
      // Merge logs from all instances
      merge_logs: true,
      
      // Time zone
      time: true,
      
      // Auto restart on memory threshold
      autorestart: true,
      
      // Cron restart (restart every day at 2 AM)
      cron_restart: '0 2 * * *',
      
      // Environment variables for different stages
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3001,
        DATABASE_URL: process.env.STAGING_DATABASE_URL,
        REDIS_URL: process.env.STAGING_REDIS_URL,
        NEXTAUTH_URL: process.env.STAGING_NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.STAGING_NEXTAUTH_SECRET,
        GEMINI_API_KEY: process.env.STAGING_GEMINI_API_KEY,
        CRON_SECRET: process.env.STAGING_CRON_SECRET,
        SENTRY_DSN: process.env.STAGING_SENTRY_DSN,
      }
    },
    
    // Background job worker
    {
      name: 'contentsync-worker',
      script: './scripts/worker.js',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
        WORKER_TYPE: 'background_jobs',
        DATABASE_URL: process.env.DATABASE_URL,
        REDIS_URL: process.env.REDIS_URL,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        CRON_SECRET: process.env.CRON_SECRET,
      },
      
      // Worker-specific settings
      log_file: './logs/worker-combined.log',
      out_file: './logs/worker-out.log',
      error_file: './logs/worker-error.log',
      
      min_uptime: '10s',
      max_restarts: 5,
      restart_delay: 10000,
      max_memory_restart: '512M',
      
      // Auto restart worker daily
      cron_restart: '0 3 * * *',
      
      autorestart: true,
      watch: false,
    },
    
    // Cron job scheduler
    {
      name: 'contentsync-scheduler',
      script: './scripts/scheduler.js',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
        SCHEDULER_TYPE: 'cron_jobs',
        DATABASE_URL: process.env.DATABASE_URL,
        REDIS_URL: process.env.REDIS_URL,
        CRON_SECRET: process.env.CRON_SECRET,
      },
      
      // Scheduler-specific settings
      log_file: './logs/scheduler-combined.log',
      out_file: './logs/scheduler-out.log',
      error_file: './logs/scheduler-error.log',
      
      min_uptime: '30s',
      max_restarts: 3,
      restart_delay: 30000,
      max_memory_restart: '256M',
      
      autorestart: true,
      watch: false,
    }
  ],
  
  // Deployment configuration
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-production-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/contentsync.git',
      path: '/var/www/contentsync',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'ssh_options': 'StrictHostKeyChecking=no'
    },
    
    staging: {
      user: 'deploy',
      host: ['your-staging-server.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:yourusername/contentsync.git',
      path: '/var/www/contentsync-staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging',
      'ssh_options': 'StrictHostKeyChecking=no'
    }
  }
}
