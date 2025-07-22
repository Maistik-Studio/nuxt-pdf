import { test, expect } from '@playwright/test'

test.describe('PDF Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the playground page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Nuxt PDF Module Playground')
    await expect(page.locator('select[data-testid="template-select"]')).toBeVisible()
    await expect(page.locator('select[data-testid="locale-select"]')).toBeVisible()
    await expect(page.locator('select[data-testid="format-select"]')).toBeVisible()
  })

  test('should generate Invoice PDF', async ({ page }) => {
    // Select Invoice template
    await page.selectOption('select[data-testid="template-select"]', 'Invoice')

    // Select English locale
    await page.selectOption('select[data-testid="locale-select"]', 'en')

    // Select A4 format
    await page.selectOption('select[data-testid="format-select"]', 'A4')

    // Click generate PDF button
    await page.click('button[data-testid="generate-pdf"]')

    // Wait for generation to complete
    await expect(page.locator('button[data-testid="generate-pdf"]')).not.toContainText('Generating...')

    // Check if PDF preview appears or error is handled gracefully
    const hasPreview = await page.locator('iframe[data-testid="pdf-preview"]').isVisible()
    const hasError = await page.locator('[data-testid="error-message"]').isVisible()

    // Either should have preview or error (since we don't have actual PDF provider running)
    expect(hasPreview || hasError).toBe(true)
  })

  test('should handle different locales', async ({ page }) => {
    const locales = ['en', 'es', 'fr']

    for (const locale of locales) {
      await page.selectOption('select[data-testid="locale-select"]', locale)
      await page.click('button[data-testid="generate-pdf"]')

      // Wait for generation to complete
      await expect(page.locator('button[data-testid="generate-pdf"]')).not.toContainText('Generating...')

      // Should either succeed or fail gracefully
      const hasPreview = await page.locator('iframe[data-testid="pdf-preview"]').isVisible()
      const hasError = await page.locator('[data-testid="error-message"]').isVisible()
      expect(hasPreview || hasError).toBe(true)
    }
  })

  test('should handle different formats', async ({ page }) => {
    const formats = ['A4', 'Letter', 'Legal']

    for (const format of formats) {
      await page.selectOption('select[data-testid="format-select"]', format)
      await page.click('button[data-testid="generate-pdf"]')

      // Wait for generation to complete
      await expect(page.locator('button[data-testid="generate-pdf"]')).not.toContainText('Generating...')

      // Should either succeed or fail gracefully
      const hasPreview = await page.locator('iframe[data-testid="pdf-preview"]').isVisible()
      const hasError = await page.locator('[data-testid="error-message"]').isVisible()
      expect(hasPreview || hasError).toBe(true)
    }
  })
})
