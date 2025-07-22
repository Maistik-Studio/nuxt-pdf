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

    // Check if PDF preview appears
    await expect(page.locator('iframe[data-testid="pdf-preview"]')).toBeVisible()

    // Verify no error message
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible()
  })

  test('should generate Sales Report PDF', async ({ page }) => {
    // Select Sales Report template
    await page.selectOption('select[data-testid="template-select"]', 'SalesReport')

    // Select Spanish locale
    await page.selectOption('select[data-testid="locale-select"]', 'es')

    // Select Letter format
    await page.selectOption('select[data-testid="format-select"]', 'Letter')

    // Click generate PDF button
    await page.click('button[data-testid="generate-pdf"]')

    // Wait for generation to complete
    await expect(page.locator('button[data-testid="generate-pdf"]')).not.toContainText('Generating...')

    // Check if PDF preview appears
    await expect(page.locator('iframe[data-testid="pdf-preview"]')).toBeVisible()

    // Verify no error message
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible()
  })

  test('should download PDF file', async ({ page }) => {
    // Select Invoice template
    await page.selectOption('select[data-testid="template-select"]', 'Invoice')

    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download')

    // Click download PDF button
    await page.click('button[data-testid="download-pdf"]')

    // Wait for download to complete
    const download = await downloadPromise

    // Verify download properties
    expect(download.suggestedFilename()).toMatch(/invoice-\d+\.pdf/)

    // Save and verify file exists
    const path = await download.path()
    expect(path).toBeTruthy()
  })

  test('should handle different locales', async ({ page }) => {
    const locales = ['en', 'es', 'fr']

    for (const locale of locales) {
      await page.selectOption('select[data-testid="locale-select"]', locale)
      await page.click('button[data-testid="generate-pdf"]')

      // Wait for generation to complete
      await expect(page.locator('button[data-testid="generate-pdf"]')).not.toContainText('Generating...')

      // Verify PDF was generated successfully
      await expect(page.locator('iframe[data-testid="pdf-preview"]')).toBeVisible()
      await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible()
    }
  })

  test('should handle different formats', async ({ page }) => {
    const formats = ['A4', 'Letter', 'Legal']

    for (const format of formats) {
      await page.selectOption('select[data-testid="format-select"]', format)
      await page.click('button[data-testid="generate-pdf"]')

      // Wait for generation to complete
      await expect(page.locator('button[data-testid="generate-pdf"]')).not.toContainText('Generating...')

      // Verify PDF was generated successfully
      await expect(page.locator('iframe[data-testid="pdf-preview"]')).toBeVisible()
      await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible()
    }
  })

  test('should display error for invalid template', async ({ page }) => {
    // Intercept API call and return error
    await page.route('/api/pdf', (route) => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Template not found' }),
      })
    })

    await page.click('button[data-testid="generate-pdf"]')

    // Wait for error to appear
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to generate PDF')
  })
})
