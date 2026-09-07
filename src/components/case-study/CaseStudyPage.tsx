import type { CaseStudy } from '@/content'
import { ExternalLink } from '@/components/primitives/ExternalLink'
import { ActionLink } from '@/components/primitives/ActionLink'
import { Metric } from '@/components/primitives/Metric'
import { Diagram } from '@/components/graphics/Diagram'
import { DIAGRAM_CAPTION } from '@/components/graphics/geometry'

interface CaseStudyPageProps {
  caseStudy: CaseStudy
  previous?: CaseStudy
  next?: CaseStudy
}

// `caseStudy.dates` is the visible structural marker for this case study
// (a deliberate design decision) , `caseStudy.index` is ordering metadata
// only and is never rendered.
// DIAGRAM_CAPTION is the single source of truth in src/components/graphics/geometry.ts,
// read here for the visible <figcaption> and by the diagram itself for its <desc>.

export function CaseStudyPage({ caseStudy, previous, next }: CaseStudyPageProps) {
  return (
    <article aria-labelledby="case-study-heading">
      <header className="graticule border-b border-grid pt-16 pb-16 sm:pt-20 sm:pb-20">
        <div className="mx-auto max-w-[1400px] px-6">
          <p className="font-mono text-14 text-label">{caseStudy.employer}</p>
          <h1
            id="case-study-heading"
            className="mt-3 text-64 leading-[0.95] tracking-[-0.03em] text-bone text-balance sm:text-104"
          >
            {caseStudy.client}
          </h1>
          <p className="mt-5 max-w-[46ch] text-18 leading-relaxed text-label">
            {caseStudy.role} · {caseStudy.dates}
          </p>
          <ul aria-label="Technologies used" className="mt-8 flex flex-wrap gap-2">
            {caseStudy.stack.map((tech) => (
              <li
                key={tech}
                className="rounded-[var(--radius)] border border-grid px-2.5 py-1 font-mono text-12 text-label"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-6">
        <section aria-labelledby="situation-heading" className="grid grid-cols-1 gap-8 border-b border-grid py-16 lg:grid-cols-12 lg:gap-6">
          <h2 id="situation-heading" className="text-22 tracking-[-0.01em] text-bone lg:col-span-3">
            Situation
          </h2>
          <div className="flex flex-col gap-5 lg:col-span-8 lg:col-start-5">
            {caseStudy.situation.map((paragraph) => (
              <p key={paragraph} className="max-w-[68ch] text-18 leading-relaxed text-label">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section aria-labelledby="constraint-heading" className="border-b border-grid py-16">
          <div className="border-l-2 border-depth bg-panel py-6 pl-6 pr-6 sm:pl-10 sm:pr-10">
            <h2 id="constraint-heading" className="font-mono text-14 text-label">
              Constraint
            </h2>
            <p data-testid="constraint" className="mt-3 max-w-[60ch] text-22 leading-snug text-bone">
              {caseStudy.constraint}
            </p>
          </div>
        </section>

        <section aria-labelledby="decision-heading" className="grid grid-cols-1 gap-8 border-b border-grid py-16 lg:grid-cols-12 lg:gap-6">
          <h2 id="decision-heading" className="text-22 tracking-[-0.01em] text-bone lg:col-span-3">
            Decision
          </h2>
          <div className="flex flex-col gap-8 lg:col-span-8 lg:col-start-5">
            <div className="flex flex-col gap-5">
              {caseStudy.decision.map((paragraph) => (
                <p key={paragraph} className="max-w-[68ch] text-18 leading-relaxed text-label">
                  {paragraph}
                </p>
              ))}
            </div>
            <figure data-diagram={caseStudy.diagram} className="border-t border-grid pt-8">
              <Diagram id={caseStudy.diagram} className="w-full" />
              <figcaption className="mt-4 max-w-[60ch] font-mono text-12 text-label">
                {DIAGRAM_CAPTION[caseStudy.diagram]}
              </figcaption>
            </figure>
          </div>
        </section>

        <section aria-labelledby="outcome-heading" className="border-b border-grid py-16">
          <h2 id="outcome-heading" className="text-22 tracking-[-0.01em] text-bone">
            Outcome
          </h2>
          <dl className="mt-10 grid grid-cols-1 gap-y-10 sm:grid-cols-3 sm:gap-x-10">
            {caseStudy.outcomes.map((metric, i) => (
              <div key={metric.value} data-testid="outcome-metric" className={i > 0 ? 'sm:border-l sm:border-grid sm:pl-10' : ''}>
                <dt>
                  <Metric value={metric.value} />
                </dt>
                <dd className="mt-3 max-w-[26ch] text-14 leading-snug text-label">{metric.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {caseStudy.links.length > 0 && (
          <section aria-labelledby="links-heading" className="border-b border-grid py-16">
            <h2 id="links-heading" className="text-22 tracking-[-0.01em] text-bone">
              Related Links
            </h2>
            <ul className="mt-6 flex flex-wrap gap-x-10 gap-y-3 font-mono text-14">
              {caseStudy.links.map((link) => (
                <li key={link.href}>
                  <ExternalLink href={link.href} className="text-label">
                    {link.label}
                  </ExternalLink>
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav aria-label="More work" className="flex flex-col gap-4 py-16 sm:flex-row sm:justify-between">
          <ul className="contents">
            {previous && (
              <li>
                <ActionLink href={`/work/${previous.slug}`} variant="quiet">
                  Previous: {previous.client}
                </ActionLink>
              </li>
            )}
            {next && (
              <li>
                <ActionLink href={`/work/${next.slug}`}>Next: {next.client}</ActionLink>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </article>
  )
}
