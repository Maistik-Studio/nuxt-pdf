import { useRuntimeConfig } from '#imports'
import type { HelperDelegate } from 'handlebars'
import Handlebars from 'handlebars'

export function compilePdfComponent(
  templateName: string,
  ctx: { data: any, options: any, locale?: string },
  messages: Record<string, string>,
  templateSources: Record<string, string>,
  partialSources: Record<string, string>,
): string {
  // Create a fresh Handlebars instance
  const handlebars = Handlebars.create()

  // Register i18n helper
  handlebars.registerHelper('t', function (key: string) {
    // Support nested keys like "invoice.title"
    const keys = key.split('.')
    let value = messages

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k] as any
      }
      else {
        return key // Return the key if not found
      }
    }

    return typeof value === 'string' ? value : key
  })

  // Register currency formatting helper
  handlebars.registerHelper('formatCurrency', function (
    value: number,
    currencyOrOptions: unknown,
    // maybeOptions?: { hash?: Record<string, any> },
  ) {
    // If they passed something that isn’t a number, just return it directly
    if (typeof value !== 'number') {
      return value
    }

    // Figure out the real currency code
    let currency = 'USD'

    if (typeof currencyOrOptions === 'string') {
      // {{formatCurrency amount "EUR"}}
      currency = currencyOrOptions
    }
    else if (
      currencyOrOptions
      && typeof (currencyOrOptions as any).hash?.currency === 'string'
    ) {
      // {{formatCurrency amount currency="GBP"}}
      currency = (currencyOrOptions as any).hash.currency
    }

    // Ensure it’s a valid ISO code (simple check)
    if (!/^[A-Z]{3}$/.test(currency)) {
      currency = 'USD'
    }

    // Now format
    return new Intl.NumberFormat(ctx.locale || 'en-US', {
      style: 'currency',
      currency,
    }).format(value)
  })

  // Register line total helper
  handlebars.registerHelper('lineTotal', function (qty: number, price: number) {
    return (qty * price).toFixed(2)
  })

  handlebars.registerHelper('eq', function (
    a: any,
    b: any,
    options: Handlebars.HelperOptions,
  ) {
    const isEqual = a === b

    // Block form: {{#if (eq a b)}}…{{else}}…{{/if}} or {{#eq a b}}…{{else}}…{{/eq}}
    if (options && typeof options.fn === 'function') {
      return isEqual
        ? options.fn(this)
        : options.inverse(this)
    }

    // Inline form: {{eq a b}} ⇒ returns true/false
    return isEqual
  })

  handlebars.registerHelper('ne', (a, b, opts) =>
    a !== b ? opts.fn(this) : opts.inverse(this),
  )

  handlebars.registerHelper('gt', (a, b, opts) =>
    a > b ? opts.fn(this) : opts.inverse(this),
  )

  // Register date formatting helper
  handlebars.registerHelper('formatDate', function (
    date: Date | string,
    formatOrOptions: unknown,
    // maybeOptions?: { hash?: Record<string, any> },
  ) {
    // figure out your style as before…
    let style = 'short'
    if (typeof formatOrOptions === 'string') {
      style = formatOrOptions
    }
    else if (
      formatOrOptions
      && typeof (formatOrOptions as any).hash?.format === 'string'
    ) {
      style = (formatOrOptions as any).hash.format
    }
    if (!['full', 'long', 'medium', 'short'].includes(style)) {
      style = 'short'
    }

    // now coerce to a real Date, and if it’s invalid, use "now"
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

    return new Intl.DateTimeFormat(ctx.locale || 'en-US', {
      dateStyle: style as any,
    }).format(dateObj)
  })

  // Register number formatting helper
  handlebars.registerHelper('formatNumber', function (value: number, options: any = {}) {
    if (typeof value !== 'number') return value
    return new Intl.NumberFormat(ctx.locale || 'en-US', options).format(value)
  })

  // Register custom helpers from runtime config
  try {
    const config = useRuntimeConfig()
    const customHelpers = (config.pdf as any).customHelpers as Record<string, any>

    if (customHelpers && typeof customHelpers === 'object') {
      Object.entries(customHelpers).forEach(([name, helper]) => {
        if (typeof helper === 'function') {
          handlebars.registerHelper(name, helper as HelperDelegate)
        }
      })
    }
  }
  catch (error) {
    console.warn('Failed to load custom helpers:', error)
  }

  // Register built-in helpers (always available)
  handlebars.registerHelper('upper', function (str: string) {
    return String(str || '').toUpperCase()
  })

  handlebars.registerHelper('lower', function (str: string) {
    return String(str || '').toLowerCase()
  })

  handlebars.registerHelper('capitalize', function (str: string) {
    return String(str || '').charAt(0).toUpperCase() + String(str || '').slice(1).toLowerCase()
  })

  handlebars.registerHelper('truncate', function (str: string, length: number) {
    const text = String(str || '')
    return text.length > length ? `${text.substring(0, length)}...` : text
  })

  handlebars.registerHelper('multiply', function (a: number, b: number) {
    return (a || 0) * (b || 0)
  })

  handlebars.registerHelper('add', function (a: number, b: number) {
    return (a || 0) + (b || 0)
  })

  handlebars.registerHelper('subtract', function (a: number, b: number) {
    return (a || 0) - (b || 0)
  })

  handlebars.registerHelper('divide', function (a: number, b: number) {
    return b !== 0 ? (a || 0) / b : 0
  })

  handlebars.registerHelper('percentage', function (value: number, total: number) {
    return total !== 0 ? `${((value || 0) / total * 100).toFixed(2)}%` : '0%'
  })

  // Register partials
  Object.entries(partialSources).forEach(([name, source]) => {
    handlebars.registerPartial(name, source)
  })

  // Get the template source
  const templateSource = templateSources[templateName]
  if (!templateSource) {
    throw new Error(`Template "${templateName}" not found`)
  }

  // Compile the template
  const template = handlebars.compile(templateSource)

  // Enrich context based on template type
  const enrichedData = enrichContextForTemplate(templateName, ctx.data)

  // Render the template
  return template({
    ...enrichedData,
    options: ctx.options,
    locale: ctx.locale,
  })
}

