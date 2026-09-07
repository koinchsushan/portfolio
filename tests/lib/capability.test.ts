import { describe, it, expect, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { useCapability } from '@/lib/useCapability'

type MediaQueryMap = Record<string, boolean>

/**
 * A minimal but faithful `matchMedia` stand-in: each query string resolves
 * to whatever boolean the test scenario supplies, defaulting to `false`
 * (query does not match) for anything unlisted. Real enough that a `change`
 * listener could be attached without throwing, even though these tests
 * never fire one.
 */
function mockMatchMedia(matches: MediaQueryMap) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: matches[query] ?? false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

function mockWebGL(available: boolean) {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((contextId: string) => {
    if (!available) return null
    if (contextId === 'webgl2' || contextId === 'webgl') return {} as unknown as RenderingContext
    return null
  }) as typeof HTMLCanvasElement.prototype.getContext)
}

function setDeviceMemory(value: number | undefined) {
  Object.defineProperty(navigator, 'deviceMemory', { value, configurable: true })
}

function setHardwareConcurrency(value: number) {
  Object.defineProperty(navigator, 'hardwareConcurrency', { value, configurable: true })
}

function setInnerWidth(value: number) {
  Object.defineProperty(window, 'innerWidth', { value, configurable: true, writable: true })
}

/** A capable desktop: fine pointer, wide viewport, full motion budget. */
function setCapableDesktopBaseline() {
  mockMatchMedia({ '(prefers-reduced-motion: reduce)': false, '(pointer: coarse)': false })
  mockWebGL(true)
  setDeviceMemory(8)
  setHardwareConcurrency(8)
  setInnerWidth(1440)
}

describe('useCapability', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders static during server-side rendering, before any effect can run', () => {
    // Capable-desktop mocks are installed so a false positive here could
    // only come from the effect running during SSR, which is exactly what
    // must never happen: `renderToStaticMarkup` never runs effects, so this
    // is the real SSR value, not a stand-in for it.
    setCapableDesktopBaseline()
    function Probe() {
      const { tier } = useCapability()
      return createElement('span', { 'data-testid': 'tier' }, tier)
    }
    const html = renderToStaticMarkup(createElement(Probe))
    expect(html).toContain('>static<')
  })

  it('upgrades to full on a capable desktop after mount', async () => {
    setCapableDesktopBaseline()
    const { result } = renderHook(() => useCapability())
    await waitFor(() => expect(result.current.tier).toBe('full'))
  })

  it('stays static when reduced motion is requested, even on capable hardware', async () => {
    mockMatchMedia({ '(prefers-reduced-motion: reduce)': true, '(pointer: coarse)': false })
    mockWebGL(true)
    setDeviceMemory(8)
    setHardwareConcurrency(8)
    setInnerWidth(1440)

    const { result } = renderHook(() => useCapability())
    await waitFor(() => expect(result.current.tier).toBe('static'))
  })

  it('stays static when no WebGL context is available', async () => {
    mockMatchMedia({ '(prefers-reduced-motion: reduce)': false, '(pointer: coarse)': false })
    mockWebGL(false)
    setDeviceMemory(8)
    setHardwareConcurrency(8)
    setInnerWidth(1440)

    const { result } = renderHook(() => useCapability())
    await waitFor(() => expect(result.current.tier).toBe('static'))
  })

  it('stays static on low device memory', async () => {
    mockMatchMedia({ '(prefers-reduced-motion: reduce)': false, '(pointer: coarse)': false })
    mockWebGL(true)
    setDeviceMemory(2)
    setHardwareConcurrency(8)
    setInnerWidth(1440)

    const { result } = renderHook(() => useCapability())
    await waitFor(() => expect(result.current.tier).toBe('static'))
  })

  it('stays static on a low core count', async () => {
    mockMatchMedia({ '(prefers-reduced-motion: reduce)': false, '(pointer: coarse)': false })
    mockWebGL(true)
    setDeviceMemory(8)
    setHardwareConcurrency(2)
    setInnerWidth(1440)

    const { result } = renderHook(() => useCapability())
    await waitFor(() => expect(result.current.tier).toBe('static'))
  })

  it('downgrades to lite on a coarse pointer even with capable hardware', async () => {
    mockMatchMedia({ '(prefers-reduced-motion: reduce)': false, '(pointer: coarse)': true })
    mockWebGL(true)
    setDeviceMemory(8)
    setHardwareConcurrency(8)
    setInnerWidth(1440)

    const { result } = renderHook(() => useCapability())
    await waitFor(() => expect(result.current.tier).toBe('lite'))
  })

  it('downgrades to lite on a narrow viewport even with a fine pointer', async () => {
    mockMatchMedia({ '(prefers-reduced-motion: reduce)': false, '(pointer: coarse)': false })
    mockWebGL(true)
    setDeviceMemory(8)
    setHardwareConcurrency(8)
    setInnerWidth(390)

    const { result } = renderHook(() => useCapability())
    await waitFor(() => expect(result.current.tier).toBe('lite'))
  })

  it('treats an undefined deviceMemory (unsupported API) as capable, not static', async () => {
    mockMatchMedia({ '(prefers-reduced-motion: reduce)': false, '(pointer: coarse)': false })
    mockWebGL(true)
    setDeviceMemory(undefined)
    setHardwareConcurrency(8)
    setInnerWidth(1440)

    const { result } = renderHook(() => useCapability())
    await waitFor(() => expect(result.current.tier).toBe('full'))
  })
})
