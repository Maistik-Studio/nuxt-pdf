import { describe, it, expect } from 'vitest'
import { compilePdfComponent } from '../../src/runtime/utils/compiler'

describe('compilePdfComponent custom helpers', () => {
  it('registers and applies a custom helper', () => {
    const html = compilePdfComponent(
      'Demo',
      { data: { name: 'world' }, options: {}, locale: 'en' },
      {},
      { Demo: '<p>{{shout name}}</p>' },
      {},
      { shout: (value: string) => `${String(value ?? '').toUpperCase()}!` },
    )

    expect(html).toContain('<p>WORLD!</p>')
  })

  it('works with no custom helpers provided', () => {
    const html = compilePdfComponent(
      'Demo',
      { data: { name: 'world' }, options: {} },
      {},
      { Demo: '<p>{{upper name}}</p>' },
      {},
    )

    expect(html).toContain('<p>WORLD</p>')
  })

  it('throws a clear error for an unknown template', () => {
    expect(() =>
      compilePdfComponent('Missing', { data: {}, options: {} }, {}, {}, {}),
    ).toThrow('Template "Missing" not found')
  })

  it('ignores non-function custom helper values', () => {
    const html = compilePdfComponent(
      'Demo',
      { data: { name: 'x' }, options: {} },
      {},
      { Demo: '<p>{{name}}</p>' },
      {},
      // @ts-expect-error - intentionally invalid to verify it is skipped
      { notAFunction: 'oops' },
    )

    expect(html).toContain('<p>x</p>')
  })
})
