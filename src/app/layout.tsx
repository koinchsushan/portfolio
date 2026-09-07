import type { Metadata } from 'next'
import './globals.css'
import { SkipLink } from '@/components/layout/SkipLink'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { identity } from '@/content'

export const metadata: Metadata = {
  title: `${identity.name} — ${identity.title}`,
  description: identity.strapline,
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body>
        <SkipLink />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
