import { Archivo, Spline_Sans_Mono } from 'next/font/google'

// Archivo is a variable grotesque with a real width axis (62.5 to 125,
// condensed to expanded) alongside its weight axis (100 to 900). The `axes`
// option pulls that width axis into the self-hosted file so display type can
// sit at the expanded end while body copy stays at the default width, one
// family carrying the whole typographic range instead of a second face.
// Spline Sans Mono replaces JetBrains Mono for labels, dates, metrics and
// stack chips: distinctive without being the same genre marker every dark
// developer portfolio reaches for.
export const sans = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  axes: ['wdth'],
})

export const mono = Spline_Sans_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})
