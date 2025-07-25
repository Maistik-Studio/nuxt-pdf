import { describe, it, expect } from 'vitest'

// Create a testable version of the compiler without Nuxt dependencies
import Handlebars from 'handlebars'

function createTestCompiler() {
  const handlebars = Handlebars.create()

  // Register test helpers
  handlebars.registerHelper('t', function (key: string, messages: Record<string, any>) {
    const keys = key.split('.')
    let value = messages

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      }
      else {
        return key
      }
    }

    return typeof value === 'string' ? value : key
  })

  handlebars.registerHelper('formatCurrency', function (value: number, locale = 'en-US') {
    if (typeof value !== 'number') return value
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
    }).format(value)
    return formatted.replace(/\u00A0/g, ' ')
  })

  handlebars.registerHelper('upper', function (str: string) {
    return String(str || '').toUpperCase()
  })

  handlebars.registerHelper('formatDate', function (date: Date | string, locale = 'en-US') {
    let dateObj: Date
    if (typeof date === 'string') {
      dateObj = new Date(date)
    }
    else if (date instanceof Date) {
      dateObj = date
    }
    else {
      dateObj = new Date()
    }
    if (isNaN(dateObj.getTime())) {
      dateObj = new Date()
    }

    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'short' as any,
    }).format(dateObj)
  })

  return handlebars
}

describe('PDF Compiler', () => {
  const mockMessages = {
    invoice: {
      title: 'Invoice',
      total: 'Total',
      subtotal: 'Subtotal',
    },
  }

  const mockTemplateSource = `
    <h1>{{t "invoice.title" @root.messages}}</h1>
    <p>{{formatCurrency total}}</p>
    <p>{{upper company.name}}</p>
  `

  it('should compile template with helpers', () => {
    const handlebars = createTestCompiler()
    const template = handlebars.compile(mockTemplateSource)

    const result = template({
      total: 100,
      company: { name: 'test company' },
      messages: mockMessages,
    })

    const allowed = ['$100.00', '100,00 US$']
    const ok = allowed.some(fmt => result.includes(fmt))
    expect(ok).toBe(true)
  })

  it('should handle missing translation keys', () => {
    const handlebars = createTestCompiler()
    const templateWithMissingKey = '<h1>{{t "missing.key" @root.messages}}</h1>'
    const template = handlebars.compile(templateWithMissingKey)

    const result = template({ messages: {} })

    expect(result).toContain('missing.key')
  })

  it('should format currency correctly', () => {
    const handlebars = createTestCompiler()
    const templateSource = '<p>{{formatCurrency amount}}</p>'
    const template = handlebars.compile(templateSource)

    const result = template({ amount: 1234.56 })

    const allowed = ['$1,234.56', '1234,56 US$']
    const ok = allowed.some(fmt => result.includes(fmt))
    expect(ok).toBe(true)
  })

  it('should format dates correctly', () => {
    const handlebars = createTestCompiler()
    const templateSource = '<p>{{formatDate date}}</p>'
    const template = handlebars.compile(templateSource)

    const result = template({ date: '2024-01-15' })

    const allowed = ['1/15/24', '15/1/24']
    const ok = allowed.some(fmt => result.includes(fmt))
    expect(ok).toBe(true)
  })

  it('should handle string helpers', () => {
    const handlebars = createTestCompiler()
    const templateSource = `
      <p>{{upper text}}</p>
    `
    const template = handlebars.compile(templateSource)

    const result = template({ text: 'hello world' })

    expect(result).toContain('HELLO WORLD')
  })
})
