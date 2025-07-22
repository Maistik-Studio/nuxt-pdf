import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    typescript: true,
    stylistic: {
      semi: false,
      quotes: 'single',
    },
  },
})
  .append(
  // Custom rules for the project
    {
      rules: {
      // Allow console.log in development
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',

        // TypeScript specific rules
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': ['error', {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        }],

        // Vue/Nuxt specific rules
        'vue/multi-word-component-names': 'off',
        'vue/no-multiple-template-root': 'off',

        // General code quality
        'prefer-const': 'error',
        'no-var': 'error',
        'object-shorthand': 'error',
        'prefer-template': 'error',
      },
    },
    // Ignore patterns
    {
      ignores: [
        'dist/**',
        '.nuxt/**',
        '.output/**',
        'node_modules/**',
        'coverage/**',
        'playwright-report/**',
        'test-results/**',
      ],
    },
  )