function enrichContextForTemplate(templateName: string, data: any): any {
  const enriched = { ...data }

  // Invoice-specific enrichments
  if (templateName.toLowerCase().includes('invoice')) {
    if (enriched.items && Array.isArray(enriched.items)) {
      enriched.subtotal = enriched.items.reduce((sum: number, item: any) => {
        return sum + (item.quantity * item.price)
      }, 0)

      enriched.tax = enriched.subtotal * (enriched.taxRate || 0.1)
      enriched.total = enriched.subtotal + enriched.tax

      if (enriched.issueDate && enriched.paymentTerms) {
        const issueDate = new Date(enriched.issueDate)
        const dueDate = new Date(issueDate)
        dueDate.setDate(dueDate.getDate() + enriched.paymentTerms)
        enriched.dueDate = dueDate
      }
    }
  }

  // Sales report-specific enrichments
  if (templateName.toLowerCase().includes('salesreport')) {
    if (enriched.salesData && Array.isArray(enriched.salesData)) {
      // Calculate quarterly breakdown
      enriched.quarters = calculateQuarters(enriched.salesData)

      // Calculate performance rating
      const totalSales = enriched.salesData.reduce((sum: number, item: any) => sum + item.amount, 0)
      enriched.rating = calculatePerformanceRating(totalSales)
    }
  }

  return enriched
}

function calculateQuarters(salesData: any[]): any[] {
  const quarters = [
    { name: 'Q1', months: [0, 1, 2], total: 0 },
    { name: 'Q2', months: [3, 4, 5], total: 0 },
    { name: 'Q3', months: [6, 7, 8], total: 0 },
    { name: 'Q4', months: [9, 10, 11], total: 0 },
  ]

  salesData.forEach((item) => {
    const month = new Date(item.date).getMonth()
    const quarter = quarters.find(q => q.months.includes(month))
    if (quarter) {
      quarter.total += item.amount
    }
  })

  return quarters
}

function calculatePerformanceRating(totalSales: number): string {
  if (totalSales >= 100000) return 'Excellent'
  if (totalSales >= 75000) return 'Good'
  if (totalSales >= 50000) return 'Average'
  return 'Needs Improvement'
}
