import type { CaseStudy } from '@/content'

/**
 * One meta-description sentence per case study, built only from fields
 * `src/content/caseStudies.ts` already states (role, employer, dates, lead
 * outcome metric), never new prose. Shared between the route's own
 * `generateMetadata` and its `CreativeWork` JSON-LD so both surfaces read
 * the same sentence.
 */
export function caseStudyDescription(caseStudy: CaseStudy): string {
  const [lead] = caseStudy.outcomes
  return `${caseStudy.client}: ${caseStudy.role} at ${caseStudy.employer} (${caseStudy.dates}). ${lead.value} ${lead.label}.`
}
