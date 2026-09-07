import { Instrument_Sans, JetBrains_Mono } from 'next/font/google'

// Spec calls for Uncut Sans (display/body) and Commit Mono (labels, dates,
// metrics, stack chips), both self-hosted via next/font. Neither ships on
// Google Fonts and neither is bundled in this environment, so both fall
// back per the brief's own escape hatch ("fall back to Instrument Sans if
// licensing blocks it and say so in the commit"): Instrument Sans for the
// sans family, and JetBrains Mono, a comparable technical monospace with
// the same tabular-figures/instrumentation character, for the mono family.
// next/font/google self-hosts the resulting files from this app's own
// origin at build time, so the "self-host" requirement is still met even
// though the source files live under next/font's cache rather than
// src/fonts/.
export const sans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})
