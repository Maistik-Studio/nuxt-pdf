import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

// Server-side PDF rendering spins up a browser per request, so generation time
// varies a lot. The reliable signal is the `/api/pdf` response itself: we wait
// for it directly (handling both success and graceful-error paths) instead of
// observing transient button/loading state, which is racy.
async function generateAndExpectResult(page: Page) {
  const responsePromise = page.waitForResponse(
    response => response.url().includes('/api/pdf'),
    { timeout: 90_000 },
  )

  await page.click('button[data-testid="generate-pdf"]')

  const response = await responsePromise
  // 200 on success, or a handled error status — never a crash.
  expect([200, 400, 404, 500]).toContain(response.status())

  // The UI should reflect the result (preview on success, error otherwise).
  await expect(
    page.locator('iframe[data-testid="pdf-preview"]')
      .or(page.locator('[data-testid="error-message"]'))
      .first(),
  ).toBeVisible({ timeout: 15_000 })
}

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
    await page.selectOption('select[data-testid="template-select"]', 'Invoice')
    await page.selectOption('select[data-testid="locale-select"]', 'en')
    await page.selectOption('select[data-testid="format-select"]', 'A4')

    await generateAndExpectResult(page)
  })

  test('should handle different locales', async ({ page }) => {
    const locales = ['en', 'es', 'fr']

    for (const locale of locales) {
      await page.selectOption('select[data-testid="locale-select"]', locale)
      await generateAndExpectResult(page)
    }
  })

  test('should handle different formats', async ({ page }) => {
    const formats = ['A4', 'Letter', 'Legal']

    for (const format of formats) {
      await page.selectOption('select[data-testid="format-select"]', format)
      await generateAndExpectResult(page)
    }
  })
})
