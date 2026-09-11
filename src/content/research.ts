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
    title: 'Forecasting UK housing affordability risk',
    repo: 'github.com/koinchsushan/houseAffordabilityDSS',
    year: '2025/26',
    // Owner's own project summary, given in session on 2026-09-11. Every
    // figure is his: 3.5x earnings in 1997 to 7.7x in 2024, no region back
    // below the ONS five-times benchmark since 2004 (the North East sat at
    // exactly 5.0 in 2025, so "below" is the accurate word, not "above five
    // everywhere"), five government datasets in a 29-year regional panel,
    // cross-validated R-squared 0.9805 for fixed-effects OLS against 0.9676
    // for the overfitting Random Forest, and no region forecast to reach a
    // lower risk tier by 2030.
    // Stack read from the repo's own imports (github.com/koinchsushan/
    // houseAffordabilityDSS, 2026-09-11), not its requirements.txt, which is a
    // full environment freeze listing packages the code never imports.
    stack: ['Python', 'Pandas', 'statsmodels', 'scikit-learn', 'SHAP', 'Matplotlib'],
    summary:
      'No region has returned below five times earnings since 2004, and none is forecast to reach a lower risk tier by 2030.',
    blurb:
      'Median house prices in England and Wales went from 3.5 times earnings in 1997 to 7.7 times in 2024, and no region has returned below the ONS benchmark of five since 2004. This decision-support system joins five government datasets into a 29-year regional panel, forecasts every region to 2030, and turns the result into auditable policy recommendations from a command-line tool. The interpretable model won: fixed-effects OLS reached a cross-validated R-squared of 0.9805 against 0.9676 for a Random Forest that overfitted. SHAP shows the same drivers lifting London and pulling the North East down, and no region is forecast to reach a lower risk tier by 2030.',
  },
  {
    title: 'Predicting flight price spikes',
    repo: 'github.com/koinchsushan/flight-price-dissertation',
    // Owner's own account of the study, given in session on 2026-09-11.
    // Every figure below is his: 1,943,082 fare records across 63,301
    // flights, ROC AUC around 0.86, three false alarms in four warnings at a
    // useful catch rate, the LSTM losing every statistical comparison, and
    // the 28x cost ratio above which it is still the right model to deploy.
    // Stack read from the repo's own imports (github.com/koinchsushan/
    // flight-price-dissertation, 2026-09-11). Polars is scripts/build_subset.py,
    // which cut the 82-million-row source file down; PyTorch is the LSTM.
    stack: ['Python', 'Polars', 'Pandas', 'statsmodels', 'XGBoost', 'PyTorch', 'scikit-learn'],
    summary:
      'The LSTM lost every statistical comparison, yet is the right model once a missed rise costs 28 times a false alarm.',
    blurb:
      'Comparison sites tell you what a fare is. This study asks whether you can tell it is about to jump, a classification framing no published study had applied to flight prices. SARIMA, XGBoost and an LSTM were tested on 1,943,082 Expedia fare records across 63,301 US domestic flights, under five rounds of rolling-origin validation. Spikes are predictable better than chance (ROC AUC around 0.86), but at a useful catch rate three warnings in four are false alarms. The sharpest finding: the LSTM lost every statistical comparison, yet it is the right model once a missed rise costs 28 times a false alarm.',
  },
]
