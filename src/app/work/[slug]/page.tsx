import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { caseStudies, getCaseStudy } from '@/content'
import { CaseStudyPage } from '@/components/case-study/CaseStudyPage'
import { JsonLd } from '@/components/seo/JsonLd'
import { caseStudyDescription } from '@/lib/caseStudyDescription'
import { caseStudyJsonLd } from '@/lib/jsonLd'

export function generateStaticParams() {
  return caseStudies.map((cs) => ({ slug: cs.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const caseStudy = getCaseStudy(slug)
  if (!caseStudy) return { title: 'Case Study' }

  const title = `${caseStudy.client}: Case Study`
  const description = caseStudyDescription(caseStudy)
  const url = `/work/${caseStudy.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'article', url, title, description },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function Work({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const caseStudy = getCaseStudy(slug)
  if (!caseStudy) notFound()

  const index = caseStudies.findIndex((cs) => cs.slug === slug)
  const previous = index > 0 ? caseStudies[index - 1] : undefined
  const next = index < caseStudies.length - 1 ? caseStudies[index + 1] : undefined

  return (
    <>
      <JsonLd data={caseStudyJsonLd(caseStudy, caseStudyDescription(caseStudy))} />
      <CaseStudyPage caseStudy={caseStudy} previous={previous} next={next} />
    </>
  )
}
