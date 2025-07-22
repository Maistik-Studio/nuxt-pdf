# @maistik/nuxt-pdf

A powerful Nuxt 3/4 module for server-side PDF generation using Handlebars templates. Generate beautiful, data-driven PDFs with support for multiple providers (Gotenberg, Browserless, Puppeteer Core) and built-in internationalization.

## Features

- 🎨 **Handlebars Templates** - Lightweight templating without Vue overhead
- 🌍 **Internationalization** - Built-in i18n support with `{{t}}` helper
- 🔄 **Provider Agnostic** - Support for Gotenberg, Browserless, and Puppeteer Core
- 🎯 **SSR Safe** - Everything runs server-side in Nitro/Node
- 🧩 **Composable API** - Easy-to-use `usePdf()` composable
- 📱 **Responsive Design** - CSS-based layouts with print media queries
- 🎪 **Playground** - Demo app with sample templates

## Quick Start

### Installation

```bash
npm install @maistik/nuxt-pdf handlebars
```

### Configuration

Add the module to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@maistik/nuxt-pdf'],
  pdf: {
    provider: 'puppeteer', // or 'gotenberg' or 'browserless'
    components: ['pdf'],
    sharedComponents: ['pdf/partials'],
    enableI18n: true,
    defaultLocale: 'en',
    availableLocales: ['en', 'es', 'fr'],
    i18nMessages: {
      en: {
        invoice: {
          title: 'Invoice',
          total: 'Total'
        }
      },
      es: {
        invoice: {
          title: 'Factura',
          total: 'Total'
        }
      }
    },
    providers: {
      puppeteer: {
        launchOptions: {
          headless: true,
          args: ['--no-sandbox']
        }
      }
    }
  }
})
```

### Create a Template

Create `pdf/Invoice.hbs` in your project:

```handlebars
<style>
  @page { size: A4; margin: 20mm; }
  body { font-family: Arial, sans-serif; }
  .header { text-align: center; margin-bottom: 30px; }
  .total { font-weight: bold; font-size: 18px; }
</style>

<div class="header">
  <h1>{{t "invoice.title"}}</h1>
  <p>Invoice #{{invoiceNumber}}</p>
</div>

