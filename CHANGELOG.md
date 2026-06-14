# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v1.1.4

[compare changes](https://github.com/Maistik-Studio/nuxt-pdf/compare/v1.1.1...v1.1.4)

### 🏡 Chore

- **release:** V1.1.1 [skip ci] ([7b45972](https://github.com/Maistik-Studio/nuxt-pdf/commit/7b45972))

### 🤖 CI

- Make release publish-first and idempotent ([ee261bd](https://github.com/Maistik-Studio/nuxt-pdf/commit/ee261bd))

### ❤️ Contributors

- Marcos Sanz Latorre ([@marsanla](https://github.com/marsanla))

## v1.1.2

[compare changes](https://github.com/Maistik-Studio/nuxt-pdf/compare/v1.0.17...v1.1.2)

### 🩹 Fixes

- Nuxt 4 support, security hardening, and working custom helpers ([2570921](https://github.com/Maistik-Studio/nuxt-pdf/commit/2570921))
- Stabilize and speed up E2E PDF generation ([1608f4d](https://github.com/Maistik-Studio/nuxt-pdf/commit/1608f4d))

### 🏡 Chore

- Update playground ([e4655a0](https://github.com/Maistik-Studio/nuxt-pdf/commit/e4655a0))

### ✅ Tests

- Improve test reliability and lint cleanup ([4945742](https://github.com/Maistik-Studio/nuxt-pdf/commit/4945742))

### 🤖 CI

- Only run lint on Node 22 ([b36ae1f](https://github.com/Maistik-Studio/nuxt-pdf/commit/b36ae1f))
- Drop Node 18 from test matrix ([ceccec2](https://github.com/Maistik-Studio/nuxt-pdf/commit/ceccec2))
- Target Node 22 and 24 ([3810ded](https://github.com/Maistik-Studio/nuxt-pdf/commit/3810ded))

### ❤️ Contributors

- Marcos Sanz Latorre ([@marsanla](https://github.com/marsanla))

## v1.0.17

[compare changes](https://github.com/Maistik-Studio/nuxt-pdf/compare/v1.0.16...v1.0.17)

### 🩹 Fixes

- Package ([11e2b3b](https://github.com/Maistik-Studio/nuxt-pdf/commit/11e2b3b))

### ❤️ Contributors

- Marcos Sanz Latorre ([@marsanla](https://github.com/marsanla))

## v1.0.16

[compare changes](https://github.com/Maistik-Studio/nuxt-pdf/compare/v1.0.14...v1.0.16)

### 🩹 Fixes

- Ci ([6745728](https://github.com/Maistik-Studio/nuxt-pdf/commit/6745728))
- Ci ([58e9cce](https://github.com/Maistik-Studio/nuxt-pdf/commit/58e9cce))

### 🏡 Chore

- **release:** V1.0.14 [skip ci] ([506c5e1](https://github.com/Maistik-Studio/nuxt-pdf/commit/506c5e1))

### ❤️ Contributors

- Marcos Sanz Latorre ([@marsanla](https://github.com/marsanla))

## v1.0.15

[compare changes](https://github.com/Maistik-Studio/nuxt-pdf/compare/v1.0.12...v1.0.15)

### 🩹 Fixes

- Ci ([5af6387](https://github.com/Maistik-Studio/nuxt-pdf/commit/5af6387))

### ❤️ Contributors

- Marcos Sanz Latorre ([@marsanla](https://github.com/marsanla))

## v1.0.13

[compare changes](https://github.com/Maistik-Studio/nuxt-pdf/compare/v1.0.10...v1.0.13)

## v1.0.11

[compare changes](https://github.com/Maistik-Studio/nuxt-pdf/compare/v1.0.7...v1.0.11)

### 🏡 Chore

- **release:** V1.0.9 ([0c0ba96](https://github.com/Maistik-Studio/nuxt-pdf/commit/0c0ba96))

### ❤️ Contributors

- Marcos Sanz Latorre ([@marsanla](https://github.com/marsanla))

## v1.0.9

[compare changes](https://github.com/Maistik-Studio/nuxt-pdf/compare/v1.0.7...v1.0.9)

## v1.0.8

[compare changes](https://github.com/Maistik-Studio/nuxt-pdf/compare/v1.0.5...v1.0.8)

## v1.0.6

[compare changes](https://github.com/Maistik-Studio/nuxt-pdf/compare/v1.0.3...v1.0.6)

### 🩹 Fixes

- Ci ([9fe9e83](https://github.com/Maistik-Studio/nuxt-pdf/commit/9fe9e83))

### ❤️ Contributors

- Marcos Sanz Latorre ([@marsanla](https://github.com/marsanla))

## v1.0.4

[compare changes](https://github.com/Maistik-Studio/nuxt-pdf/compare/v1.0.1...v1.0.4)

## v1.0.2


### 🩹 Fixes

- Url ([811e09e](https://github.com/Maistik-Studio/nuxt-pdf/commit/811e09e))
- Pnpm ci package ([a92b48a](https://github.com/Maistik-Studio/nuxt-pdf/commit/a92b48a))
- Testing ([1291672](https://github.com/Maistik-Studio/nuxt-pdf/commit/1291672))
- Ci ([85a3ff3](https://github.com/Maistik-Studio/nuxt-pdf/commit/85a3ff3))
- Ci ([38b1ff8](https://github.com/Maistik-Studio/nuxt-pdf/commit/38b1ff8))
- Ci ([913cffa](https://github.com/Maistik-Studio/nuxt-pdf/commit/913cffa))

### ❤️ Contributors

- Marcos Sanz Latorre ([@marsanla](https://github.com/marsanla))

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