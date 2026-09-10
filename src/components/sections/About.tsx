import { DraftNote } from '@/components/primitives/DraftNote'
import { SectionHeader } from '@/components/primitives/SectionHeader'
import { Portrait } from '@/components/about/Portrait'

// DRAFT bio. Every claim below traces to the CV , three years commercial, the
// 450,000-member platform, the 10,000-emails-a-day quotation system, the
// five-engineer team and two-week cycles, the four-into-one chat consolidation,
// the release-train split, the research app, the MSc. Nothing is invented.
// It is prose the owner has not approved, so it stays wrapped in DraftNote.
//
// Task K rewrite: the heading and portrait now share one row, exactly the
// pattern Stack uses for its heading + object (`SectionHeader` beside a
// fixed-width visual, `items-end`), so the portrait fills the dead space
// that used to sit under a lone heading instead of floating in its own
// column far to the right of the body. The amber left rule is dropped , a
// single long-form column reads better without an accent bar competing
// with it, and the DRAFT marker alone still flags the copy as unapproved.
// Below sm the row stacks (heading, then portrait), full body copy follows.
export function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="border-b border-grid">
      <div className="mx-auto max-w-[1400px] px-6 py-20 sm:py-28">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-[1fr_240px] sm:items-end sm:gap-10">
          <SectionHeader id="about-heading" heading="About" headingSize="text-40 sm:text-64" />
          <Portrait className="sm:justify-self-end" />
        </div>

        <DraftNote bordered={false} className="mt-10 max-w-[68ch] sm:mt-14">
          <div className="flex flex-col gap-6 text-18 leading-relaxed text-label">
            <p>
              I build interfaces and the systems underneath them. Three years so far:
              a US healthcare platform serving 450,000 union members, an aerospace
              quotation system reading 10,000 emails a day, and now a five-engineer
              London startup where I scope, build and deploy features myself on
              two-week cycles.
            </p>
            <p>
              The thread through all of it is the same. Taking something fragmented
              and making it legible. Four chat implementations into one component
              layer. A coordinated release train into five independent deployments.
              Three researchers&rsquo; local scripts into an app anyone can open in a
              browser.
            </p>
            <p>
              An MSc in Data Analytics sits behind that, which earns its keep on
              data-heavy product surfaces where the interface and the data model
              have to be designed together.
            </p>
          </div>
        </DraftNote>
      </div>
    </section>
  )
}
