import Link from 'next/link'
import { caseStudies } from '@/content'

// Region accessible name must contain "Selected Work" — the h2 text below
// supplies it via aria-labelledby. `cs.index` is ordering metadata only and
// is never rendered; `cs.dates` is the visible structural marker instead.
export function Work() {
  return (
    <section id="work" aria-labelledby="work-heading">
      <h2 id="work-heading">Selected Work</h2>
      <ul>
        {caseStudies.map((cs) => (
          <li key={cs.slug}>
            <h3>
              <Link href={`/work/${cs.slug}`}>{cs.client}</Link>
            </h3>
            <p>
              {cs.employer} · {cs.role} · {cs.dates}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
