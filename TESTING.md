# Testing Guide

## Overview

This project uses a comprehensive testing strategy with multiple layers of testing to ensure reliability and maintainability.

## Testing Stack

- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Jest with API testing
- **End-to-End Tests**: Playwright
- **Coverage**: Jest coverage reports
- **CI/CD**: GitHub Actions

## Test Structure

```
├── __tests__/              # Unit tests (Jest)
│   ├── lib/               # Library function tests
│   ├── components/        # React component tests
│   └── api/               # API route tests
├── tests/
│   ├── unit/              # Additional unit tests
│   ├── integration/       # Integration tests
│   ├── e2e/               # End-to-end tests (Playwright)
│   └── utils/             # Test utilities and helpers
├── jest.config.js         # Jest configuration
├── jest.setup.js          # Jest setup and mocks
└── playwright.config.ts   # Playwright configuration
```

## Running Tests

### All Tests
```bash
npm run test:all          # Run all test suites
```

### Unit Tests
```bash
npm test                  # Run unit tests once
npm run test:watch        # Run unit tests in watch mode
npm run test:coverage     # Run with coverage report
npm run test:unit         # Run only unit tests
```

### Integration Tests
```bash
npm run test:integration  # Run integration tests
```

### End-to-End Tests
```bash
npm run test:e2e          # Run E2E tests headless
npm run test:e2e:headed   # Run E2E tests with browser UI
npm run test:e2e:ui       # Run E2E tests with Playwright UI
```

### Setup Playwright
```bash
npm run playwright:install  # Install Playwright browsers
```

## Test Categories

### 1. Unit Tests

Test individual functions, components, and modules in isolation.

**Location**: `__tests__/`

**Examples**:
- Security middleware functions
- Environment validation
- Content sanitization
- Utility functions
- React components

**Running**:
```bash
npm run test:unit
```

### 2. Integration Tests

Test how different parts of the system work together.

**Location**: `tests/integration/`

**Examples**:
- API routes with database
- Authentication flows
- Background job processing
- External service integrations

**Running**:
```bash
npm run test:integration
```

### 3. End-to-End Tests

Test complete user workflows in a real browser environment.

**Location**: `tests/e2e/`

**Examples**:
- User registration and login
- Platform management
- Content creation and editing
- API security testing

**Running**:
```bash
npm run test:e2e
```

## Test Environment Setup

### Environment Variables

Tests use the following environment variables:

```bash
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:5432/test
REDIS_URL=redis://localhost:6379
NEXTAUTH_SECRET=test-secret-key-for-testing-purposes-only
GEMINI_API_KEY=test-gemini-key
CRON_SECRET=test-cron-secret-for-testing-purposes
```

### Test Database

For integration and E2E tests, set up a separate test database:

```bash
# Create test database
createdb contentsync_test

# Set test database URL
export TEST_DATABASE_URL="postgresql://user:pass@localhost:5432/contentsync_test"

# Run migrations
npx prisma db push
```

## Writing Tests

### Unit Test Example

```typescript
// __tests__/lib/security.test.ts
import { sanitizeContent } from '@/lib/security'

describe('sanitizeContent', () => {
  it('should remove script tags', () => {
    const input = 'Hello <script>alert("xss")</script> World'
    const output = sanitizeContent(input)
    expect(output).toBe('Hello  World')
  })
})
```

### API Test Example

```typescript
// __tests__/api/platforms.test.ts
import { GET } from '@/app/api/platforms/route'
import { NextRequest } from 'next/server'

describe('/api/platforms', () => {
  it('should return 401 for unauthenticated user', async () => {
    const request = new NextRequest('http://localhost:3000/api/platforms')
    const response = await GET(request)
    expect(response.status).toBe(401)
  })
})
```

### E2E Test Example

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test('should redirect unauthenticated users to login', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/.*\/login/)
})
```

## Test Utilities

### Database Helpers

```typescript
import { TestDatabase } from '@/tests/utils/test-helpers'

const testDb = new TestDatabase()

// Create test user
const user = await testDb.createTestUser({
  email: 'test@example.com',
  password: 'password123'
})

// Clean up after tests
await testDb.cleanup()
```

### Authentication Helpers

```typescript
import { AuthHelper } from '@/tests/utils/test-helpers'

// Login user in E2E test
await AuthHelper.login(page, 'test@example.com', 'password123')

// Register new user
await AuthHelper.register(page, {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
})
```

## Coverage Requirements

- **Minimum Coverage**: 70% for all metrics
- **Critical Paths**: 90%+ coverage required
- **Security Functions**: 100% coverage required

### Coverage Reports

```bash
npm run test:coverage
```

Reports are generated in:
- `coverage/lcov-report/index.html` - HTML report
- `coverage/lcov.info` - LCOV format for CI

## Continuous Integration

### GitHub Actions

The CI pipeline runs:

1. **Linting**: Code style and syntax checks
2. **Unit Tests**: All unit tests with coverage
3. **Integration Tests**: Database and API tests
4. **Security Audit**: Dependency vulnerability scan
5. **Build**: Application build verification
6. **E2E Tests**: Full browser testing
7. **Deploy**: Automatic deployment on main branch

### Required Checks

All PRs must pass:
- ✅ Linting
- ✅ Unit tests (70%+ coverage)
- ✅ Integration tests
- ✅ Security audit
- ✅ Build success
- ✅ E2E tests

## Best Practices

### Test Organization

1. **Group related tests** using `describe` blocks
2. **Use descriptive test names** that explain the expected behavior
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Keep tests independent** - no shared state between tests

### Mocking

1. **Mock external dependencies** (APIs, databases, etc.)
2. **Use Jest mocks** for Node.js modules
3. **Mock Next.js features** (router, auth, etc.)
4. **Avoid mocking internal functions** unless necessary

### Data Management

1. **Use test factories** for generating test data
2. **Clean up after tests** to prevent interference
3. **Use separate test database** for integration tests
4. **Reset mocks** between tests

### Performance

1. **Keep tests fast** - aim for <1s per test
2. **Use parallel execution** where possible
3. **Mock slow operations** (network calls, file I/O)
4. **Optimize test setup/teardown**

## Debugging Tests

### Jest Debugging

```bash
# Run specific test file
npm test -- security.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should validate"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Playwright Debugging

```bash
# Run with browser UI
npm run test:e2e:headed

# Run with Playwright inspector
npm run test:e2e:ui

# Debug specific test
npx playwright test auth.spec.ts --debug
```

## Troubleshooting

### Common Issues

1. **Database connection errors**: Check TEST_DATABASE_URL
2. **Port conflicts**: Ensure test ports are available
3. **Timeout errors**: Increase timeout for slow operations
4. **Mock issues**: Verify mock setup in jest.setup.js

### Getting Help

1. Check test logs for detailed error messages
2. Review CI logs for environment-specific issues
3. Use debugging tools for step-by-step analysis
4. Consult team documentation for project-specific patterns
