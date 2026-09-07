import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Boot } from '@/components/motion/Boot'

type MediaQueryMap = Record<string, boolean>

/** Same minimal `matchMedia` stand-in `tests/lib/capability.test.ts` uses. */
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

describe('Boot', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    sessionStorage.clear()
    mockMatchMedia({ '(prefers-reduced-motion: reduce)': false })
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('dismisses itself within the 1.4s hard cap', async () => {
    render(<Boot />)

    // Let the mount effect's synchronous sessionStorage/matchMedia read run.
    await vi.advanceTimersByTimeAsync(0)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()

    await vi.advanceTimersByTimeAsync(1400)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('never renders when sessionStorage already has boot-seen', async () => {
    sessionStorage.setItem('boot-seen', '1')

    render(<Boot />)
    await vi.advanceTimersByTimeAsync(0)

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    // Confirms the cap wouldn't conjure it up later either.
    await vi.advanceTimersByTimeAsync(1400)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('leaves page content in the DOM behind the overlay', async () => {
    render(
      <div>
        <Boot />
        <main>
          <h1>Page content</h1>
        </main>
      </div>,
    )
    await vi.advanceTimersByTimeAsync(0)

    // The overlay is showing, and the real page is still fully present.
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Page content' })).toBeInTheDocument()

    await vi.advanceTimersByTimeAsync(1400)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Page content' })).toBeInTheDocument()
  })
})
