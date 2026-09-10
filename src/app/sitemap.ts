import type { MetadataRoute } from 'next'
import { caseStudies } from '@/content'
import { SITE_URL } from '@/lib/site'

/**
 * All six public routes: the home page, the three case studies, the
 * research index, and the resume PDF route. `/api/contact` is a form
 * submission endpoint, not a page for a crawler to index, so it is
 * deliberately absent.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/research`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/resume`, changeFrequency: 'monthly', priority: 0.5 },
  ]

  const caseStudyRoutes: MetadataRoute.Sitemap = caseStudies.map((cs) => ({
    url: `${SITE_URL}/work/${cs.slug}`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...caseStudyRoutes]
}
