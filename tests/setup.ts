import { vi } from 'vitest'

// Mock Nuxt composables
vi.mock('#imports', () => ({
  useRuntimeConfig: vi.fn(() => ({
    pdf: {
      provider: 'puppeteer',
      enableI18n: true,
      defaultLocale: 'en',
      availableLocales: ['en', 'es', 'fr'],
      i18nMessages: {},
      providers: {},
      defaultOptions: {},
      templateSources: {},
      partialSources: {},
      customHelpers: {},
    },
    public: {
      pdf: {
        enableI18n: true,
        defaultLocale: 'en',
        availableLocales: ['en', 'es', 'fr'],
      },
    },
  })),
}))

// Mock h3 functions
vi.mock('h3', () => ({
  defineEventHandler: vi.fn(handler => handler),
  readBody: vi.fn(),
  setHeader: vi.fn(),
}))

// Mock $fetch for composables
global.$fetch = vi.fn()
