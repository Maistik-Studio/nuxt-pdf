import FormData from 'form-data'
import type { PdfProvider, PdfProviderConfig, PdfOptions } from '../types'

export function createPdfProvider(
  providerType: string,
  config: Partial<PdfProviderConfig>,
): PdfProvider {
  switch (providerType) {
    case 'gotenberg':
      return new GotenbergProvider(config.gotenberg!)
    case 'browserless':
      return new BrowserlessProvider(config.browserless!)
    case 'puppeteer':
      return new PuppeteerProvider(config.puppeteer!)
    default:
      throw new Error(`Unknown PDF provider: ${providerType}`)
  }
}

class GotenbergProvider implements PdfProvider {
  constructor(private config: { url: string }) {}

  async generatePdf(html: string, options: PdfOptions): Promise<Buffer> {
    const form = new FormData()

    // Add the HTML file
    const htmlBuffer = Buffer.from(html, 'utf8')
    form.append('files', htmlBuffer, {
      filename: 'index.html',
      contentType: 'text/html',
      knownLength: htmlBuffer.length,
    })

    // Add Gotenberg-specific options
    if (options.format) {
      const dimensions = this.getPageDimensions(options.format)
      form.append('paperWidth', dimensions.width)
      form.append('paperHeight', dimensions.height)
    }

    if (options.margin) {
      // Convert mm to inches
      form.append('marginTop', ((options.margin.top ?? 0) / 25.4).toString())
      form.append('marginBottom', ((options.margin.bottom ?? 0) / 25.4).toString())
      form.append('marginLeft', ((options.margin.left ?? 0) / 25.4).toString())
      form.append('marginRight', ((options.margin.right ?? 0) / 25.4).toString())
    }

    if (options.landscape) {
      form.append('landscape', 'true')
    }

    if (options.printBackground) {
      form.append('printBackground', 'true')
    }

    // Wait for network idle
    form.append('waitForNetworkIdle', 'true')
    form.append('waitDelay', '1s')

    const bodyBuffer = form.getBuffer()
    const headers: Record<string, string> = {
      ...form.getHeaders(), // multipart/form-data; boundary=XXX
      'Content-Length': bodyBuffer.length.toString(),
    }

    const response = await fetch(`${this.config.url}/forms/chromium/convert/html`, {
      method: 'POST',
      body: bodyBuffer,
      headers,
    })

    if (!response.ok) {
      throw new Error(`Gotenberg error: ${response.statusText}`)
    }

    return Buffer.from(await response.arrayBuffer())
  }

  private getPageDimensions(format: string): { width: string, height: string } {
    const formats: Record<string, { width: string, height: string }> = {
      A4: { width: '8.27in', height: '11.69in' },
      Letter: { width: '8.5in', height: '11in' },
      Legal: { width: '8.5in', height: '14in' },
    }
    return formats[format] || formats['A4']
  }
}

class BrowserlessProvider implements PdfProvider {
  constructor(private config: { url: string, apiKey: string }) {}

  async generatePdf(html: string, options: PdfOptions): Promise<Buffer> {
    const response = await fetch(`${this.config.url}/pdf?token=${this.config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html,
        options: {
          format: options.format || 'A4',
          margin: options.margin,
          landscape: options.landscape || false,
          printBackground: options.printBackground !== false,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Browserless error: ${response.statusText}`)
    }

    return Buffer.from(await response.arrayBuffer())
  }
}

class PuppeteerProvider implements PdfProvider {
  // Launching a full Chromium per request is slow and flaky (especially on CI),
  // so we keep one browser alive and reuse it, relaunching if it disconnects.
  private static browser: import('puppeteer').Browser | null = null
  private static launching: Promise<import('puppeteer').Browser> | null = null

  constructor(private config: { launchOptions: Record<string, unknown> }) {}

  private async getBrowser(): Promise<import('puppeteer').Browser> {
    const existing = PuppeteerProvider.browser
    if (existing?.connected) {
      return existing
    }

    // De-duplicate concurrent launches.
    if (!PuppeteerProvider.launching) {
      PuppeteerProvider.launching = (async () => {
        const puppeteer = await import('puppeteer').then(m => m.default)
        const launchOptions = this.config.launchOptions as Parameters<typeof puppeteer.launch>[0]
        const browser = await puppeteer.launch({
          // `--disable-dev-shm-usage` avoids Chromium exhausting the small
          // /dev/shm tmpfs in CI/Docker, a common cause of hangs and crashes.
          ...launchOptions,
          args: ['--disable-dev-shm-usage', ...(launchOptions?.args ?? [])],
        })
        PuppeteerProvider.browser = browser
        browser.on('disconnected', () => {
          PuppeteerProvider.browser = null
        })
        return browser
      })()

      try {
        await PuppeteerProvider.launching
      }
      finally {
        PuppeteerProvider.launching = null
      }
    }
    else {
      await PuppeteerProvider.launching
    }

    return PuppeteerProvider.browser!
  }

  async generatePdf(html: string, options: PdfOptions): Promise<Buffer> {
    const browser = await this.getBrowser()
    const page = await browser.newPage()

    try {
      // `domcontentloaded` + a bounded timeout keeps a missing external asset
      // from blocking generation indefinitely; templates are self-contained.
      await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30_000 })

      const pdfOptions = {
        format: options.format || 'A4',
        margin: options.margin,
        landscape: options.landscape || false,
        printBackground: options.printBackground !== false,
        timeout: 30_000,
      }

      const pdfBuffer = await page.pdf(pdfOptions as Parameters<typeof page.pdf>[0])
      return Buffer.from(pdfBuffer)
    }
    finally {
      await page.close().catch(() => {})
    }
  }
}
