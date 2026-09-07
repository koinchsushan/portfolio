import { caseStudies } from '@/content'
import { SectionHeader } from '@/components/primitives/SectionHeader'
import { PinnedStory } from '@/components/motion/PinnedStory'

// Region accessible name must contain "Selected Work" , the h2 text below
// supplies it via aria-labelledby. `cs.index` is ordering metadata only and
// is never rendered; `cs.dates` is the visible structural marker instead.
//
// SIGNATURE 3 lives here: each case study is a `PinnedStory`, the pinned
// narrative that scrubs the study's own diagram open as its four beats
// (situation, constraint, decision, outcome) advance, on hardware that can
// take the scroll-jack. Everywhere else it is the same four beats stacked,
// unpinned, diagram already built , see `PinnedStory` for the tier split.
export function Work() {
  return (
    <section id="work" aria-labelledby="work-heading" className="border-b border-grid">
      <div className="mx-auto max-w-[1400px] px-6 py-20 sm:py-28">
        <SectionHeader id="work-heading" heading="Selected Work" headingSize="text-40 sm:text-64" />

        <ul className="mt-14 border-t border-grid">
          {caseStudies.map((cs) => (
            <PinnedStory key={cs.slug} study={cs} />
          ))}
        </ul>
      </div>
    </section>
  )
}
