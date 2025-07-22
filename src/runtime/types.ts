export interface PdfContext {
  data: any
  options: PdfOptions
  locale?: string
}

export interface PdfOptions {
  format?: 'A4' | 'Letter' | 'Legal'
  margin?: {
    top?: number
    bottom?: number
    left?: number
    right?: number
  }
  landscape?: boolean
  printBackground?: boolean
  pageBreak?: {
    before?: string[]
    after?: string[]
    avoid?: string[]
  }
}

export interface PdfProviderConfig {
  gotenberg: {
    url: string
  }
  browserless: {
    url: string
    apiKey: string
  }
  puppeteer: {
    launchOptions: Record<string, any>
  }
}

export interface PdfProvider {
  generatePdf(html: string, options: any): Promise<Buffer>
}
