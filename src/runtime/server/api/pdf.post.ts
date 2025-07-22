import { defineEventHandler, readBody, setHeader } from 'h3'
import { useRuntimeConfig } from '#imports'
import { compilePdfComponent } from '../../utils/compiler'
import { createPdfProvider } from '../../utils/providers'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const { template, ctx } = await readBody(event)

    if (!template || !ctx) {
      throw new Error('Missing template or context')
    }

    const { data, options = {}, locale } = ctx
    const mergedOptions = { ...config.pdf.defaultOptions, ...options }

    // Get i18n messages for the locale
    const messages = config.pdf.enableI18n
      ? config.pdf.i18nMessages[locale || config.pdf.defaultLocale] || {}
      : {}

    // Compile the template
    const html = compilePdfComponent(
      template,
      { data, options: mergedOptions, locale },
      messages,
      config.pdf.templateSources,
      config.pdf.partialSources,
    )

    // Create PDF using the configured provider
    const provider = createPdfProvider(config.pdf.provider, config.pdf.providers)
    const pdfBuffer = await provider.generatePdf(html, mergedOptions)

    // Set response headers
    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(event, 'Content-Length', pdfBuffer.length.toString())

    return pdfBuffer
  }
  catch (error) {
    console.error('PDF generation error:', error)
    throw error
  }
})
