import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPdfProvider } from '../../src/runtime/utils/providers'

// Mock fetch globally
global.fetch = vi.fn()

describe('PDF Providers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Gotenberg Provider', () => {
    it('should create Gotenberg provider', () => {
      const provider = createPdfProvider('gotenberg', {
        gotenberg: { url: 'http://localhost:3000' },
      })

      expect(provider).toBeDefined()
    })

    it('should generate PDF with Gotenberg', async () => {
      const mockResponse = {
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1000)),
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any)

      const provider = createPdfProvider('gotenberg', {
        gotenberg: { url: 'http://localhost:3000' },
      })

      const html = '<html><body>Test</body></html>'
      const options = { format: 'A4' }

      const result = await provider.generatePdf(html, options)

      expect(result).toBeInstanceOf(Buffer)
      expect(result.length).toBe(1000)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/forms/chromium/convert/html',
        expect.objectContaining({
          method: 'POST',
        }),
      )
    })

    it('should handle Gotenberg errors', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Internal Server Error',
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any)

      const provider = createPdfProvider('gotenberg', {
        gotenberg: { url: 'http://localhost:3000' },
      })

      const html = '<html><body>Test</body></html>'
      const options = { format: 'A4' }

      await expect(provider.generatePdf(html, options))
        .rejects.toThrow('Gotenberg error: Internal Server Error')
    })
  })

  describe('Browserless Provider', () => {
    it('should create Browserless provider', () => {
      const provider = createPdfProvider('browserless', {
        browserless: {
          url: 'https://chrome.browserless.io',
          apiKey: 'test-key',
        },
      })

      expect(provider).toBeDefined()
    })

    it('should generate PDF with Browserless', async () => {
      const mockResponse = {
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1000)),
      }

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as any)

      const provider = createPdfProvider('browserless', {
        browserless: {
          url: 'https://chrome.browserless.io',
          apiKey: 'test-key',
        },
      })

      const html = '<html><body>Test</body></html>'
      const options = { format: 'A4' }

      const result = await provider.generatePdf(html, options)

      expect(result).toBeInstanceOf(Buffer)
      expect(result.length).toBe(1000)
      expect(fetch).toHaveBeenCalledWith(
        'https://chrome.browserless.io/pdf?token=test-key',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      )
    })
  })

  describe('Puppeteer Provider', () => {
    it('should create Puppeteer provider', () => {
      const provider = createPdfProvider('puppeteer', {
        puppeteer: {
          launchOptions: { headless: true },
        },
      })

      expect(provider).toBeDefined()
    })

    // Note: Testing Puppeteer provider would require mocking the entire puppeteer module
    // which is complex. In a real scenario, you might want to use integration tests instead.
  })

  describe('Provider Factory', () => {
    it('should throw error for unknown provider', () => {
      expect(() => {
        createPdfProvider('unknown', {})
      }).toThrow('Unknown PDF provider: unknown')
    })
  })
})
