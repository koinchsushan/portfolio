import type { Metadata } from 'next'
import './globals.css'
import { sans, mono } from './fonts'
import { SkipLink } from '@/components/layout/SkipLink'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { SmoothScroll } from '@/components/motion/SmoothScroll'
import { RouteTransition } from '@/components/motion/RouteTransition'
import { InPageNavigation } from '@/components/motion/InPageNavigation'
import { Boot } from '@/components/motion/Boot'
import { JsonLd } from '@/components/seo/JsonLd'
import { identity } from '@/content'
import { SITE_URL } from '@/lib/site'
import { personJsonLd } from '@/lib/jsonLd'

const title = `${identity.name}, ${identity.title}`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: `%s - ${identity.name}` },
  description: identity.strapline,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: identity.name,
    title,
    description: identity.strapline,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description: identity.strapline,
  },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <JsonLd data={personJsonLd()} />
        <SmoothScroll />
        <RouteTransition />
        <InPageNavigation />
        <SkipLink />
        <Nav />
        <main id="main" className="pt-16">
          {children}
        </main>
        <Footer />
        {/* Last in the DOM, deliberately: `Boot` has no focusable content of
            its own (see its own docstring), so this placement cannot move
            the skip link out of first position in the tab order , its
            `position: fixed` overlay covers the page regardless of where
            it sits in source order. */}
        <Boot />
      </body>
    </html>
  )
}
