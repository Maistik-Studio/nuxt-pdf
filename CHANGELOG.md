# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of @maistik/nuxt-pdf
- Handlebars template support for PDF generation
- Multiple provider support (Gotenberg, Browserless, Puppeteer)
- Built-in internationalization with i18n helpers
- Custom helpers support
- Comprehensive testing suite with Playwright and Vitest
- Playground application with sample templates

### Features
- 🎨 **Handlebars Templates** - Lightweight templating without Vue overhead
- 🌍 **Internationalization** - Built-in i18n support with `{{t}}` helper
- 🔄 **Provider Agnostic** - Support for Gotenberg, Browserless, and Puppeteer Core
- 🎯 **SSR Safe** - Everything runs server-side in Nitro/Node
- 🧩 **Composable API** - Easy-to-use `usePdf()` composable
- 📱 **Responsive Design** - CSS-based layouts with print media queries
- 🎪 **Playground** - Demo app with sample templates

### Documentation
- Comprehensive README with examples
- API documentation
- Configuration guide
- Provider setup instructions

## [1.0.0] - 2024-01-XX

### Added
- Initial stable release