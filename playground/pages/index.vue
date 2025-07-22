<!-- eslint-disable no-console -->
<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            Nuxt PDF Module Playground
          </h1>
          <p class="text-lg text-gray-600">
            Generate beautiful PDFs using Handlebars templates
          </p>
        </div>

        <!-- Controls -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Template
              </label>
              <select
                v-model="selectedTemplate"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="template-select"
              >
                <option value="Invoice">
                  Invoice
                </option>
                <option value="SalesReport">
                  Sales Report
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                v-model="selectedLocale"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="locale-select"
              >
                <option value="en">
                  English
                </option>
                <option value="es">
                  Español
                </option>
                <option value="fr">
                  Français
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <select
                v-model="selectedFormat"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="format-select"
              >
                <option value="A4">
                  A4
                </option>
                <option value="Letter">
                  Letter
                </option>
                <option value="Legal">
                  Legal
                </option>
              </select>
            </div>
          </div>

          <div class="flex flex-wrap gap-4">
            <button
              :disabled="isGenerating"
              class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              data-testid="generate-pdf"
              @click="generatePdf"
            >
              {{ isGenerating ? 'Generating...' : 'Generate PDF' }}
            </button>

            <button
              :disabled="isGenerating"
              class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              data-testid="download-pdf"
              @click="downloadPdf"
            >
              {{ isGenerating ? 'Generating...' : 'Download PDF' }}
            </button>

            <NuxtLink
              to="/editor"
              class="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Visual Builder
            </NuxtLink>
          </div>
        </div>

        <!-- Preview -->
        <div
          v-if="pdfUrl"
          class="bg-white rounded-lg shadow-md p-6"
        >
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            PDF Preview
          </h2>
          <div class="border border-gray-300 rounded-lg overflow-hidden">
            <iframe
              :src="pdfUrl"
              class="w-full h-96"
              frameborder="0"
              data-testid="pdf-preview"
            />
          </div>
        </div>

        <!-- Error Display -->
        <div
          v-if="error"
          class="bg-red-50 border border-red-200 rounded-lg p-4 mb-8"
          data-testid="error-message"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Error
              </h3>
              <p class="mt-1 text-sm text-red-700">
                {{ error }}
              </p>
            </div>
          </div>
        </div>

        <!-- Template Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">
              Invoice Template
            </h2>
            <p class="text-gray-600 mb-4">
              A complete invoice template with company details, line items, calculations, and payment terms.
            </p>
            <ul class="text-sm text-gray-500 space-y-1">
              <li>• Automatic subtotal and tax calculations</li>
              <li>• Due date computation</li>
              <li>• Multi-language support</li>
              <li>• Professional styling</li>
            </ul>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">
              Sales Report Template
            </h2>
            <p class="text-gray-600 mb-4">
              A comprehensive sales report with metrics, quarterly breakdown, and performance ratings.
            </p>
            <ul class="text-sm text-gray-500 space-y-1">
              <li>• Quarterly sales analysis</li>
              <li>• Performance rating calculation</li>
              <li>• Metric cards with totals</li>
              <li>• Responsive design</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { generate, download } = usePdf()

const selectedTemplate = ref('Invoice')
const selectedLocale = ref('en')
const selectedFormat = ref('A4')
const isGenerating = ref(false)
const pdfUrl = ref('')
const error = ref('')

const invoiceData = {
  company: {
    name: 'Acme Corporation',
    address: '123 Business St',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    phone: '(555) 123-4567',
    email: 'billing@acme.com',
  },
  customer: {
    name: 'John Doe',
    address: '456 Customer Ave',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90210',
  },
  invoiceNumber: 'INV-2024-001',
  issueDate: new Date().toISOString().split('T')[0],
  paymentTerms: 30,
  taxRate: 0.08,
  items: [
    {
      description: 'Web Development Services',
      quantity: 40,
      price: 125.00,
    },
    {
      description: 'UI/UX Design',
      quantity: 20,
      price: 100.00,
    },
    {
      description: 'Project Management',
      quantity: 10,
      price: 150.00,
    },
  ],
  notes: 'Payment is due within 30 days. Late payments may incur additional fees.',
}

const salesReportData = {
  period: '2024 Q1-Q4',
  totalSales: 125000,
  totalOrders: 450,
  avgOrderValue: 278,
  salesData: [
    { date: '2024-01-15', amount: 15000 },
    { date: '2024-02-20', amount: 18000 },
    { date: '2024-03-10', amount: 22000 },
    { date: '2024-04-05', amount: 16000 },
    { date: '2024-05-12', amount: 19000 },
    { date: '2024-06-18', amount: 21000 },
    { date: '2024-07-22', amount: 17000 },
    { date: '2024-08-30', amount: 20000 },
    { date: '2024-09-14', amount: 23000 },
    { date: '2024-10-08', amount: 18000 },
    { date: '2024-11-25', amount: 16000 },
    { date: '2024-12-15', amount: 19000 },
  ],
  generatedDate: new Date().toLocaleDateString(),
}

const getCurrentData = () => {
  return selectedTemplate.value === 'Invoice' ? invoiceData : salesReportData
}

const generatePdf = async () => {
  try {
    isGenerating.value = true
    error.value = ''

    const blob = await generate(
      selectedTemplate.value,
      getCurrentData(),
      { format: selectedFormat.value },
      selectedLocale.value,
    )

    // Create object URL for preview
    if (pdfUrl.value) {
      URL.revokeObjectURL(pdfUrl.value)
    }
    pdfUrl.value = URL.createObjectURL(blob)
  }
  catch (err) {
    error.value = err.message || 'Failed to generate PDF'
    console.error('PDF generation error:', err)
  }
  finally {
    isGenerating.value = false
  }
}

const downloadPdf = async () => {
  try {
    isGenerating.value = true
    error.value = ''

    const filename = `${selectedTemplate.value.toLowerCase()}-${Date.now()}.pdf`

    await download(
      selectedTemplate.value,
      getCurrentData(),
      { format: selectedFormat.value },
      filename,
      selectedLocale.value,
    )
  }
  catch (err) {
    error.value = err.message || 'Failed to download PDF'
    console.error('PDF download error:', err)
  }
  finally {
    isGenerating.value = false
  }
}

// Cleanup on unmount
onUnmounted(() => {
  if (pdfUrl.value) {
    URL.revokeObjectURL(pdfUrl.value)
  }
})
</script>
