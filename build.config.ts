import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  entries: [
    'src/module',
  ],
  dependencies: [
    '@nuxt/kit',
    '@nuxt/schema',
  ],
  externals: [
    '@nuxt/kit',
    '@nuxt/schema',
    'handlebars',
    'puppeteer',
    'form-data',
    // Virtual module injected into the consumer's Nitro build at runtime.
    '#pdf-custom-helpers',
  ],
  failOnWarn: false,
})
