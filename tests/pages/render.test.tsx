import { render, screen, within, act } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { useRevealText } from '@/lib/useRevealText'
import Home from '@/app/page'
import Work from '@/app/work/[slug]/page'
import { caseStudies } from '@/content'

describe('site renders', () => {
  it('home has one h1 and seven labelled sections', () => {
    const { container } = render(<Home />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(container.querySelectorAll('section[aria-labelledby]')).toHaveLength(7)
  })

  it('home shows the three verified metrics in the position block', () => {
    render(<Home />)
    // Scoped: these figures legitimately recur in case-study prose elsewhere on
    // the page. The assertion is that the position block states them, not that
    // they appear exactly once , copy must not be shaped to satisfy a query.
    const position = screen.getByRole('region', { name: /what the work adds up to/i })
    for (const m of [/450,000\+/, /10,000\+/, /~30%/]) {
      expect(within(position).getByText(m)).toBeInTheDocument()
    }
  })

  it('work section links each case study to its route', () => {
    render(<Home />)
    const work = screen.getByRole('region', { name: /selected work/i })
    for (const cs of caseStudies) {
      expect(within(work).getByRole('link', { name: new RegExp(cs.client, 'i') }))
        .toHaveAttribute('href', `/work/${cs.slug}`)
    }
  })

  it('draft copy is visibly marked', () => {
    render(<Home />)
    expect(screen.getAllByText(/DRAFT: owner to rewrite/).length).toBeGreaterThan(0)
  })

  it.each(caseStudies.map((c) => c.slug))('%s renders the full template', async (slug) => {
    render(await Work({ params: Promise.resolve({ slug }) }))
    expect(screen.getByRole('article')).toBeInTheDocument()
    expect(screen.getByTestId('constraint')).toBeInTheDocument()
    expect(screen.getAllByTestId('outcome-metric').length).toBeGreaterThanOrEqual(2)
  })

  it('never renders a phone number', () => {
    render(<Home />)
    expect(document.body.textContent).not.toMatch(/\+?\d{10,}/)
  })

  // The em-dash is the strongest single tell of machine-written copy, and this
  // repo had 32 of them. En-dash separators in ranges are banned with it.
  it('ships no em-dash or en-dash in any source file', async () => {
    const { globby } = await import('globby')
    const { readFile } = await import('node:fs/promises')
    const offenders: string[] = []
    for (const f of await globby(['src/**/*.{ts,tsx,css}'])) {
      if (/[\u2013\u2014]/.test(await readFile(f, 'utf8'))) offenders.push(f)
    }
    expect(offenders).toEqual([])
  })

  // All colour comes from the tokens in src/styles/tokens.css, mapped into
  // Tailwind utilities via @theme. No component should hardcode a hex value.
  it('ships no raw 6-digit hex colour in any component', async () => {
    const { globby } = await import('globby')
    const { readFile } = await import('node:fs/promises')
    const offenders: string[] = []
    for (const f of await globby(['src/components/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'])) {
      if (/#[0-9a-f]{6}\b/i.test(await readFile(f, 'utf8'))) offenders.push(f)
    }
    expect(offenders).toEqual([])
  })
})

describe('text reveal never gates content', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  // A hidden or backgrounded tab suspends IntersectionObserver, and the reveal
  // starts text blurred and semi-transparent. If it waited only on the
  // observer, a heading could stay unreadable indefinitely. This shipped once:
  // the hero h1 sat at opacity 0.165 with an 8px blur on a hidden tab.
  // (rAF is deliberately NOT mocked here: stubbing it breaks React's own act
  // scheduling, and the observer path is the real-world failure anyway.)
  it('resolves even when IntersectionObserver never fires', () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        disconnect() {}
      },
    )

    function Heading() {
      const { ref, className } = useRevealText<HTMLHeadingElement>('onView')
      return (
        <h2 ref={ref} className={className} data-testid="heading">
          Selected Work
        </h2>
      )
    }

    render(<Heading />)
    const heading = screen.getByTestId('heading')
    expect(heading.className).toContain('reveal-pending')

    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(heading.className).not.toContain('reveal-pending')
  })

  it('never starts fully transparent, so the hero h1 still paints for LCP', async () => {
    const { readFile } = await import('node:fs/promises')
    const css = await readFile('src/app/globals.css', 'utf8')
    const pending = css.match(/\.reveal-text\.reveal-pending\s*\{[^}]*\}/)?.[0] ?? ''
    expect(pending).not.toMatch(/opacity:\s*0\s*;/)
  })
})
