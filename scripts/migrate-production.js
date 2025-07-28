#!/usr/bin/env node

/**
 * Production Database Migration Script
 * 
 * This script handles database migrations for production deployment
 * with proper error handling, rollback capabilities, and logging.
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Configuration
const config = {
  backupDir: './backups',
  logFile: './logs/migration.log',
  maxRetries: 3,
  retryDelay: 5000, // 5 seconds
}

// Logging utility
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] [${level}] ${message}\n`
  
  console.log(logMessage.trim())
  
  // Ensure log directory exists
  const logDir = path.dirname(config.logFile)
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }
  
  // Append to log file
  fs.appendFileSync(config.logFile, logMessage)
}

// Execute command with retry logic
function executeWithRetry(command, description, retries = config.maxRetries) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      log(`Executing: ${description} (attempt ${attempt}/${retries})`)
      const result = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe'
      })
      log(`Success: ${description}`)
      return result
    } catch (error) {
      log(`Failed: ${description} - ${error.message}`, 'ERROR')
      
      if (attempt === retries) {
        throw new Error(`Failed after ${retries} attempts: ${description}`)
      }
      
      log(`Retrying in ${config.retryDelay}ms...`, 'WARN')
      // Simple sleep implementation
      execSync(`node -e "setTimeout(() => {}, ${config.retryDelay})"`)
    }
  }
}

// Create database backup
function createBackup() {
  log('Creating database backup...')
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFile = path.join(config.backupDir, `backup-${timestamp}.sql`)
  
  // Ensure backup directory exists
  if (!fs.existsSync(config.backupDir)) {
    fs.mkdirSync(config.backupDir, { recursive: true })
  }
  
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }
  
  try {
    executeWithRetry(
      `pg_dump "${databaseUrl}" > "${backupFile}"`,
      'Database backup creation'
    )
    
    log(`Backup created successfully: ${backupFile}`)
    return backupFile
  } catch (error) {
    log(`Backup creation failed: ${error.message}`, 'ERROR')
    throw error
  }
}

// Validate environment
function validateEnvironment() {
  log('Validating environment...')
  
  const requiredVars = [
    'DATABASE_URL',
    'REDIS_URL',
    'NEXTAUTH_SECRET',
    'GEMINI_API_KEY',
    'CRON_SECRET'
  ]
  
  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }
  
  // Validate database connection
  try {
    executeWithRetry(
      'npx prisma db execute --stdin < /dev/null',
      'Database connection validation'
    )
  } catch (error) {
    throw new Error('Database connection failed')
  }
  
  log('Environment validation successful')
}

// Run database migrations
function runMigrations() {
  log('Running database migrations...')
  
  try {
    // Generate Prisma client
    executeWithRetry(
      'npx prisma generate',
      'Prisma client generation'
    )
    
    // Deploy migrations
    executeWithRetry(
      'npx prisma migrate deploy',
      'Database migration deployment'
    )
    
    log('Database migrations completed successfully')
  } catch (error) {
    log(`Migration failed: ${error.message}`, 'ERROR')
    throw error
  }
}

// Verify migration success
function verifyMigration() {
  log('Verifying migration success...')
  
  try {
    // Check if main tables exist and are accessible
    const verificationScript = `
      const { PrismaClient } = require('@prisma/client')
      const prisma = new PrismaClient()
      
      async function verify() {
        try {
          await prisma.user.findFirst()
          await prisma.platform.findFirst()
          await prisma.originalContent.findFirst()
          await prisma.generatedContent.findFirst()
          console.log('Verification successful')
          process.exit(0)
        } catch (error) {
          console.error('Verification failed:', error.message)
          process.exit(1)
        } finally {
          await prisma.$disconnect()
        }
      }
      
      verify()
    `
    
    fs.writeFileSync('./temp-verify.js', verificationScript)
    
    executeWithRetry(
      'node temp-verify.js',
      'Migration verification'
    )
    
    // Clean up temporary file
    fs.unlinkSync('./temp-verify.js')
    
    log('Migration verification successful')
  } catch (error) {
    log(`Migration verification failed: ${error.message}`, 'ERROR')
    throw error
  }
}

// Rollback to backup (if needed)
function rollbackToBackup(backupFile) {
  log(`Rolling back to backup: ${backupFile}`, 'WARN')
  
  try {
    const databaseUrl = process.env.DATABASE_URL
    
    // Drop and recreate database (be very careful with this!)
    executeWithRetry(
      `psql "${databaseUrl}" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`,
      'Database schema reset'
    )
    
    // Restore from backup
    executeWithRetry(
      `psql "${databaseUrl}" < "${backupFile}"`,
      'Database backup restoration'
    )
    
    log('Rollback completed successfully')
  } catch (error) {
    log(`Rollback failed: ${error.message}`, 'ERROR')
    throw error
  }
}

// Main migration function
async function main() {
  let backupFile = null
  
  try {
    log('Starting production database migration...')
    
    // Step 1: Validate environment
    validateEnvironment()
    
    // Step 2: Create backup
    backupFile = createBackup()
    
    // Step 3: Run migrations
    runMigrations()
    
    // Step 4: Verify migration
    verifyMigration()
    
    log('Production database migration completed successfully!')
    
  } catch (error) {
    log(`Migration failed: ${error.message}`, 'ERROR')
    
    if (backupFile && fs.existsSync(backupFile)) {
      const shouldRollback = process.argv.includes('--auto-rollback')
      
      if (shouldRollback) {
        try {
          rollbackToBackup(backupFile)
          log('Automatic rollback completed')
        } catch (rollbackError) {
          log(`Rollback also failed: ${rollbackError.message}`, 'ERROR')
        }
      } else {
        log(`Backup available for manual rollback: ${backupFile}`, 'WARN')
        log('To rollback manually, run:', 'WARN')
        log(`psql "${process.env.DATABASE_URL}" < "${backupFile}"`, 'WARN')
      }
    }
    
    process.exit(1)
  }
}

// Handle script arguments
if (require.main === module) {
  // Check for help flag
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Usage: node migrate-production.js [options]

Options:
  --auto-rollback    Automatically rollback on migration failure
  --help, -h         Show this help message

Environment Variables:
  DATABASE_URL       PostgreSQL connection string (required)
  REDIS_URL         Redis connection string (required)
  NEXTAUTH_SECRET   NextAuth secret (required)
  GEMINI_API_KEY    Gemini API key (required)
  CRON_SECRET       Cron job secret (required)

Examples:
  node migrate-production.js
  node migrate-production.js --auto-rollback
    `)
    process.exit(0)
  }
  
  main()
}

module.exports = {
  createBackup,
  validateEnvironment,
  runMigrations,
  verifyMigration,
  rollbackToBackup
}
