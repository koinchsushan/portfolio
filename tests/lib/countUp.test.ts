import { describe, it, expect } from 'vitest'
import { parseFigure, formatStep } from '@/components/primitives/CountUpMetric'
import { caseStudies } from '@/content'

/**
 * The count-up rewrites a figure many times a second. The one thing that must
 * never happen is it landing on, or passing through, a number the CV does not
 * say: every figure it animates has to reformat back to its source string
 * exactly, and anything it cannot read has to opt out rather than guess.
 */
describe('count-up never changes the figure it counts to', () => {
  const values = caseStudies.flatMap((study) => study.outcomes.map((outcome) => outcome.value))

  it('has real figures to check', () => {
    expect(values.length).toBeGreaterThan(0)
  })

  it.each(values)('%s reformats back to itself, or opts out', (value) => {
    const figure = parseFigure(value)
    if (figure === null) return
    expect(formatStep(figure.target, figure)).toBe(value)
  })

  it('reads the three shapes the position block actually shows', () => {
    expect(parseFigure('450,000+')).toMatchObject({ prefix: '', target: 450000, suffix: '+', grouped: true })
    expect(parseFigure('10,000+')).toMatchObject({ prefix: '', target: 10000, suffix: '+', grouped: true })
    expect(parseFigure('~30%')).toMatchObject({ prefix: '~', target: 30, suffix: '%', grouped: false })
  })

  it('opts out of anything with no figure in it at all', () => {
    expect(parseFigure('Distinction')).toBeNull()
  })
})
