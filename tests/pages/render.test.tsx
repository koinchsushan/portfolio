import { render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Home from '@/app/page'
import Work from '@/app/work/[slug]/page'
import { caseStudies } from '@/content'

describe('site renders', () => {
  it('home has one h1 and eight labelled sections', () => {
    const { container } = render(<Home />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(container.querySelectorAll('section[aria-labelledby]')).toHaveLength(8)
  })

  it('home shows the three verified metrics in the position block', () => {
    render(<Home />)
    // Scoped: these figures legitimately recur in case-study prose elsewhere on
    // the page. The assertion is that the position block states them, not that
    // they appear exactly once — copy must not be shaped to satisfy a query.
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
    expect(screen.getAllByText(/DRAFT — owner to rewrite/).length).toBeGreaterThan(0)
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
})
