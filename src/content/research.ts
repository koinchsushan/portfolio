import type { ResearchItem } from './types'

// Per owner instruction (spec §2), these three read as research studies, not
// dissertations — none of the display titles below uses that word, even
// though the flight price study was Sushan's dissertation.
export const research: ResearchItem[] = [
  {
    title: 'Behavioural trial-replay research platform',
    repo: 'github.com/koinchsushan/CardsProblemAnalysis',
    year: '2025',
    stack: ['Python', 'Flask', 'Chart.js', 'Pandas', 'Matplotlib'],
    licence: 'MIT',
    forks: 3,
    liveDemo: false,
    blurb:
      "A live web application replacing three researchers' separate local Python scripts, covering 845 trials from 228 participants. Self-service dataset upload — validated, atomically written, revertible in one click — is backed by a 21-test suite, and an interactive visualisation layer (animated trial replay, spatial heatmaps, learning curves, error-pattern breakdowns across eight analyses) is unified by a tokenised design system with full dark mode. Published open source under MIT with a contributor guide and documented releases; co-authoring the resulting paper on the blank-card hint effect.",
  },
  {
    title: 'UK housing affordability decision-support system',
    repo: 'github.com/koinchsushan/houseAffordabilityDSS',
    blurb:
      'A multi-layer analytics pipeline for UK housing affordability, combining predictive modelling with SHAP-based interpretability.',
  },
  {
    title: 'Flight price study',
    repo: 'github.com/koinchsushan/flight-price-dissertation',
    // The CV/spec give no further detail on this study's method or findings
    // beyond its title and repo — this line is a best-effort framing, not a
    // transcribed fact, so it is flagged for the owner to confirm or rewrite.
    draft: true,
    blurb: 'An independent study of flight pricing, published as open-source code.',
  },
]
