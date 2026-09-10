import type { CaseStudy } from '@/content'
import { identity } from '@/content'
import { SITE_URL } from '@/lib/site'

/**
 * The site's `Person` structured data. Every field traces to
 * `src/content/identity.ts`. `identity` itself carries no phone number (see
 * that file's own comment), so there is no way for one to end up here by
 * accident, but the omission is also deliberate on its own terms: a
 * personal number has no place in a public, machine-readable record search
 * engines and AI crawlers both index.
 */
export function personJsonLd(): Record<string, unknown> {
  const [locality, country] = identity.location.split(', ')

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: identity.name,
    jobTitle: identity.title,
    description: identity.tagline,
    url: SITE_URL,
    email: `mailto:${identity.email}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: locality,
      addressCountry: country,
    },
    sameAs: [`https://${identity.linkedin}`, `https://${identity.github}`],
  }
}

/** One `CreativeWork` per case study. `description` is passed in rather than
 * rebuilt here, so the exact same string backs both this and the route's
 * meta description (`src/app/work/[slug]/page.tsx`), one source, two
 * surfaces. */
export function caseStudyJsonLd(caseStudy: CaseStudy, description: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: `${caseStudy.client}: Case Study`,
    description,
    about: caseStudy.client,
    keywords: caseStudy.stack.join(', '),
    author: { '@type': 'Person', name: identity.name },
    url: `${SITE_URL}/work/${caseStudy.slug}`,
  }
}
