import { getCaseStudy } from '@/content'
import type { Metric as MetricType } from '@/content'
import { Metric } from '@/components/primitives/Metric'
import { Datum } from '@/components/graphics/Datum'

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

// A short, non-fabricated unit tag for each metric: a category label lifted
// from its own full sentence, not a new number. Never used to imply the
// three figures share a scale , they are readings from three different
// instruments (a membership count, a daily email volume, a percentage) and
// stay visually parallel but numerically incomparable.
const UNITS: Record<string, string> = {
  '450,000+': 'MEMBERS',
  '10,000+': 'EMAILS / DAY',
  '~30%': 'BUNDLE CUT',
}

// Full-bleed statement: a flat panel spanning the viewport width, one long
// statement, and a stat row read left to right rather than as cards.
//
// Instrument-readout treatment: each figure gets the same fixed tick/datum
// mark and a mono unit tag underneath, exactly like a physical gauge face,
// because that is what these three numbers actually are , three separate
// instruments read once each, not three points on a shared scale.
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

        <dl className="mt-16 grid grid-cols-1 gap-y-12 sm:grid-cols-3 sm:gap-x-10">
          {metrics.map((metric, i) => (
            <div key={metric.value} className={i > 0 ? 'sm:border-l sm:border-grid sm:pl-10' : ''}>
              <Datum className="mb-3 h-3 w-24" />
              <dt>
                <Metric value={metric.value} tone={i === 0 ? 'signal' : 'bone'} className="sm:text-64" />
              </dt>
              {UNITS[metric.value] && (
                <p className="mt-2 font-mono text-12 tracking-[0.08em] text-label">{UNITS[metric.value]}</p>
              )}
              <dd className="mt-3 max-w-[24ch] text-14 leading-snug text-label">{metric.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