<table>
  {{#each items}}
  <tr>
    <td>{{this.description}}</td>
    <td>{{formatCurrency this.price}}</td>
  </tr>
  {{/each}}
</table>

<div class="total">
  {{t "invoice.total"}}: {{formatCurrency total}}
</div>
```

### Generate PDFs

Use the composable in your Vue components:

```vue
<script setup>
const { generate, download } = usePdf()

const generateInvoice = async () => {
  const data = {
    invoiceNumber: 'INV-001',
    items: [
      { description: 'Service', price: 100 }
    ],
    total: 100
  }
  
  // Generate and preview
  const blob = await generate('Invoice', data, { format: 'A4' }, 'en')
  
  // Or download directly
  await download('Invoice', data, { format: 'A4' }, 'invoice.pdf', 'en')
}
</script>
```

## Providers

### Puppeteer Core (Local)

Best for development and on-premise deployments:

```typescript
pdf: {
  provider: 'puppeteer',
  providers: {
    puppeteer: {
      launchOptions: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    }
  }
}
```

### Gotenberg (Docker)

Perfect for containerized environments:

```typescript
pdf: {
  provider: 'gotenberg',
  providers: {
    gotenberg: {
      url: 'http://gotenberg:3000'
    }
  }
}
```

### Browserless (Cloud)

Great for serverless deployments:

```typescript
pdf: {
  provider: 'browserless',
  providers: {
    browserless: {
      url: 'https://chrome.browserless.io',
      apiKey: process.env.BROWSERLESS_API_KEY
    }
  }
}
```

## Built-in Helpers

### Internationalization
```handlebars
{{t "invoice.title"}} <!-- Outputs localized text -->
```

### Currency Formatting
```handlebars
{{formatCurrency 1234.56}} <!-- $1,234.56 -->
{{formatCurrency 1234.56 "EUR"}} <!-- €1,234.56 -->
```

### Date Formatting
```handlebars
{{formatDate date}} <!-- 12/25/2024 -->
{{formatDate date "full"}} <!-- Wednesday, December 25, 2024 -->
```

### Number Formatting
```handlebars
{{formatNumber 1234.56}} <!-- 1,234.56 -->
{{formatNumber 0.15 style="percent"}} <!-- 15% -->
```

### Math Operations
```handlebars
{{add 10 5}} <!-- 15 -->
{{subtract 10 5}} <!-- 5 -->
{{multiply 10 5}} <!-- 50 -->
{{divide 10 5}} <!-- 2 -->
{{percentage 25 100}} <!-- 25% -->
```

## Custom Helpers

You can define your own custom helpers in the configuration:

```typescript
pdf: {
  customHelpers: {
    // Simple value transformation
    customFormat: (value: any) => `[${value}]`,
    
    // String manipulation
    repeat: (str: string, times: number) => str.repeat(times || 1),
    
    // Block helper with conditional logic
    ifEquals: function(this: any, arg1: any, arg2: any, options: any) {
      return (arg1 === arg2) ? options.fn(this) : options.inverse(this)
    }
  }
}
```

Use them in templates:
```handlebars
{{customFormat "hello"}} <!-- [hello] -->
{{repeat "★" 5}} <!-- ★★★★★ -->
{{#ifEquals status "active"}}Active User{{else}}Inactive User{{/ifEquals}}
```

### String Helpers
```handlebars
{{upper "hello world"}} <!-- HELLO WORLD -->
{{lower "HELLO WORLD"}} <!-- hello world -->
{{capitalize "hello world"}} <!-- Hello world -->
{{truncate "Long text here" 10}} <!-- Long text... -->
```

### Line Calculations
```handlebars
{{lineTotal quantity price}} <!-- quantity * price -->
```

## Template Features

### Automatic Enrichment

The module automatically enriches your data based on template names:

**Invoice Templates** get:
- `subtotal` - Sum of all line items
- `tax` - Calculated tax amount
- `total` - Subtotal + tax
- `dueDate` - Calculated from issue date + payment terms

**Sales Report Templates** get:
- `quarters` - Quarterly breakdown of sales data
- `rating` - Performance rating based on total sales

### CSS Styling

Use standard CSS with print-specific rules:

```css
@page {
  size: A4;
  margin: 20mm;
}

.page-break {
  page-break-before: always;
}

@media print {
  .no-break {
    page-break-inside: avoid;
  }
}
```

### Partials

Create reusable components in your `sharedComponents` directory:

```handlebars
<!-- pdf/partials/header.hbs -->
<div class="header">
  <h1>{{title}}</h1>
  <p>{{subtitle}}</p>
</div>
```

Use in templates:
```handlebars
{{> header title="My Document" subtitle="Generated Report"}}
```

## API Reference

### `usePdf()`

The main composable for PDF operations:

```typescript
const {
  generate,    // (template, data, options?, locale?) => Promise<Blob>
  download,    // (template, data, options?, filename?, locale?) => Promise<void>
  getAvailableLocales, // () => string[]
  getDefaultLocale     // () => string
} = usePdf()
```

### Options

```typescript
interface PdfOptions {
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
```

## Development

### Playground

The module includes a full playground application:

```bash
npm run dev
```

This starts a demo app with sample Invoice and Sales Report templates in multiple languages.

### Building

```bash
npm run build
```

### Testing

```bash
npm run test
```

## Examples

Check out the `playground/` directory for complete examples including:

- **Invoice Template** - Complete invoice with line items, taxes, and totals
- **Sales Report Template** - Comprehensive report with metrics and quarterly breakdown
- **Multi-language Support** - Templates in English, Spanish, and French
- **Multiple Providers** - Configuration examples for all supported providers

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## Support

- 📖 [Documentation](https://github.com/maistik/nuxt-pdf)
- 🐛 [Issue Tracker](https://github.com/maistik/nuxt-pdf/issues)
- 💬 [Discussions](https://github.com/maistik/nuxt-pdf/discussions)