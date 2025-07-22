import { defineNuxtModule, addServerHandler, createResolver, addImports } from '@nuxt/kit'
import type { HelperDelegate } from 'handlebars'
import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

export interface PdfModuleOptions {
  provider: 'gotenberg' | 'browserless' | 'puppeteer'
  components: string[]
  sharedComponents: string[]
  enableI18n: boolean
  defaultLocale: string
  availableLocales: string[]
  i18nMessages: Record<string, Record<string, string>>
  providers: {
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
  defaultOptions: {
    format: string
    margin: {
      top: number
      bottom: number
      left: number
      right: number
    }
    landscape: boolean
    printBackground: boolean
    pageBreak: {
      before: string[]
      after: string[]
      avoid: string[]
    }
  }
  customHelpers?: Record<string, HelperDelegate>
}

export default defineNuxtModule<PdfModuleOptions>({
  meta: {
    name: '@maistik/nuxt-pdf',
    configKey: 'pdf',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  defaults: {
    provider: 'gotenberg',
    components: ['pdf'],
    sharedComponents: ['pdf/partials'],
    enableI18n: true,
    defaultLocale: 'en',
    availableLocales: ['en'],
    i18nMessages: {},
    providers: {
      gotenberg: {
        url: 'http://localhost:3000',
      },
      browserless: {
        url: 'https://chrome.browserless.io',
        apiKey: '',
      },
      puppeteer: {
        launchOptions: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      },
    },
    customHelpers: {},
    defaultOptions: {
      format: 'A4',
      margin: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      },
      landscape: false,
      printBackground: true,
      pageBreak: {
        before: ['always'],
        after: ['always'],
        avoid: ['.no-break'],
      },
    },
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Discover templates and partials
    const templateSources: Record<string, string> = {}
    const partialSources: Record<string, string> = {}

    // Scan component directories for templates
    for (const componentDir of options.components) {
      const fullPath = join(nuxt.options.srcDir, componentDir)
      if (existsSync(fullPath)) {
        scanDirectory(fullPath, templateSources, '.hbs')
      }
    }

    // Scan shared component directories for partials
    for (const sharedDir of options.sharedComponents) {
      const fullPath = join(nuxt.options.srcDir, sharedDir)
      if (existsSync(fullPath)) {
        scanDirectory(fullPath, partialSources, '.hbs')
      }
    }

    // Add runtime config
    nuxt.options.runtimeConfig.pdf = {
      provider: options.provider,
      enableI18n: options.enableI18n,
      defaultLocale: options.defaultLocale,
      availableLocales: options.availableLocales,
      i18nMessages: options.i18nMessages,
      providers: options.providers,
      defaultOptions: options.defaultOptions,
      templateSources,
      partialSources,
      customHelpers: options.customHelpers || {},
    }

    // Add public runtime config for client-side
    nuxt.options.runtimeConfig.public.pdf = {
      enableI18n: options.enableI18n,
      defaultLocale: options.defaultLocale,
      availableLocales: options.availableLocales,
    }

    // Add server handler
    addServerHandler({
      route: '/api/pdf',
      handler: resolver.resolve('./runtime/server/api/pdf.post'),
    })

    // Add composable
    addImports({
      name: 'usePdf',
      as: 'usePdf',
      from: resolver.resolve('./runtime/composables/usePdf'),
    })
  },
})

function scanDirectory(dir: string, sources: Record<string, string>, extension: string) {
  if (!existsSync(dir)) return

  const files = readdirSync(dir)
  for (const file of files) {
    const filePath = join(dir, file)
    const stat = statSync(filePath)

    if (stat.isDirectory()) {
      scanDirectory(filePath, sources, extension)
    }
    else if (file.endsWith(extension)) {
      const templateName = file.replace(extension, '')
      sources[templateName] = readFileSync(filePath, 'utf-8')
    }
  }
}
