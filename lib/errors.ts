import { NextResponse } from 'next/server'
import { Logger } from './logger'
import { ZodError } from 'zod'

// Custom error classes
export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly code?: string

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.code = code
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, true, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, true, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, true, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, true, 'NOT_FOUND_ERROR')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, true, 'CONFLICT_ERROR')
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, true, 'RATE_LIMIT_ERROR')
    this.name = 'RateLimitError'
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string = 'External service error') {
    super(`${service}: ${message}`, 502, true, 'EXTERNAL_SERVICE_ERROR')
    this.name = 'ExternalServiceError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, false, 'DATABASE_ERROR')
    this.name = 'DatabaseError'
  }
}

// Error response formatter
export interface ErrorResponse {
  error: string
  message: string
  statusCode: number
  code?: string
  details?: any
  timestamp: string
  path?: string
}

export function formatErrorResponse(
  error: Error,
  path?: string,
  includeStack: boolean = false
): ErrorResponse {
  const response: ErrorResponse = {
    error: error.name,
    message: error.message,
    statusCode: error instanceof AppError ? error.statusCode : 500,
    code: error instanceof AppError ? error.code : 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    path,
  }

  // Add stack trace in development
  if (includeStack && process.env.NODE_ENV === 'development') {
    response.details = { stack: error.stack }
  }

  return response
}

// Global error handler for API routes
export function handleApiError(
  error: Error,
  path?: string
): NextResponse {
  // Log the error
  Logger.error('API Error', error, { path })

  // Handle specific error types
  if (error instanceof ZodError) {
    const validationError = new ValidationError('Invalid input data')
    const response = formatErrorResponse(validationError, path)
    response.details = error.errors
    return NextResponse.json(response, { status: 400 })
  }

  if (error instanceof AppError) {
    const response = formatErrorResponse(error, path)
    return NextResponse.json(response, { status: error.statusCode })
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any
    switch (prismaError.code) {
      case 'P2002':
        const conflictError = new ConflictError('Resource already exists')
        const response = formatErrorResponse(conflictError, path)
        return NextResponse.json(response, { status: 409 })
      case 'P2025':
        const notFoundError = new NotFoundError('Resource not found')
        const notFoundResponse = formatErrorResponse(notFoundError, path)
        return NextResponse.json(notFoundResponse, { status: 404 })
      default:
        const dbError = new DatabaseError('Database operation failed')
        const dbResponse = formatErrorResponse(dbError, path)
        return NextResponse.json(dbResponse, { status: 500 })
    }
  }

  // Handle unknown errors
  const unknownError = new AppError(
    process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    500,
    false
  )
  
  const response = formatErrorResponse(
    unknownError, 
    path, 
    process.env.NODE_ENV === 'development'
  )
  
  return NextResponse.json(response, { status: 500 })
}

// Async error wrapper for API routes
export function asyncHandler(
  handler: (req: any, context?: any) => Promise<NextResponse>
) {
  return async (req: any, context?: any): Promise<NextResponse> => {
    try {
      return await handler(req, context)
    } catch (error) {
      return handleApiError(error as Error, req.url)
    }
  }
}

// Error boundary for React components
export class ErrorBoundary extends Error {
  constructor(
    public readonly componentStack: string,
    public readonly errorBoundary: string,
    originalError: Error
  ) {
    super(originalError.message)
    this.name = 'ErrorBoundary'
    this.stack = originalError.stack
  }
}

// Validation helpers
export function validateRequired(value: any, fieldName: string): void {
  if (value === undefined || value === null || value === '') {
    throw new ValidationError(`${fieldName} is required`)
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format')
  }
}

export function validateUrl(url: string): void {
  try {
    new URL(url)
  } catch {
    throw new ValidationError('Invalid URL format')
  }
}

export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string
): void {
  if (value.length < min) {
    throw new ValidationError(`${fieldName} must be at least ${min} characters`)
  }
  if (value.length > max) {
    throw new ValidationError(`${fieldName} must be no more than ${max} characters`)
  }
}

// Database error helpers
export function handleDatabaseError(error: any, operation: string): never {
  Logger.error(`Database error during ${operation}`, error)
  
  if (error.code === 'P2002') {
    throw new ConflictError('Resource already exists')
  }
  
  if (error.code === 'P2025') {
    throw new NotFoundError('Resource not found')
  }
  
  throw new DatabaseError(`Failed to ${operation}`)
}

// External service error helpers
export function handleExternalServiceError(
  service: string,
  error: any,
  operation: string
): never {
  Logger.externalService(service, operation, false, { error: error.message })
  
  if (error.response?.status === 429) {
    throw new RateLimitError(`${service} rate limit exceeded`)
  }
  
  if (error.response?.status >= 500) {
    throw new ExternalServiceError(service, 'Service temporarily unavailable')
  }
  
  throw new ExternalServiceError(service, error.message || 'Unknown error')
}

// Security error helpers
export function handleSecurityViolation(
  violation: string,
  details?: any
): never {
  Logger.security(`Security violation: ${violation}`, details)
  throw new AuthorizationError('Access denied')
}

// Rate limiting error helper
export function handleRateLimit(
  identifier: string,
  limit: number,
  window: number
): never {
  Logger.security('Rate limit exceeded', { identifier, limit, window })
  throw new RateLimitError(`Rate limit exceeded. Try again in ${Math.ceil(window / 1000)} seconds`)
}
