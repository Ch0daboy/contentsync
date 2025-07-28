import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/')
  })

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Should be redirected to login page
    await expect(page).toHaveURL(/.*\/login/)
    
    // Should show login form
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('should show validation errors for invalid login', async ({ page }) => {
    await page.goto('/login')
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // Should show validation errors
    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Password is required')).toBeVisible()
  })

  test('should handle login with invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login')
    
    // Click register link
    await page.click('text=Sign up')
    
    // Should navigate to register page
    await expect(page).toHaveURL(/.*\/register/)
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('should show validation errors for invalid registration', async ({ page }) => {
    await page.goto('/register')
    
    // Try to submit with invalid data
    await page.fill('input[name="name"]', '')
    await page.fill('input[type="email"]', 'invalid-email')
    await page.fill('input[type="password"]', '123') // Too short
    
    await page.click('button[type="submit"]')
    
    // Should show validation errors
    await expect(page.locator('text=Name is required')).toBeVisible()
    await expect(page.locator('text=Invalid email')).toBeVisible()
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible()
  })

  test('should handle successful registration flow', async ({ page }) => {
    await page.goto('/register')
    
    // Fill in valid registration data
    const timestamp = Date.now()
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[type="email"]', `test${timestamp}@example.com`)
    await page.fill('input[type="password"]', 'password123')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should redirect to login or dashboard
    await expect(page).toHaveURL(/.*\/(login|dashboard)/)
  })

  test('should protect dashboard routes', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('/dashboard')
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*\/login/)
  })

  test('should protect platform routes', async ({ page }) => {
    // Try to access platforms without authentication
    await page.goto('/platforms')
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*\/login/)
  })

  test('should protect content routes', async ({ page }) => {
    // Try to access content without authentication
    await page.goto('/content')
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*\/login/)
  })

  test('should protect settings routes', async ({ page }) => {
    // Try to access settings without authentication
    await page.goto('/settings')
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*\/login/)
  })
})

test.describe('Authenticated User Flow', () => {
  // This would require setting up a test user and authentication
  // For now, we'll skip these tests until we have a proper test database setup
  test.skip('should allow authenticated users to access dashboard', async ({ page }) => {
    // TODO: Implement authentication setup
    // await authenticateUser(page, 'test@example.com', 'password123')
    
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/.*\/dashboard/)
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test.skip('should allow logout', async ({ page }) => {
    // TODO: Implement authentication setup
    // await authenticateUser(page, 'test@example.com', 'password123')
    
    await page.goto('/dashboard')
    await page.click('button:has-text("Logout")')
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/)
  })
})
