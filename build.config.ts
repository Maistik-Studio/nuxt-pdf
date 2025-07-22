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
  ],
  failOnWarn: false,
})
