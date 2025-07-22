import { useRuntimeConfig } from '#imports'

export interface PdfGenerateOptions {
  format?: string
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

export function usePdf() {
  const config = useRuntimeConfig()

  const generate = async (
    template: string,
    data: any,
    options: PdfGenerateOptions = {},
    locale?: string,
  ): Promise<Blob> => {
    const response = await $fetch('/api/pdf', {
      method: 'POST',
      body: {
        template,
        ctx: {
          data,
          options,
          locale: locale || config.public.pdf.defaultLocale,
        },
      },
      responseType: 'arrayBuffer',
    })

    return new Blob([response], { type: 'application/pdf' })
  }

  const download = async (
    template: string,
    data: any,
    options: PdfGenerateOptions = {},
    filename: string = 'document.pdf',
    locale?: string,
  ): Promise<void> => {
    const blob = await generate(template, data, options, locale)

    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getAvailableLocales = (): string[] => {
    return config.public.pdf.availableLocales || ['en']
  }

  const getDefaultLocale = (): string => {
    return config.public.pdf.defaultLocale || 'en'
  }

  return {
    generate,
    download,
    getAvailableLocales,
    getDefaultLocale,
  }
}
