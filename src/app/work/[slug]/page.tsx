import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { caseStudies, getCaseStudy } from '@/content'
import { CaseStudyPage } from '@/components/case-study/CaseStudyPage'

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
  return { title: caseStudy ? `${caseStudy.client} — Case Study` : 'Case Study' }
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

  return <CaseStudyPage caseStudy={caseStudy} previous={previous} next={next} />
}
