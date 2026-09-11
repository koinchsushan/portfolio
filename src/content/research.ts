import type { ResearchItem } from './types'

// Per owner instruction (spec §2), these three read as research studies, not
// dissertations , none of the display titles below uses that word, even
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
      "A live web application replacing three researchers' separate local Python scripts, covering 845 trials from 228 participants. Self-service dataset upload, validated, atomically written and revertible in one click, is backed by a 21-test suite, and an interactive visualisation layer (animated trial replay, spatial heatmaps, learning curves, error-pattern breakdowns across eight analyses) is unified by a tokenised design system with full dark mode. Published open source under MIT with a contributor guide and documented releases; co-authoring the resulting paper on the blank-card hint effect.",
  },
  {
    title: 'UK housing affordability decision-support system',
    repo: 'github.com/koinchsushan/houseAffordabilityDSS',
    blurb:
      'A multi-layer analytics pipeline for UK housing affordability, combining predictive modelling with SHAP-based interpretability.',
  },
  {
    title: 'Predicting flight price spikes',
    repo: 'github.com/koinchsushan/flight-price-dissertation',
    // Owner's own account of the study, given in session on 2026-09-11.
    // Every figure below is his: 1,943,082 fare records across 63,301
    // flights, ROC AUC around 0.86, three false alarms in four warnings at a
    // useful catch rate, the LSTM losing every statistical comparison, and
    // the 28x cost ratio above which it is still the right model to deploy.
    blurb:
      'Comparison sites tell you what a fare is. This study asks whether you can tell it is about to jump, a classification framing no published study had applied to flight prices. SARIMA, XGBoost and an LSTM were tested on 1,943,082 Expedia fare records across 63,301 US domestic flights, under five rounds of rolling-origin validation. Spikes are predictable better than chance (ROC AUC around 0.86), but at a useful catch rate three warnings in four are false alarms. The sharpest finding: the LSTM lost every statistical comparison, yet it is the right model once a missed rise costs 28 times a false alarm.',
  },
]
