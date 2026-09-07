import Link from 'next/link'
import type { CaseStudy } from '@/content'

interface CaseStudyPageProps {
  caseStudy: CaseStudy
  previous?: CaseStudy
  next?: CaseStudy
}

// `caseStudy.dates` is the visible structural marker for this case study
// (a deliberate design decision) — `caseStudy.index` is ordering metadata
// only and is never rendered.
export function CaseStudyPage({ caseStudy, previous, next }: CaseStudyPageProps) {
  return (
    <article aria-labelledby="case-study-heading">
      <header>
        <p>{caseStudy.employer}</p>
        <h1 id="case-study-heading">{caseStudy.client}</h1>
        <p>{caseStudy.role}</p>
        <p>{caseStudy.dates}</p>
        <ul aria-label="Technologies used">
          {caseStudy.stack.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>
      </header>

      <section aria-labelledby="situation-heading">
        <h2 id="situation-heading">Situation</h2>
        {caseStudy.situation.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      <section aria-labelledby="constraint-heading">
        <h2 id="constraint-heading">Constraint</h2>
        <p data-testid="constraint">{caseStudy.constraint}</p>
      </section>

      <section aria-labelledby="decision-heading">
        <h2 id="decision-heading">Decision</h2>
        {caseStudy.decision.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <figure data-diagram={caseStudy.diagram}>
          <figcaption>Diagram placeholder ({caseStudy.diagram}) — a later task fills this in.</figcaption>
        </figure>
      </section>

      <section aria-labelledby="outcome-heading">
        <h2 id="outcome-heading">Outcome</h2>
        <dl>
          {caseStudy.outcomes.map((metric) => (
            <div key={metric.value} data-testid="outcome-metric">
              <dt>{metric.value}</dt>
              <dd>{metric.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {caseStudy.links.length > 0 && (
        <section aria-labelledby="links-heading">
          <h2 id="links-heading">Related Links</h2>
          <ul>
            {caseStudy.links.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noreferrer noopener">
                  {link.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav aria-label="More work">
        <ul>
          {previous && (
            <li>
              <Link href={`/work/${previous.slug}`}>Previous: {previous.client}</Link>
            </li>
          )}
          {next && (
            <li>
              <Link href={`/work/${next.slug}`}>Next: {next.client}</Link>
            </li>
          )}
        </ul>
      </nav>
    </article>
  )
}
