import { getCaseStudy } from '@/content'
import type { Metric as MetricType } from '@/content'
import { Metric } from '@/components/primitives/Metric'

/**
 * The three verified headline metrics, pulled from the case studies that
 * already carry them (never re-typed as new facts here).
 */
function positionMetrics(): MetricType[] {
  const viveka = getCaseStudy('viveka-health')
  const proponent = getCaseStudy('proponent')

  const metrics: MetricType[] = []
  const members = viveka?.outcomes.find((o) => o.value === '450,000+')
  const emails = proponent?.outcomes.find((o) => o.value === '10,000+')
  const bundle = viveka?.outcomes.find((o) => o.value === '~30%')

  if (members) metrics.push(members)
  if (emails) metrics.push(emails)
  if (bundle) metrics.push(bundle)

  return metrics
}

// Full-bleed statement: a flat panel spanning the viewport width, one long
// statement, and a stat row read left to right rather than as cards.
export function Position() {
  const metrics = positionMetrics()

  return (
    <section aria-labelledby="position-heading" className="border-b border-grid bg-panel">
      <div className="mx-auto max-w-[1400px] px-6 py-20 sm:py-28">
        <h2
          id="position-heading"
          className="max-w-[20ch] text-40 leading-[0.98] tracking-[-0.02em] text-bone text-balance sm:text-64"
        >
          What the work adds up to
        </h2>
        <p className="mt-6 max-w-[52ch] text-18 leading-relaxed text-label">
          Three years building interfaces for systems where the data model and
          the screen have to be reasoned about together.
        </p>

        <dl className="mt-16 grid grid-cols-1 gap-y-10 sm:grid-cols-3 sm:gap-x-10">
          {metrics.map((metric, i) => (
            <div key={metric.value} className={i > 0 ? 'sm:border-l sm:border-grid sm:pl-10' : ''}>
              <dt>
                <Metric value={metric.value} />
              </dt>
              <dd className="mt-3 max-w-[24ch] text-14 leading-snug text-label">{metric.label}</dd>
            </div>
          ))}
        </dl>

      </div>
    </section>
  )
}
