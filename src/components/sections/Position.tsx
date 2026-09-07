import { getCaseStudy } from '@/content'
import type { Metric } from '@/content'

/**
 * The three verified headline metrics, pulled from the case studies that
 * already carry them (never re-typed as new facts here).
 */
function positionMetrics(): Metric[] {
  const viveka = getCaseStudy('viveka-health')
  const proponent = getCaseStudy('proponent')

  const metrics: Metric[] = []
  const members = viveka?.outcomes.find((o) => o.value === '450,000+')
  const emails = proponent?.outcomes.find((o) => o.value === '10,000+')
  const bundle = viveka?.outcomes.find((o) => o.value === '~30%')

  if (members) metrics.push(members)
  if (emails) metrics.push(emails)
  if (bundle) metrics.push(bundle)

  return metrics
}

export function Position() {
  const metrics = positionMetrics()

  return (
    <section aria-labelledby="position-heading">
      <h2 id="position-heading">What the work adds up to</h2>
      <p>
        Three years building interfaces for systems where the data model and the
        screen have to be reasoned about together.
      </p>
      <dl>
        {metrics.map((metric) => (
          <div key={metric.value}>
            <dt>{metric.value}</dt>
            <dd>{metric.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
