import { test, expect } from '@playwright/test'

test.describe('PDF API', () => {
  const invoiceData = {
    company: {
      name: 'Test Company',
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zip: '12345',
      phone: '(555) 123-4567',
      email: 'test@test.com',
    },
    customer: {
      name: 'Test Customer',
      address: '456 Customer Ave',
      city: 'Customer City',
      state: 'CS',
      zip: '67890',
    },
    invoiceNumber: 'TEST-001',
    issueDate: '2024-01-15',
    paymentTerms: 30,
    taxRate: 0.08,
    items: [
      { description: 'Test Service', quantity: 1, price: 100.00 },
      { description: 'Another Service', quantity: 2, price: 50.00 },
    ],
    notes: 'Test invoice notes',
  }

  test('should generate PDF via API', async ({ request }) => {
    const response = await request.post('/api/pdf', {
      data: {
        template: 'Invoice',
        ctx: {
          data: invoiceData,
          options: { format: 'A4' },
          locale: 'en',
        },
      },
    })

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toBe('application/pdf')

    const buffer = await response.body()
    expect(buffer.length).toBeGreaterThan(0)

    // Verify PDF magic number
    const pdfHeader = buffer.subarray(0, 4).toString()
    expect(pdfHeader).toBe('%PDF')
  })

  test('should handle missing template', async ({ request }) => {
    const response = await request.post('/api/pdf', {
      data: {
        template: 'NonExistentTemplate',
        ctx: {
          data: invoiceData,
          options: { format: 'A4' },
          locale: 'en',
        },
      },
    })

    expect(response.status()).toBe(500)
  })

  test('should handle missing context', async ({ request }) => {
    const response = await request.post('/api/pdf', {
      data: {
        template: 'Invoice',
        // Missing ctx
      },
    })

    expect(response.status()).toBe(500)
  })

  test('should handle different locales', async ({ request }) => {
    const locales = ['en', 'es', 'fr']

    for (const locale of locales) {
      const response = await request.post('/api/pdf', {
        data: {
          template: 'Invoice',
          ctx: {
            data: invoiceData,
            options: { format: 'A4' },
            locale,
          },
        },
      })

      expect(response.status()).toBe(200)
      expect(response.headers()['content-type']).toBe('application/pdf')

      const buffer = await response.body()
      expect(buffer.length).toBeGreaterThan(0)
    }
  })

  test('should handle different formats', async ({ request }) => {
    const formats = ['A4', 'Letter', 'Legal']

    for (const format of formats) {
      const response = await request.post('/api/pdf', {
        data: {
          template: 'Invoice',
          ctx: {
            data: invoiceData,
            options: { format },
            locale: 'en',
          },
        },
      })

      expect(response.status()).toBe(200)
      expect(response.headers()['content-type']).toBe('application/pdf')

      const buffer = await response.body()
      expect(buffer.length).toBeGreaterThan(0)
    }
  })

  test('should generate Sales Report PDF', async ({ request }) => {
    const salesData = {
      period: '2024 Q1-Q4',
      totalSales: 125000,
      totalOrders: 450,
      avgOrderValue: 278,
      salesData: [
        { date: '2024-01-15', amount: 15000 },
        { date: '2024-02-20', amount: 18000 },
        { date: '2024-03-10', amount: 22000 },
      ],
      generatedDate: new Date().toLocaleDateString(),
    }

    const response = await request.post('/api/pdf', {
      data: {
        template: 'SalesReport',
        ctx: {
          data: salesData,
          options: { format: 'A4' },
          locale: 'en',
        },
      },
    })

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toBe('application/pdf')

    const buffer = await response.body()
    expect(buffer.length).toBeGreaterThan(0)

    // Verify PDF magic number
    const pdfHeader = buffer.subarray(0, 4).toString()
    expect(pdfHeader).toBe('%PDF')
  })
})
