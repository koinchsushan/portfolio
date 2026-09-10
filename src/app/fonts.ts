import { Geist, Geist_Mono } from 'next/font/google'

// Geist replaces Archivo (Task N: the owner called Archivo Expanded 800 too
// bold, and moved the whole site to a light palette). Both Geist and Geist
// Mono are variable fonts on a weight axis only (100 to 900, no width axis
// the way Archivo carried one), so hierarchy on this site now comes from
// size, negative tracking and weight rather than expansion , see the
// `.font-display` / `.font-subhead` classes in globals.css, both capped at
// regular-to-medium weight per the owner's "less bold" note. Geist Mono
// replaces Spline Sans Mono for labels, dates, metrics and stack chips.
export const sans = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export const mono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})
