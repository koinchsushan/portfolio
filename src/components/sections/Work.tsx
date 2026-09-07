import Link from 'next/link'
import { caseStudies } from '@/content'
import { SectionHeader } from '@/components/primitives/SectionHeader'
import { Diagram } from '@/components/graphics/Diagram'

// Region accessible name must contain "Selected Work" , the h2 text below
// supplies it via aria-labelledby. `cs.index` is ordering metadata only and
// is never rendered; `cs.dates` is the visible structural marker instead.
//
// Hairline-ruled index: each case study is a grid row divided by a single
// top rule, not a card. Mobile collapses the three columns to one stack.
// Each row's own transformation diagram runs the full row width beneath
// the text, at a size where its geometry actually reads.
export function Work() {
  return (
    <section id="work" aria-labelledby="work-heading" className="border-b border-grid">
      <div className="mx-auto max-w-[1400px] px-6 py-20 sm:py-28">
        <SectionHeader id="work-heading" heading="Selected Work" headingSize="text-40 sm:text-64" />

        <ul className="mt-14 border-t border-grid">
          {caseStudies.map((cs) => (
            <li key={cs.slug} className="grid grid-cols-1 gap-x-8 gap-y-8 border-b border-grid py-10 lg:grid-cols-12">
              <h3 className="lg:col-span-3">
                <Link
                  href={`/work/${cs.slug}`}
                  className="font-subhead text-28 tracking-[-0.01em] text-bone transition-colors hover:text-signal focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-4"
                >
                  {cs.client}
                </Link>
              </h3>
              <p className="font-mono text-12 leading-relaxed text-label lg:col-span-3">
                <span aria-hidden className="mr-1.5 inline-block size-1.5 bg-depth align-middle" />
                {cs.employer}
                <br />
                {cs.role}
                <br />
                {cs.dates}
              </p>
              <p className="text-16 leading-relaxed text-label lg:col-span-6">{cs.constraint}</p>
              <div className="border border-grid bg-panel p-6 lg:col-span-9 lg:col-start-4">
                <Diagram id={cs.diagram} className="h-auto w-full max-w-2xl" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
