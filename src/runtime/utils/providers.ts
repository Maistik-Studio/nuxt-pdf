import FormData from 'form-data'
import type { PdfProvider } from '../types'

export function createPdfProvider(
  providerType: string,
  config: any,
): PdfProvider {
  switch (providerType) {
    case 'gotenberg':
      return new GotenbergProvider(config.gotenberg)
    case 'browserless':
      return new BrowserlessProvider(config.browserless)
    case 'puppeteer':
      return new PuppeteerProvider(config.puppeteer)
    default:
      throw new Error(`Unknown PDF provider: ${providerType}`)
  }
}

class GotenbergProvider implements PdfProvider {
  constructor(private config: { url: string }) {}

  async generatePdf(html: string, options: any): Promise<Buffer> {
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
      form.append('marginTop', (options.margin.top / 25.4).toString()) // Convert mm to inches
      form.append('marginBottom', (options.margin.bottom / 25.4).toString())
      form.append('marginLeft', (options.margin.left / 25.4).toString())
      form.append('marginRight', (options.margin.right / 25.4).toString())
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

    const bodyBuffer = (form as any).getBuffer() as Buffer
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
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(`Gotenberg error: ${response.status} ${response.statusText} - ${errorText}`)
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

  async generatePdf(html: string, options: any): Promise<Buffer> {
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
  constructor(private config: { launchOptions: any }) {}

  async generatePdf(html: string, options: any): Promise<Buffer> {
    // Dynamic import to avoid bundling puppeteer in environments where it's not needed
    const puppeteer = await import('puppeteer').then(m => m.default)

    const browser = await puppeteer.launch(this.config.launchOptions)

    try {
      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'networkidle0' })

      const pdfOptions: any = {
        format: options.format || 'A4',
        margin: options.margin,
        landscape: options.landscape || false,
        printBackground: options.printBackground !== false,
      }

      const pdfBuffer = await page.pdf(pdfOptions)
      return Buffer.from(pdfBuffer)
    }
    finally {
      await browser.close()
    }
  }
}
