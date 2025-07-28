import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { env, isProduction, isDevelopment } from './env'

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

// Tell winston that you want to link the colors
winston.addColors(colors)

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
)

// Define which transports the logger must use
const transports = []

// Console transport for development
if (isDevelopment) {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  )
}

// File transports for production
if (isProduction) {
  // Error log file
  transports.push(
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      handleExceptions: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  )

  // Combined log file
  transports.push(
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  )

  // Console transport for production (JSON format)
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  )
} else {
  // Development console transport
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  )
}

// Create the logger
const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  levels,
  format,
  transports,
  exitOnError: false,
})

// Enhanced logging methods with context
export class Logger {
  static info(message: string, meta?: any) {
    logger.info(message, meta)
  }

  static warn(message: string, meta?: any) {
    logger.warn(message, meta)
  }

  static error(message: string, error?: Error | any, meta?: any) {
    const errorMeta = {
      ...meta,
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
      }),
    }
    logger.error(message, errorMeta)
  }

  static debug(message: string, meta?: any) {
    logger.debug(message, meta)
  }

  static http(message: string, meta?: any) {
    logger.http(message, meta)
  }

  // Security-related logging
  static security(message: string, meta?: any) {
    logger.warn(`[SECURITY] ${message}`, {
      ...meta,
      type: 'security',
      timestamp: new Date().toISOString(),
    })
  }

  // Performance logging
  static performance(message: string, duration: number, meta?: any) {
    logger.info(`[PERFORMANCE] ${message}`, {
      ...meta,
      duration,
      type: 'performance',
    })
  }

  // API request logging
  static apiRequest(method: string, url: string, statusCode: number, duration: number, meta?: any) {
    logger.http(`${method} ${url} ${statusCode}`, {
      ...meta,
      method,
      url,
      statusCode,
      duration,
      type: 'api_request',
    })
  }

  // Database operation logging
  static database(operation: string, table: string, duration: number, meta?: any) {
    logger.debug(`[DATABASE] ${operation} on ${table}`, {
      ...meta,
      operation,
      table,
      duration,
      type: 'database',
    })
  }

  // Background job logging
  static job(jobName: string, status: 'started' | 'completed' | 'failed', meta?: any) {
    const level = status === 'failed' ? 'error' : 'info'
    logger[level](`[JOB] ${jobName} ${status}`, {
      ...meta,
      jobName,
      status,
      type: 'background_job',
    })
  }

  // User action logging
  static userAction(userId: string, action: string, meta?: any) {
    logger.info(`[USER] ${action}`, {
      ...meta,
      userId,
      action,
      type: 'user_action',
    })
  }

  // External service logging
  static externalService(service: string, operation: string, success: boolean, meta?: any) {
    const level = success ? 'info' : 'error'
    logger[level](`[EXTERNAL] ${service} ${operation}`, {
      ...meta,
      service,
      operation,
      success,
      type: 'external_service',
    })
  }
}

// Request logging middleware
export function createRequestLogger() {
  return (req: any, res: any, next: any) => {
    const start = Date.now()
    
    res.on('finish', () => {
      const duration = Date.now() - start
      Logger.apiRequest(
        req.method,
        req.url,
        res.statusCode,
        duration,
        {
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          userId: req.user?.id,
        }
      )
    })
    
    next()
  }
}

// Error logging helper
export function logError(error: Error, context?: string, meta?: any) {
  Logger.error(
    context ? `${context}: ${error.message}` : error.message,
    error,
    meta
  )
}

// Performance measurement helper
export function measurePerformance<T>(
  operation: string,
  fn: () => Promise<T> | T
): Promise<T> {
  const start = Date.now()
  
  const handleResult = (result: T) => {
    const duration = Date.now() - start
    Logger.performance(operation, duration)
    return result
  }
  
  const handleError = (error: Error) => {
    const duration = Date.now() - start
    Logger.performance(`${operation} (failed)`, duration)
    throw error
  }
  
  try {
    const result = fn()
    if (result instanceof Promise) {
      return result.then(handleResult).catch(handleError)
    }
    return Promise.resolve(handleResult(result))
  } catch (error) {
    return Promise.reject(handleError(error as Error))
  }
}

export default logger
