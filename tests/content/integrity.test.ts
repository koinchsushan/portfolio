import { describe, it, expect } from 'vitest'
import { identity, caseStudies, research, roles, education, skillGroups, getCaseStudy } from '@/content'

describe('identity', () => {
  it('carries the CV identity verbatim', () => {
    expect(identity.name).toBe('Sushan Sunuwar')
    expect(identity.title).toBe('Frontend Software Engineer')
    expect(identity.location).toBe('London, United Kingdom')
    expect(identity.email).toBe('koinchsushan@gmail.com')
    expect(identity.availability).toBe('Open to conversations')
  })

  it('exposes no phone field at all', () => {
    expect(Object.keys(identity)).not.toContain('phone')
  })
})

describe('case studies', () => {
  it('has exactly the three approved studies in order', () => {
    expect(caseStudies.map((c) => c.slug)).toEqual([
      'foundermatcha', 'viveka-health', 'proponent',
    ])
  })

  it('numbers them 01..03', () => {
    expect(caseStudies.map((c) => c.index)).toEqual(['01', '02', '03'])
  })

  it('gives every study the full narrative shape', () => {
    for (const cs of caseStudies) {
      expect(cs.situation.length).toBeGreaterThanOrEqual(2)
      expect(cs.constraint.length).toBeGreaterThan(20)
      expect(cs.decision.length).toBeGreaterThanOrEqual(1)
      expect(cs.outcomes.length).toBeGreaterThanOrEqual(2)
      expect(cs.stack.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('uses only the three defined diagram ids', () => {
    for (const cs of caseStudies) {
      expect(['converge', 'split', 'extract']).toContain(cs.diagram)
    }
  })

  it('resolves by slug', () => {
    expect(getCaseStudy('proponent')?.client).toBe('Proponent')
    expect(getCaseStudy('nope')).toBeUndefined()
  })
})

describe('CV metrics are exact', () => {
  const all = JSON.stringify(caseStudies)
  it('uses the verified figures', () => {
    expect(all).toContain('450,000+')
    expect(all).toContain('10,000+')
    expect(all).toContain('~3,000')
  })

  it('never claims the employer forward-looking targets', () => {
    expect(all).not.toContain('20,000')
    expect(all).not.toMatch(/Oxford|Cambridge|Imperial/)
  })
})

describe('research', () => {
  it('lists three studies and never says "dissertation"', () => {
    expect(research).toHaveLength(3)
    expect(JSON.stringify(research.map((r) => r.title))).not.toMatch(/dissertation/i)
  })

  it('records the CardsProblemAnalysis facts', () => {
    const cards = research.find((r) => r.repo.endsWith('CardsProblemAnalysis'))!
    expect(cards.licence).toBe('MIT')
    expect(cards.forks).toBe(3)
    expect(cards.blurb).toContain('845')
    expect(cards.blurb).toContain('228')
  })
})

describe('roles and education', () => {
  it('has four roles newest first', () => {
    expect(roles.map((r) => r.org)).toEqual([
      'Foundermatcha', 'Viveka Services', 'Javra Software', 'London Metropolitan University',
    ])
  })

  it('records the MSc distinction', () => {
    expect(education[0].award).toContain('Distinction')
  })
})

describe('skills', () => {
  it('keeps the ten CV groupings', () => {
    expect(skillGroups).toHaveLength(10)
    expect(skillGroups[0].label).toBe('Languages')
  })
})
